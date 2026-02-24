---
title: "Component Library"
slug: "component-library"
excerpt: "12 pre-built UI components you can install with a single command."
subtitle: "Production-ready components. One command to install."
icon: "puzzle"
order: 5
published: true
permalink: "/features/component-library/"
---

## 12 Ready-to-Use Components

Ink includes a library of pre-built UI components that cover common website patterns. Each component is self-contained -- a Nunjucks macro, scoped CSS, and optional JavaScript -- and installs with a single CLI command.

| Component | Command |
|-----------|---------|
| Contact Form | `ink add contact-form` |
| Feature Grid | `ink add feature-grid` |
| Testimonials | `ink add testimonials` |
| Pricing Table | `ink add pricing-table` |
| Stats Counter | `ink add stats-counter` |
| Image Gallery | `ink add image-gallery` |
| Tabs | `ink add tabs` |
| Logo Cloud | `ink add logo-cloud` |
| Newsletter Signup | `ink add newsletter-signup` |
| Timeline | `ink add timeline` |
| Modal | `ink add modal` |
| Social Share | `ink add social-share` |

## Install with One Command

```bash
npx ink add testimonials
# ✓ Copied testimonials.njk to src/_includes/components/
# ✓ Styles injected into project CSS
# ✓ Component ready to use
```

The CLI copies the template into your project's `_includes/components/` directory and injects the associated styles. No npm packages, no node_modules bloat, no version conflicts.

## Nunjucks Macros

Every component is a Nunjucks macro. Import it in any template and call it with data:

```html
{% raw %}{% from "components/testimonials.njk" import testimonials %}
{{ testimonials(collections.testimonials) }}{% endraw %}
```

Or pass data directly from frontmatter:

```html
{% raw %}{% from "components/stats-counter.njk" import statsCounter %}
{{ statsCounter(stats) }}{% endraw %}
```

Macros accept arguments, so you control what data each component receives. No global state, no side effects.

## Accessible by Default

Components ship with proper ARIA attributes, keyboard navigation, and semantic HTML:

- **Tabs** use `role="tablist"`, `role="tab"`, and `role="tabpanel"` with arrow key navigation
- **Modal** traps focus, closes on Escape, and restores focus on close
- **Image Gallery** supports keyboard browsing and screen reader descriptions
- **Contact Form** associates labels with inputs and provides validation feedback

## Customize Everything

Because components are plain Nunjucks and CSS in your project, you can edit them directly. Change the markup, override the styles with your design tokens, or add new functionality. There is no abstraction layer between you and the code.
