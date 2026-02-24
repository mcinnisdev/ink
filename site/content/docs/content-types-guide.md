---
title: "Content Types Guide"
slug: "content-types-guide"
excerpt: "How Ink's 8 built-in content types work, their frontmatter fields, and how to create your own custom types."
order: 3
published: true
permalink: "/docs/content-types-guide/"
---

## How Content Types Work

Every content type in Ink follows the same pattern: Markdown files in a directory, collected by a tag, sorted by a field, and rendered with a layout. The `contentTypes.json` file in `src/_data/` drives this system automatically -- no manual Eleventy collection code required.

When you run `ink add blog`, the CLI:

1. Creates the `content/blog/` directory
2. Adds a `blog.json` directory data file (sets the layout, tag, and defaults)
3. Installs the layout (`src/_layouts/post.njk`) and any includes
4. Registers the collection in `contentTypes.json`

## The Collection Factory

The `contentTypes.json` file maps tag names to glob patterns and sort orders:

```json
{
  "posts": {
    "glob": "content/blog/*.md",
    "sort": "date"
  },
  "services": {
    "glob": "content/services/*.md",
    "sort": "order"
  }
}
```

In `eleventy.config.js`, a factory function reads this file and creates an Eleventy collection for each entry. Content sorted by `date` is ordered newest-first. Content sorted by `order` uses the numeric `order` field in frontmatter.

## Built-in Content Types

### Blog (`blog`)

Date-sorted blog posts. Supports featured images, categories, and author attribution.

| Field | Directory | Tag | Sort | Layout |
|-------|-----------|-----|------|--------|
| blog | `content/blog/` | posts | date | `post.njk` |

```yaml
---
title: "How We Redesigned Our Workflow"
slug: "redesigned-workflow"
excerpt: "A look at the tools and processes that transformed our team."
date: 2025-03-15
published: true
image: "/media/blog/redesigned-workflow.jpg"
permalink: "/blog/redesigned-workflow/"
---
```

### Services (`services`)

Order-sorted service offerings with icons and call-to-action links.

| Field | Directory | Tag | Sort | Layout |
|-------|-----------|-----|------|--------|
| services | `content/services/` | services | order | `service.njk` |

```yaml
---
title: "Web Development"
slug: "web-development"
excerpt: "Custom websites built for performance and accessibility."
order: 1
published: true
icon: "code"
permalink: "/services/web-development/"
---
```

### Team (`team`)

Team member profiles sorted by display order.

| Field | Directory | Tag | Sort | Layout |
|-------|-----------|-----|------|--------|
| team | `content/employees/` | employees | order | `employee.njk` |

```yaml
---
title: "Jane Smith"
slug: "jane-smith"
excerpt: "Lead Designer"
order: 1
published: true
role: "Lead Designer"
image: "/media/employees/jane-smith.jpg"
permalink: "/team/jane-smith/"
---
```

### Docs (`docs`)

Documentation pages sorted by order, like the page you're reading now.

| Field | Directory | Tag | Sort | Layout |
|-------|-----------|-----|------|--------|
| docs | `content/docs/` | docs | order | `doc.njk` |

```yaml
---
title: "Getting Started"
slug: "getting-started"
excerpt: "Install Ink and create your first project."
order: 1
published: true
permalink: "/docs/getting-started/"
---
```

### Features (`features`)

Feature highlights for product or service pages.

| Field | Directory | Tag | Sort | Layout |
|-------|-----------|-----|------|--------|
| features | `content/features/` | features | order | `feature.njk` |

```yaml
---
title: "Lightning Fast Builds"
slug: "fast-builds"
excerpt: "Eleventy generates your entire site in under a second."
order: 1
published: true
icon: "zap"
permalink: "/features/fast-builds/"
---
```

### Service Areas (`service-areas`)

Geographic or topical service areas, useful for local SEO.

| Field | Directory | Tag | Sort | Layout |
|-------|-----------|-----|------|--------|
| service-areas | `content/service-areas/` | serviceAreas | order | `service-area.njk` |

```yaml
---
title: "Austin, TX"
slug: "austin-tx"
excerpt: "Serving the greater Austin metropolitan area."
order: 1
published: true
permalink: "/service-areas/austin-tx/"
---
```

### Portfolio (`portfolio`)

Date-sorted project showcases with images and client details.

| Field | Directory | Tag | Sort | Layout |
|-------|-----------|-----|------|--------|
| portfolio | `content/portfolio/` | projects | date | `project.njk` |

```yaml
---
title: "Acme Corp Rebrand"
slug: "acme-corp-rebrand"
excerpt: "A complete visual identity overhaul for a Fortune 500 client."
date: 2025-01-20
published: true
image: "/media/portfolio/acme-corp.jpg"
client: "Acme Corp"
permalink: "/portfolio/acme-corp-rebrand/"
---
```

### FAQ (`faq`)

Frequently asked questions sorted by display order.

| Field | Directory | Tag | Sort | Layout |
|-------|-----------|-----|------|--------|
| faq | `content/faq/` | faqs | order | `faq.njk` |

```yaml
---
title: "Do you offer ongoing support?"
slug: "ongoing-support"
excerpt: "Yes -- all plans include 30 days of post-launch support."
order: 1
published: true
permalink: "/faq/ongoing-support/"
---
```

## Creating a Custom Content Type

If the 8 built-in types don't cover your needs, use the interactive wizard:

```bash
npx ink add custom
```

The wizard asks for:

1. **Type name** -- e.g., "case-studies"
2. **Directory** -- Where Markdown files will live (e.g., `content/case-studies/`)
3. **Tag name** -- The Eleventy collection tag (e.g., `caseStudies`)
4. **Sort field** -- `date` or `order`
5. **Layout name** -- The Nunjucks layout file (e.g., `case-study.njk`)

The CLI creates the directory, layout, directory data file, and registers everything in `contentTypes.json`. From that point on, every `.md` file you place in the directory is automatically part of the collection.

## Filtering Content

Every content type supports a `published` field in frontmatter. Set `published: false` to hide an entry from the built site while keeping it in your content folder. This is useful for drafts or seasonal content.
