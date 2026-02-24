---
title: "Customization"
slug: "customization"
excerpt: "Change colors, fonts, spacing, and layouts using Ink's design token system and Nunjucks templates."
order: 5
published: true
permalink: "/docs/customization/"
---

## Design Tokens

Ink uses CSS custom properties (design tokens) defined in the `:root` selector of `src/css/main.css`. Changing a single variable updates every element that references it -- buttons, links, headings, components, and more.

### Colors

```css
:root {
  --color-primary: #2563eb;
  --color-primary-dark: #1d4ed8;
  --color-primary-light: #60a5fa;
  --color-secondary: #f59e0b;
  --color-background: #ffffff;
  --color-surface: #f8fafc;
  --color-dark: #0f172a;
  --color-text: #334155;
  --color-text-muted: #94a3b8;
  --color-text-inverse: #ffffff;
  --color-border: #e2e8f0;
}
```

To rebrand your site, change `--color-primary` and its dark/light variants. The `ink init` wizard sets these for you during project creation, but you can edit them at any time.

### Typography

```css
:root {
  --font-body: system-ui, -apple-system, sans-serif;
  --font-heading: system-ui, -apple-system, sans-serif;
  --font-mono: ui-monospace, "Cascadia Code", monospace;
}
```

To use a custom font, add a `@font-face` declaration or a Google Fonts `@import` at the top of `main.css`, then update the variable:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

:root {
  --font-body: "Inter", system-ui, sans-serif;
  --font-heading: "Inter", system-ui, sans-serif;
}
```

### Font Sizes

Ink uses fluid typography with `clamp()` values that scale smoothly between viewport sizes:

```css
:root {
  --text-sm: clamp(0.8rem, 0.17vw + 0.76rem, 0.89rem);
  --text-base: clamp(1rem, 0.34vw + 0.91rem, 1.19rem);
  --text-lg: clamp(1.25rem, 0.61vw + 1.1rem, 1.58rem);
  --text-xl: clamp(1.56rem, 1vw + 1.31rem, 2.11rem);
  --text-2xl: clamp(1.95rem, 1.56vw + 1.56rem, 2.81rem);
  --text-3xl: clamp(2.44rem, 2.38vw + 1.85rem, 3.75rem);
  --text-display: clamp(3.05rem, 3.54vw + 2.17rem, 5rem);
}
```

### Spacing

Consistent spacing scale used for margins, padding, and gaps:

```css
:root {
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 4rem;
}
```

### Layout Widths

Control the maximum width of content areas:

```css
:root {
  --content-width: 72rem;
  --content-narrow: 42rem;
  --content-wide: 90rem;
  --gutter: 1.5rem;
}
```

### Borders and Shadows

```css
:root {
  --radius: 0.375rem;
  --radius-lg: 0.75rem;
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

## Custom Layouts

Layouts live in `src/_layouts/`. Every layout extends a base template and defines blocks for content. To create a custom layout:

1. Create a new file in `src/_layouts/`, for example `landing.njk`:

```html
{% raw %}---
layout: base.njk
---

<main class="landing-page">
  <section class="hero">
    <h1>{{ title }}</h1>
    <p>{{ excerpt }}</p>
  </section>
  <section class="landing-content">
    {{ content | safe }}
  </section>
</main>{% endraw %}
```

2. Reference it in your content's frontmatter:

```yaml
---
title: "Spring Sale"
layout: landing.njk
permalink: "/spring-sale/"
---
```

## Adding Partials

Partials (reusable template fragments) live in `src/_includes/`. Create a new `.njk` file and include it in any layout or page:

```html
{% raw %}<!-- src/_includes/cta-banner.njk -->
<div class="cta-banner">
  <h2>Ready to get started?</h2>
  <a href="/contact/" class="btn btn-primary">Contact Us</a>
</div>{% endraw %}
```

Use it in a layout or page:

```html
{% raw %}{% include "cta-banner.njk" %}{% endraw %}
```

## Overriding Component Styles

Every installed component's CSS is marked with a comment header in `src/css/main.css`. To override styles, either:

1. **Edit the component's CSS block directly** -- Find the `/* Component: component-name */` comment and modify the rules.

2. **Add overrides after the component block** -- This keeps the original intact so you can see what changed:

```css
/* Component: contact-form */
/* ... original component styles ... */

/* Custom overrides */
.contact-form .btn-submit {
  background: var(--color-secondary);
  border-radius: var(--radius-lg);
}
```

3. **Use design tokens** -- The most maintainable approach. If a component uses `var(--color-primary)`, changing the token changes the component everywhere.

## Dark Mode

Ink does not ship with a built-in dark mode toggle, but the design token system makes it straightforward to add one. Define a dark theme by overriding tokens inside a `prefers-color-scheme` media query or a `.dark` class:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #0f172a;
    --color-surface: #1e293b;
    --color-text: #e2e8f0;
    --color-text-muted: #94a3b8;
    --color-border: #334155;
  }
}
```

Because every element references these tokens, the entire site adapts automatically.
