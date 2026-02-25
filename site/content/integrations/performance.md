---
title: "Performance & Caching"
slug: "performance"
excerpt: "You don't need caching plugins -- Ink is already static. Every page is pre-rendered at build time."
icon: "zap"
order: 10
replaces: "WP Rocket, W3 Total Cache, Autoptimize"
published: true
permalink: "/integrations/performance/"
---

## No Plugin Needed

WordPress needs caching plugins because PHP generates pages dynamically on every request. Ink builds static HTML files at deploy time. There is nothing to cache because every page is already pre-rendered.

Deploy to Cloudflare Pages and you get global edge CDN delivery for free -- faster than any cached WordPress site.

## Why This Matters

- **No server-side processing** -- every page is pre-built HTML
- **No database queries** -- there is no database
- **No PHP execution** -- there is no PHP
- **Global CDN delivery** -- Cloudflare Pages serves from 300+ edge locations
- **Perfect caching headers** -- static files are naturally cacheable

The performance plugins that WordPress sites depend on exist to solve a problem that static sites don't have.
