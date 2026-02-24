# Ink Starter

A Markdown-native website starter built on [Eleventy (11ty)](https://www.11ty.dev/) and designed for [Cloudflare Pages](https://pages.cloudflare.com/).

**Design once. Write in plain text. Publish instantly.**

## Quick Start

```bash
npm install
npm run dev       # local dev server at http://localhost:8080
npm run build     # build to _site/
```

## Project Structure

```
content/          Markdown content (your CMS data)
  pages/          Standard pages (home, contact, etc.)
  services/       Service entries
  employees/      Team member entries
media/            Images and assets
  employees/      Headshots
  services/       Service images
  site/           Logos, hero images, icons
public/           Static files (_redirects, _headers, robots.txt)
src/
  _data/          Global data (site config, navigation, content types)
  _layouts/       Nunjucks layout templates
  _includes/      Partials and components
  css/            Stylesheets
  js/             Client-side scripts
```

## Adding Content

### Add a new service

1. Duplicate `content/services/web-design.md`
2. Update the frontmatter fields
3. Write your content in Markdown below the `---`
4. Save — the dev server rebuilds automatically

### Add a new team member

1. Duplicate `content/employees/jane-doe.md`
2. Update the frontmatter fields
3. Add a headshot to `media/employees/` and set the `photo` path
4. Save

### Using Obsidian

Open the `content/` folder as an Obsidian vault. Use the templates in `.obsidian-templates/` to create new entries with pre-filled frontmatter.

## Frontmatter Schema

### Required (all content types)

| Field       | Type    | Description                          |
|-------------|---------|--------------------------------------|
| `title`     | string  | Page/entry title                     |
| `slug`      | string  | URL segment (kebab-case)             |
| `published` | boolean | Set `false` to exclude from build    |

### Optional (all content types)

| Field              | Type   | Description                           |
|--------------------|--------|---------------------------------------|
| `excerpt`          | string | Short description for cards and meta  |
| `featured_image`   | string | Path to hero/card image               |
| `order`            | number | Manual sort position (lower = first)  |
| `seo_title`        | string | Override `<title>` tag                |
| `meta_description` | string | Meta description for search engines   |
| `og_image`         | string | Social sharing image                  |

### Services (additional)

| Field        | Type   | Description          |
|--------------|--------|----------------------|
| `price_note` | string | Optional pricing info|

### Employees (additional)

| Field   | Type   | Description           |
|---------|--------|-----------------------|
| `role`  | string | Job title             |
| `photo` | string | Path to headshot      |

## Adding a New Content Type

1. Create `content/<type>/` folder
2. Add `<type>.json` with defaults: `{ "layout": "<type>.njk", "tags": "<type>", "published": true }`
3. Add entry to `src/_data/contentTypes.json`
4. Create `src/_layouts/<type>.njk` layout template
5. Create an archive page in `content/pages/` using `archive.njk` layout with `collection_name: "<type>"`

## Theming

All design tokens live in `src/css/main.css` under the `:root` block. To brand the site:

1. Update `--color-primary`, `--color-primary-dark`, `--color-primary-light`
2. Update `--color-secondary` and variants
3. Change `--font-body` and `--font-heading`
4. Update the Google Fonts link in `src/_layouts/base.njk`

## Deploy to Cloudflare Pages

| Setting          | Value                    |
|------------------|--------------------------|
| Build command    | `npm run build`          |
| Output directory | `_site`                  |
| Node version     | `20` (set `NODE_VERSION`)|

## License

MIT
