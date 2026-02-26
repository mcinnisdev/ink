---
title: "Deploy Anywhere"
slug: "deploy-anywhere"
excerpt: "Static HTML output that runs on any CDN. No servers, no runtime, no vendor lock-in."
subtitle: "Build once. Host everywhere."
icon: "cloud"
order: 8
published: true
permalink: "/features/deploy-anywhere/"
---

## Static HTML Output

When you run `npm run build`, Ink compiles your entire site into a folder of static HTML, CSS, and image files. There is no server-side runtime, no database connection, and no application server. The output is plain files that any web server can deliver.

```bash
npx inksite build
# ✓ Built 47 pages in 0.38s
# ✓ Output: _site/
```

The `_site/` directory contains everything. Upload it anywhere and your site works.

## Supported Hosting Providers

Ink works with every static hosting platform. Here are the most common options:

**Cloudflare Pages** -- Connect your Git repo and Cloudflare builds and deploys on every push. Free tier includes unlimited bandwidth and requests.

**Netlify** -- Drop your `_site/` folder or connect a Git repo. Build command: `npm run build`. Publish directory: `_site`.

**Vercel** -- Same Git-based workflow. Zero-config detection for Eleventy projects.

**GitHub Pages** -- Push to a `gh-pages` branch or use GitHub Actions to build and deploy. Free for public repos.

**Any CDN or server** -- Because the output is static files, you can host on AWS S3 + CloudFront, DigitalOcean Spaces, Firebase Hosting, Surge, or even a basic Apache/Nginx server.

## Zero Server Dependencies

Your production site requires:

- No Node.js runtime
- No database
- No server-side language
- No container orchestration
- No process manager

This eliminates entire categories of operational concerns -- no security patches for server software, no database backups, no scaling configuration, no uptime monitoring for application servers.

## Global Edge Delivery

Static files are the fastest thing a CDN can serve. When your site lives on a CDN edge network, every visitor gets responses from the nearest data center. Typical time-to-first-byte is under 50ms worldwide.

## Deploy Workflow

A complete deploy workflow for Ink:

```bash
# Build the site
npm run build

# Preview the output locally
npx serve _site

# Deploy (example: Cloudflare Pages via Wrangler)
npx wrangler pages deploy _site --project-name=my-site
```

Or just push to Git and let your hosting provider's CI handle it.

## No Vendor Lock-In

Because Ink outputs standard HTML files, switching hosting providers is a matter of pointing the build output to a different service. There is no proprietary deployment format, no serverless functions to rewrite, and no platform-specific configuration to migrate. Your site is portable by default.
