/**
 * Page template registry for the Ink CMS.
 * Each template is a full-page .md file with frontmatter + Nunjucks component calls.
 * Templates compose the existing CLI components to create ready-made pages.
 */

export const PAGE_TEMPLATES = {
  "landing-page": {
    label: "Landing Page",
    description: "Hero section, feature grid, testimonials, and call-to-action",
    category: "marketing",
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
    requires: ["feature-grid", "testimonials"],
  },

  "about-us": {
    label: "About Us",
    description: "Company story, team section, and timeline of milestones",
    category: "informational",
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
    requires: ["timeline", "stats-counter"],
  },

  contact: {
    label: "Contact",
    description: "Contact form with business information and map placeholder",
    category: "cta",
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
    requires: ["contact-form"],
  },

  "services-overview": {
    label: "Services Overview",
    description: "Feature grid of services with pricing table and CTA",
    category: "marketing",
    content: `---
title: "Our Services"
seo_title: "Services — What We Offer"
meta_description: "Explore our range of professional services designed to help your business grow."
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
      { name: "Enterprise", price: "Custom", period: "", features: ["Unlimited Pages", "E-commerce Ready", "Priority Support", "Custom Integrations", "Dedicated Manager"] }
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
    requires: ["feature-grid", "pricing-table"],
  },

  portfolio: {
    label: "Portfolio Showcase",
    description: "Image gallery of work samples with project details",
    category: "informational",
    content: `---
title: "Our Work"
seo_title: "Portfolio — Our Best Work"
meta_description: "Browse our portfolio of completed projects and case studies."
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
    <p class="lead">A selection of projects we're proud of. Each one represents a unique challenge and a creative solution.</p>

    {{ imageGallery([
      { src: "/media/placeholders/landscape-1.png", alt: "Project 1", caption: "Website Redesign — Acme Inc" },
      { src: "/media/placeholders/building.png", alt: "Project 2", caption: "Brand Identity — StartupCo" },
      { src: "/media/placeholders/product.png", alt: "Project 3", caption: "E-commerce Launch — ShopBrand" },
      { src: "/media/placeholders/landscape-1.png", alt: "Project 4", caption: "Marketing Campaign — GrowthOrg" }
    ]) }}
  </div>
</section>

<section class="section section--alt">
  <div class="container">
    <h2 class="section__title">Trusted By</h2>
    {{ logoCloud([
      { src: "/media/placeholders/avatar-1.png", alt: "Client 1" },
      { src: "/media/placeholders/avatar-1.png", alt: "Client 2" },
      { src: "/media/placeholders/avatar-1.png", alt: "Client 3" },
      { src: "/media/placeholders/avatar-1.png", alt: "Client 4" }
    ]) }}
  </div>
</section>
`,
    requires: ["image-gallery", "logo-cloud"],
  },

  faq: {
    label: "FAQ Page",
    description: "Expandable frequently asked questions with categories",
    category: "informational",
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
    <p class="lead">Got questions? We've got answers. Browse by category below.</p>

    {{ tabs([
      { label: "General", content: "
        <h3>What services do you offer?</h3>
        <p>We offer web design, development, SEO, and ongoing maintenance services.</p>
        <h3>How long does a typical project take?</h3>
        <p>Most projects are completed within 4-8 weeks, depending on scope and complexity.</p>
        <h3>Do you work with small businesses?</h3>
        <p>Absolutely! We work with businesses of all sizes, from startups to enterprises.</p>
      " },
      { label: "Pricing", content: "
        <h3>How much does a website cost?</h3>
        <p>Our projects start at $499 for a basic website. Contact us for a custom quote.</p>
        <h3>Do you offer payment plans?</h3>
        <p>Yes, we offer flexible payment plans for larger projects.</p>
        <h3>Are there any ongoing costs?</h3>
        <p>Hosting and domain fees are separate. We can help you find affordable options.</p>
      " },
      { label: "Support", content: "
        <h3>Do you offer ongoing support?</h3>
        <p>Yes, we offer maintenance plans starting at $49/month.</p>
        <h3>How do I request changes to my site?</h3>
        <p>Simply email us or use our client portal to submit change requests.</p>
        <h3>What is your response time?</h3>
        <p>We typically respond within 24 hours on business days.</p>
      " }
    ]) }}
  </div>
</section>
`,
    requires: ["tabs"],
  },
};

export const PAGE_TEMPLATE_CATEGORIES = {
  marketing: "Marketing",
  informational: "Informational",
  cta: "CTA & Forms",
};
