---
title: "Seriously, Another CMS?"
slug: "seriously-another-cms"
excerpt: "Yes. No. Maybe. Not really. Here's why I'm building Ink anyway."
date: 2026-02-26
author: "Nick McInnis"
post_tags: "opinion, behind-the-scenes"
featured_image: ""
published: true
permalink: "/blog/seriously-another-cms/"
---

Yes. No. Maybe. Not really.

I know what you're thinking. There are already hundreds of content management systems out there. Strapi, Sanity, Contentful, Optimizely, WordPress, Wix, Squarespace -- the list goes on. Why would anyone build another one?

Honestly, I've asked myself the same question more times than I'd like to admit.

## The Gap Nobody Talks About

If you spend any time evaluating CMS platforms, you'll notice they split into two camps.

**Camp one: built for developers and big teams.** Strapi, Sanity, Contentful, and their friends are powerful headless platforms with APIs, webhooks, and enough configuration options to make your head spin. They're fantastic if you have a dev team, a deployment pipeline, and hundreds or thousands of pages of content to manage. But if you're a local plumber who just needs a website with five pages and a phone number? You're not setting up a headless CMS with a React frontend. You're just not.

**Camp two: built for everyone, used by everyone.** WordPress, Wix, and Squarespace promise that anyone can build a website. And technically they can. But "anyone can" doesn't mean "anyone enjoys it." These platforms have gotten so bloated with features, upsells, plugins, and abstractions that adding a single page to your website can take an hour. Your site loads slowly because it's dragging along a database, a PHP runtime, and forty plugins you installed three years ago. And you're paying monthly for the privilege.

There's a gap between these two camps. It's where most small businesses actually live: they need a site that's simple, fast, and easy to update, without the complexity of a developer-oriented platform or the bloat of a website builder.

## What I Actually Built (and Why)

I'm a web developer. I build websites for small businesses -- mostly local service companies. Roofers, remodelers, electricians. The kind of businesses that need a clean, fast website that shows up in Google and has their phone number in the right place.

For years my workflow has been the same: build the site with a static site generator, hand it over to the client, and then field a call every time they need to change a paragraph. Because no matter how clean the codebase is, asking a non-technical person to edit a Markdown file in a Git repository is not a real solution.

Ink is the tool I built to fix that handoff. It's a desktop app that sits on top of [Eleventy](https://www.11ty.dev/), one of the best static site generators out there. The client opens the app, clicks on a page, edits the content, and hits publish. That's it. No terminal, no config files, no build commands, no Git knowledge required. Under the hood it's still just Markdown files and static HTML, which means the sites are fast, secure, and can be hosted anywhere for almost nothing.

## Standing on the Shoulders of Giants

I want to be clear about something: I didn't build a static site generator. Zach Leatherman built Eleventy, and it's excellent. I didn't invent Markdown. I didn't write the code editor or the rich text engine. I'm using Electron, React, CodeMirror, TipTap, and a dozen other open-source projects that people far more talented than me have spent years building and maintaining.

And let's be honest about the other elephant in the room -- a significant portion of Ink's code was written with the help of LLMs. I'm not a 10x developer cranking out thousands of lines of pristine code. I'm a freelancer who saw a problem, had a rough idea of how to solve it, and used every tool available to me to make it real. That includes Claude, Copilot, and whatever else gets the job done.

Ink isn't groundbreaking. It isn't necessarily new. It's a specific combination of existing, proven technologies, packaged in a way that solves a specific problem for a specific group of people.

## So... Another CMS?

Not really. It's more like a bridge.

On one side you have static site generators that produce fast, lightweight websites but require technical knowledge to use. On the other side you have people who need to update their website without calling their developer every time.

Ink connects those two sides. The developer gets to work with tools they already know and love. The client gets a simple app that lets them manage their content without touching code. The output is still just static HTML -- no databases, no server-side rendering, no monthly platform fees eating into a small business's budget.

Is it for everyone? No. If you're managing an e-commerce store with ten thousand products, use Shopify. If you're running a SaaS with a hundred developers, use whatever your team prefers. Ink is for the local business with a ten-page website that should be simple to maintain and shouldn't cost a fortune to host.

## Get in Touch

If you're a small business owner looking for a fast, no-nonsense website -- or a developer who's tired of the same handoff problem -- I'd genuinely like to hear from you.

You can check out my work at [mcinnis.dev](https://mcinnis.dev) or send me an email at [nick@mcinnis.dev](mailto:nick@mcinnis.dev).

And if you just want to kick the tires on Ink itself, it's open source and free:

```bash
npx ink-cli init my-site
```

Thanks for reading. Now if you'll excuse me, I have another CMS to go work on.
