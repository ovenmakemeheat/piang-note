import type { APIRoute } from "astro";
import { getNotes } from "../lib/content";
import { absoluteUrl, SITE_NAME } from "../lib/seo";

function escapeXml(value: string) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

function atomDate(value: string) {
	const timestamp = /^\d{4}-\d{2}-\d{2}$/.test(value)
		? `${value}T00:00:00.000Z`
		: value;
	const date = new Date(timestamp);
	return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export const GET: APIRoute = async () => {
	const notes = (await getNotes()).filter((note) =>
		atomDate(note.publishedAt ?? ""),
	);
	const entries = notes
		.map((note) => {
			const url = absoluteUrl(`/blog/${note.slug}/`);
			const published = atomDate(note.publishedAt ?? "");
			if (!published) return "";
			const updated = atomDate(note.updatedAt ?? "") ?? published;
			const summary = note.excerpt
				? `<summary>${escapeXml(note.excerpt)}</summary>`
				: "";
			return `<entry><title>${escapeXml(note.title)}</title><id>${escapeXml(url)}</id><link href="${escapeXml(url)}"/><published>${published}</published><updated>${updated}</updated><author><name>${SITE_NAME}</name><uri>${absoluteUrl("/about/")}</uri></author>${summary}</entry>`;
		})
		.join("");
	const latestUpdate = notes[0]
		? atomDate(notes[0].updatedAt ?? notes[0].publishedAt ?? "")
		: undefined;
	const updated = latestUpdate ?? new Date().toISOString();
	const feedUrl = absoluteUrl("/feed.xml");
	const blogUrl = absoluteUrl("/blog/");
	const xml = `<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>${SITE_NAME} — Notes and Writing</title><id>${feedUrl}</id><link rel="self" href="${feedUrl}"/><link href="${blogUrl}"/><updated>${updated}</updated><author><name>${SITE_NAME}</name><uri>${absoluteUrl("/about/")}</uri></author><subtitle>Notes on computing, machine learning, and engineering.</subtitle>${entries}</feed>`;

	return new Response(xml, {
		headers: {
			"Cache-Control": "public, max-age=3600, s-maxage=3600",
			"Content-Type": "application/atom+xml; charset=utf-8",
		},
	});
};
