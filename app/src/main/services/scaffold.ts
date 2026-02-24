import fs from "fs";
import path from "path";
import { readFile, writeFile } from "./file";

// --- Color helpers for brand color variants ---

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) =>
        Math.max(0, Math.min(255, Math.round(v)))
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
  );
}

function darkenHex(hex: string, percent: number): string {
  const [r, g, b] = hexToRgb(hex);
  const f = 1 - percent / 100;
  return rgbToHex(r * f, g * f, b * f);
}

function lightenHex(hex: string, percent: number): string {
  const [r, g, b] = hexToRgb(hex);
  const f = percent / 100;
  return rgbToHex(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f);
}

/**
 * Content type scaffold definitions.
 * Each defines the directory, layout, collection config, directory defaults,
 * and sample content files to create.
 */

interface ContentTypeScaffold {
  /** Directory under content/ */
  dir: string;
  /** Eleventy layout file name */
  layout: string;
  /** Tag used for Eleventy collection */
  tag: string;
  /** Sort method for contentTypes.json */
  sort: "order" | "date";
  /** Directory defaults (the .json file in content/dir/) */
  directoryDefaults: Record<string, unknown>;
  /** Layout template content (Nunjucks) */
  layoutTemplate: string;
  /** Sample content files */
  samples: Array<{ filename: string; content: string }>;
  /** Navigation entry */
  navEntry?: { label: string; url: string };
  /** Archive page in content/pages/ */
  archivePage?: { filename: string; content: string };
}

const SCAFFOLDS: Record<string, ContentTypeScaffold> = {
  blog: {
    dir: "blog",
    layout: "post.njk",
    tag: "posts",
    sort: "date",
    directoryDefaults: {
      layout: "post.njk",
      tags: "posts",
      published: true,
    },
    layoutTemplate: `---
layout: base.njk
---
<article class="section">
  <div class="container container--narrow">
    {% if featured_image %}
    <div class="hero hero--sm" style="background-image: url('{{ featured_image }}')">
      <div class="hero__overlay"></div>
    </div>
    {% endif %}
    <header class="detail__header">
      <h1>{{ title }}</h1>
      {% if date %}<time class="detail__meta" datetime="{{ date | dateISO }}">{{ date | dateISO }}</time>{% endif %}
      {% if author %}<span class="detail__meta"> · {{ author }}</span>{% endif %}
    </header>
    <div class="detail__content">
      {{ content | safe }}
    </div>
  </div>
</article>`,
    samples: [
      {
        filename: "welcome-to-our-blog.md",
        content: `---
title: "Welcome to Our Blog"
slug: "welcome-to-our-blog"
excerpt: "Stay up to date with the latest news, tips, and insights from our team."
date: 2024-01-15
author: "Admin"
published: true
permalink: "/blog/welcome-to-our-blog/"
---
Welcome to our blog! This is where we'll share updates, industry insights, and helpful tips.

## What to Expect

We'll be covering topics related to our industry, sharing behind-the-scenes looks at our work, and providing valuable resources for our community.

Stay tuned for more posts coming soon!`,
      },
    ],
    navEntry: { label: "Blog", url: "/blog/" },
    archivePage: {
      filename: "blog.md",
      content: `---
title: "Blog"
seo_title: "Blog — Latest News & Insights"
meta_description: "Read our latest articles, news, and insights."
slug: "blog"
layout: "archive.njk"
permalink: "/blog/"
published: true
collection_name: "posts"
---`,
    },
  },

  services: {
    dir: "services",
    layout: "service.njk",
    tag: "services",
    sort: "order",
    directoryDefaults: {
      layout: "service.njk",
      tags: "services",
      published: true,
    },
    layoutTemplate: "", // Already exists in starter
    samples: [], // Already exists in starter
    navEntry: { label: "Services", url: "/services/" },
  },

  team: {
    dir: "employees",
    layout: "employee.njk",
    tag: "employees",
    sort: "order",
    directoryDefaults: {
      layout: "employee.njk",
      tags: "employees",
      published: true,
    },
    layoutTemplate: "", // Already exists in starter
    samples: [], // Already exists in starter
    navEntry: { label: "Team", url: "/team/" },
  },

  docs: {
    dir: "docs",
    layout: "doc.njk",
    tag: "docs",
    sort: "order",
    directoryDefaults: {
      layout: "doc.njk",
      tags: "docs",
      published: true,
    },
    layoutTemplate: `---
layout: base.njk
---
<div class="section">
  <div class="container">
    <div class="docs-layout">
      <nav class="docs-sidebar">
        <h3>Documentation</h3>
        <ul>
          {%- for doc in collections.docs %}
          <li><a href="{{ doc.url }}"{% if doc.url == page.url %} class="active"{% endif %}>{{ doc.data.title }}</a></li>
          {%- endfor %}
        </ul>
      </nav>
      <article class="docs-content detail__content">
        <h1>{{ title }}</h1>
        {{ content | safe }}
      </article>
    </div>
  </div>
</div>`,
    samples: [
      {
        filename: "getting-started.md",
        content: `---
title: "Getting Started"
slug: "getting-started"
excerpt: "Learn how to get started with our platform."
order: 1
published: true
permalink: "/docs/getting-started/"
---
## Overview

Welcome to our documentation. This guide will help you get started quickly.

## Prerequisites

Before you begin, make sure you have the following:
- A modern web browser
- An active account

## Quick Start

1. Sign up for an account
2. Follow the onboarding wizard
3. Start using the platform

Need help? [Contact our support team](/contact/).`,
      },
    ],
    navEntry: { label: "Docs", url: "/docs/" },
    archivePage: {
      filename: "docs.md",
      content: `---
title: "Documentation"
seo_title: "Documentation"
meta_description: "Browse our documentation and guides."
slug: "docs"
layout: "archive.njk"
permalink: "/docs/"
published: true
collection_name: "docs"
---`,
    },
  },

  features: {
    dir: "features",
    layout: "feature.njk",
    tag: "features",
    sort: "order",
    directoryDefaults: {
      layout: "feature.njk",
      tags: "features",
      published: true,
    },
    layoutTemplate: `---
layout: base.njk
---
<article class="section">
  <div class="container container--narrow">
    {% if featured_image %}
    <div class="hero hero--sm" style="background-image: url('{{ featured_image }}')">
      <div class="hero__overlay"></div>
    </div>
    {% endif %}
    <div class="detail__content">
      <h1>{{ title }}</h1>
      {% if subtitle %}<p class="detail__subtitle">{{ subtitle }}</p>{% endif %}
      {{ content | safe }}
    </div>
  </div>
</article>`,
    samples: [
      {
        filename: "easy-to-use.md",
        content: `---
title: "Easy to Use"
slug: "easy-to-use"
excerpt: "Our intuitive interface makes it simple for anyone to get started."
subtitle: "No technical expertise required"
order: 1
published: true
permalink: "/features/easy-to-use/"
---
## Designed for Everyone

Our platform was built with simplicity in mind. Whether you're a beginner or an expert, you'll find our tools intuitive and powerful.

### Key Benefits

- **Intuitive Interface** — Clean, modern design that's easy to navigate
- **Quick Setup** — Get started in minutes, not hours
- **Guided Workflows** — Step-by-step processes for common tasks`,
      },
    ],
    navEntry: { label: "Features", url: "/features/" },
    archivePage: {
      filename: "features.md",
      content: `---
title: "Features"
seo_title: "Features — What We Offer"
meta_description: "Explore our powerful features designed to help you succeed."
slug: "features"
layout: "archive.njk"
permalink: "/features/"
published: true
collection_name: "features"
---`,
    },
  },

  "service-areas": {
    dir: "service-areas",
    layout: "service-area.njk",
    tag: "serviceAreas",
    sort: "order",
    directoryDefaults: {
      layout: "service-area.njk",
      tags: "serviceAreas",
      published: true,
    },
    layoutTemplate: `---
layout: base.njk
---
<article class="section">
  <div class="container container--narrow">
    {% if featured_image %}
    <div class="hero hero--sm" style="background-image: url('{{ featured_image }}')">
      <div class="hero__overlay"></div>
    </div>
    {% endif %}
    <div class="detail__content">
      <h1>{{ title }}</h1>
      {{ content | safe }}
    </div>
    {% if cta_title %}
    {% include "components/cta-strip.njk" %}
    {% endif %}
  </div>
</article>`,
    samples: [
      {
        filename: "downtown.md",
        content: `---
title: "Downtown"
slug: "downtown"
excerpt: "Serving the downtown area with reliable, professional service."
order: 1
published: true
permalink: "/service-areas/downtown/"
cta_title: "Need Service in Downtown?"
cta_text: "Contact us today for a free estimate."
cta_url: "/contact/"
cta_label: "Get a Quote"
---
## Serving Downtown

We're proud to serve the downtown area and surrounding neighborhoods. Our team provides fast, reliable service to residential and commercial customers.

### Why Choose Us?

- **Local Expertise** — We know the area inside and out
- **Fast Response Times** — We're just around the corner
- **Trusted by Neighbors** — Serving this community for years`,
      },
    ],
    navEntry: { label: "Service Areas", url: "/service-areas/" },
    archivePage: {
      filename: "service-areas.md",
      content: `---
title: "Service Areas"
seo_title: "Service Areas — Where We Work"
meta_description: "Find out if we serve your area."
slug: "service-areas"
layout: "archive.njk"
permalink: "/service-areas/"
published: true
collection_name: "serviceAreas"
---`,
    },
  },

  portfolio: {
    dir: "portfolio",
    layout: "project.njk",
    tag: "projects",
    sort: "date",
    directoryDefaults: {
      layout: "project.njk",
      tags: "projects",
      published: true,
    },
    layoutTemplate: `---
layout: base.njk
---
<article class="section">
  <div class="container container--narrow">
    {% if featured_image %}
    <div class="hero hero--sm" style="background-image: url('{{ featured_image }}')">
      <div class="hero__overlay"></div>
    </div>
    {% endif %}
    <div class="detail__content">
      <h1>{{ title }}</h1>
      {% if client %}<p class="detail__meta">Client: {{ client }}</p>{% endif %}
      {% if date %}<time class="detail__meta">{{ date | dateISO }}</time>{% endif %}
      {{ content | safe }}
    </div>
  </div>
</article>`,
    samples: [
      {
        filename: "sample-project.md",
        content: `---
title: "Website Redesign"
slug: "website-redesign"
excerpt: "A complete redesign of a local business website, improving conversions by 40%."
date: 2024-01-10
client: "Example Corp"
featured_image: ""
published: true
permalink: "/portfolio/website-redesign/"
---
## Project Overview

We redesigned the website for Example Corp, focusing on modern aesthetics, mobile responsiveness, and conversion optimization.

### Challenge

The existing website was outdated, slow, and not mobile-friendly.

### Solution

We built a fast, modern website with a focus on user experience and clear calls to action.

### Results

- 40% increase in conversions
- 60% faster page load times
- 25% reduction in bounce rate`,
      },
    ],
    navEntry: { label: "Portfolio", url: "/portfolio/" },
    archivePage: {
      filename: "portfolio.md",
      content: `---
title: "Portfolio"
seo_title: "Portfolio — Our Work"
meta_description: "Browse our portfolio of completed projects and case studies."
slug: "portfolio"
layout: "archive.njk"
permalink: "/portfolio/"
published: true
collection_name: "projects"
---`,
    },
  },

  faq: {
    dir: "faq",
    layout: "faq.njk",
    tag: "faqs",
    sort: "order",
    directoryDefaults: {
      layout: "faq.njk",
      tags: "faqs",
      published: true,
    },
    layoutTemplate: `---
layout: base.njk
---
<article class="section">
  <div class="container container--narrow">
    <div class="detail__content">
      <h1>{{ title }}</h1>
      {{ content | safe }}
    </div>
  </div>
</article>`,
    samples: [
      {
        filename: "how-do-i-get-started.md",
        content: `---
title: "How do I get started?"
slug: "how-do-i-get-started"
excerpt: "Learn how to get started with our services."
category: "General"
order: 1
published: true
permalink: "/faq/how-do-i-get-started/"
---
Getting started is easy! Simply [contact us](/contact/) or give us a call. We'll schedule a free consultation to understand your needs and create a plan that works for you.

## What to expect

1. **Initial consultation** — We'll discuss your goals and requirements
2. **Proposal** — We'll send you a detailed proposal with pricing
3. **Getting started** — Once approved, we'll begin work right away`,
      },
    ],
    navEntry: { label: "FAQ", url: "/faq/" },
    archivePage: {
      filename: "faq.md",
      content: `---
title: "Frequently Asked Questions"
seo_title: "FAQ — Common Questions Answered"
meta_description: "Find answers to our most frequently asked questions."
slug: "faq"
layout: "archive.njk"
permalink: "/faq/"
published: true
collection_name: "faqs"
---`,
    },
  },
};

/**
 * Scaffold selected content types into a new project.
 * Creates directories, layouts, sample content, and updates contentTypes.json + navigation.json.
 */
export async function scaffoldProject(
  projectPath: string,
  contentTypes: string[],
  siteDescription: string,
  siteName: string,
  siteUrl: string,
  logoPath?: string,
  brandColors?: { primary: string; secondary: string }
): Promise<void> {
  console.log("[scaffold] Starting scaffold for:", projectPath);
  console.log("[scaffold] Content types:", contentTypes);
  console.log("[scaffold] Logo:", logoPath);
  console.log("[scaffold] Colors:", brandColors);

  // Update site.json with description
  const siteJsonPath = path.join(projectPath, "src", "_data", "site.json");
  try {
    const siteJson = JSON.parse(await readFile(siteJsonPath));
    if (siteDescription) siteJson.description = siteDescription;
    if (siteName) siteJson.name = siteName;
    if (siteUrl) siteJson.url = siteUrl;
    await writeFile(siteJsonPath, JSON.stringify(siteJson, null, 2));
    console.log("[scaffold] Updated site.json");
  } catch (err) {
    console.error("[scaffold] Failed to update site.json:", err);
  }

  // Read existing contentTypes.json
  const contentTypesPath = path.join(projectPath, "src", "_data", "contentTypes.json");
  let existingTypes: Record<string, { glob: string; sort: string }> = {};
  try {
    existingTypes = JSON.parse(await readFile(contentTypesPath));
  } catch { /* ok */ }

  // Read existing navigation.json
  const navPath = path.join(projectPath, "src", "_data", "navigation.json");
  let navConfig: { main: Array<{ label: string; url: string }> } = { main: [] };
  try {
    navConfig = JSON.parse(await readFile(navPath));
  } catch { /* ok */ }

  const existingNavUrls = new Set(navConfig.main.map((n) => n.url));

  for (const typeId of contentTypes) {
    const scaffold = SCAFFOLDS[typeId];
    if (!scaffold) {
      console.log("[scaffold] Unknown type, skipping:", typeId);
      continue;
    }

    // Skip types that already exist (services, team are already in starter)
    if (typeId === "services" || typeId === "team") {
      // Just ensure nav entry exists
      if (scaffold.navEntry && !existingNavUrls.has(scaffold.navEntry.url)) {
        navConfig.main.push(scaffold.navEntry);
        existingNavUrls.add(scaffold.navEntry.url);
      }
      continue;
    }

    // Create content directory
    const contentDir = path.join(projectPath, "content", scaffold.dir);
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }

    // Write directory defaults JSON
    const defaultsPath = path.join(contentDir, `${scaffold.dir}.json`);
    if (!fs.existsSync(defaultsPath)) {
      await writeFile(defaultsPath, JSON.stringify(scaffold.directoryDefaults, null, 2));
    }

    // Create layout if it doesn't exist and template is provided
    if (scaffold.layoutTemplate) {
      const layoutPath = path.join(projectPath, "src", "_layouts", scaffold.layout);
      if (!fs.existsSync(layoutPath)) {
        await writeFile(layoutPath, scaffold.layoutTemplate);
      }
    }

    // Write sample content files
    for (const sample of scaffold.samples) {
      const samplePath = path.join(contentDir, sample.filename);
      if (!fs.existsSync(samplePath)) {
        await writeFile(samplePath, sample.content);
      }
    }

    // Add to contentTypes.json
    const collectionKey = scaffold.tag === "serviceAreas" ? "serviceAreas" : scaffold.tag;
    if (!existingTypes[collectionKey]) {
      existingTypes[collectionKey] = {
        glob: `content/${scaffold.dir}/*.md`,
        sort: scaffold.sort,
      };
    }

    // Add nav entry
    if (scaffold.navEntry && !existingNavUrls.has(scaffold.navEntry.url)) {
      navConfig.main.push(scaffold.navEntry);
      existingNavUrls.add(scaffold.navEntry.url);
    }

    // Create archive page
    if (scaffold.archivePage) {
      const archivePath = path.join(projectPath, "content", "pages", scaffold.archivePage.filename);
      if (!fs.existsSync(archivePath)) {
        await writeFile(archivePath, scaffold.archivePage.content);
      }
    }
  }

  // Write updated contentTypes.json
  console.log("[scaffold] Writing contentTypes:", JSON.stringify(existingTypes));
  await writeFile(contentTypesPath, JSON.stringify(existingTypes, null, 2));

  // Write updated navigation.json
  console.log("[scaffold] Writing navigation:", JSON.stringify(navConfig));
  await writeFile(navPath, JSON.stringify(navConfig, null, 2));

  // Copy logo if provided
  if (logoPath && fs.existsSync(logoPath)) {
    const siteMediaDir = path.join(projectPath, "media", "site");
    if (!fs.existsSync(siteMediaDir)) {
      fs.mkdirSync(siteMediaDir, { recursive: true });
    }
    const ext = path.extname(logoPath);
    const dest = path.join(siteMediaDir, `logo${ext}`);
    fs.copyFileSync(logoPath, dest);
  }

  // Update brand colors in CSS
  if (brandColors) {
    const cssPath = path.join(projectPath, "src", "css", "main.css");
    try {
      let css = await readFile(cssPath);
      // Primary
      css = css.replace(
        /--color-primary: #[0-9a-fA-F]{6};/,
        `--color-primary: ${brandColors.primary};`
      );
      css = css.replace(
        /--color-primary-dark: #[0-9a-fA-F]{6};/,
        `--color-primary-dark: ${darkenHex(brandColors.primary, 15)};`
      );
      css = css.replace(
        /--color-primary-light: #[0-9a-fA-F]{6};/,
        `--color-primary-light: ${lightenHex(brandColors.primary, 30)};`
      );
      // Secondary
      css = css.replace(
        /--color-secondary: #[0-9a-fA-F]{6};/,
        `--color-secondary: ${brandColors.secondary};`
      );
      css = css.replace(
        /--color-secondary-dark: #[0-9a-fA-F]{6};/,
        `--color-secondary-dark: ${darkenHex(brandColors.secondary, 15)};`
      );
      css = css.replace(
        /--color-secondary-light: #[0-9a-fA-F]{6};/,
        `--color-secondary-light: ${lightenHex(brandColors.secondary, 30)};`
      );
      await writeFile(cssPath, css);
    } catch {
      /* CSS update is non-critical */
    }
  }
}
