---
title: "Why I'm building a CMS Around Markdown"
slug: "why-markdown"
excerpt: "Markdown is portable, version-controllable, and human-readable. It's the perfect foundation for a CMS."
date: 2026-02-22
author: "Ink Team"
post_tags: "philosophy, markdown"
featured_image: ""
published: true
permalink: "/blog/why-markdown/"
---

Most content management systems store your content in a database. Your words, your structure, your metadata -- all locked inside a proprietary format that you can only access through an admin panel. If the platform disappears, or you want to switch, migrating that content becomes a project in itself.

I think there's a better way.

## Content Should Be Portable

Ink stores everything as plain Markdown files with YAML frontmatter. A blog post looks like this:

```markdown
---
title: "My Post"
date: 2026-02-22
author: "Your Name"
---

The actual content goes here, written in plain Markdown.
```

That's it. No database queries, no JSON blobs in a CMS backend, no export tools needed. Your content is a folder of text files that you own completely.

## Version Control Just Works

Because your content is plain text, it plays perfectly with Git. Every edit is a commit. Every version is recoverable. You get a full history of your site for free, with branching, diffing, and collaboration built in. No plugin required.

## Use Any Editor You Want

WordPress has Gutenberg. Notion has its block editor. Ink has... whatever you prefer. Write in VS Code, Vim, Sublime Text, or even Notepad. The files are just text.

Better yet, your Ink content directory is fully compatible with **Obsidian**. Open your project's content folder as an Obsidian vault, and you get a beautiful writing environment with live preview, backlinks, and graph view -- all while your content stays in the exact format Ink expects. No syncing, no conversion, no middleware.

## How Ink Uses Markdown

Every piece of content in Ink is a Markdown file. The YAML frontmatter at the top of each file holds structured metadata -- title, date, tags, SEO fields -- while the body holds your content. Eleventy reads these files at build time and generates static HTML pages. The result is a site that loads instantly, costs almost nothing to host, and never needs a server.

## The Bottom Line

I built Ink around Markdown because I believe your content should outlast any tool. Platforms come and go. Plain text is forever.
