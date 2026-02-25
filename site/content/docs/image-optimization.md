---
title: "Image Optimization"
slug: "image-optimization"
excerpt: "Automatic responsive images with WebP and JPEG fallbacks, powered by eleventy-img."
icon: "image"
order: 6
published: true
permalink: "/docs/image-optimization/"
---

## Overview

Ink automatically optimizes images at build time using the [`@11ty/eleventy-img`](https://www.11ty.dev/docs/plugins/image/) transform plugin. Every `<img>` tag in your HTML output is converted to a `<picture>` element with WebP and JPEG sources at multiple widths. No manual conversion, no external services, no runtime overhead.

## How It Works

The image transform plugin runs after Eleventy renders your templates. It finds every `<img>` tag, processes the source image, and replaces it with a responsive `<picture>` element:

**Input (your template):**

```html
{% raw %}<img src="/media/services/hero.png" alt="Our services" loading="lazy">{% endraw %}
```

**Output (built HTML):**

```html
<picture>
  <source type="image/webp"
    srcset="/img/hero-400w.webp 400w, /img/hero-800w.webp 800w, /img/hero-1200w.webp 1200w"
    sizes="100vw">
  <img loading="lazy" decoding="async"
    src="/img/hero-400w.jpeg" alt="Our services"
    width="1200" height="800"
    srcset="/img/hero-400w.jpeg 400w, /img/hero-800w.jpeg 800w, /img/hero-1200w.jpeg 1200w"
    sizes="100vw">
</picture>
```

Browsers that support WebP get the smaller file. Older browsers fall back to JPEG. The `srcset` attribute lets the browser choose the right size based on the viewport.

## Default Widths

The transform plugin generates images at three widths by default:

| Width | Use Case |
|-------|----------|
| 400px | Mobile devices, card thumbnails |
| 800px | Tablets, medium viewports |
| 1200px | Desktop, full-width images |

If the source image is smaller than a given width, that size is skipped automatically.

## Per-Image Width Override

Use the `eleventy:widths` attribute on any `<img>` tag to override the default widths:

```html
{% raw %}<img src="{{ photo }}" alt="{{ title }}"
     eleventy:widths="200,400" sizes="200px">{% endraw %}
```

This is useful for small images like avatars or logos where generating 1200px variants is unnecessary. The `eleventy:widths` attribute is removed from the final output.

## Controlling Sizes

The `sizes` attribute tells the browser how wide the image will actually be displayed. This helps it pick the correct source from the `srcset`:

```html
{% raw %}<!-- Full-width hero -->
<img src="/media/hero.jpg" alt="Hero"
     sizes="100vw">

<!-- Card thumbnail -->
<img src="{{ featured_image }}" alt="{{ title }}"
     eleventy:widths="400,800"
     sizes="(max-width: 600px) 100vw, 400px">

<!-- Small profile photo -->
<img src="{{ photo }}" alt="{{ title }}"
     eleventy:widths="200,400" sizes="200px">{% endraw %}
```

## Image Paths in Frontmatter

When referencing images from frontmatter, use paths that start with `/`:

```yaml
---
title: "Web Design"
featured_image: "/media/services/web-design.jpg"
---
```

The leading `/` ensures the image resolves correctly regardless of which page includes it. Paths without a leading `/` are resolved relative to the source file, which can break when the same image is referenced from multiple pages (e.g., a card on a listing page and the detail page).

## The imageUrl Filter

For cases where you need an optimized image URL rather than a `<picture>` element -- such as CSS `background-image` or Open Graph meta tags -- use the `imageUrl` async filter:

```html
{% raw %}<!-- Hero background -->
<section style="background-image: url('{{ featured_image | imageUrl }}')">

<!-- OG meta tag -->
<meta property="og:image" content="{{ site.url }}{{ featured_image | imageUrl }}">{% endraw %}
```

The `imageUrl` filter processes the image at widths of 800, 1200, and 1920 pixels and returns the URL of the largest JPEG variant.

## Supported Formats

The plugin processes these input formats:

- JPEG / JPG
- PNG
- WebP
- AVIF
- TIFF

SVGs, ICOs, and external URLs (starting with `http`) are passed through unchanged.

## Placeholder Images

Both starters ship with minimal placeholder images so cards and team pages have visible content out of the box:

```
media/
├── services/
│   ├── service-placeholder-1.png    (1200×800)
│   └── service-placeholder-2.png    (1200×800)
├── employees/
│   ├── employee-placeholder-1.png   (600×600)
│   └── employee-placeholder-2.png   (600×600)
└── site/
    └── site-placeholder.png         (800×800)
```

Replace these with your own images when you're ready. The optimization pipeline handles any image you drop into the `media/` directory.

## Configuration

The image transform plugin is configured in `eleventy.config.js`. The default configuration works well for most sites, but you can adjust it:

```javascript
eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
  extensions: "html",
  formats: ["webp", "jpeg"],
  widths: [400, 800, 1200],
  defaultAttributes: {
    loading: "lazy",
    decoding: "async",
  },
  filenameFormat: (id, src, width, format) => {
    const name = path.basename(src, path.extname(src));
    return `${name}-${width}w.${format}`;
  },
});
```

| Option | Default | Description |
|--------|---------|-------------|
| `formats` | `["webp", "jpeg"]` | Output formats. Add `"avif"` for even smaller files (slower build) |
| `widths` | `[400, 800, 1200]` | Default widths generated for each image |
| `defaultAttributes` | `lazy` + `async` | Applied to every processed `<img>` |

## Performance Impact

On a typical Ink site, image optimization delivers significant improvements:

- **File size reduction** -- WebP images are 25-35% smaller than equivalent JPEGs
- **Responsive loading** -- Mobile devices download smaller images instead of full-size originals
- **Automatic lazy loading** -- Images below the fold load on demand
- **No runtime cost** -- All processing happens at build time
