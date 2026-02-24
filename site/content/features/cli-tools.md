---
title: "Powerful CLI Tools"
slug: "cli-tools"
excerpt: "Scaffold projects, add components, and generate content types from the command line."
subtitle: "One command to scaffold. One command to extend."
order: 2
published: true
permalink: "/features/cli-tools/"
---

## ink

The Ink CLI (`ink`) is a command-line tool that handles project scaffolding, component installation, and content type generation. Every operation that would otherwise require manual file creation and configuration is a single command.

## Core Commands

**`ink init <project-name>`** -- Scaffold a new Ink project with content directories, design tokens, layouts, and a working dev server. You get a deployable site from the first command.

```bash
npx ink init my-site
```

**`ink add <component>`** -- Install a pre-built UI component. The CLI copies the Nunjucks template, CSS, and JavaScript into your project. No package manager, no dependencies.

```bash
npx ink add contact-form
npx ink add pricing-table
```

**`ink generate <content-type>`** -- Add a built-in content type to your project. This creates the content directory, layout template, archive page, and directory data file.

```bash
npx ink generate blog
npx ink generate portfolio
```

**`ink list [components|types]`** -- See what is available to install or generate.

```bash
npx ink list components    # 12 available
npx ink list types         # 8 built-in
```

**`ink remove <component>`** -- Cleanly remove a component from your project.

**`ink serve`** -- Start the Eleventy dev server with hot reload.

**`ink build`** -- Build your site for production.

## Custom Content Type Wizard

Need a content type that is not built in? The CLI includes an interactive wizard that walks you through creating one:

```bash
npx ink generate custom
# ? Content type name: case-studies
# ? Singular label: Case Study
# ? Frontmatter fields: title, client, industry, outcome
# ✓ Created content/case-studies/
# ✓ Created layout template
# ✓ Created archive page
# ✓ Updated contentTypes.json
```

The wizard generates the directory structure, layout, archive page, and registers the new type in your project configuration.

## 12 Installable Components

Every component is self-contained and installed with `ink add`. The full list: contact-form, feature-grid, testimonials, pricing-table, stats-counter, image-gallery, tabs, logo-cloud, newsletter-signup, timeline, modal, and social-share. Each includes accessible markup, scoped styles, and optional JavaScript.
