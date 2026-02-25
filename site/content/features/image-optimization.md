---
title: "Automatic Image Optimization"
slug: "image-optimization"
excerpt: "Responsive WebP images with JPEG fallbacks, generated automatically at build time."
subtitle: "Every image optimized. Zero manual effort."
icon: "image"
order: 9
published: true
permalink: "/features/image-optimization/"
---

## Build-Time Image Processing

Every image in an Ink site is automatically optimized during the build. The `@11ty/eleventy-img` transform plugin converts standard `<img>` tags into responsive `<picture>` elements with WebP and JPEG sources at multiple widths. No manual resizing, no third-party image CDN, no client-side JavaScript.

## What You Get

Drop an image into your `media/` directory, reference it in frontmatter, and the build pipeline handles the rest:

- **WebP + JPEG** -- Modern browsers get WebP (25-35% smaller). Older browsers get JPEG.
- **Responsive srcset** -- Three sizes by default (400, 800, 1200px). The browser picks the best fit.
- **Lazy loading** -- Images below the fold load on demand with `loading="lazy"`.
- **Width and height** -- Dimensions are added automatically to prevent layout shift.

## Zero Configuration

Image optimization works out of the box. The transform plugin is pre-configured in both the standard and Tailwind starters. There is nothing to install, nothing to configure, and nothing to remember.

```html
<!-- What you write -->
<img src="/media/team/jane.jpg" alt="Jane Doe">

<!-- What the build produces -->
<picture>
  <source type="image/webp" srcset="/img/jane-400w.webp 400w, /img/jane-800w.webp 800w">
  <img src="/img/jane-400w.jpeg" alt="Jane Doe" width="800" height="800"
       srcset="/img/jane-400w.jpeg 400w, /img/jane-800w.jpeg 800w">
</picture>
```

## Per-Image Control

Need smaller variants for a thumbnail or larger ones for a hero? Use the `eleventy:widths` attribute:

```html
<!-- Avatar: only needs small sizes -->
<img src="/media/team/jane.jpg" alt="Jane"
     eleventy:widths="200,400" sizes="200px">

<!-- Hero: needs full-width sizes -->
<img src="/media/hero.jpg" alt="Welcome"
     eleventy:widths="800,1200,1920" sizes="100vw">
```

The attribute is stripped from the final HTML. The browser gets clean, standards-compliant markup.

## Background Images and Meta Tags

For CSS `background-image` and Open Graph meta tags, the `imageUrl` filter returns an optimized URL:

```html
{% raw %}<section style="background-image: url('{{ featured_image | imageUrl }}')">
<meta property="og:image" content="{{ site.url }}{{ featured_image | imageUrl }}">{% endraw %}
```

## Starter Placeholders

Both starters include minimal placeholder images for services, team members, and general site use. Cards and team pages look complete from the first build, and you replace the placeholders with real images whenever you're ready. The pipeline optimizes whatever you put in.
