type MarkdownModule = {
	Content: unknown;
	frontmatter: Record<string, unknown>;
};

export type Category = {
	_id: string;
	description?: string;
	slug: string;
	title: string;
};

export type NoteLink = {
	_id: string;
	slug: string;
	title: string;
};

export type Topic = {
	depth: number;
	id: string;
	text: string;
};

export type Note = {
	_id: string;
	Content: unknown;
	categories: Category[];
	excerpt?: string;
	links: NoteLink[];
	publishedAt?: string;
	slug: string;
	title: string;
	topics: Topic[];
	updatedAt?: string;
};

export type GraphData = {
	categories: Category[];
	notes: Note[];
};

const noteModules = import.meta.glob<MarkdownModule>("../content/notes/*.md", {
	eager: true,
});
const noteRawModules = import.meta.glob<string>("../content/notes/*.md", {
	eager: true,
	query: "?raw",
	import: "default",
});
const categoryModules = import.meta.glob<MarkdownModule>(
	"../content/categories/*.md",
	{ eager: true },
);

function slugFromPath(path: string) {
	return path.split("/").pop()?.replace(/\.md$/, "") ?? path;
}

function textValue(value: unknown, fallback = "") {
	return typeof value === "string" ? value : fallback;
}

function stringArray(value: unknown) {
	return Array.isArray(value)
		? value.filter((item): item is string => typeof item === "string")
		: [];
}

function slugify(value: string) {
	return value
		.toLowerCase()
		.trim()
		.replace(/[`*_~[\]()]/g, "")
		.replace(/&/g, "and")
		.replace(/[^a-z0-9ก-๙]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function stripFrontmatter(markdown: string) {
	return markdown.replace(/^---[\s\S]*?---\s*/, "");
}

function extractTopics(markdown: string): Topic[] {
	const topics: Topic[] = [];
	const idCounts = new Map<string, number>();
	let inFence = false;

	for (const line of stripFrontmatter(markdown).split(/\r?\n/)) {
		if (/^\s*```/.test(line) || /^\s*~~~/.test(line)) {
			inFence = !inFence;
			continue;
		}

		if (inFence) {
			continue;
		}

		const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);

		if (!match) {
			continue;
		}

		const text = match[2].trim();
		const baseId = slugify(text) || "section";
		const count = idCounts.get(baseId) ?? 0;
		idCounts.set(baseId, count + 1);

		topics.push({
			depth: match[1].length,
			id: count === 0 ? baseId : `${baseId}-${count + 1}`,
			text,
		});
	}

	return topics;
}

const categories = Object.entries(categoryModules)
	.map(([path, module]) => {
		const slug = textValue(module.frontmatter.slug, slugFromPath(path));
		return {
			_id: `category-${slug}`,
			description: textValue(module.frontmatter.description),
			slug,
			title: textValue(module.frontmatter.title, slug),
		};
	})
	.sort((a, b) => a.title.localeCompare(b.title));

function resolveCategories(slugs: string[]) {
	return slugs
		.map((slug) => categories.find((category) => category.slug === slug))
		.filter((category): category is Category => Boolean(category));
}

const noteEntries = Object.entries(noteModules).map(([path, module]) => {
	const slug = textValue(module.frontmatter.slug, slugFromPath(path));
	const raw = noteRawModules[path] ?? "";
	return {
		_id: `note-${slug}`,
		Content: module.Content,
		categorySlugs: stringArray(module.frontmatter.categories),
		excerpt: textValue(module.frontmatter.excerpt),
		linkSlugs: stringArray(module.frontmatter.links),
		publishedAt: textValue(module.frontmatter.publishedAt),
		slug,
		title: textValue(module.frontmatter.title, slug),
		topics: extractTopics(raw),
		updatedAt: textValue(module.frontmatter.updatedAt),
	};
});

function toNote(entry: (typeof noteEntries)[number]): Note {
	return {
		_id: entry._id,
		Content: entry.Content,
		categories: resolveCategories(entry.categorySlugs),
		excerpt: entry.excerpt,
		links: entry.linkSlugs
			.map((slug) => noteEntries.find((note) => note.slug === slug))
			.filter((note): note is (typeof noteEntries)[number] => Boolean(note))
			.map((note) => ({
				_id: note._id,
				slug: note.slug,
				title: note.title,
			})),
		publishedAt: entry.publishedAt,
		slug: entry.slug,
		title: entry.title,
		topics: entry.topics,
		updatedAt: entry.updatedAt,
	};
}

export async function getNotes() {
	return noteEntries
		.map(toNote)
		.sort((a, b) => {
			const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
			const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
			return bTime - aTime;
		});
}

export async function getNote(slug: string) {
	const entry = noteEntries.find((note) => note.slug === slug);
	return entry ? toNote(entry) : undefined;
}

export async function getCategories() {
	return categories;
}

export async function getCategory(slug: string) {
	return categories.find((category) => category.slug === slug);
}

export async function getNotesByCategory(slug: string) {
	const notes = await getNotes();
	return notes.filter((note) =>
		note.categories.some((category) => category.slug === slug),
	);
}

export async function getBacklinks(noteId: string) {
	const notes = await getNotes();
	return notes.filter((note) => note.links.some((link) => link._id === noteId));
}

export async function getGraphData(): Promise<GraphData> {
	const [categoryList, notes] = await Promise.all([getCategories(), getNotes()]);
	return { categories: categoryList, notes };
}
