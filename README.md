# Ink

**The Markdown-Native CMS**

Ink is an open-source CMS built on [Eleventy v3](https://www.11ty.dev/) that turns plain Markdown files into fast, beautiful websites. No database. No lock-in. Just files you own.

## Packages

This monorepo contains:

| Package | Description | Status |
|---------|-------------|--------|
| [`cli/`](cli/) | CLI tool for scaffolding, components, and content management | v1.0 |
| [`starter/`](starter/) | Eleventy v3 starter template with design tokens | v0.1 |
| [`site/`](site/) | Official marketing site at [get.ink](https://get.ink) | Beta |
| [`app/`](app/) | Desktop app with visual editor and live preview | Alpha |

## Quick Start

```bash
npx ink-cli init my-site
cd my-site
npm install
npx ink-cli serve
```

## What You Get

- **8 content types** -- Blog, docs, team, services, portfolio, FAQ, features, service areas
- **12 components** -- Contact forms, pricing tables, image galleries, and more
- **Design tokens** -- One CSS file controls your entire brand
- **Obsidian compatible** -- Edit content in Obsidian, build with Ink
- **Static output** -- Deploy to Cloudflare Pages, Netlify, Vercel, or any CDN
- **Zero database** -- Content is Markdown files versioned with Git

## CLI Commands

```bash
ink init [dir]              # Scaffold a new project
ink add <type>              # Add a content type (blog, docs, faq, etc.)
ink add <type> "Title"      # Create a content entry
ink add component [name]    # Install a UI component
ink generate <type> [count] # Generate sample content
ink serve                   # Start dev server
ink build                   # Build for production
ink list [type]             # List content entries
ink remove <type>           # Remove a content type
```

## Documentation

Full documentation is available at [get.ink/docs](https://get.ink/docs/).

- [Getting Started](https://get.ink/docs/getting-started/)
- [CLI Reference](https://get.ink/docs/cli-reference/)
- [Content Types](https://get.ink/docs/content-types-guide/)
- [Components](https://get.ink/docs/components-guide/)
- [Customization](https://get.ink/docs/customization/)
- [Deployment](https://get.ink/docs/deployment/)

## Requirements

- Node.js 18+
- npm 9+

## License

[MIT](LICENSE)
