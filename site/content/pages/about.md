---
title: "About"
seo_title: "About — Ink CMS"
meta_description: "Ink is built by Nick McInnis as a personal tool for spinning up fast, optimized, scalable websites. Built openly with AI assistance."
slug: "about"
layout: "page.njk"
permalink: "/about/"
published: true
---

Ink is built and maintained by **Nick McInnis**, a developer based in Colorado. You can find more of my work at [mcinnis.dev](https://mcinnis.dev).

## Why I'm Building This

I build a lot of websites. For clients, for side projects, for ideas that might go somewhere and ideas that won't. Every time, I found myself doing the same thing: copying a previous project, stripping out the old content, fixing the things that broke, and spending hours on setup before writing a single line of real code.

I wanted a tool that would let me go from zero to a production-ready site in under a minute. Not a bloated platform with a hundred features I'd never use -- just the right scaffolding, the right defaults, and a clean structure I could build on.

Ink is that tool. It's a personal utility that grew into something worth sharing.

### What I Optimized For

- **Speed** -- Static HTML output, zero client-side JavaScript by default, image optimization at build time. Every site starts fast and stays fast.
- **Maintainability** -- Content lives in Markdown files. Templates are plain Nunjucks. CSS uses design tokens. There's no framework to upgrade, no database to migrate, no vendor to depend on.
- **Scalability** -- The same architecture works for a single-page portfolio and a 500-page documentation site. Add content types, install components, deploy to any CDN.
- **Developer experience** -- One command to scaffold. One command to add a component. One command to build. The CLI handles the boring parts so I can focus on the work that matters.

Ink isn't trying to replace WordPress or compete with Next.js. It's a focused tool for people who think in Markdown and ship static sites.

## Transparency: AI-Assisted Development

I believe in being upfront about how things are built. Ink is developed with heavy usage and reliance on AI assistance -- specifically [Claude](https://claude.ai) by Anthropic.

### How AI Is Used

- **Code generation** -- The majority of Ink's codebase -- CLI tools, Eleventy configurations, Nunjucks templates, CSS architecture, and build scripts -- has been written with AI assistance. I describe what I want, review the output, test it, and iterate.
- **Architecture decisions** -- AI helps evaluate trade-offs, suggest approaches, and identify edge cases I might miss. The image optimization pipeline, for example, went through several iterations before landing on the transform plugin approach after discovering that Nunjucks async filters silently fail inside included partials within loops.
- **Documentation and content** -- The docs, feature pages, and blog posts on this site were drafted with AI and edited for accuracy and tone.
- **Debugging** -- When something breaks, AI helps trace the issue, propose fixes, and verify solutions. Every commit in the repository includes a `Co-Authored-By` tag crediting Claude.

### Why I'm Transparent About This

AI tools are changing how software gets built. I think that's a good thing, and I think pretending otherwise does a disservice to the people using these tools and the people evaluating the output.

Using AI doesn't mean the work is low quality or unreviewed. It means I can ship faster, explore more approaches, and build things I wouldn't have time to build alone. Every line of code still gets tested. Every architectural decision still gets scrutinized. The AI is a collaborator, not an autopilot.

If you're evaluating Ink for your own projects, you should know how it was made. That's the point of this section.

## Get in Touch

- **GitHub**: [github.com/mcinnisdev/ink](https://github.com/mcinnisdev/ink)
- **Personal site**: [mcinnis.dev](https://mcinnis.dev)
