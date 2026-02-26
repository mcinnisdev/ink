import fs from "fs";

/**
 * Content type definitions for the Ink CMS.
 * Each type defines everything needed to scaffold it into a project.
 */

export const CONTENT_TYPES = {
  blog: {
    label: "Blog",
    dir: "blog",
    layout: "post.njk",
    tag: "posts",
    sort: "date",
    directoryDefaults: { layout: "post.njk", tags: "posts", published: true },
    layoutTemplate: `---
layout: base.njk
og_type: article
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
      <div class="post-meta">
        {% if date %}<time class="post-meta__item" datetime="{{ date | dateISO }}">{{ date | dateFormat }}</time>{% endif %}
        {% if author %}<span class="post-meta__item">{{ author }}</span>{% endif %}
        {% if content %}<span class="post-meta__item">{{ content | readingTime }}</span>{% endif %}
      </div>
    </header>
    <div class="detail__content">
      {{ content | safe }}
    </div>
    {% if post_tags %}
    <div class="post-tags">
      {% for tag in post_tags | split(",") %}
      <span class="post-tags__tag">{{ tag | trim }}</span>
      {% endfor %}
    </div>
    {% endif %}
    {%- set allPosts = collections.posts %}
    {%- set currentIndex = -1 %}
    {%- for post in allPosts %}
      {%- if post.url == page.url %}{%- set currentIndex = loop.index0 %}{%- endif %}
    {%- endfor %}
    {%- if currentIndex > 0 or currentIndex < allPosts.length - 1 %}
    <nav class="post-nav" aria-label="Post navigation">
      {%- if currentIndex < allPosts.length - 1 %}
      <a href="{{ allPosts[currentIndex + 1].url }}" class="post-nav__link post-nav__link--prev">
        <span class="post-nav__label">Previous</span>
        <span class="post-nav__title">{{ allPosts[currentIndex + 1].data.title }}</span>
      </a>
      {%- else %}<span></span>{%- endif %}
      {%- if currentIndex > 0 %}
      <a href="{{ allPosts[currentIndex - 1].url }}" class="post-nav__link post-nav__link--next">
        <span class="post-nav__label">Next</span>
        <span class="post-nav__title">{{ allPosts[currentIndex - 1].data.title }}</span>
      </a>
      {%- else %}<span></span>{%- endif %}
    </nav>
    {%- endif %}
  </div>
</article>`,
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
    frontmatter: [
      { key: "title", type: "string", required: true },
      { key: "slug", type: "string", required: true },
      { key: "excerpt", type: "string" },
      { key: "date", type: "date" },
      { key: "author", type: "string" },
      { key: "featured_image", type: "string" },
      { key: "post_tags", type: "string" },
      { key: "published", type: "boolean", default: true },
    ],
    sampleEntry: (title, slug) => `---
title: "${title}"
slug: "${slug}"
excerpt: ""
date: ${new Date().toISOString().split("T")[0]}
author: "Admin"
post_tags: ""
featured_image: "/media/placeholders/landscape-1.png"
published: true
permalink: "/blog/${slug}/"
---
Write your blog post content here.
`,
  },

  services: {
    label: "Services",
    dir: "services",
    layout: "service.njk",
    tag: "services",
    sort: "order",
    existsInStarter: true,
    directoryDefaults: { layout: "service.njk", tags: "services", published: true },
    layoutTemplate: "",
    navEntry: { label: "Services", url: "/services/" },
    frontmatter: [
      { key: "title", type: "string", required: true },
      { key: "slug", type: "string", required: true },
      { key: "excerpt", type: "string" },
      { key: "featured_image", type: "string" },
      { key: "order", type: "number" },
      { key: "price_note", type: "string" },
      { key: "published", type: "boolean", default: true },
    ],
    sampleEntry: (title, slug) => `---
title: "${title}"
slug: "${slug}"
excerpt: ""
featured_image: "/media/placeholders/building.png"
order: 10
published: true
permalink: "/services/${slug}/"
---
Describe this service here.
`,
  },

  team: {
    label: "Team / Staff",
    dir: "employees",
    layout: "employee.njk",
    tag: "employees",
    sort: "order",
    existsInStarter: true,
    directoryDefaults: { layout: "employee.njk", tags: "employees", published: true },
    layoutTemplate: "",
    navEntry: { label: "Team", url: "/team/" },
    frontmatter: [
      { key: "title", type: "string", required: true, label: "Full Name" },
      { key: "slug", type: "string", required: true },
      { key: "role", type: "string" },
      { key: "photo", type: "string" },
      { key: "order", type: "number" },
      { key: "published", type: "boolean", default: true },
    ],
    sampleEntry: (title, slug) => `---
title: "${title}"
slug: "${slug}"
role: ""
photo: "/media/placeholders/avatar-1.png"
order: 10
published: true
permalink: "/team/${slug}/"
---
Write the team member bio here.
`,
  },

  docs: {
    label: "Documentation",
    dir: "docs",
    layout: "doc.njk",
    tag: "docs",
    sort: "order",
    directoryDefaults: { layout: "doc.njk", tags: "docs", published: true },
    layoutTemplate: `---
layout: base.njk
og_type: article
---
<div class="section">
  <div class="container">
    <div class="docs-layout">
      <nav class="docs-sidebar" aria-label="Documentation navigation">
        <h3>Documentation</h3>
        <ul>
          {%- for doc in collections.docs %}
          <li><a href="{{ doc.url }}"{% if doc.url == page.url %} class="active" aria-current="page"{% endif %}>{{ doc.data.title }}</a></li>
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
    frontmatter: [
      { key: "title", type: "string", required: true },
      { key: "slug", type: "string", required: true },
      { key: "excerpt", type: "string" },
      { key: "order", type: "number" },
      { key: "published", type: "boolean", default: true },
    ],
    sampleEntry: (title, slug) => `---
title: "${title}"
slug: "${slug}"
excerpt: ""
order: 10
published: true
permalink: "/docs/${slug}/"
---
Write your documentation here.
`,
  },

  features: {
    label: "Features",
    dir: "features",
    layout: "feature.njk",
    tag: "features",
    sort: "order",
    directoryDefaults: { layout: "feature.njk", tags: "features", published: true },
    layoutTemplate: `---
layout: base.njk
og_type: article
---
<article class="section">
  <div class="container container--narrow">
    <a href="/features/" class="detail__back-link">&larr; All Features</a>
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
    {%- set allItems = collections.features %}
    {%- set currentIndex = -1 %}
    {%- for item in allItems %}
      {%- if item.url == page.url %}{%- set currentIndex = loop.index0 %}{%- endif %}
    {%- endfor %}
    {%- if currentIndex > 0 or currentIndex < allItems.length - 1 %}
    <nav class="detail__nav" aria-label="Feature navigation">
      {%- if currentIndex > 0 %}
      <a href="{{ allItems[currentIndex - 1].url }}" class="detail__nav-link detail__nav-link--prev">
        <span class="detail__nav-label">Previous</span>
        <span class="detail__nav-title">{{ allItems[currentIndex - 1].data.title }}</span>
      </a>
      {%- else %}<span></span>{%- endif %}
      {%- if currentIndex < allItems.length - 1 %}
      <a href="{{ allItems[currentIndex + 1].url }}" class="detail__nav-link detail__nav-link--next">
        <span class="detail__nav-label">Next</span>
        <span class="detail__nav-title">{{ allItems[currentIndex + 1].data.title }}</span>
      </a>
      {%- else %}<span></span>{%- endif %}
    </nav>
    {%- endif %}
  </div>
</article>`,
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
    frontmatter: [
      { key: "title", type: "string", required: true },
      { key: "slug", type: "string", required: true },
      { key: "excerpt", type: "string" },
      { key: "subtitle", type: "string" },
      { key: "featured_image", type: "string" },
      { key: "order", type: "number" },
      { key: "published", type: "boolean", default: true },
    ],
    sampleEntry: (title, slug) => `---
title: "${title}"
slug: "${slug}"
excerpt: ""
subtitle: ""
featured_image: "/media/placeholders/landscape-1.png"
order: 10
published: true
permalink: "/features/${slug}/"
---
Describe this feature here.
`,
  },

  "service-areas": {
    label: "Service Areas",
    dir: "service-areas",
    layout: "service-area.njk",
    tag: "serviceAreas",
    sort: "order",
    directoryDefaults: { layout: "service-area.njk", tags: "serviceAreas", published: true },
    layoutTemplate: `---
layout: base.njk
og_type: article
---
<article class="section">
  <div class="container container--narrow">
    <a href="/service-areas/" class="detail__back-link">&larr; All Service Areas</a>
    {% if featured_image %}
    <div class="hero hero--sm" style="background-image: url('{{ featured_image }}')">
      <div class="hero__overlay"></div>
    </div>
    {% endif %}
    <div class="detail__content">
      <h1>{{ title }}</h1>
      {% if excerpt %}<p class="detail__subtitle">{{ excerpt }}</p>{% endif %}
      {{ content | safe }}
    </div>
    {% if cta_title %}
    <div class="detail__cta">
      <h3>{{ cta_title }}</h3>
      {% if cta_text %}<p>{{ cta_text }}</p>{% endif %}
      {% if cta_url and cta_label %}
      <a href="{{ cta_url }}" class="btn btn--primary">{{ cta_label }}</a>
      {% endif %}
    </div>
    {% endif %}
  </div>
</article>`,
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
    frontmatter: [
      { key: "title", type: "string", required: true },
      { key: "slug", type: "string", required: true },
      { key: "excerpt", type: "string" },
      { key: "featured_image", type: "string" },
      { key: "order", type: "number" },
      { key: "cta_title", type: "string" },
      { key: "cta_text", type: "string" },
      { key: "cta_url", type: "string" },
      { key: "cta_label", type: "string" },
      { key: "published", type: "boolean", default: true },
    ],
    sampleEntry: (title, slug) => `---
title: "${title}"
slug: "${slug}"
excerpt: "Serving the ${title} area with reliable, professional service."
order: 10
published: true
permalink: "/service-areas/${slug}/"
cta_title: "Need Service in ${title}?"
cta_text: "Contact us today for a free estimate."
cta_url: "/contact/"
cta_label: "Get a Quote"
---
## Serving ${title}

We're proud to serve the ${title} area and surrounding neighborhoods.
`,
  },

  portfolio: {
    label: "Portfolio / Projects",
    dir: "portfolio",
    layout: "project.njk",
    tag: "projects",
    sort: "date",
    directoryDefaults: { layout: "project.njk", tags: "projects", published: true },
    layoutTemplate: `---
layout: base.njk
og_type: article
---
{% if featured_image %}
<div class="hero hero--sm" style="background-image: url('{{ featured_image }}')">
  <div class="hero__overlay"></div>
  <div class="hero__content">
    <h1 class="hero__title">{{ title }}</h1>
    {% if client %}<p class="hero__subtitle">{{ client }}</p>{% endif %}
  </div>
</div>
{% endif %}
<article class="section">
  <div class="container container--narrow">
    <a href="/portfolio/" class="detail__back-link">&larr; All Projects</a>
    {% if not featured_image %}<h1>{{ title }}</h1>{% endif %}
    <div class="detail__meta-bar">
      {% if client %}<span class="detail__badge">{{ client }}</span>{% endif %}
      {% if date %}<time datetime="{{ date | dateISO }}">{{ date | dateFormat }}</time>{% endif %}
    </div>
    <div class="detail__content">
      {{ content | safe }}
    </div>
    {%- set allItems = collections.projects %}
    {%- set currentIndex = -1 %}
    {%- for item in allItems %}
      {%- if item.url == page.url %}{%- set currentIndex = loop.index0 %}{%- endif %}
    {%- endfor %}
    {%- if currentIndex > 0 or currentIndex < allItems.length - 1 %}
    <nav class="detail__nav" aria-label="Project navigation">
      {%- if currentIndex > 0 %}
      <a href="{{ allItems[currentIndex - 1].url }}" class="detail__nav-link detail__nav-link--prev">
        <span class="detail__nav-label">Previous</span>
        <span class="detail__nav-title">{{ allItems[currentIndex - 1].data.title }}</span>
      </a>
      {%- else %}<span></span>{%- endif %}
      {%- if currentIndex < allItems.length - 1 %}
      <a href="{{ allItems[currentIndex + 1].url }}" class="detail__nav-link detail__nav-link--next">
        <span class="detail__nav-label">Next</span>
        <span class="detail__nav-title">{{ allItems[currentIndex + 1].data.title }}</span>
      </a>
      {%- else %}<span></span>{%- endif %}
    </nav>
    {%- endif %}
  </div>
</article>`,
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
    frontmatter: [
      { key: "title", type: "string", required: true },
      { key: "slug", type: "string", required: true },
      { key: "excerpt", type: "string" },
      { key: "date", type: "date" },
      { key: "client", type: "string" },
      { key: "featured_image", type: "string" },
      { key: "published", type: "boolean", default: true },
    ],
    sampleEntry: (title, slug) => `---
title: "${title}"
slug: "${slug}"
excerpt: ""
date: ${new Date().toISOString().split("T")[0]}
client: ""
featured_image: "/media/placeholders/product.png"
published: true
permalink: "/portfolio/${slug}/"
---
Describe this project here.
`,
  },

  faq: {
    label: "FAQ",
    dir: "faq",
    layout: "faq.njk",
    tag: "faqs",
    sort: "order",
    directoryDefaults: { layout: "faq.njk", tags: "faqs", published: true },
    layoutTemplate: `---
layout: base.njk
og_type: article
---
<article class="section">
  <div class="container container--narrow">
    <a href="/faq/" class="detail__back-link">&larr; All FAQ</a>
    <div class="faq-detail">
      {% if category %}<span class="faq-category">{{ category }}</span>{% endif %}
      <h1>{{ title }}</h1>
      <div class="detail__content">
        {{ content | safe }}
      </div>
    </div>
    {%- set allItems = collections.faqs %}
    {%- set currentIndex = -1 %}
    {%- for item in allItems %}
      {%- if item.url == page.url %}{%- set currentIndex = loop.index0 %}{%- endif %}
    {%- endfor %}
    {%- if currentIndex > 0 or currentIndex < allItems.length - 1 %}
    <nav class="detail__nav" aria-label="FAQ navigation">
      {%- if currentIndex > 0 %}
      <a href="{{ allItems[currentIndex - 1].url }}" class="detail__nav-link detail__nav-link--prev">
        <span class="detail__nav-label">Previous</span>
        <span class="detail__nav-title">{{ allItems[currentIndex - 1].data.title }}</span>
      </a>
      {%- else %}<span></span>{%- endif %}
      {%- if currentIndex < allItems.length - 1 %}
      <a href="{{ allItems[currentIndex + 1].url }}" class="detail__nav-link detail__nav-link--next">
        <span class="detail__nav-label">Next</span>
        <span class="detail__nav-title">{{ allItems[currentIndex + 1].data.title }}</span>
      </a>
      {%- else %}<span></span>{%- endif %}
    </nav>
    {%- endif %}
  </div>
</article>`,
    navEntry: { label: "FAQ", url: "/faq/" },
    additionalLayouts: [
      {
        filename: "faq-archive.njk",
        content: `---
layout: base.njk
---
<section class="hero hero--no-image hero--sm">
  <div class="hero__content">
    <h1 class="hero__title">{{ title }}</h1>
    {% if excerpt %}<p class="hero__subtitle">{{ excerpt }}</p>{% endif %}
  </div>
</section>

<section class="section">
  <div class="container container--narrow">
    {%- set items = collections[collection_name] -%}
    {% if items and items.length %}
    <div class="faq-accordion">
      {% for item in items %}
      <details class="faq-accordion__item">
        <summary class="faq-accordion__question">
          {{ item.data.title }}
          {% if item.data.category %}<span class="faq-category">{{ item.data.category }}</span>{% endif %}
        </summary>
        <div class="faq-accordion__answer">
          {{ item.content | safe }}
        </div>
      </details>
      {% endfor %}
    </div>
    {% else %}
    <p class="text-center">No questions yet.</p>
    {% endif %}
  </div>
</section>`,
      },
    ],
    archivePage: {
      filename: "faq.md",
      content: `---
title: "Frequently Asked Questions"
seo_title: "FAQ — Common Questions Answered"
meta_description: "Find answers to our most frequently asked questions."
slug: "faq"
layout: "faq-archive.njk"
permalink: "/faq/"
published: true
collection_name: "faqs"
---`,
    },
    frontmatter: [
      { key: "title", type: "string", required: true, label: "Question" },
      { key: "slug", type: "string", required: true },
      { key: "excerpt", type: "string" },
      { key: "category", type: "string" },
      { key: "order", type: "number" },
      { key: "published", type: "boolean", default: true },
    ],
    sampleEntry: (title, slug) => `---
title: "${title}"
slug: "${slug}"
excerpt: ""
category: "General"
order: 10
published: true
permalink: "/faq/${slug}/"
---
Write the answer here.
`,
  },
};

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Build a content type definition from a custom type config.
 * Used by `ink add custom` to create dynamic content types.
 */
export function buildCustomType(config) {
  const { label, slug, tag, fields, sort, addToNav } = config;

  return {
    label,
    dir: slug,
    layout: `${slug}.njk`,
    tag,
    sort: sort || "order",
    directoryDefaults: { layout: `${slug}.njk`, tags: tag, published: true },
    layoutTemplate: generateLayoutTemplate(label, fields),
    navEntry: addToNav ? { label, url: `/${slug}/` } : null,
    archivePage: {
      filename: `${slug}.md`,
      content: `---
title: "${label}"
seo_title: "${label}"
meta_description: "Browse all ${label.toLowerCase()} entries."
slug: "${slug}"
layout: "archive.njk"
permalink: "/${slug}/"
published: true
collection_name: "${tag}"
---`,
    },
    frontmatter: fields.map((f) => ({
      key: f.name,
      type: f.type,
      required: f.required || false,
    })),
    sampleEntry: (title, entrySlug) => {
      let fm = `---\ntitle: "${title}"\nslug: "${entrySlug}"\n`;
      for (const field of fields) {
        if (field.name === "title" || field.name === "slug") continue;
        const defaultVal = getDefaultForType(field.type);
        fm += `${field.name}: ${defaultVal}\n`;
      }
      fm += `published: true\npermalink: "/${slug}/${entrySlug}/"\n---\nAdd your content here.\n`;
      return fm;
    },
  };
}

function generateLayoutTemplate(label, fields) {
  let template = `---
layout: base.njk
og_type: article
---
<article class="section">
  <div class="container container--narrow">
    <div class="detail__content">
      <h1>{{ title }}</h1>`;

  // Add rendered fields (skip title, slug, published, order)
  const renderedFields = fields.filter(
    (f) => !["title", "slug", "published", "order"].includes(f.name)
  );
  for (const field of renderedFields) {
    if (field.type === "date") {
      template += `\n      {% if ${field.name} %}<p class="detail__meta">{{ ${field.name} | dateISO }}</p>{% endif %}`;
    } else if (field.type === "boolean") {
      // skip rendering booleans
    } else {
      template += `\n      {% if ${field.name} %}<p><strong>${capitalize(field.name)}:</strong> {{ ${field.name} }}</p>{% endif %}`;
    }
  }

  template += `
      {{ content | safe }}
    </div>
  </div>
</article>`;

  return template;
}

function getDefaultForType(type) {
  switch (type) {
    case "number": return "0";
    case "boolean": return "true";
    case "date": return new Date().toISOString().split("T")[0];
    default: return '""';
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/[_-]/g, " ");
}

/**
 * Load custom content types from the project's ink-custom-types.json.
 * Returns an object of typeId → full content type definition.
 */
export function loadCustomTypes(projectRoot) {
  if (!projectRoot) return {};
  const customTypesPath = `${projectRoot}/ink-custom-types.json`;
  try {
    const raw = JSON.parse(fs.readFileSync(customTypesPath, "utf-8"));
    const result = {};
    for (const [id, config] of Object.entries(raw)) {
      result[id] = buildCustomType(config);
    }
    return result;
  } catch {
    return {};
  }
}
