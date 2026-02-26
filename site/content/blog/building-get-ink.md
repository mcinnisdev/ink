---
title: "Building get.ink with Ink: A Dogfooding Story"
slug: "building-get-ink"
excerpt: "We built the Ink marketing site using Ink itself. Here's what we learned."
date: 2026-02-20
author: "Ink Team"
post_tags: "behind-the-scenes, dogfooding"
featured_image: ""
published: true
permalink: "/blog/building-get-ink/"
---

There's no better way to test a tool than to use it for real work. So when it came time to build the marketing site for Ink, we reached for the only CMS we'd trust: Ink itself.

## The Process

It started the same way any Ink project starts:

```bash
npx inksite init site
```

The CLI walked us through the setup prompts -- site name, description, color palette, content types -- and within a minute we had a working scaffold with pages, blog posts, and components ready to customize.

From there, the workflow looked like this:

1. **Theming** -- We edited the design tokens in the CSS file to set up a dark color scheme with accent colors that matched our brand. No Sass compilation, no build step for styles. Just CSS custom properties.
2. **Content types** -- We enabled the content types we needed: pages, blog posts, FAQs, projects, and team members. Each one came with its own archive page and frontmatter schema.
3. **Components** -- We pulled in the hero section, feature grid, CTA blocks, and testimonial components. Each one was already responsive and styled through the design token system.
4. **Content** -- We wrote all the site copy in Markdown files. Pages, blog posts, FAQ entries -- everything lives in the content directory as plain text.

## What Worked Well

The **design token system** was the biggest win. Changing the entire look of the site meant editing a handful of CSS custom properties. Colors, fonts, spacing, border radii -- all controlled from one place. We went from the default light theme to our dark branded look in about fifteen minutes.

The **CLI scaffolding** saved a surprising amount of time. Instead of copying boilerplate from a previous project, we got a clean, well-structured starting point with all the right files in all the right places.

**Component composition** felt natural. Each component is a Nunjucks partial with its own scoped styles. Dropping a hero section or a feature grid onto a page was as simple as including a template tag.

## What We Improved

Dogfooding revealed a few rough edges that we smoothed out along the way. We refined the default responsive breakpoints after testing on real devices. We improved the component documentation after catching ourselves looking up our own API. And we simplified the frontmatter schemas after realizing some fields were rarely used.

Every improvement we made went straight back into the starter template. If you run `npx inksite init` today, you're getting the same foundation that powers this site.

## The Takeaway

Building get.ink with Ink gave us confidence that the tool works for real projects, not just demos. It's fast to set up, straightforward to customize, and the output is clean static HTML that loads quickly and deploys anywhere.

If we can build our own site with it, you can build yours.
