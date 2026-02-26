---
title: "Flexible Content Types"
slug: "content-types"
excerpt: "Eight built-in content types with layouts, schemas, and archive pages — plus a wizard for custom ones."
subtitle: "Structured content without a database."
icon: "layers"
order: 4
published: true
permalink: "/features/content-types/"
---

## 8 Built-In Content Types

Ink ships with eight content types, each with its own layout template, frontmatter schema, archive page, and directory data file:

| Type | Directory | Use Case |
|------|-----------|----------|
| **Blog** | `content/blog/` | Posts with dates, authors, excerpts |
| **Docs** | `content/docs/` | Documentation with ordering and sections |
| **Team** | `content/employees/` | Staff profiles with roles and photos |
| **Services** | `content/services/` | Service descriptions with icons and pricing |
| **Features** | `content/features/` | Product feature pages with ordering |
| **Portfolio** | `content/portfolio/` | Project showcases with images and tags |
| **FAQ** | `content/faq/` | Question-and-answer pairs |
| **Service Areas** | `content/service-areas/` | Location-based service pages |

Generate any of them with a single command:

```bash
npx inksite generate blog
```

This creates the content directory, layout, archive page, and directory data file. Start writing immediately.

## How Content Types Work

Each content type is registered in `contentTypes.json` at the project root. This file tells Eleventy how to collect, sort, and paginate the content:

```json
{
  "blog": {
    "directory": "content/blog",
    "layout": "post.njk",
    "sortBy": "date",
    "sortOrder": "desc",
    "tags": "blog"
  }
}
```

Ink's collection factory reads this configuration and builds Eleventy collections automatically. You never write manual `addCollection()` calls.

## Frontmatter Schemas

Each content type defines expected frontmatter fields. A blog post expects `title`, `date`, `author`, and `excerpt`. A team member expects `name`, `role`, `photo`, and `bio`. These schemas serve as documentation and ensure consistency across your content.

## Custom Content Types

Need something Ink does not ship with -- case studies, events, recipes, product listings? The CLI wizard generates a custom content type:

```bash
npx inksite generate custom
```

The wizard asks for a name, singular label, and frontmatter fields, then creates the full directory structure, layout template, archive page, and `contentTypes.json` entry. Your custom type works exactly like the built-in ones -- same collection factory, same archive pagination, same design token integration.

## Collection Factory Pattern

Under the hood, Ink uses a collection factory that reads `contentTypes.json` and registers an Eleventy collection for each type. This means adding a new content type never requires editing your Eleventy config. Drop the files in place, update the JSON, and the build picks it up.
