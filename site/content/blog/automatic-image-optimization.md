---
title: "Automatic Image Optimization Is Here"
slug: "automatic-image-optimization"
excerpt: "Every Ink site now ships with responsive WebP images, placeholder content, and zero-config optimization."
date: 2026-02-25
author: "Ink Team"
post_tags: "feature, performance, images"
featured_image: ""
published: true
permalink: "/blog/automatic-image-optimization/"
---

Images are the heaviest assets on most websites. They account for the majority of page weight and are the single biggest factor in slow load times. Until now, Ink sites served images exactly as you dropped them in -- uncompressed PNGs, oversized JPEGs, whatever the original file happened to be.

That changes today. Both Ink starters now include automatic image optimization powered by `@11ty/eleventy-img`.

## What Changed

Every `<img>` tag in your built HTML is now automatically converted to a `<picture>` element with:

- **WebP sources** for browsers that support it (25-35% smaller than JPEG)
- **JPEG fallbacks** for everything else
- **Responsive srcset** at 400, 800, and 1200 pixel widths
- **Lazy loading** and **async decoding** by default
- **Width and height attributes** to prevent cumulative layout shift

This happens at build time. There is no client-side JavaScript, no external image CDN, and nothing you need to configure.

## How It Works

The [`@11ty/eleventy-img`](https://www.11ty.dev/docs/plugins/image/) transform plugin runs as a post-processing step after Eleventy renders your templates. It scans the HTML output for `<img>` tags, processes each source image, and replaces the tag with an optimized `<picture>` element.

Because it operates on the rendered HTML (not the Nunjucks templates), it works everywhere -- cards, listing pages, detail pages, included partials. There are no async filter limitations or template engine constraints to worry about.

## Per-Image Control

The default widths (400, 800, 1200) work well for most images. But for small images like avatars or large images like heroes, you can override them with the `eleventy:widths` attribute:

```html
<!-- Team photo: small sizes only -->
<img src="/media/team/jane.jpg" alt="Jane"
     eleventy:widths="200,400" sizes="200px">
```

The attribute is removed from the final output. The browser gets clean, standards-compliant HTML.

## The imageUrl Filter

Not every image lives in an `<img>` tag. Hero sections use CSS `background-image`, and social sharing relies on `og:image` meta tags. For those cases, the `imageUrl` async filter returns an optimized URL:

```html
{% raw %}<section style="background-image: url('{{ featured_image | imageUrl }}')">{% endraw %}
```

This filter generates optimized images at 800, 1200, and 1920 pixel widths and returns the URL of the largest variant.

## Placeholder Images

We also added placeholder images to both starters. New projects now have visible cards and team pages from the first build -- gray placeholder images sized correctly for each content type. Replace them with real photos whenever you're ready; the pipeline handles the rest.

## Image Paths

One important convention: reference images from frontmatter with a leading `/`:

```yaml
featured_image: "/media/services/hero.jpg"
```

The leading slash ensures the image resolves correctly from any page. Without it, paths are resolved relative to the source file, which breaks when the same image appears on both a listing page and a detail page.

## What's Next

This is the same approach we now use on the get.ink marketing site itself. The logo in the header went from a 10KB unoptimized PNG to a 939-byte optimized JPEG with a WebP alternative -- a 91% reduction from a single config change.

Image optimization is available now in both the standard and Tailwind starters. Existing projects can add it by installing `@11ty/eleventy-img` and adding the transform plugin configuration to `eleventy.config.js`. See the [image optimization docs](/docs/image-optimization/) for the full setup guide.
