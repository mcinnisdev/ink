---
title: "Ink"
seo_title: "Ink — The Markdown-Native CMS"
meta_description: "Ink is an open-source, Markdown-native CMS built on Eleventy v3. Zero database, static output, deploy anywhere. Scaffold a complete site in one command."
slug: "home"
layout: "home.njk"
permalink: "/index.html"
published: true
hero_headline: "Your Website, Written in Markdown."
hero_subtitle: "Ink is an open-source CMS that turns plain Markdown files into fast, beautiful websites. No database. No lock-in. Just files you own, powered by Eleventy v3."
hero_cta_text: "Get Started"
hero_cta_url: "/docs/getting-started/"
hero_code: |
  <span class="prompt">$</span> npx ink init my-site
  <span class="comment"># Scaffolding project into ./my-site</span>
  <span class="comment"># ✓ Created content directories</span>
  <span class="comment"># ✓ Installed design tokens</span>
  <span class="comment"># ✓ Site ready</span>

  <span class="prompt">$</span> cd my-site && npx ink add contact-form
  <span class="comment"># ✓ Component installed</span>

  <span class="prompt">$</span> npm run dev
  <span class="comment"># ✓ Server running at http://localhost:8080</span>
features_section:
  heading: "Everything You Need. Nothing You Don't."
  columns: 3
  cta_text: "Explore All Features"
  cta_url: "/features/"
  items:
    - icon: "file-text"
      title: "Markdown-Native"
      description: "Content lives in plain .md files with YAML frontmatter. Edit with any text editor, version with Git, sync with Obsidian."
    - icon: "zap"
      title: "Lightning Builds"
      description: "Eleventy v3 compiles your entire site to static HTML in milliseconds. No client-side JavaScript required."
    - icon: "puzzle"
      title: "12 Components"
      description: "Install pre-built components with one command — contact forms, pricing tables, image galleries, and more."
    - icon: "palette"
      title: "Design Tokens"
      description: "One CSS file controls your entire brand. Change colors, typography, and spacing from a single source of truth."
    - icon: "package"
      title: "8 Content Types"
      description: "Blog, docs, team, services, portfolio, FAQ, features, and service areas — all built in and ready to use."
    - icon: "rocket"
      title: "Deploy Anywhere"
      description: "Static HTML output means any CDN works. Cloudflare Pages, Netlify, Vercel, GitHub Pages — take your pick."
how_it_works:
  heading: "Ship in Three Steps"
  steps:
    - title: "Scaffold"
      description: "Run npx ink init to generate a complete project with content types, design tokens, layouts, and a dev server — all configured and ready to go."
    - title: "Write"
      description: "Add content in Markdown. Each file is a page. Frontmatter handles metadata. Directories map to URLs. Open the content folder in Obsidian for a rich editing experience."
    - title: "Deploy"
      description: "Run npm run build to generate static HTML, then push to any hosting provider. No servers to manage, no databases to maintain, no vendor lock-in."
code_examples:
  heading: "See How Simple It Is"
  tabs:
    - label: "Content File"
      content: "<pre><code><span class=\"token punctuation\">---</span>\n<span class=\"token property\">title:</span> <span class=\"token string\">\"Redesigning Our Dashboard\"</span>\n<span class=\"token property\">slug:</span> <span class=\"token string\">\"redesigning-dashboard\"</span>\n<span class=\"token property\">date:</span> <span class=\"token number\">2026-02-24</span>\n<span class=\"token property\">author:</span> <span class=\"token string\">\"Jane Chen\"</span>\n<span class=\"token property\">excerpt:</span> <span class=\"token string\">\"How we rebuilt the UI from scratch.\"</span>\n<span class=\"token property\">featured_image:</span> <span class=\"token string\">\"/assets/img/dashboard.jpg\"</span>\n<span class=\"token property\">published:</span> <span class=\"token boolean\">true</span>\n<span class=\"token punctuation\">---</span>\n\n<span class=\"token keyword\">##</span> The Problem\n\nOur old dashboard loaded in <span class=\"token important\">**4.2 seconds**</span>.\nUsers were leaving before it rendered.\n\n<span class=\"token keyword\">##</span> The Solution\n\nWe moved to a component-based architecture\nwith lazy loading and edge caching.\n\n- Reduced bundle size by <span class=\"token number\">60%</span>\n- Time to interactive under <span class=\"token number\">800ms</span>\n- User retention up <span class=\"token number\">35%</span></code></pre>"
    - label: "Design Tokens"
      content: "<pre><code><span class=\"token comment\">/* tokens.css — your entire brand in one file */</span>\n\n<span class=\"token selector\">:root</span> <span class=\"token punctuation\">{</span>\n  <span class=\"token comment\">/* Colors */</span>\n  <span class=\"token property\">--color-primary</span><span class=\"token punctuation\">:</span> <span class=\"token number\">#2563eb</span><span class=\"token punctuation\">;</span>\n  <span class=\"token property\">--color-secondary</span><span class=\"token punctuation\">:</span> <span class=\"token number\">#7c3aed</span><span class=\"token punctuation\">;</span>\n  <span class=\"token property\">--color-accent</span><span class=\"token punctuation\">:</span> <span class=\"token number\">#06b6d4</span><span class=\"token punctuation\">;</span>\n\n  <span class=\"token comment\">/* Typography */</span>\n  <span class=\"token property\">--font-body</span><span class=\"token punctuation\">:</span> <span class=\"token string\">'Inter'</span>, system-ui, sans-serif<span class=\"token punctuation\">;</span>\n  <span class=\"token property\">--font-heading</span><span class=\"token punctuation\">:</span> <span class=\"token string\">'Cal Sans'</span>, <span class=\"token function\">var</span>(<span class=\"token property\">--font-body</span>)<span class=\"token punctuation\">;</span>\n  <span class=\"token property\">--step-0</span><span class=\"token punctuation\">:</span> <span class=\"token function\">clamp</span>(<span class=\"token number\">1rem</span>, 0.5vw + 0.9rem, <span class=\"token number\">1.125rem</span>)<span class=\"token punctuation\">;</span>\n\n  <span class=\"token comment\">/* Spacing */</span>\n  <span class=\"token property\">--space-sm</span><span class=\"token punctuation\">:</span> <span class=\"token function\">clamp</span>(<span class=\"token number\">0.75rem</span>, 1vw, <span class=\"token number\">1rem</span>)<span class=\"token punctuation\">;</span>\n  <span class=\"token property\">--space-md</span><span class=\"token punctuation\">:</span> <span class=\"token function\">clamp</span>(<span class=\"token number\">1.5rem</span>, 3vw, <span class=\"token number\">2rem</span>)<span class=\"token punctuation\">;</span>\n  <span class=\"token property\">--space-lg</span><span class=\"token punctuation\">:</span> <span class=\"token function\">clamp</span>(<span class=\"token number\">2rem</span>, 5vw, <span class=\"token number\">4rem</span>)<span class=\"token punctuation\">;</span>\n\n  <span class=\"token comment\">/* Shadows */</span>\n  <span class=\"token property\">--shadow-sm</span><span class=\"token punctuation\">:</span> <span class=\"token number\">0</span> 1px 2px <span class=\"token function\">rgba</span>(<span class=\"token number\">0,0,0,.05</span>)<span class=\"token punctuation\">;</span>\n  <span class=\"token property\">--shadow-md</span><span class=\"token punctuation\">:</span> <span class=\"token number\">0</span> 4px 12px <span class=\"token function\">rgba</span>(<span class=\"token number\">0,0,0,.1</span>)<span class=\"token punctuation\">;</span>\n<span class=\"token punctuation\">}</span></code></pre>"
    - label: "CLI Usage"
      content: "<pre><code><span class=\"token comment\"># Scaffold a new project</span>\n<span class=\"token function\">$</span> npx ink init <span class=\"token variable\">my-site</span>\n\n<span class=\"token comment\"># Add a content type</span>\n<span class=\"token function\">$</span> npx ink generate <span class=\"token variable\">blog</span>\n\n<span class=\"token comment\"># Install a component</span>\n<span class=\"token function\">$</span> npx ink add <span class=\"token variable\">pricing-table</span>\n\n<span class=\"token comment\"># List available components</span>\n<span class=\"token function\">$</span> npx ink list <span class=\"token variable\">components</span>\n\n<span class=\"token comment\"># Start the dev server</span>\n<span class=\"token function\">$</span> npx ink <span class=\"token variable\">serve</span>\n\n<span class=\"token comment\"># Build for production</span>\n<span class=\"token function\">$</span> npx ink <span class=\"token variable\">build</span></code></pre>"
stats:
  - value: 0
    suffix: ""
    label: "Database Dependencies"
  - value: 8
    suffix: ""
    label: "Built-in Content Types"
  - value: 12
    suffix: ""
    label: "Installable Components"
  - value: 100
    suffix: "%"
    label: "Static Output"
faq_items:
  - question: "What is Ink?"
    answer: "Ink is an open-source, Markdown-native CMS built on Eleventy v3. It gives you a complete website with content types, design tokens, and CLI tools — all powered by plain Markdown files."
  - question: "Do I need coding experience?"
    answer: "Basic familiarity with the command line and Markdown is helpful, but you don't need to be a developer. Ink handles the build system, layouts, and components for you."
  - question: "How is Ink different from WordPress or other CMS platforms?"
    answer: "Ink has no database, no admin panel, and no server runtime. Your content lives in Markdown files, your site compiles to static HTML, and you can host it anywhere for free."
  - question: "Can I use Obsidian to write content?"
    answer: "Yes. Your Ink content directory is a valid Obsidian vault. Open it in Obsidian for a rich writing experience with live preview, backlinks, and graph view."
  - question: "Where can I deploy an Ink site?"
    answer: "Anywhere that serves static files — Cloudflare Pages, Netlify, Vercel, GitHub Pages, or your own server. The output is plain HTML, CSS, and JavaScript."
  - question: "Is Ink free?"
    answer: "Yes, Ink is fully open source under the MIT License. Free to use, modify, and distribute."
---
