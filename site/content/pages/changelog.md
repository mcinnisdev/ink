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

## v1.1.2

### New Features

- **Purpose-built content type layouts** — FAQ uses an accordion archive with expandable Q&As, portfolio gets full-width image heroes with overlay text, features and service areas gain prev/next navigation and back links.
- **Simplified project wizard** — Removed AI content customization from the new project setup; users now choose how many sample entries to generate per content type (None, 3, 5, or 8).
- **Field validation warnings** — Frontmatter fields for permalinks, URLs, and media paths show a yellow warning when missing a leading `/`.

### Bug Fixes

- Fixed file explorer sidebar not scrolling when expanded folders push content off-screen.
- Fixed CLI placeholder images not varying per content type (team now cycles avatars, blog cycles landscapes, etc.).

---

## v1.1.1

### Bug Fixes

- Fixed visual editor corrupting Nunjucks template brackets during markdown roundtrip
- Fixed "no port detected" error hiding actual Eleventy startup errors
- Widened dev server port detection range (8080-8100)
- Added Eleventy output logging for easier debugging

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
