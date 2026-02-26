---
title: "Changelog"
seo_title: "Ink Desktop App Changelog"
meta_description: "Release notes and version history for the Ink desktop app."
slug: "changelog"
layout: "page.njk"
permalink: "/changelog/"
published: true
excerpt: "What's new in each release of the Ink desktop app."
hero_headline: "Changelog"
hero_subtitle: "Release notes and version history for the Ink desktop app."
---

## v1.1.0

### New Features

- **Schema-driven frontmatter editing** — Typed form fields (date pickers, toggles, media selectors) driven by content type schemas instead of generic auto-detect. Fields render in schema order with labels and required indicators.
- **Component gallery & page templates** — Browsable library of pre-built components and page templates with category filtering, install/insert workflow, and insert-at-cursor support for both editor modes.
- **Visual rich text editor** — Code/Visual toggle for markdown files using TipTap WYSIWYG with full formatting toolbar, inline URL inputs for images and links, and markdown roundtripping via marked + turndown.
- **Reference fields** — Searchable dropdown fields that link entries across collections (e.g., link a blog post to an author from the team collection).

### Bug Fixes

- Fixed electron-updater crash on dev startup (lazy-loaded module)
- Fixed Content Security Policy blocking Vite dev scripts in development mode
- Fixed TipTap toolbar buttons losing editor focus on click
- Replaced `window.prompt` with inline inputs (blocked by Electron sandbox)

---

## v1.0.0

Initial stable release of the Ink desktop app.

- Visual editor with live preview for Markdown content
- One-click Git publishing (commit, push, deploy)
- Media management with drag-and-drop uploads
- Project wizard for scaffolding new Ink sites
- Auto-update support via electron-updater
