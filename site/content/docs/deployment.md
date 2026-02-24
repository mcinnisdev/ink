---
title: "Deployment"
slug: "deployment"
excerpt: "Deploy your Ink site to Cloudflare Pages, Netlify, Vercel, or GitHub Pages with step-by-step instructions."
order: 6
published: true
permalink: "/docs/deployment/"
---

## Build Settings

Regardless of hosting provider, the build settings are the same:

| Setting | Value |
|---------|-------|
| **Build command** | `npx @11ty/eleventy` |
| **Output directory** | `_site` |
| **Node.js version** | 18 or later |

Make sure your `package.json` includes `@11ty/eleventy` v3 as a dependency. The hosting provider will run `npm install` automatically before executing your build command.

## Cloudflare Pages

Cloudflare Pages offers fast global edge delivery and generous free-tier limits.

### Setup

1. Push your project to a GitHub or GitLab repository.
2. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and go to **Workers & Pages**.
3. Click **Create application** then **Pages** then **Connect to Git**.
4. Select your repository and configure:

```
Framework preset: None
Build command: npx @11ty/eleventy
Build output directory: _site
```

5. Under **Environment variables**, add:

```
NODE_VERSION = 18
```

6. Click **Save and Deploy**.

Cloudflare Pages will build and deploy your site on every push to the main branch. Preview deployments are created automatically for pull requests.

### Custom Headers and Redirects

Ink projects include `public/_headers` and `public/_redirects` files that Cloudflare Pages reads automatically. Edit these to add security headers, caching rules, or URL redirects.

## Netlify

### Setup

1. Push your project to GitHub, GitLab, or Bitbucket.
2. Log in to [Netlify](https://app.netlify.com/) and click **Add new site** then **Import an existing project**.
3. Select your repository and configure:

```
Build command: npx @11ty/eleventy
Publish directory: _site
```

4. Under **Environment variables**, set:

```
NODE_VERSION = 18
```

5. Click **Deploy site**.

### Netlify Forms

If you installed the `contact-form` component, you can use Netlify Forms by adding the `netlify` attribute to the form tag in `src/_includes/components/contact-form.njk`:

```html
<form name="contact" method="POST" netlify>
```

No backend code required -- Netlify intercepts the form at the CDN level.

### netlify.toml (Optional)

For version-controlled build configuration, add a `netlify.toml` to your project root:

```toml
[build]
  command = "npx @11ty/eleventy"
  publish = "_site"

[build.environment]
  NODE_VERSION = "18"
```

## Vercel

### Setup

1. Push your project to GitHub, GitLab, or Bitbucket.
2. Log in to [Vercel](https://vercel.com/) and click **Add New** then **Project**.
3. Import your repository and configure:

```
Framework Preset: Other
Build Command: npx @11ty/eleventy
Output Directory: _site
Install Command: npm install
```

4. Under **Environment Variables**, add:

```
NODE_VERSION = 18
```

5. Click **Deploy**.

### vercel.json (Optional)

Add a `vercel.json` to your project root for explicit configuration:

```json
{
  "buildCommand": "npx @11ty/eleventy",
  "outputDirectory": "_site",
  "installCommand": "npm install"
}
```

## GitHub Pages

GitHub Pages works well for open-source projects and personal sites hosted from a repository.

### Using GitHub Actions

Create the file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      - run: npm ci
      - run: npx @11ty/eleventy
      - uses: actions/upload-pages-artifact@v3
        with:
          path: _site

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Then in your repository settings, go to **Settings** then **Pages** and set the source to **GitHub Actions**.

### Path Prefix

If your site is hosted at `https://username.github.io/repo-name/` (not a custom domain), you need to set a path prefix. Add to your `eleventy.config.js`:

```javascript
export default function(eleventyConfig) {
  return {
    pathPrefix: "/repo-name/"
  };
};
```

## Environment Variables

All providers support environment variables. Common variables you may want to set:

| Variable | Purpose |
|----------|---------|
| `NODE_VERSION` | Ensure Node.js 18+ is used |
| `ELEVENTY_ENV` | Set to `production` for conditional logic |

Access environment variables in your templates via a data file. Create `src/_data/env.js`:

```javascript
export default function() {
  return {
    environment: process.env.ELEVENTY_ENV || "development"
  };
};
```

Then use it in templates:

```html
{% raw %}{% if env.environment == "production" %}
  <!-- Google Tag Manager or analytics snippet -->
{% endif %}{% endraw %}
```
