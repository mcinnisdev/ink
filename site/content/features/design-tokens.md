---
title: "Design Token System"
slug: "design-tokens"
excerpt: "Control your entire brand from a single CSS file with custom properties."
subtitle: "One file. Every color, font, and spacing value in your site."
icon: "palette"
order: 3
published: true
permalink: "/features/design-tokens/"
---

## A Single Source of Truth

Ink uses CSS custom properties (design tokens) to control every visual aspect of your site. All tokens live in one file -- `tokens.css` -- and every layout, component, and content type references them. Change a value once, and it propagates everywhere.

```css
:root {
  --color-primary: #2563eb;
  --color-secondary: #7c3aed;
  --color-accent: #06b6d4;
  --color-surface: #ffffff;
  --color-text: #1e293b;
  --color-text-muted: #64748b;
}
```

Swap `--color-primary` from blue to green and your buttons, links, headings, and active states all update instantly. No find-and-replace. No build step.

## Fluid Typography

Ink ships with a fluid type scale using CSS `clamp()`. Text sizes smoothly adapt between mobile and desktop without breakpoints:

```css
:root {
  --step--1: clamp(0.833rem, 0.35vw + 0.77rem, 0.938rem);
  --step-0:  clamp(1rem, 0.5vw + 0.9rem, 1.125rem);
  --step-1:  clamp(1.2rem, 0.72vw + 1.06rem, 1.35rem);
  --step-2:  clamp(1.44rem, 1.03vw + 1.24rem, 1.62rem);
  --step-3:  clamp(1.728rem, 1.45vw + 1.45rem, 1.944rem);
  --step-4:  clamp(2.074rem, 2.02vw + 1.68rem, 2.333rem);
}
```

Body text, headings, small print -- each maps to a step in the scale. The ratios are mathematically derived so everything stays proportional.

## Spacing Scale

A consistent spacing scale prevents arbitrary pixel values from creeping into your styles:

```css
:root {
  --space-3xs: clamp(0.25rem, 0.5vw, 0.375rem);
  --space-2xs: clamp(0.5rem, 0.75vw, 0.625rem);
  --space-xs:  clamp(0.75rem, 1vw, 1rem);
  --space-sm:  clamp(1rem, 1.5vw, 1.25rem);
  --space-md:  clamp(1.5rem, 3vw, 2rem);
  --space-lg:  clamp(2rem, 5vw, 4rem);
  --space-xl:  clamp(3rem, 7vw, 6rem);
}
```

## Shadows, Radii, and Transitions

The token system also covers elevation, border radius, and motion:

```css
:root {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.15);

  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
  --radius-full: 9999px;

  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
}
```

## Why Tokens Matter

Design tokens give you three things:

- **Consistency** -- Every element draws from the same palette and scale
- **Speed** -- Rebranding is a five-minute edit to one file
- **Maintainability** -- No magic numbers scattered across dozens of stylesheets

Because tokens are plain CSS custom properties, they work in every browser without a preprocessor, build tool, or runtime dependency.

## Tailwind CSS Option

Prefer utility-first CSS? During `ink init`, you can choose **Tailwind CSS** instead of the default token system. The Tailwind starter includes `tailwindcss`, `@tailwindcss/typography`, and a `tailwind.config.js` pre-configured with your brand colors. CSS custom properties are still defined in `@layer base` so components work seamlessly with either approach.
