---
title: "CLI Reference"
slug: "cli-reference"
excerpt: "Complete reference for every ink command -- project setup, content management, components, and builds."
icon: "terminal"
order: 2
published: true
permalink: "/docs/cli-reference/"
---

## Overview

The `ink` package provides the `ink` command (when installed globally) or can be invoked with `npx inksite`. All commands follow the pattern:

```bash
npx inksite <command> [arguments] [options]
```

## Project Commands

### `ink init [dir]`

Interactively scaffold a new Ink project.

```bash
npx inksite init my-site
```

The wizard prompts for site name, URL, brand colors, CSS framework (Tailwind or plain CSS custom properties), and which content types to include. If `dir` is omitted, the project is created in the current directory.

### `ink serve`

Start the Eleventy development server with live reload.

```bash
npx inksite serve
```

Runs at `http://localhost:8080` by default. File changes trigger an automatic browser refresh.

### `ink build`

Build the site for production. Output goes to `_site/`.

```bash
npx inksite build
```

### `ink --version`

Print the currently installed ink version.

```bash
npx inksite --version
```

### `ink help`

Display a summary of all available commands.

```bash
npx inksite help
```

## Content Type Commands

### `ink add <type>`

Add a content type to your project. This creates the content directory, layout, includes, and updates `contentTypes.json`.

```bash
npx inksite add blog
npx inksite add services
npx inksite add docs
```

**Available types:** `blog`, `docs`, `features`, `faq`, `team`, `services`, `portfolio`, `service-areas`

### `ink add <type> "Title"`

Create a new content entry for an existing content type.

```bash
npx inksite add blog "My First Post"
npx inksite add services "Web Design"
npx inksite add team "Jane Smith"
```

This generates a Markdown file with pre-filled frontmatter in the correct directory.

### `ink add custom`

Launch an interactive wizard to define a completely custom content type.

```bash
npx inksite add custom
```

You'll be prompted for the type name, directory, tag name, sort field, and layout. The CLI generates all necessary files and registers the type in `contentTypes.json`.

### `ink generate <type> [count]`

Generate sample content entries for a given type. Defaults to 3 entries if `count` is omitted.

```bash
npx inksite generate blog 5
npx inksite generate services
npx inksite generate faq 10
```

### `ink list [type]`

List all content entries. If `type` is provided, only entries of that type are shown.

```bash
npx inksite list          # List all content
npx inksite list blog     # List only blog posts
npx inksite list services # List only services
```

### `ink remove <type>`

Remove an entire content type from the project. This deletes the directory, layout, and unregisters it from `contentTypes.json`.

```bash
npx inksite remove faq
```

### `ink delete <type> <slug>`

Delete a single content entry by its slug.

```bash
npx inksite delete blog my-first-post
npx inksite delete services web-design
```

## Component Commands

### `ink add component [name]`

Install a pre-built UI component. If `name` is omitted, the CLI lists all available components so you can choose interactively.

```bash
npx inksite add component                # List all available components
npx inksite add component contact-form   # Install the contact form
npx inksite add component pricing-table  # Install the pricing table
```

**Available components:** `contact-form`, `feature-grid`, `testimonials`, `pricing-table`, `stats-counter`, `image-gallery`, `tabs`, `logo-cloud`, `newsletter-signup`, `timeline`, `modal`, `social-share`

Each component installs a Nunjucks macro, associated CSS, and any required JavaScript.

### `ink remove component <name>`

Uninstall a previously installed component.

```bash
npx inksite remove component contact-form
```

## Icon Commands

### `ink add icons`

Install the Lucide icon system. This adds an icon partial and a helper macro for rendering SVG icons inline.

```bash
npx inksite add icons
```

After installation, use icons in your templates:

```html
{% raw %}{{ icon("mail") }}
{{ icon("phone", { size: 24, class: "text-primary" }) }}{% endraw %}
```

## Quick Reference Table

| Command | Description |
|---------|-------------|
| `ink init [dir]` | Create a new project |
| `ink serve` | Start dev server |
| `ink build` | Build for production |
| `ink add <type>` | Add a content type |
| `ink add <type> "Title"` | Create a content entry |
| `ink add custom` | Create a custom content type |
| `ink add component [name]` | Install a UI component |
| `ink add icons` | Add Lucide icon system |
| `ink generate <type> [count]` | Generate sample content |
| `ink list [type]` | List content entries |
| `ink remove <type>` | Remove a content type |
| `ink remove component <name>` | Uninstall a component |
| `ink delete <type> <slug>` | Delete a single entry |
| `ink --version` | Show version |
| `ink help` | Show help |
