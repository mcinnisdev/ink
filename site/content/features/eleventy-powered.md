---
title: "Built on Eleventy v3"
slug: "eleventy-powered"
excerpt: "A zero-config static site generator with lightning-fast builds and no client-side JS."
subtitle: "The simplest, fastest static site generator — now with ESM."
icon: "zap"
order: 6
published: true
permalink: "/features/eleventy-powered/"
---

## Why Eleventy

Eleventy is a static site generator that takes templates and content files and produces plain HTML. It does not ship a JavaScript framework to the browser. It does not require a bundler. It does not impose an opinion on your frontend stack. Ink builds on Eleventy v3 to give you a CMS-like experience with none of the runtime overhead.

## ESM and Modern JavaScript

Eleventy v3 runs on native ES modules. Ink's configuration file (`eleventy.config.js`) uses `import`/`export` syntax, and all plugins and utilities follow the same pattern. No CommonJS, no transpilation step.

```js
import { contentCollections } from "./src/_config/collections.js";

export default function (eleventyConfig) {
  contentCollections(eleventyConfig);
  // ...
}
```

## Nunjucks Templating

Ink uses Nunjucks as its templating engine. Nunjucks gives you template inheritance, macros, filters, and conditionals without compiling to JavaScript. Templates are readable, composable, and fast:

```html
{% raw %}{% extends "base.njk" %}
{% block content %}
  <h1>{{ title }}</h1>
  {{ content | safe }}
{% endblock %}{% endraw %}
```

Layouts extend other layouts. Components are macros you import and call. Data flows from frontmatter through templates to HTML -- no intermediate framework layer.

## Lightning-Fast Builds

Eleventy compiles sites in milliseconds, not minutes. A typical Ink project with hundreds of pages builds in under a second. Incremental builds during development are near-instant, and the built-in dev server reloads your browser automatically when files change.

## Zero Client-Side JavaScript

By default, an Ink site ships zero JavaScript to the browser. Pages are static HTML styled with CSS. If a component needs interactivity (tabs, modals, galleries), it includes a small, scoped script -- no framework, no bundle, no hydration.

This means:

- **Perfect Lighthouse scores** out of the box
- **No JavaScript-dependent rendering** -- content is visible immediately
- **Smaller payloads** -- typical pages are under 50KB total
- **Better accessibility** -- content works with JavaScript disabled

## Ecosystem

Eleventy has a rich plugin ecosystem. Ink is compatible with any Eleventy plugin -- image optimization, RSS feeds, syntax highlighting, SEO metadata, sitemaps, and more. Install a plugin with npm and register it in your config.
