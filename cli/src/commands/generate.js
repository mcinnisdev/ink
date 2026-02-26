import fs from "fs";
import path from "path";
import { CONTENT_TYPES, slugify } from "../content-types.js";

/**
 * ink generate <type> [count]  — Generate sample content with lorem ipsum.
 * Useful for quickly populating a site for design and layout testing.
 */
export async function generate(args) {
  const typeId = args[0];
  const count = parseInt(args[1], 10) || 3;

  if (!typeId) {
    console.log("\n  Usage: ink generate <type> [count]\n");
    console.log("  Examples:");
    console.log("    ink generate blog 5      Generate 5 sample blog posts");
    console.log("    ink generate team 4      Generate 4 team members");
    console.log("    ink generate faq 10      Generate 10 FAQ entries\n");
    console.log("  Available types:", Object.keys(CONTENT_TYPES).join(", "));
    return;
  }

  const type = CONTENT_TYPES[typeId];
  if (!type) {
    console.error(`Unknown content type: "${typeId}"`);
    console.log("Available types:", Object.keys(CONTENT_TYPES).join(", "));
    process.exit(1);
  }

  // Find the project root
  const projectRoot = findProjectRoot();
  if (!projectRoot) {
    console.error("Not in an Ink project. Run this from a directory with eleventy.config.js");
    process.exit(1);
  }

  const contentDir = path.join(projectRoot, "content", type.dir);
  fs.mkdirSync(contentDir, { recursive: true });

  // Ensure directory defaults exist
  const defaultsPath = path.join(contentDir, `${type.dir}.json`);
  if (!fs.existsSync(defaultsPath)) {
    fs.writeFileSync(defaultsPath, JSON.stringify(type.directoryDefaults, null, 2));
  }

  const samples = getSamples(typeId, count);
  let created = 0;

  console.log(`\n  Generating ${count} ${type.label} entries...\n`);

  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i];
    const slug = slugify(sample.title);
    const filePath = path.join(contentDir, `${slug}.md`);

    if (fs.existsSync(filePath)) {
      console.log(`  Skipped ${slug}.md (already exists)`);
      continue;
    }

    const content = buildEntry(type, typeId, sample, i);
    fs.writeFileSync(filePath, content);
    console.log(`  Created content/${type.dir}/${slug}.md`);
    created++;
  }

  console.log(`\n  Done! Created ${created} ${type.label} entries.`);
  if (created < samples.length) {
    console.log(`  (${samples.length - created} skipped — already existed)`);
  }
  console.log();
}

/**
 * Build a complete markdown entry with frontmatter and body content.
 */
function buildEntry(type, typeId, sample, index) {
  const slug = slugify(sample.title);
  const date = pastDate(index);

  // Build frontmatter
  const fm = { title: sample.title, slug };

  if (hasField(type, "excerpt")) fm.excerpt = sample.excerpt || "";
  if (hasField(type, "date")) fm.date = date;
  if (hasField(type, "author")) fm.author = sample.author || "Admin";
  if (hasField(type, "role")) fm.role = sample.role || "";
  if (hasField(type, "photo")) fm.photo = getPlaceholderImage(typeId, "photo", index);
  if (hasField(type, "featured_image")) fm.featured_image = getPlaceholderImage(typeId, "featured_image", index);
  if (hasField(type, "client")) fm.client = sample.client || "";
  if (hasField(type, "category")) fm.category = sample.category || "General";
  if (hasField(type, "subtitle")) fm.subtitle = sample.subtitle || "";
  if (hasField(type, "order")) fm.order = index + 1;
  if (hasField(type, "price_note")) fm.price_note = "";
  fm.published = true;
  // Derive URL base from navEntry (e.g. team dir is "employees" but URL is "/team/")
  const urlBase = type.navEntry ? type.navEntry.url.replace(/\/$/, "") : `/${type.dir}`;
  fm.permalink = `${urlBase}/${slug}/`;

  // CTA fields for service-areas
  if (typeId === "service-areas") {
    fm.cta_title = `Need Service in ${sample.title}?`;
    fm.cta_text = "Contact us today for a free estimate.";
    fm.cta_url = "/contact/";
    fm.cta_label = "Get a Quote";
  }

  const frontmatter = buildYamlFrontmatter(fm);
  const body = sample.body || loremBody();

  return `${frontmatter}\n${body}\n`;
}

/**
 * Build YAML frontmatter from an object.
 */
function buildYamlFrontmatter(obj) {
  let yaml = "---\n";
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "boolean") {
      yaml += `${key}: ${value}\n`;
    } else if (typeof value === "number") {
      yaml += `${key}: ${value}\n`;
    } else {
      yaml += `${key}: "${String(value).replace(/"/g, '\\"')}"\n`;
    }
  }
  yaml += "---";
  return yaml;
}

function hasField(type, key) {
  return type.frontmatter.some((f) => f.key === key);
}

/**
 * Return a date string N weeks in the past.
 */
function pastDate(weeksAgo) {
  const d = new Date();
  d.setDate(d.getDate() - weeksAgo * 7);
  return d.toISOString().split("T")[0];
}

// ─── Placeholder images ──────────────────────────────────────────────────────

const PLACEHOLDER_IMAGES = {
  photo: ["/media/placeholders/avatar-1.png", "/media/placeholders/avatar-2.png"],
  blog: ["/media/placeholders/landscape-1.png", "/media/placeholders/landscape-2.png", "/media/placeholders/landscape-3.png"],
  services: ["/media/placeholders/building.png", "/media/placeholders/product.png", "/media/placeholders/landscape-1.png"],
  portfolio: ["/media/placeholders/product.png", "/media/placeholders/landscape-1.png", "/media/placeholders/landscape-2.png", "/media/placeholders/landscape-3.png"],
  features: ["/media/placeholders/product.png", "/media/placeholders/landscape-1.png", "/media/placeholders/landscape-2.png"],
  "service-areas": ["/media/placeholders/map.png", "/media/placeholders/landscape-2.png", "/media/placeholders/landscape-3.png"],
};

function getPlaceholderImage(typeId, fieldName, index) {
  if (fieldName === "photo") {
    const pool = PLACEHOLDER_IMAGES.photo;
    return pool[index % pool.length];
  }
  const pool = PLACEHOLDER_IMAGES[typeId] || ["/media/placeholders/default.png"];
  return pool[index % pool.length];
}

// ─── Sample data per content type ─────────────────────────────────────────────

function getSamples(typeId, count) {
  const pools = {
    blog: [
      { title: "Getting Started with Markdown", excerpt: "Learn the basics of Markdown formatting and how it powers your website.", body: blogBody("Getting Started with Markdown", "Markdown is a lightweight markup language that makes writing content for the web intuitive and efficient.") },
      { title: "5 Tips for Better Web Performance", excerpt: "Speed matters. Here are five actionable tips to make your site faster.", body: blogBody("5 Tips for Better Web Performance", "Website performance directly impacts user experience and search engine rankings.") },
      { title: "The Power of Static Sites", excerpt: "Why static site generators are the future of web development.", body: blogBody("The Power of Static Sites", "Static sites offer unmatched security, speed, and simplicity compared to traditional CMS platforms.") },
      { title: "Design Principles for Small Business Websites", excerpt: "Good design doesn't have to be complicated. Focus on what matters.", body: blogBody("Design Principles for Small Business Websites", "Your website is often the first impression potential customers have of your business.") },
      { title: "SEO Basics Every Business Owner Should Know", excerpt: "A beginner-friendly guide to search engine optimization.", body: blogBody("SEO Basics Every Business Owner Should Know", "Search engine optimization doesn't have to be mysterious or overwhelming.") },
      { title: "Content Strategy That Actually Works", excerpt: "How to plan and create content that drives results.", body: blogBody("Content Strategy That Actually Works", "A solid content strategy is the foundation of any successful online presence.") },
      { title: "Why Accessibility Matters for Your Website", excerpt: "Making your site accessible benefits everyone — including your bottom line.", body: blogBody("Why Accessibility Matters", "Web accessibility ensures that people with disabilities can use your website effectively.") },
      { title: "Choosing the Right Tech Stack", excerpt: "How to pick technologies that will serve your project well.", body: blogBody("Choosing the Right Tech Stack", "The technology choices you make at the start of a project can define its trajectory for years.") },
    ],
    services: [
      { title: "Web Design", excerpt: "Custom, responsive websites built for your brand." },
      { title: "SEO Optimization", excerpt: "Boost your search rankings and drive organic traffic." },
      { title: "Content Marketing", excerpt: "Engaging content that attracts and converts customers." },
      { title: "Brand Identity", excerpt: "Logo, color palette, and typography that tell your story." },
      { title: "Social Media Management", excerpt: "Strategic social presence that grows your audience." },
      { title: "Email Marketing", excerpt: "Campaigns that nurture leads and drive conversions." },
      { title: "Analytics & Reporting", excerpt: "Data-driven insights to guide your marketing strategy." },
      { title: "Consulting", excerpt: "Expert guidance to help you make the right decisions." },
    ],
    team: [
      { title: "Sarah Johnson", role: "CEO & Founder", body: "Sarah founded the company with a vision to make professional web presence accessible to every business. With over 15 years of experience in technology and business strategy, she leads the team with a focus on innovation and client success." },
      { title: "Michael Chen", role: "Lead Developer", body: "Michael brings a decade of full-stack development experience to the team. He specializes in building fast, accessible websites and is passionate about clean code and modern web standards." },
      { title: "Emily Rodriguez", role: "Creative Director", body: "Emily oversees all creative output, from brand identity to web design. Her background in fine arts and digital media gives her a unique perspective on visual storytelling that resonates with audiences." },
      { title: "David Kim", role: "Marketing Manager", body: "David develops and executes marketing strategies that drive real results. His data-driven approach combines SEO expertise with compelling content creation to help clients reach their goals." },
      { title: "Rachel Thompson", role: "UX Designer", body: "Rachel is passionate about creating intuitive, accessible user experiences. She conducts user research and designs interfaces that make complex tasks feel simple and natural." },
      { title: "James Wilson", role: "Content Strategist", body: "James helps clients find their voice and tell their story effectively. With a background in journalism and digital marketing, he crafts content strategies that engage audiences and drive conversions." },
      { title: "Ana Martinez", role: "Project Manager", body: "Ana keeps projects running smoothly from kickoff to launch. Her organizational skills and clear communication ensure that every project is delivered on time and exceeds expectations." },
      { title: "Chris Taylor", role: "SEO Specialist", body: "Chris helps clients achieve top search rankings through technical SEO, content optimization, and strategic link building. He stays current with algorithm changes to keep clients ahead of the curve." },
    ],
    docs: [
      { title: "Getting Started", excerpt: "Set up your project and start building.", body: docsBody("Getting Started", "Welcome to the documentation. This guide will walk you through setting up your project from scratch.") },
      { title: "Configuration", excerpt: "Customize your site settings and options.", body: docsBody("Configuration", "Your site's configuration is managed through a few key files.") },
      { title: "Content Types", excerpt: "Learn about the different content types available.", body: docsBody("Content Types", "Content types define the structure and behavior of your site's content.") },
      { title: "Layouts & Templates", excerpt: "Understand how layouts and templates work.", body: docsBody("Layouts & Templates", "Layouts wrap your content in consistent page structures.") },
      { title: "Deployment", excerpt: "Deploy your site to production.", body: docsBody("Deployment", "Once your site is ready, deploying it is straightforward.") },
      { title: "Troubleshooting", excerpt: "Common issues and how to resolve them.", body: docsBody("Troubleshooting", "If you run into problems, this guide covers the most common issues.") },
    ],
    features: [
      { title: "Lightning Fast", subtitle: "Built for speed from the ground up", excerpt: "Pages load in milliseconds, not seconds." },
      { title: "SEO Optimized", subtitle: "Rank higher, reach more people", excerpt: "Best practices baked in from day one." },
      { title: "Fully Accessible", subtitle: "Works for everyone", excerpt: "WCAG 2.1 AA compliance out of the box." },
      { title: "Mobile Responsive", subtitle: "Looks great on every device", excerpt: "Fluid layouts that adapt to any screen size." },
      { title: "Easy to Customize", subtitle: "Make it yours", excerpt: "Design tokens and modular components for quick branding." },
      { title: "Secure by Default", subtitle: "No database, no vulnerabilities", excerpt: "Static files eliminate entire categories of security risks." },
    ],
    "service-areas": [
      { title: "Downtown", excerpt: "Serving the Downtown area with reliable, professional service." },
      { title: "Midtown", excerpt: "Proud to serve Midtown and surrounding neighborhoods." },
      { title: "Westside", excerpt: "Providing top-quality service to the Westside community." },
      { title: "Northgate", excerpt: "Your trusted partner in the Northgate area." },
      { title: "Riverside", excerpt: "Serving Riverside and the surrounding region." },
      { title: "Harbor District", excerpt: "Professional services in the Harbor District area." },
      { title: "University Heights", excerpt: "Trusted by the University Heights community." },
      { title: "Oak Park", excerpt: "Reliable service in Oak Park and beyond." },
    ],
    portfolio: [
      { title: "Brand Refresh for Coastal Cafe", excerpt: "A complete visual overhaul for a beloved local coffee shop.", client: "Coastal Cafe" },
      { title: "E-Commerce Platform Launch", excerpt: "Building a scalable online store from the ground up.", client: "Modern Goods Co." },
      { title: "Healthcare Portal Redesign", excerpt: "Improving patient experience through thoughtful UX design.", client: "ClearPath Health" },
      { title: "Restaurant Mobile App", excerpt: "A custom ordering app that boosted takeout revenue by 40%.", client: "Olive & Thyme" },
      { title: "Non-Profit Campaign Site", excerpt: "A fundraising website that exceeded donation targets.", client: "Green Future Initiative" },
      { title: "Real Estate Platform", excerpt: "Property listings with interactive maps and virtual tours.", client: "Summit Realty" },
    ],
    faq: [
      { title: "How do I get started?", category: "General", body: "Getting started is easy! Simply reach out to us through our contact page or give us a call. We'll schedule an initial consultation to discuss your needs and goals, then put together a customized plan for your project." },
      { title: "What is your pricing structure?", category: "Pricing", body: "Our pricing is project-based and depends on the scope of work. During our initial consultation, we'll provide a detailed proposal with transparent pricing. We believe in no hidden fees and clear communication about costs." },
      { title: "How long does a typical project take?", category: "Process", body: "Project timelines vary depending on complexity. A simple website typically takes 2-4 weeks, while more complex projects may take 6-12 weeks. We'll provide a realistic timeline during our planning phase." },
      { title: "Do you offer ongoing support?", category: "Support", body: "Yes! We offer maintenance and support packages to keep your site running smoothly. This includes security updates, content changes, performance monitoring, and priority support for any issues." },
      { title: "Can I update the content myself?", category: "General", body: "Absolutely. Our sites are built with content management in mind. We'll provide training on how to update your content using simple Markdown files, and our documentation covers everything you need to know." },
      { title: "What technologies do you use?", category: "Technical", body: "We use modern, battle-tested technologies including Eleventy for static site generation, Markdown for content, and optimized CSS for styling. This stack delivers fast, secure, and maintainable websites." },
      { title: "Do you help with SEO?", category: "Services", body: "SEO best practices are built into every site we create. This includes proper meta tags, structured data, semantic HTML, fast load times, and mobile responsiveness. We also offer ongoing SEO consulting." },
      { title: "What if I need changes after launch?", category: "Support", body: "We're here to help! Minor changes are often included in our support packages. For larger modifications, we'll scope out the work and provide a clear estimate before proceeding." },
    ],
  };

  const pool = pools[typeId] || [];
  const results = [];
  for (let i = 0; i < count; i++) {
    results.push(pool[i % pool.length]);
  }
  // If count exceeds pool, append numbers to avoid slug collisions
  if (count > pool.length) {
    for (let i = pool.length; i < count; i++) {
      const base = pool[i % pool.length];
      results[i] = { ...base, title: `${base.title} ${Math.floor(i / pool.length) + 1}` };
    }
  }
  return results;
}

// ─── Body generators ─────────────────────────────────────────────────────────

function blogBody(heading, intro) {
  return `${intro}

## Why This Matters

In today's digital landscape, understanding the fundamentals can set you apart from the competition. Whether you're just starting out or looking to refine your approach, the principles remain the same: clarity, consistency, and a focus on your audience.

## Key Takeaways

- **Start with a solid foundation.** Don't skip the basics in pursuit of advanced techniques.
- **Measure what matters.** Use data to guide your decisions, not assumptions.
- **Iterate and improve.** The best results come from continuous refinement.

## Putting It Into Practice

The best way to learn is by doing. Take one idea from this post and implement it today. Small, consistent improvements compound over time into significant results.

> "The secret of getting ahead is getting started." — Mark Twain

## Conclusion

The path forward is clear: focus on the fundamentals, stay consistent, and keep your audience at the center of everything you do. The tools and techniques will evolve, but these principles are timeless.
`;
}

function docsBody(heading, intro) {
  return `${intro}

## Overview

This section covers the essential information you need to get up and running quickly. Follow the steps below in order for the best experience.

## Step 1: Prerequisites

Before you begin, make sure you have the following:

- **Node.js** version 18 or later
- A text editor (VS Code recommended)
- Basic familiarity with the command line

## Step 2: Installation

\`\`\`bash
npm install
\`\`\`

This will install all required dependencies for your project.

## Step 3: Verify

Run the development server to verify everything is working:

\`\`\`bash
npm run dev
\`\`\`

You should see output confirming the server is running.

## Next Steps

Now that you're set up, explore the other documentation pages to learn more about configuration, content types, and deployment.
`;
}

function loremBody() {
  return `This is sample content generated by the Ink CLI. Replace this with your actual content.

## About This Entry

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

## Details

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
`;
}

function findProjectRoot() {
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, "eleventy.config.js"))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return null;
}
