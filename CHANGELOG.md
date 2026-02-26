# Changelog

All notable changes to the Ink desktop app are documented here.

## 1.1.2

### New Features

- **Purpose-built content type layouts** — FAQ uses an accordion archive with expandable Q&As, portfolio gets full-width image heroes with overlay text, features and service areas gain prev/next navigation and back links
- **Simplified project wizard** — Removed AI content customization from the new project setup; users now choose how many sample entries to generate per content type (None, 3, 5, or 8)
- **Field validation warnings** — Frontmatter fields for permalinks, URLs, and media paths show a yellow warning when missing a leading `/`

### Bug Fixes

- Fixed file explorer sidebar not scrolling when expanded folders push content off-screen
- Fixed CLI placeholder images not varying per content type (team now cycles avatars, blog cycles landscapes, etc.)

## 1.1.1

### Bug Fixes

- Fixed TipTap visual editor corrupting Nunjucks brackets (`[` → `\[`) during markdown roundtrip
- Fixed "no port detected" error hiding actual Eleventy startup errors
- Widened dev server port detection range (8080-8100)
- Added Eleventy output logging for easier debugging

## 1.1.0

### New Features

- **Schema-driven frontmatter editing** — Typed form fields (date pickers, toggles, media selectors) driven by content type schemas instead of generic auto-detect
- **Component gallery & page templates** — Browsable library of pre-built components with category filtering, install/insert workflow, and insert-at-cursor support
- **Visual rich text editor** — Code/Visual toggle for markdown files using TipTap WYSIWYG with full formatting toolbar and markdown roundtripping
- **Reference fields** — Searchable dropdown fields that link entries across collections (e.g., blog post to author)

### Bug Fixes

- Fixed electron-updater crash on dev startup (lazy-loaded module)
- Fixed Content Security Policy blocking Vite dev scripts
- Fixed TipTap toolbar buttons losing editor focus on click
- Replaced window.prompt with inline inputs (blocked by Electron sandbox)

## 1.0.0

Initial stable release.

- Visual editor with live preview for Markdown content
- One-click Git publishing (commit, push, deploy)
- Media management with drag-and-drop uploads
- Project wizard for scaffolding new Ink sites
- Auto-update support via electron-updater
