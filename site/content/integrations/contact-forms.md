---
title: "Contact Forms & Surveys"
slug: "contact-forms"
excerpt: "Replace Contact Form 7, WPForms, and Gravity Forms with simple HTML forms and embeddable SaaS tools."
icon: "file-text"
order: 1
replaces: "Contact Form 7, WPForms, Gravity Forms, WS Form, Ninja Forms"
published: true
permalink: "/integrations/contact-forms/"
---

## Replacements

| WP Plugin | Ink Replacement | How to Embed | Free? | Ease |
|---|---|---|---|---|
| Contact Form 7 | [Formspree](https://formspree.io) | HTML form with action URL -- no JS needed | Yes | Easy |
| WPForms | [Tally.so](https://tally.so) | Embed iframe or popup via script tag | Yes | Easy |
| Gravity Forms | [Typeform](https://typeform.com) | Embed script or full-page redirect | Paid | Easy |
| WS Form | [HubSpot Forms](https://hubspot.com) | Script tag -- also adds free CRM | Yes | Medium |
| Ninja Forms | [Jotform](https://jotform.com) | Iframe embed code | Limited | Easy |

## Recommended: Formspree + Tally

Formspree handles simple contact forms with zero JavaScript -- plain HTML with an action attribute. Tally is the best free option for multi-step forms. Both work inside markdown via raw HTML blocks.

Ink supports raw HTML blocks in markdown, so any embed snippet drops in without modification.

```html
<!-- Simple Formspree contact form -->
<form action="https://formspree.io/f/yourcode" method="POST">
  <input type="email" name="email" placeholder="Your email">
  <textarea name="message"></textarea>
  <button type="submit">Send</button>
</form>
```
