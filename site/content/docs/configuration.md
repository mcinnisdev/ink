---
title: "Configuration"
slug: "configuration"
excerpt: "Detailed reference for site.json, navigation.json, contentTypes.json, and eleventy.config.js."
icon: "settings"
order: 7
published: true
permalink: "/docs/configuration/"
---

## Overview

Ink's configuration is split across four files, each with a specific purpose. All data files live in `src/_data/` and are available in every template as global variables.

## site.json

The primary site metadata file. Every field here is accessible in templates via `site.fieldName`.

```json
{
  "name": "My Business",
  "tagline": "We build great websites",
  "url": "https://mybusiness.com",
  "description": "A short description for search engines and social cards.",
  "email": "hello@mybusiness.com",
  "phone": "(555) 123-4567",
  "address": {
    "street": "123 Main St",
    "city": "Austin",
    "state": "TX",
    "zip": "78701"
  },
  "social": {
    "twitter": "https://twitter.com/mybusiness",
    "facebook": "https://facebook.com/mybusiness",
    "linkedin": "https://linkedin.com/company/mybusiness",
    "instagram": "https://instagram.com/mybusiness"
  },
  "gtm_id": "GTM-XXXXXXX"
}
```

### Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Site/business name, shown in header and title tags |
| `tagline` | string | Short slogan displayed in the header or hero |
| `url` | string | Production URL (used for sitemaps, canonical tags, OG meta) |
| `description` | string | Default meta description for pages without their own |
| `email` | string | Contact email displayed in footer and contact page |
| `phone` | string | Contact phone number |
| `address` | object | Physical address with `street`, `city`, `state`, `zip` |
| `social` | object | Social media profile URLs |
| `gtm_id` | string | Google Tag Manager container ID (leave empty to disable) |

Use these values in templates:

```html
{% raw %}<title>{{ title }} | {{ site.name }}</title>
<meta name="description" content="{{ excerpt or site.description }}">
<a href="mailto:{{ site.email }}">{{ site.email }}</a>{% endraw %}
```

## navigation.json

Controls the site's navigation menus. The `main` array defines the primary navigation links.

```json
{
  "main": [
    { "label": "Home", "url": "/" },
    { "label": "Services", "url": "/services/" },
    { "label": "About", "url": "/about/" },
    {
      "label": "Resources",
      "url": "/resources/",
      "children": [
        { "label": "Blog", "url": "/blog/" },
        { "label": "FAQ", "url": "/faq/" },
        { "label": "Docs", "url": "/docs/" }
      ]
    },
    { "label": "Contact", "url": "/contact/" }
  ]
}
```

### Dropdown Menus

Any navigation item with a `children` array renders as a dropdown menu. Each child has the same `label` and `url` structure. The parent `url` is used as a fallback link for accessibility.

### Using Navigation in Templates

Navigation data is available as `navigation.main`:

```html
{% raw %}<nav>
  <ul>
    {% for item in navigation.main %}
      <li>
        <a href="{{ item.url }}">{{ item.label }}</a>
        {% if item.children %}
          <ul class="dropdown">
            {% for child in item.children %}
              <li><a href="{{ child.url }}">{{ child.label }}</a></li>
            {% endfor %}
          </ul>
        {% endif %}
      </li>
    {% endfor %}
  </ul>
</nav>{% endraw %}
```

## contentTypes.json

The collection factory configuration. Each key is an Eleventy tag name, and the value specifies which files to collect and how to sort them.

```json
{
  "posts": {
    "glob": "content/blog/*.md",
    "sort": "date"
  },
  "services": {
    "glob": "content/services/*.md",
    "sort": "order"
  },
  "employees": {
    "glob": "content/employees/*.md",
    "sort": "order"
  },
  "docs": {
    "glob": "content/docs/*.md",
    "sort": "order"
  }
}
```

### Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `glob` | string | File path pattern relative to the project root |
| `sort` | string | `"date"` for reverse-chronological or `"order"` for numeric frontmatter field |

When `sort` is `"date"`, entries are sorted newest-first using the `date` frontmatter field. When `sort` is `"order"`, entries are sorted by the numeric `order` field in ascending order.

You should not need to edit this file manually. The `ink add` and `ink remove` commands manage it for you. However, understanding its structure is useful when creating custom integrations.

## eleventy.config.js

The main Eleventy configuration file at the project root. Ink's config handles several things:

```javascript
import contentTypes from "./src/_data/contentTypes.json" with { type: "json" };

export default function(eleventyConfig) {
  // Passthrough copy: static assets served as-is
  eleventyConfig.addPassthroughCopy("public");
  eleventyConfig.addPassthroughCopy("media");

  // Collection factory: creates a collection for each content type
  for (const [tag, config] of Object.entries(contentTypes)) {
    eleventyConfig.addCollection(tag, (collectionApi) => {
      const items = collectionApi.getFilteredByGlob(config.glob);
      if (config.sort === "date") {
        return items.sort((a, b) => b.date - a.date);
      }
      return items.sort((a, b) =>
        (a.data.order || 0) - (b.data.order || 0)
      );
    });
  }

  return {
    dir: {
      input: ".",
      includes: "src/_includes",
      layouts: "src/_layouts",
      data: "src/_data",
      output: "_site"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
```

### Key Configuration Options

| Option | Value | Description |
|--------|-------|-------------|
| `dir.input` | `"."` | Project root is the input directory (content/ at root level) |
| `dir.includes` | `"src/_includes"` | Partials and components |
| `dir.layouts` | `"src/_layouts"` | Page layouts |
| `dir.data` | `"src/_data"` | Global data files |
| `dir.output` | `"_site"` | Build output directory |
| `markdownTemplateEngine` | `"njk"` | Process Markdown files through Nunjucks first |
| `htmlTemplateEngine` | `"njk"` | Process HTML files through Nunjucks |

### Passthrough Copies

The `addPassthroughCopy` calls tell Eleventy to copy files directly to the output without processing. The `public/` directory holds static assets like favicons, `_headers`, and `_redirects`. The `media/` directory holds images.

### Adding Custom Filters

You can add Nunjucks filters in `eleventy.config.js`:

```javascript
eleventyConfig.addFilter("readableDate", (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
});
```

Then use it in templates:

```html
{% raw %}<time>{{ post.date | readableDate }}</time>{% endraw %}
```
