---
title: "Markdown-Native Content"
slug: "markdown-native"
excerpt: "Your content lives in plain .md files — no database, no proprietary format, no lock-in."
subtitle: "Write in the format the web was built on."
icon: "file-text"
order: 1
published: true
permalink: "/features/markdown-native/"
---

## Content as Files

Every page, post, and document in an Ink site is a Markdown file with YAML frontmatter. There is no database, no admin panel, and no proprietary content format. A blog post looks like this:

```markdown
---
title: "Launching Our New API"
slug: "launching-new-api"
date: 2026-02-24
author: "Sarah Park"
excerpt: "A look at what we shipped and why."
published: true
---

We spent six months rebuilding our API from the ground up.
Here is what changed and what it means for developers.
```

The file name becomes the URL. The frontmatter becomes metadata. The Markdown becomes HTML. That is the entire system.

## YAML Frontmatter

Each content type defines its own frontmatter schema. Blog posts have `date` and `author`. Team members have `role` and `photo`. Services have `icon` and `price`. You control exactly what fields appear in each type, and Ink validates them at build time.

## Directory Data Files

Ink uses Eleventy's directory data files to set defaults for entire content directories. A single `blog.json` file can set the layout, tag, and default values for every post in the folder:

```json
{
  "layout": "post.njk",
  "tags": "blog",
  "published": true
}
```

No need to repeat boilerplate frontmatter in every file.

## No Lock-In

Your content is plain text. You can:

- Open it in any text editor (VS Code, Vim, Sublime, Obsidian)
- Version it with Git like any other source code
- Migrate it to another static site generator with minimal effort
- Back it up by copying a folder

There is no export step, no API to query, and no format conversion. Your `.md` files are your content, and they belong to you.

## Obsidian Compatibility

The content directory in an Ink project is a valid Obsidian vault. Open it in Obsidian and you get a rich writing environment with live preview, backlinks, and graph view -- all while your site builds from the same files. See the [Obsidian Compatible](/features/obsidian-compatible/) feature page for details.
