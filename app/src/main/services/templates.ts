import fs from "fs";
import path from "path";
import { addComponent as cliAddComponent } from "./cli";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ComponentEntry {
  name: string;
  label: string;
  description: string;
  category: string;
  tier: number;
  usage: string;
  installed: boolean;
}

export interface PageTemplateEntry {
  id: string;
  label: string;
  description: string;
  category: string;
  requires: string[];
}

// ---------------------------------------------------------------------------
// Component metadata (mirrors cli/src/component-registry.js)
// ---------------------------------------------------------------------------

const COMPONENTS: Record<
  string,
  { label: string; description: string; category: string; tier: number; njk: string; usage: string }
> = {
  "contact-form": {
    label: "Contact Form",
    description: "Styled form with Formspree/Netlify support and validation",
    category: "cta",
    tier: 1,
    njk: "contact-form.njk",
    usage: `{% from "components/contact-form.njk" import contactForm %}\n{{ contactForm(\n  action="https://formspree.io/f/YOUR_ID",\n  fields=[\n    { name: "name", label: "Name", type: "text", required: true },\n    { name: "email", label: "Email", type: "email", required: true },\n    { name: "message", label: "Message", type: "textarea", required: true }\n  ]\n) }}`,
  },
  "feature-grid": {
    label: "Feature Grid",
    description: "2-4 column grid with icon, title, and description",
    category: "content",
    tier: 1,
    njk: "feature-grid.njk",
    usage: `{% from "components/feature-grid.njk" import featureGrid %}\n{{ featureGrid([\n  { icon: "⚡", title: "Lightning Fast", description: "Pages load in milliseconds." },\n  { icon: "🔒", title: "Secure", description: "No database, no vulnerabilities." },\n  { icon: "📱", title: "Responsive", description: "Looks great on every device." }\n]) }}`,
  },
  testimonials: {
    label: "Testimonials",
    description: "Customer testimonial cards with star ratings and photos",
    category: "social-proof",
    tier: 1,
    njk: "testimonials.njk",
    usage: `{% from "components/testimonials.njk" import testimonial, testimonialGrid %}\n{{ testimonial("Amazing service!", "Jane Doe", "CEO", "/media/jane.jpg", 5) }}`,
  },
  "pricing-table": {
    label: "Pricing Table",
    description: "2-3 column pricing cards with featured plan highlight",
    category: "cta",
    tier: 1,
    njk: "pricing-table.njk",
    usage: `{% from "components/pricing-table.njk" import pricingTable %}\n{{ pricingTable([\n  { name: "Starter", price: "$29", period: "mo", features: ["5 Pages", "Basic SEO"] },\n  { name: "Pro", price: "$79", period: "mo", featured: true, badge: "Popular", features: ["Unlimited Pages", "Advanced SEO"] }\n]) }}`,
  },
  "stats-counter": {
    label: "Stats Counter",
    description: "Animated number counters that count up on scroll",
    category: "social-proof",
    tier: 2,
    njk: "stats-counter.njk",
    usage: `{% from "components/stats-counter.njk" import statsCounter %}\n{{ statsCounter([\n  { value: 500, suffix: "+", label: "Projects Completed" },\n  { value: 98, suffix: "%", label: "Client Satisfaction" }\n]) }}`,
  },
  "image-gallery": {
    label: "Image Gallery",
    description: "Responsive image grid with fullscreen lightbox",
    category: "media",
    tier: 2,
    njk: "image-gallery.njk",
    usage: `{% from "components/image-gallery.njk" import imageGallery %}\n{{ imageGallery([\n  { src: "/media/photo-1.jpg", alt: "Project photo", caption: "Our latest work" },\n  { src: "/media/photo-2.jpg", alt: "Team photo" }\n]) }}`,
  },
  tabs: {
    label: "Tabs",
    description: "Tabbed content panels with ARIA and keyboard navigation",
    category: "content",
    tier: 2,
    njk: "tabs.njk",
    usage: `{% from "components/tabs.njk" import tabs %}\n{{ tabs([\n  { label: "Overview", content: "<p>Overview content here</p>" },\n  { label: "Details", content: "<p>Detailed information</p>" }\n]) }}`,
  },
  "logo-cloud": {
    label: "Logo Cloud",
    description: "Row of partner/client logos with grayscale hover",
    category: "social-proof",
    tier: 2,
    njk: "logo-cloud.njk",
    usage: `{% from "components/logo-cloud.njk" import logoCloud %}\n{{ logoCloud([\n  { src: "/media/logos/client-1.svg", alt: "Client Name", url: "https://example.com" }\n]) }}`,
  },
  "newsletter-signup": {
    label: "Newsletter Signup",
    description: "Email capture form for Mailchimp, ConvertKit, or custom",
    category: "cta",
    tier: 2,
    njk: "newsletter-signup.njk",
    usage: `{% from "components/newsletter-signup.njk" import newsletterSignup %}\n{{ newsletterSignup(action="https://your-provider.com/subscribe", heading="Stay Updated") }}`,
  },
  timeline: {
    label: "Timeline",
    description: "Vertical timeline for history, process steps, or milestones",
    category: "content",
    tier: 3,
    njk: "timeline.njk",
    usage: `{% from "components/timeline.njk" import timeline %}\n{{ timeline([\n  { year: "2020", title: "Founded", description: "Started with a small team and big vision." },\n  { year: "2023", title: "100 Clients", description: "Reached our first major milestone." }\n]) }}`,
  },
  modal: {
    label: "Modal / Dialog",
    description: "Accessible dialog with focus trap and escape-to-close",
    category: "content",
    tier: 3,
    njk: "modal.njk",
    usage: `{% from "components/modal.njk" import modal, modalTrigger %}\n{{ modalTrigger("open-demo", "Open Demo") }}\n{{ modal("open-demo", "Demo Modal", "<p>Modal content here</p>") }}`,
  },
  "social-share": {
    label: "Social Share",
    description: "Share buttons for Twitter, Facebook, LinkedIn",
    category: "social-proof",
    tier: 3,
    njk: "social-share.njk",
    usage: `{% from "components/social-share.njk" import socialShare %}\n{{ socialShare(title, page.url, site.url) }}`,
  },
};

export const COMPONENT_CATEGORIES: Record<string, string> = {
  content: "Content",
  cta: "CTA & Forms",
  "social-proof": "Social Proof",
  media: "Media",
};

// ---------------------------------------------------------------------------
// Page template metadata (mirrors cli/src/page-templates.js)
// ---------------------------------------------------------------------------

interface PageTemplateDef {
  label: string;
  description: string;
  category: string;
  requires: string[];
  content: string;
}

const PAGE_TEMPLATES: Record<string, PageTemplateDef> = {
  "landing-page": {
    label: "Landing Page",
    description: "Hero section, feature grid, testimonials, and call-to-action",
    category: "marketing",
    requires: ["feature-grid", "testimonials"],
    content: `---
title: "Welcome"
seo_title: "Welcome — Your Site Name"
meta_description: "Your site's landing page."
slug: "home"
layout: "base.njk"
permalink: "/"
published: true
---

{% from "components/feature-grid.njk" import featureGrid %}
{% from "components/testimonials.njk" import testimonialGrid %}

<section class="hero">
  <div class="container">
    <h1>Build Something Amazing</h1>
    <p>A short, compelling tagline that describes what you do and why it matters.</p>
    <a href="/contact/" class="btn btn--primary">Get Started</a>
  </div>
</section>

<section class="section">
  <div class="container">
    <h2 class="section__title">What We Offer</h2>
    {{ featureGrid([
      { icon: "⚡", title: "Lightning Fast", description: "Pages load in milliseconds with static site generation." },
      { icon: "🔒", title: "Secure by Default", description: "No database means no SQL injection or server vulnerabilities." },
      { icon: "📱", title: "Fully Responsive", description: "Looks great on every device, from phones to desktops." }
    ]) }}
  </div>
</section>

<section class="section section--alt">
  <div class="container">
    <h2 class="section__title">What Our Clients Say</h2>
    {{ testimonialGrid([
      { quote: "An amazing experience from start to finish.", author: "Jane Doe", role: "CEO, Acme Inc", rating: 5 },
      { quote: "Professional, fast, and easy to work with.", author: "John Smith", role: "Founder, StartupCo", rating: 5 }
    ]) }}
  </div>
</section>

<section class="section">
  <div class="container" style="text-align: center;">
    <h2>Ready to Get Started?</h2>
    <p>Contact us today for a free consultation.</p>
    <a href="/contact/" class="btn btn--primary">Contact Us</a>
  </div>
</section>
`,
  },
  "about-us": {
    label: "About Us",
    description: "Company story, stats, and timeline of milestones",
    category: "informational",
    requires: ["timeline", "stats-counter"],
    content: `---
title: "About Us"
seo_title: "About Us — Our Story"
meta_description: "Learn about our company, our mission, and the team behind it all."
slug: "about"
layout: "base.njk"
permalink: "/about/"
published: true
---

{% from "components/timeline.njk" import timeline %}
{% from "components/stats-counter.njk" import statsCounter %}

<section class="section">
  <div class="container container--narrow">
    <h1>About Us</h1>
    <p class="lead">We started with a simple idea: make things better. Today, we're proud to serve hundreds of clients with the same passion we had on day one.</p>
  </div>
</section>

<section class="section section--alt">
  <div class="container">
    <h2 class="section__title">By the Numbers</h2>
    {{ statsCounter([
      { value: 500, suffix: "+", label: "Projects Completed" },
      { value: 98, suffix: "%", label: "Client Satisfaction" },
      { value: 10, suffix: "+", label: "Years Experience" },
      { value: 50, suffix: "+", label: "Team Members" }
    ]) }}
  </div>
</section>

<section class="section">
  <div class="container container--narrow">
    <h2 class="section__title">Our Journey</h2>
    {{ timeline([
      { year: "2015", title: "Founded", description: "Started with a small team and a big vision." },
      { year: "2018", title: "100 Clients", description: "Reached our first major milestone." },
      { year: "2021", title: "National Expansion", description: "Expanded our services across the country." },
      { year: "2024", title: "Industry Leader", description: "Recognized as a leader in our field." }
    ]) }}
  </div>
</section>
`,
  },
  contact: {
    label: "Contact",
    description: "Contact form with business information",
    category: "cta",
    requires: ["contact-form"],
    content: `---
title: "Contact Us"
seo_title: "Contact Us — Get in Touch"
meta_description: "Have a question or want to work together? Reach out to us."
slug: "contact"
layout: "base.njk"
permalink: "/contact/"
published: true
---

{% from "components/contact-form.njk" import contactForm %}

<section class="section">
  <div class="container container--narrow">
    <h1>Contact Us</h1>
    <p>Have a question or want to work together? Fill out the form below and we'll get back to you within 24 hours.</p>

    {{ contactForm(
      action="https://formspree.io/f/YOUR_ID",
      fields=[
        { name: "name", label: "Full Name", type: "text", required: true },
        { name: "email", label: "Email Address", type: "email", required: true },
        { name: "phone", label: "Phone Number", type: "tel" },
        { name: "subject", label: "Subject", type: "text", required: true },
        { name: "message", label: "Message", type: "textarea", required: true }
      ]
    ) }}
  </div>
</section>
`,
  },
  "services-overview": {
    label: "Services Overview",
    description: "Feature grid of services with pricing table",
    category: "marketing",
    requires: ["feature-grid", "pricing-table"],
    content: `---
title: "Our Services"
seo_title: "Services — What We Offer"
meta_description: "Explore our range of professional services."
slug: "services-overview"
layout: "base.njk"
permalink: "/services-overview/"
published: true
---

{% from "components/feature-grid.njk" import featureGrid %}
{% from "components/pricing-table.njk" import pricingTable %}

<section class="section">
  <div class="container">
    <h1>Our Services</h1>
    <p class="lead">We offer a comprehensive range of services to help your business succeed.</p>

    {{ featureGrid([
      { icon: "🎨", title: "Design", description: "Beautiful, user-centered designs that convert visitors into customers." },
      { icon: "💻", title: "Development", description: "Fast, reliable websites built with modern technologies." },
      { icon: "📈", title: "Marketing", description: "Data-driven strategies to grow your online presence." },
      { icon: "🔧", title: "Maintenance", description: "Ongoing support and updates to keep your site running smoothly." }
    ]) }}
  </div>
</section>

<section class="section section--alt">
  <div class="container">
    <h2 class="section__title">Pricing</h2>
    {{ pricingTable([
      { name: "Starter", price: "$499", period: "project", features: ["5-Page Website", "Mobile Responsive", "Contact Form", "Basic SEO"] },
      { name: "Professional", price: "$999", period: "project", featured: true, badge: "Most Popular", features: ["10-Page Website", "Custom Design", "Blog Setup", "Advanced SEO", "Analytics"] },
      { name: "Enterprise", price: "Custom", period: "", features: ["Unlimited Pages", "E-commerce Ready", "Priority Support", "Custom Integrations"] }
    ]) }}
  </div>
</section>

<section class="section">
  <div class="container" style="text-align: center;">
    <h2>Ready to Start Your Project?</h2>
    <p>Let's discuss how we can help your business grow.</p>
    <a href="/contact/" class="btn btn--primary">Get a Free Quote</a>
  </div>
</section>
`,
  },
  portfolio: {
    label: "Portfolio Showcase",
    description: "Image gallery with logo cloud of clients",
    category: "informational",
    requires: ["image-gallery", "logo-cloud"],
    content: `---
title: "Our Work"
seo_title: "Portfolio — Our Best Work"
meta_description: "Browse our portfolio of completed projects."
slug: "our-work"
layout: "base.njk"
permalink: "/our-work/"
published: true
---

{% from "components/image-gallery.njk" import imageGallery %}
{% from "components/logo-cloud.njk" import logoCloud %}

<section class="section">
  <div class="container">
    <h1>Our Work</h1>
    <p class="lead">A selection of projects we're proud of.</p>

    {{ imageGallery([
      { src: "/media/placeholders/landscape-1.png", alt: "Project 1", caption: "Website Redesign" },
      { src: "/media/placeholders/building.png", alt: "Project 2", caption: "Brand Identity" },
      { src: "/media/placeholders/product.png", alt: "Project 3", caption: "E-commerce Launch" }
    ]) }}
  </div>
</section>

<section class="section section--alt">
  <div class="container">
    <h2 class="section__title">Trusted By</h2>
    {{ logoCloud([
      { src: "/media/placeholders/avatar-1.png", alt: "Client 1" },
      { src: "/media/placeholders/avatar-1.png", alt: "Client 2" },
      { src: "/media/placeholders/avatar-1.png", alt: "Client 3" }
    ]) }}
  </div>
</section>
`,
  },
  "faq-page": {
    label: "FAQ Page",
    description: "Tabbed frequently asked questions by category",
    category: "informational",
    requires: ["tabs"],
    content: `---
title: "Frequently Asked Questions"
seo_title: "FAQ — Common Questions Answered"
meta_description: "Find answers to our most frequently asked questions."
slug: "faq-page"
layout: "base.njk"
permalink: "/faq-page/"
published: true
---

{% from "components/tabs.njk" import tabs %}

<section class="section">
  <div class="container container--narrow">
    <h1>Frequently Asked Questions</h1>
    <p class="lead">Got questions? We've got answers.</p>

    {{ tabs([
      { label: "General", content: "<h3>What services do you offer?</h3><p>We offer web design, development, SEO, and ongoing maintenance services.</p><h3>How long does a typical project take?</h3><p>Most projects are completed within 4-8 weeks.</p>" },
      { label: "Pricing", content: "<h3>How much does a website cost?</h3><p>Our projects start at $499. Contact us for a custom quote.</p><h3>Do you offer payment plans?</h3><p>Yes, we offer flexible payment plans for larger projects.</p>" },
      { label: "Support", content: "<h3>Do you offer ongoing support?</h3><p>Yes, we offer maintenance plans starting at $49/month.</p><h3>What is your response time?</h3><p>We typically respond within 24 hours on business days.</p>" }
    ]) }}
  </div>
</section>
`,
  },
};

export const PAGE_TEMPLATE_CATEGORIES: Record<string, string> = {
  marketing: "Marketing",
  informational: "Informational",
  cta: "CTA & Forms",
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function listComponents(projectRoot: string): ComponentEntry[] {
  const componentsDir = path.join(
    projectRoot,
    "src",
    "_includes",
    "components"
  );

  return Object.entries(COMPONENTS).map(([name, comp]) => ({
    name,
    label: comp.label,
    description: comp.description,
    category: comp.category,
    tier: comp.tier,
    usage: comp.usage,
    installed: fs.existsSync(path.join(componentsDir, comp.njk)),
  }));
}

export function listPageTemplates(): PageTemplateEntry[] {
  return Object.entries(PAGE_TEMPLATES).map(([id, tmpl]) => ({
    id,
    label: tmpl.label,
    description: tmpl.description,
    category: tmpl.category,
    requires: tmpl.requires,
  }));
}

export function getComponentSnippet(name: string): string | null {
  return COMPONENTS[name]?.usage ?? null;
}

export async function installComponent(
  projectRoot: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  if (!COMPONENTS[name]) {
    return { success: false, error: `Unknown component: ${name}` };
  }
  const result = await cliAddComponent(projectRoot, name);
  return {
    success: result.success,
    error: result.success ? undefined : result.stderr || result.stdout,
  };
}

export async function createPageFromTemplate(
  projectRoot: string,
  templateId: string,
  title: string
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  const template = PAGE_TEMPLATES[templateId];
  if (!template) {
    return { success: false, error: `Unknown template: ${templateId}` };
  }

  const slug = slugify(title);
  const pagesDir = path.join(projectRoot, "content", "pages");
  fs.mkdirSync(pagesDir, { recursive: true });

  const filePath = path.join(pagesDir, `${slug}.md`);
  if (fs.existsSync(filePath)) {
    return { success: false, error: `File already exists: content/pages/${slug}.md` };
  }

  // Replace default title/slug in frontmatter with the user-provided title
  let content = template.content;
  content = content.replace(/^title: ".*"$/m, `title: "${title}"`);
  content = content.replace(/^slug: ".*"$/m, `slug: "${slug}"`);

  fs.writeFileSync(filePath, content);

  // Auto-install required components that aren't installed yet
  const componentsDir = path.join(projectRoot, "src", "_includes", "components");
  for (const reqName of template.requires) {
    const comp = COMPONENTS[reqName];
    if (comp && !fs.existsSync(path.join(componentsDir, comp.njk))) {
      await cliAddComponent(projectRoot, reqName);
    }
  }

  return { success: true, filePath };
}
