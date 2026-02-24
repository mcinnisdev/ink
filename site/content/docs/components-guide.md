---
title: "Components Guide"
slug: "components-guide"
excerpt: "Install and use Ink's 12 pre-built UI components -- from contact forms to image galleries."
order: 4
published: true
permalink: "/docs/components-guide/"
---

## How Components Work

Ink components are Nunjucks macros bundled with their own CSS and (when needed) JavaScript. When you install a component with the CLI, three things happen:

1. A **Nunjucks partial** is added to `src/_includes/components/`
2. **Component CSS** is injected into `src/css/main.css`
3. **Component JS** (if any) is added to `src/js/main.js`

To use a component in any layout or page, import the macro and call it.

## Installing and Removing Components

Install a component by name:

```bash
npx ink add component contact-form
```

List all available components interactively:

```bash
npx ink add component
```

Remove a component you no longer need:

```bash
npx ink remove component contact-form
```

## Available Components

### Contact Form

A styled, accessible contact form with name, email, phone, and message fields.

```bash
npx ink add component contact-form
```

```html
{% raw %}{% include "components/contact-form.njk" %}{% endraw %}
```

The form submits via POST. Configure the action URL in the include or wire it up to a service like Formspree, Netlify Forms, or Cloudflare Workers.

### Feature Grid

A responsive grid of feature cards, perfect for highlighting product or service benefits.

```bash
npx ink add component feature-grid
```

```html
{% raw %}{% include "components/feature-grid.njk" %}{% endraw %}
```

Pulls items from the `features` collection automatically. Add feature entries with `ink add features "Feature Title"`.

### Testimonials

A testimonial carousel or grid displaying client quotes with attribution.

```bash
npx ink add component testimonials
```

```html
{% raw %}{% include "components/testimonials.njk" %}{% endraw %}
```

Testimonial data can be stored in a data file at `src/_data/testimonials.json` or passed directly to the include.

### Pricing Table

A responsive pricing comparison table with tier highlighting.

```bash
npx ink add component pricing-table
```

```html
{% raw %}{% include "components/pricing-table.njk" %}{% endraw %}
```

Define your pricing tiers in `src/_data/pricing.json`:

```json
[
  {
    "name": "Starter",
    "price": "$29/mo",
    "features": ["5 Pages", "Blog", "SSL"],
    "highlighted": false
  },
  {
    "name": "Pro",
    "price": "$79/mo",
    "features": ["Unlimited Pages", "Blog", "SSL", "Analytics"],
    "highlighted": true
  }
]
```

### Stats Counter

Animated number counters for displaying key metrics (projects completed, clients served, etc.).

```bash
npx ink add component stats-counter
```

```html
{% raw %}{% include "components/stats-counter.njk" %}{% endraw %}
```

This component includes JavaScript for the count-up animation that triggers when the section scrolls into view.

### Image Gallery

A responsive image gallery with lightbox support.

```bash
npx ink add component image-gallery
```

```html
{% raw %}{% include "components/image-gallery.njk" %}{% endraw %}
```

Place images in the `media/` directory and reference them in your content or a data file. The gallery handles responsive thumbnails and full-size viewing.

### Tabs

A tabbed content interface for organizing information into switchable panels.

```bash
npx ink add component tabs
```

```html
{% raw %}{% include "components/tabs.njk" %}{% endraw %}
```

Tabs are built with accessible ARIA roles and keyboard navigation. The component includes the required JavaScript for panel switching.

### Logo Cloud

A grid of partner or client logos, ideal for social proof sections.

```bash
npx ink add component logo-cloud
```

```html
{% raw %}{% include "components/logo-cloud.njk" %}{% endraw %}
```

Store logo images in `media/logos/` and list them in a data file or pass them directly.

### Newsletter Signup

An email signup form for mailing list integration.

```bash
npx ink add component newsletter-signup
```

```html
{% raw %}{% include "components/newsletter-signup.njk" %}{% endraw %}
```

Configure the form action to point to your email service provider (Mailchimp, ConvertKit, Buttondown, etc.).

### Timeline

A vertical timeline for displaying company history, project milestones, or process steps.

```bash
npx ink add component timeline
```

```html
{% raw %}{% include "components/timeline.njk" %}{% endraw %}
```

### Modal

A reusable modal dialog with open/close controls and backdrop.

```bash
npx ink add component modal
```

```html
{% raw %}{% include "components/modal.njk" %}{% endraw %}
```

Trigger the modal from any button or link using a `data-modal-target` attribute. The component includes JavaScript for open, close, and escape-key handling.

### Social Share

Share buttons for Twitter/X, Facebook, LinkedIn, and email.

```bash
npx ink add component social-share
```

```html
{% raw %}{% include "components/social-share.njk" %}{% endraw %}
```

The component reads the current page URL and title automatically. No API keys required -- it uses native share URLs.

## Customizing Component Styles

Every component uses CSS custom properties from your design tokens, so changing your site's `--color-primary` or `--font-heading` will automatically update component styles. For deeper customization, find the component's CSS block in `src/css/main.css` (marked with a comment like `/* Component: contact-form */`) and edit it directly.

## Building Your Own Components

Create a new Nunjucks file in `src/_includes/components/`, add any styles to `src/css/main.css`, and include it in your templates. Follow the existing components as examples for structure and naming conventions.
