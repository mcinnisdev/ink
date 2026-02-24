---
title: "How do I deploy my Ink site?"
slug: "how-do-i-deploy"
excerpt: ""
category: "General"
order: 6
published: true
permalink: "/faq/how-do-i-deploy/"
---

Run `ink build` (or `npx eleventy`) to generate your site into the `_site/` directory. That folder contains plain HTML, CSS, and assets -- everything needed to serve your site. Upload it to any static hosting provider. Popular options include **Cloudflare Pages**, **Netlify**, and **Vercel**, all of which offer free tiers and can automatically rebuild your site when you push to a Git repository. No server configuration required.
