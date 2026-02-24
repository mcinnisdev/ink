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
      content: "<pre><code>---\ntitle: \"Redesigning Our Dashboard\"\nslug: \"redesigning-dashboard\"\ndate: 2026-02-24\nauthor: \"Jane Chen\"\nexcerpt: \"How we rebuilt the UI from scratch.\"\nfeatured_image: \"/assets/img/dashboard.jpg\"\npublished: true\n---\n\n## The Problem\n\nOur old dashboard loaded in **4.2 seconds**.\nUsers were leaving before it rendered.\n\n## The Solution\n\nWe moved to a component-based architecture\nwith lazy loading and edge caching.\n\n- Reduced bundle size by 60%\n- Time to interactive under 800ms\n- User retention up 35%</code></pre>"
    - label: "Design Tokens"
      content: "<pre><code>/* tokens.css — your entire brand in one file */\n\n:root {\n  /* Colors */\n  --color-primary: #2563eb;\n  --color-secondary: #7c3aed;\n  --color-accent: #06b6d4;\n\n  /* Typography */\n  --font-body: 'Inter', system-ui, sans-serif;\n  --font-heading: 'Cal Sans', var(--font-body);\n  --step-0: clamp(1rem, 0.5vw + 0.9rem, 1.125rem);\n\n  /* Spacing */\n  --space-sm: clamp(0.75rem, 1vw, 1rem);\n  --space-md: clamp(1.5rem, 3vw, 2rem);\n  --space-lg: clamp(2rem, 5vw, 4rem);\n\n  /* Shadows */\n  --shadow-sm: 0 1px 2px rgba(0,0,0,.05);\n  --shadow-md: 0 4px 12px rgba(0,0,0,.1);\n}</code></pre>"
    - label: "CLI Usage"
      content: "<pre><code># Scaffold a new project\n$ npx ink init my-site\n\n# Add a content type\n$ npx ink generate blog\n\n# Install a component\n$ npx ink add pricing-table\n\n# List available components\n$ npx ink list components\n\n# Start the dev server\n$ npx ink serve\n\n# Build for production\n$ npx ink build</code></pre>"
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
cta_title: "Ready to Build?"
cta_text: "Get started with Ink in under 5 minutes. One command to scaffold, one file to brand, Markdown to write."
cta_url: "/docs/getting-started/"
cta_label: "Read the Docs"
newsletter:
  heading: "Stay Updated"
  description: "Get notified about new releases, components, and features. No spam, unsubscribe anytime."
  action: "#"
---
