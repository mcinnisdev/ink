---
title: "Obsidian Compatible"
slug: "obsidian-compatible"
excerpt: "Your content directory is a valid Obsidian vault. Write in the editor you love."
subtitle: "Your favorite writing tool meets your CMS."
order: 7
published: true
permalink: "/features/obsidian-compatible/"
---

## Your Content Folder Is a Vault

An Ink project stores all content in the `content/` directory -- plain Markdown files with YAML frontmatter organized into subdirectories. This directory structure is also a valid Obsidian vault. Open it in Obsidian and you get a full-featured writing environment with zero additional configuration.

## Write with Live Preview

Obsidian renders your Markdown in real time as you type. You see formatted headings, bold text, links, images, and code blocks without switching between edit and preview modes. Since Ink content is standard Markdown, what you see in Obsidian is what gets built into your site.

## Use Obsidian Templates

Obsidian's Templates plugin works naturally with Ink content types. Create a template for each content type with the expected frontmatter fields pre-filled:

```markdown
---
title: ""
slug: ""
date: "{{date}}"
author: ""
excerpt: ""
featured_image: ""
published: false
---

Write your content here.
```

When you create a new blog post, insert the template and fill in the blanks. The frontmatter schema stays consistent across your entire site.

## Graph View and Backlinks

Obsidian's graph view visualizes the connections between your content files. If you use internal links between posts, you can see how your content relates at a glance. Backlinks show you every page that references the current one -- useful for documentation sites, knowledge bases, and interlinked blog posts.

## Tags and Search

Obsidian indexes your vault for instant full-text search across all your content. Combined with YAML frontmatter tags, you can quickly find and navigate between posts, docs, and pages without leaving the editor.

## The Workflow

A typical Ink + Obsidian workflow looks like this:

1. Open the `content/` directory as an Obsidian vault
2. Use templates to create new content with the correct frontmatter
3. Write and preview in Obsidian's live editor
4. Run `npm run dev` in a terminal to see the built site with full styling
5. Commit and deploy when ready

Your writing tool and your CMS are looking at the same files. No sync, no export, no copy-paste. Edit a file in Obsidian and the dev server picks up the change instantly.

## No Obsidian Required

Obsidian compatibility is a feature, not a requirement. Your content files work with any text editor -- VS Code, Vim, Sublime Text, or even GitHub's web editor. Ink does not depend on Obsidian in any way. It is simply a natural fit because both tools are built on the same foundation: plain Markdown files.
