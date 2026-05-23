---
title: Welcome
slug: welcome
excerpt: A minimal markdown note surface with categories and linked notes.
publishedAt: 2026-05-23
updatedAt: 2026-05-23
categories:
  - field-notes
links:
  - graph-view
---
Piang Note is now a markdown-managed notebook. Each note is a file in `src/content/notes`, and each category is a file in `src/content/categories`.

## Structure

Use frontmatter to manage the note graph:

- `categories` connects a note to category pages.
- `links` connects a note to other notes.
- Inline markdown links can point directly to other notes, like [Graph view](/notes/graph-view/).

### Example frontmatter

```yaml
title: Welcome
slug: welcome
categories:
  - field-notes
links:
  - graph-view
```

## Writing

This keeps the writing portable while preserving the graph structure needed for linked thinking.

### Markdown support

Headings, subheadings, lists, links, blockquotes, tables, images, inline code, and code blocks are rendered by the note page.
