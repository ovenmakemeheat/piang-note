import type { APIRoute } from "astro";
import { getCategories, getNotes } from "../lib/content";
import { absoluteUrl } from "../lib/seo";

function sitemapDate(value?: string) {
	if (!value) return undefined;
	const date = value.slice(0, 10);
	return /^\d{4}-\d{2}-\d{2}$/.test(date) &&
		!Number.isNaN(Date.parse(`${date}T00:00:00Z`))
		? date
		: undefined;
}

function escapeXml(value: string) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

export const GET: APIRoute = async () => {
	const [notes, categories] = await Promise.all([getNotes(), getCategories()]);
	const urls = new Map<string, string | undefined>();
	const add = (path: string, lastmod?: string) => {
		const current = urls.get(path);
		if (!current || (lastmod && lastmod > current))
			urls.set(path, lastmod ?? current);
	};

	for (const path of [
		"/about/",
		"/projects/",
		"/blog/",
		"/archive/",
		"/categories/",
	]) {
		add(path);
	}

	for (const category of categories) add(`/categories/${category.slug}/`);

	for (const note of notes) {
		const lastmod = sitemapDate(note.updatedAt || note.publishedAt);
		add(`/blog/${note.slug}/`, lastmod);

		const published = sitemapDate(note.publishedAt);
		if (!published) continue;
		const [year, month] = published.split("-");
		add(`/archive/${year}/`, published);
		add(`/archive/${year}/${Number(month)}/`, published);
	}

	const entries = [...urls.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([path, lastmod]) => {
			const lastmodTag = lastmod ? `<lastmod>${lastmod}</lastmod>` : "";
			return `<url><loc>${escapeXml(absoluteUrl(path))}</loc>${lastmodTag}</url>`;
		})
		.join("");

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`,
		{
			headers: {
				"Cache-Control": "public, max-age=3600, s-maxage=3600",
				"Content-Type": "application/xml; charset=utf-8",
			},
		},
	);
};
