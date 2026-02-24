/**
 * Registry of installable CLI components.
 * Each component has a .njk macro, .css block, and optional .js module
 * stored in cli/templates/components/<name>/
 */

export const COMPONENTS = {
  "contact-form": {
    label: "Contact Form",
    description: "Styled form macro with Formspree/Netlify support and client-side validation",
    files: { njk: "contact-form.njk", css: "contact-form.css", js: "contact-form.js" },
    tier: 1,
    usage: `{% from "components/contact-form.njk" import contactForm %}
{{ contactForm(
  action="https://formspree.io/f/YOUR_ID",
  fields=[
    { name: "name", label: "Name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "message", label: "Message", type: "textarea", required: true }
  ]
) }}`,
  },
  "feature-grid": {
    label: "Feature Grid",
    description: "2-4 column grid with icon, title, and description for each feature",
    files: { njk: "feature-grid.njk", css: "feature-grid.css" },
    tier: 1,
    usage: `{% from "components/feature-grid.njk" import featureGrid %}
{{ featureGrid([
  { icon: "⚡", title: "Lightning Fast", description: "Pages load in milliseconds." },
  { icon: "🔒", title: "Secure", description: "No database, no vulnerabilities." },
  { icon: "📱", title: "Responsive", description: "Looks great on every device." }
]) }}`,
  },
  testimonials: {
    label: "Testimonials",
    description: "Customer testimonial cards with optional star ratings and photos",
    files: { njk: "testimonials.njk", css: "testimonials.css" },
    tier: 1,
    usage: `{% from "components/testimonials.njk" import testimonial, testimonialGrid %}
{{ testimonial("Amazing service!", "Jane Doe", "CEO", "/media/jane.jpg", 5) }}`,
  },
  "pricing-table": {
    label: "Pricing Table",
    description: "2-3 column pricing cards with featured plan highlight and feature lists",
    files: { njk: "pricing-table.njk", css: "pricing-table.css" },
    tier: 1,
    usage: `{% from "components/pricing-table.njk" import pricingTable %}
{{ pricingTable([
  { name: "Starter", price: "$29", period: "mo", features: ["5 Pages", "Basic SEO"] },
  { name: "Pro", price: "$79", period: "mo", featured: true, badge: "Popular", features: ["Unlimited Pages", "Advanced SEO"] }
]) }}`,
  },
  "stats-counter": {
    label: "Stats Counter",
    description: "Animated number counters that count up when scrolled into view",
    files: { njk: "stats-counter.njk", css: "stats-counter.css", js: "stats-counter.js" },
    tier: 2,
    usage: `{% from "components/stats-counter.njk" import statsCounter %}
{{ statsCounter([
  { value: 500, suffix: "+", label: "Projects Completed" },
  { value: 98, suffix: "%", label: "Client Satisfaction" }
]) }}`,
  },
  "image-gallery": {
    label: "Image Gallery",
    description: "Responsive image grid with fullscreen lightbox overlay",
    files: { njk: "image-gallery.njk", css: "image-gallery.css", js: "image-gallery.js" },
    tier: 2,
    usage: `{% from "components/image-gallery.njk" import imageGallery %}
{{ imageGallery([
  { src: "/media/photo-1.jpg", alt: "Project photo", caption: "Our latest work" },
  { src: "/media/photo-2.jpg", alt: "Team photo" }
]) }}`,
  },
  tabs: {
    label: "Tabs",
    description: "Tabbed content panels with ARIA roles and keyboard navigation",
    files: { njk: "tabs.njk", css: "tabs.css", js: "tabs.js" },
    tier: 2,
    usage: `{% from "components/tabs.njk" import tabs %}
{{ tabs([
  { label: "Overview", content: "<p>Overview content here</p>" },
  { label: "Details", content: "<p>Detailed information</p>" }
]) }}`,
  },
  "logo-cloud": {
    label: "Logo Cloud",
    description: "Row of partner or client logos with optional grayscale hover effect",
    files: { njk: "logo-cloud.njk", css: "logo-cloud.css" },
    tier: 2,
    usage: `{% from "components/logo-cloud.njk" import logoCloud %}
{{ logoCloud([
  { src: "/media/logos/client-1.svg", alt: "Client Name", url: "https://example.com" }
]) }}`,
  },
  "newsletter-signup": {
    label: "Newsletter Signup",
    description: "Email capture form for Mailchimp, ConvertKit, or custom endpoints",
    files: { njk: "newsletter-signup.njk", css: "newsletter-signup.css" },
    tier: 2,
    usage: `{% from "components/newsletter-signup.njk" import newsletterSignup %}
{{ newsletterSignup(action="https://your-provider.com/subscribe", heading="Stay Updated") }}`,
  },
  timeline: {
    label: "Timeline",
    description: "Vertical timeline for company history, process steps, or milestones",
    files: { njk: "timeline.njk", css: "timeline.css" },
    tier: 3,
    usage: `{% from "components/timeline.njk" import timeline %}
{{ timeline([
  { year: "2020", title: "Founded", description: "Started with a small team and big vision." },
  { year: "2023", title: "100 Clients", description: "Reached our first major milestone." }
]) }}`,
  },
  modal: {
    label: "Modal / Dialog",
    description: "Accessible dialog overlay with focus trap, escape-to-close, and scroll lock",
    files: { njk: "modal.njk", css: "modal.css", js: "modal.js" },
    tier: 3,
    usage: `{% from "components/modal.njk" import modal, modalTrigger %}
{{ modalTrigger("open-demo", "Open Demo") }}
{{ modal("open-demo", "Demo Modal", "<p>Modal content here</p>") }}`,
  },
  "social-share": {
    label: "Social Share",
    description: "Share buttons for Twitter, Facebook, LinkedIn using Web Share API with fallbacks",
    files: { njk: "social-share.njk", css: "social-share.css", js: "social-share.js" },
    tier: 3,
    usage: `{% from "components/social-share.njk" import socialShare %}
{{ socialShare(title, page.url, site.url) }}`,
  },
};
