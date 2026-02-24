---
title: "Getting Started"
slug: "getting-started"
excerpt: "Install Ink, create your first project, and understand the directory structure in under five minutes."
icon: "rocket"
order: 1
published: true
permalink: "/docs/getting-started/"
---

## Prerequisites

Before you begin, make sure you have the following installed on your machine:

- **Node.js 18 or later** -- Check with `node --version`
- **npm 9 or later** (ships with Node.js) -- Check with `npm --version`
- **Git** (optional but recommended for version control and deployment)

If you need Node.js, download it from [nodejs.org](https://nodejs.org) or use a version manager like [nvm](https://github.com/nvm-sh/nvm).

## Create a New Project

The fastest way to start is with `ink init`. You can run it directly with `npx` -- no global install required:

```bash
npx ink init my-site
```

The interactive wizard will ask you for:

1. **Site name** -- Your site's display name
2. **Site URL** -- The production URL (used for sitemaps and meta tags)
3. **Primary color** -- A hex color for your brand (e.g. `#2563eb`)
4. **CSS framework** -- Use Tailwind CSS or plain CSS custom properties (default)
5. **Content types** -- Choose which content types to include (blog, services, team, etc.)

If you choose **Tailwind CSS**, the project is scaffolded with `tailwindcss`, `@tailwindcss/typography`, and a `tailwind.config.js` pre-configured with your brand color. If you choose the default, you get a single `main.css` file with CSS custom properties (design tokens).

Once the wizard finishes, you'll have a fully scaffolded project ready to go.

## Install Dependencies

Move into your new project directory and install the Node.js dependencies:

```bash
cd my-site
npm install
```

## Start the Dev Server

Launch the Eleventy development server with live reload:

```bash
npx ink serve
```

Your site is now running at **http://localhost:8080**. Every time you save a file, the browser will automatically refresh.

## Build for Production

When you're ready to deploy, generate the static output:

```bash
npx ink build
```

This creates a `_site/` directory containing your fully built static site, ready to upload to any hosting provider.

## Project Structure

After running `ink init`, your project will look like this:

```
my-site/
├── content/            # Markdown content (works as an Obsidian vault)
│   ├── pages/          # Static pages (home, about, contact)
│   ├── blog/           # Blog posts (if added)
│   ├── services/       # Services (if added)
│   └── employees/      # Team members (if added)
├── src/
│   ├── _data/          # Data files (site.json, navigation.json, contentTypes.json)
│   ├── _layouts/       # Nunjucks page layouts
│   ├── _includes/      # Partials and UI components
│   ├── css/            # main.css (or tailwind.css if Tailwind was chosen)
│   └── js/             # Client-side JavaScript
├── media/              # Images organized by content type
├── public/             # Static files (favicon, _headers, _redirects)
├── eleventy.config.js  # Eleventy configuration
└── package.json
```

### Key Concepts

- **Content lives in Markdown.** Every page, blog post, and service entry is a `.md` file with YAML frontmatter at the top. You can edit these files in any text editor -- or open the `content/` folder in [Obsidian](https://obsidian.md) for a rich editing experience.
- **Templates use Nunjucks.** Layouts in `src/_layouts/` and partials in `src/_includes/` use the [Nunjucks](https://mozilla.github.io/nunjucks/) templating language.
- **One CSS file.** All styles live in a single stylesheet -- `src/css/main.css` (CSS custom properties) or `src/css/tailwind.css` (Tailwind), depending on what you chose during `ink init`.
- **Data-driven collections.** The `contentTypes.json` file tells Eleventy which folders to collect and how to sort them. You never need to write manual collection code.

## Generate Sample Content

If you want to see your site populated with realistic placeholder content, use the `generate` command:

```bash
npx ink generate blog 5
npx ink generate services 4
```

This creates the specified number of sample entries so you can preview layouts and components immediately.

## Install a Global Copy (Optional)

If you use Ink frequently, install it globally so you can skip the `npx` prefix:

```bash
npm install -g ink
```

Then you can run commands directly:

```bash
ink init my-site
ink serve
ink build
```

## Next Steps

- **[CLI Reference](/docs/cli-reference/)** -- Learn every command and option available.
- **[Content Types Guide](/docs/content-types-guide/)** -- Understand how blog posts, services, team members, and more work.
- **[Components Guide](/docs/components-guide/)** -- Add pre-built UI components like contact forms, pricing tables, and image galleries.
- **[Customization](/docs/customization/)** -- Change colors, fonts, spacing, and layouts to match your brand.
