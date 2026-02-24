---
title: "Troubleshooting"
slug: "troubleshooting"
excerpt: "Solutions for common issues with Node.js, builds, collections, components, and Windows line endings."
order: 8
published: true
permalink: "/docs/troubleshooting/"
---

## Node.js Version Issues

### Symptom

```
SyntaxError: Cannot use import statement outside a module
```

or

```
Error [ERR_REQUIRE_ESM]: require() of ES Module
```

### Cause

Ink requires **Node.js 18 or later** because it uses ESM (`import`/`export`) syntax. Older versions of Node.js do not support this.

### Fix

Check your Node.js version:

```bash
node --version
```

If it is below 18, upgrade Node.js. If you use a version manager:

```bash
nvm install 18
nvm use 18
```

On hosting providers, set the `NODE_VERSION` environment variable to `18` or later.

## Collection Not Appearing

### Symptom

A content type was added, but the collection shows up empty on the site -- no entries render on the listing page.

### Possible Causes and Fixes

**1. Missing or incorrect tag in directory data file.**

Each content directory has a `.json` file (e.g., `content/blog/blog.json`) that sets the tag for all files in that folder:

```json
{
  "layout": "post.njk",
  "tags": "posts",
  "published": true
}
```

Make sure the `tags` value matches what is registered in `contentTypes.json`.

**2. Content type not registered in `contentTypes.json`.**

Open `src/_data/contentTypes.json` and verify an entry exists for your content type:

```json
{
  "posts": {
    "glob": "content/blog/*.md",
    "sort": "date"
  }
}
```

The `glob` path must match the actual directory where your Markdown files live.

**3. `published: false` in frontmatter.**

If an entry has `published: false`, the layout may filter it out. Check the frontmatter of your entries.

**4. No Markdown files in the directory.**

An empty content directory produces an empty collection. Generate sample content to verify the setup:

```bash
npx ink generate blog 3
```

## Component CSS or JS Not Showing

### Symptom

You installed a component and included it in a template, but it renders unstyled or its interactive features do not work.

### Possible Causes and Fixes

**1. CSS was not injected into `main.css`.**

Open `src/css/main.css` and search for the component name. You should find a comment block like:

```css
/* Component: pricing-table */
```

If it is missing, try removing and reinstalling the component:

```bash
npx ink remove component pricing-table
npx ink add component pricing-table
```

**2. JavaScript was not added to `main.js`.**

For interactive components (tabs, modal, stats-counter, image-gallery), check `src/js/main.js` for the component's initialization code. If missing, reinstall the component.

**3. Browser cache.**

Hard-refresh your browser with `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac), or clear the browser cache entirely.

## Build Errors

### `Error: Cannot find module` or `MODULE_NOT_FOUND`

Run `npm install` in your project directory. If the error persists, delete `node_modules` and `package-lock.json`, then reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

### `ENOENT: no such file or directory`

This usually means a layout or include file is referenced but does not exist. Check the error message for the specific file path and verify it exists in `src/_layouts/` or `src/_includes/`.

### `TemplateContentRenderError` or Nunjucks syntax errors

The error message will include a file path and line number. Common causes:

- Unclosed `{% raw %}{% block %}{% endraw %}` or `{% raw %}{% if %}{% endraw %}` tags
- Missing `{% raw %}{% endblock %}{% endraw %}` or `{% raw %}{% endif %}{% endraw %}`
- Calling an undefined variable (check for typos in frontmatter field names)

## Windows Line Endings (CRLF)

### Symptom

Template rendering behaves oddly, or Git shows changes on every line of a file you did not edit.

### Cause

Windows uses CRLF (`\r\n`) line endings, while Eleventy and most web tooling expect LF (`\n`). This can cause rendering issues in Nunjucks templates and noisy Git diffs.

### Fix

Configure Git to handle line endings automatically. Add a `.gitattributes` file to your project root:

```
* text=auto eol=lf
```

Then normalize existing files:

```bash
git add --renormalize .
git commit -m "Normalize line endings"
```

For your editor, configure it to use LF line endings for this project. In VS Code, add to `.vscode/settings.json`:

```json
{
  "files.eol": "\n"
}
```

## Dev Server Not Refreshing

### Symptom

You save a file but the browser does not reload, or changes are not reflected.

### Possible Fixes

1. **Check that `ink serve` is still running** in the terminal. Look for error output that may have stopped the process.
2. **File is outside the watched directories.** Eleventy watches the directories defined in `eleventy.config.js`. Files outside `content/`, `src/`, `public/`, and `media/` will not trigger a rebuild.
3. **Restart the dev server.** Stop it with `Ctrl+C` and run `npx ink serve` again.

## Layout Not Found

### Symptom

```
TemplateLayoutPathResolverError: Could not find layout "some-layout.njk"
```

### Fix

Verify the layout file exists in `src/_layouts/`. The layout name in frontmatter should match the filename exactly (case-sensitive):

```yaml
---
layout: post.njk
---
```

This corresponds to the file `src/_layouts/post.njk`.

## Getting Help

If you're stuck on an issue not covered here:

1. Search the [Eleventy documentation](https://www.11ty.dev/docs/) -- since Ink is built on Eleventy v3, most Eleventy troubleshooting advice applies.
2. Check the Ink repository's [GitHub Issues](https://github.com/mcinnisdev/ink/issues) for known bugs and feature requests.
3. Open a new issue with your error output, Node.js version, operating system, and the steps to reproduce the problem.
