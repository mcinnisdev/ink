---
title: "Introducing Ink: The Markdown-Native CMS"
slug: "introducing-ink"
excerpt: "Meet Ink, an open-source CMS built on Eleventy v3 that puts Markdown first."
date: 2026-02-24
author: "Ink Team"
post_tags: "announcement, open-source, launch"
featured_image: ""
published: true
permalink: "/blog/introducing-ink/"
---

We're excited to introduce **Ink**, an open-source, Markdown-native CMS built on Eleventy v3. Ink is designed for developers, freelancers, and agencies who want to build fast, modern websites without wrestling with bloated platforms or proprietary lock-in.

## Why We Built Ink

We love building websites. What we don't love is the overhead that comes with most CMS platforms: complex admin panels, sluggish page loads, database management, plugin conflicts, and upgrade nightmares. We wanted something simpler. Something that respects the way developers actually work -- with text files, version control, and the command line.

Markdown has been the preferred writing format for developers for years. It's clean, portable, and readable. So we asked ourselves: what if we built an entire CMS around it?

## What Ink Gives You

Ink ships as a CLI tool that scaffolds a complete, production-ready website in seconds. Here's what's included out of the box:

- **8 content types** -- Blog posts, pages, projects, team members, FAQs, testimonials, services, and employees. Each with its own frontmatter schema and archive page.
- **12 components** -- Hero sections, feature grids, CTAs, testimonial carousels, pricing tables, and more. All built with semantic HTML and scoped CSS.
- **Design tokens** -- A single CSS file with custom properties for colors, typography, spacing, and layout. Change your entire theme by editing a handful of variables.
- **CLI scaffolding** -- Run `npx ink-cli init` and answer a few prompts. Your site is ready to edit and deploy in under a minute.
- **SEO and feeds** -- Every page gets proper meta tags, Open Graph data, and structured markup. RSS and sitemap are generated automatically.
- **Responsive design** -- Mobile-first layouts that work across devices without any extra configuration.

## Who It's For

Ink is built for people who want to ship sites, not manage infrastructure:

- **Solo developers** building personal sites, portfolios, or side projects.
- **Freelancers** delivering client sites that are easy to maintain and cheap to host.
- **Agencies** looking for a lightweight starting point they can customize per client.

If you're comfortable with a terminal and a text editor, you'll feel right at home.

## What's Next

This is just the beginning. We're working on a desktop app with a visual editor, live preview, one-click Git publishing, and media management. But the core of Ink will always be Markdown files and static output.

## Try It Today

Getting started takes one command:

```bash
npx ink-cli init my-site
```

Check out the [documentation](/docs/) to learn more, browse the [features](/features/) to see what's included, or jump straight into the [getting started guide](/docs/getting-started/).

Ink is MIT licensed and open source. We'd love for you to try it, break it, and help us make it better.
