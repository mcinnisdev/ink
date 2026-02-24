import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createInterface } from "readline";
import { CONTENT_TYPES, slugify } from "../content-types.js";
import { c } from "../colors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ink init — Interactive project setup.
 * Copies the starter template and customises site.json, CSS brand colors,
 * navigation, and optionally scaffolds additional content types.
 */
export async function init(args) {
  const targetArg = args[0];
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

  try {
    console.log("\n  Welcome to Ink — the Markdown-native CMS\n");

    // 1. Project directory
    const dirAnswer = targetArg || (await ask("  Project directory (default: .): "));
    const projectDir = path.resolve(dirAnswer.trim() || ".");

    if (fs.existsSync(path.join(projectDir, "eleventy.config.js"))) {
      console.error(`\n  An Ink project already exists at ${projectDir}`);
      console.log("  Use 'ink add' to add content types to an existing project.\n");
      return;
    }

    // 2. Site details
    const siteName = (await ask("  Site name: ")).trim() || "My Site";
    const siteTagline = (await ask("  Tagline (short description): ")).trim() || "";
    const siteUrl = (await ask("  URL (e.g. https://example.com): ")).trim() || "https://example.com";
    const siteEmail = (await ask("  Contact email: ")).trim() || "";

    // 3. Brand colors
    console.log("\n  Brand colors (press Enter for defaults)");
    const primaryColor = (await ask("  Primary color (default #2563eb): ")).trim() || "#2563eb";
    const secondaryColor = (await ask("  Secondary color (default #1e3a5f): ")).trim() || "#1e3a5f";

    // 3b. Tailwind CSS option
    const useTailwind = (await ask("\n  Use Tailwind CSS? (y/N): ")).trim().toLowerCase();
    const tailwind = useTailwind === "y" || useTailwind === "yes";

    // 4. Content types
    console.log("\n  Which content types do you want? (starter includes services + team)");
    const extraTypes = [];
    for (const [id, type] of Object.entries(CONTENT_TYPES)) {
      if (type.existsInStarter) continue;
      const answer = (await ask(`  Add ${type.label}? (y/N): `)).trim().toLowerCase();
      if (answer === "y" || answer === "yes") {
        extraTypes.push(id);
      }
    }

    rl.close();

    // --- Execute ---
    console.log(`\n  Creating project at ${projectDir}...\n`);

    // Copy starter template
    const starterDir = findStarterDir(tailwind);
    if (!starterDir) {
      console.error("  Could not find the Ink starter template.");
      console.error("  Make sure ink-cli is installed properly.\n");
      process.exit(1);
    }

    copyDirSync(starterDir, projectDir, ["node_modules", "_site", ".git", "package-lock.json"]);
    console.log("  Copied starter template");

    // Update site.json
    const siteJsonPath = path.join(projectDir, "src", "_data", "site.json");
    const siteJson = JSON.parse(fs.readFileSync(siteJsonPath, "utf-8"));
    siteJson.name = siteName;
    if (siteTagline) siteJson.tagline = siteTagline;
    siteJson.url = siteUrl;
    if (siteEmail) siteJson.email = siteEmail;
    siteJson.description = siteTagline
      ? `${siteTagline} — powered by Ink.`
      : `${siteName} — powered by Ink.`;
    fs.writeFileSync(siteJsonPath, JSON.stringify(siteJson, null, 2));
    console.log("  Configured site.json");

    // Update brand colors in CSS
    if (tailwind) {
      updateBrandColorsTailwind(projectDir, primaryColor);
    } else {
      updateBrandColors(projectDir, primaryColor, secondaryColor);
    }
    console.log("  Applied brand colors");

    // Scaffold extra content types
    for (const typeId of extraTypes) {
      const type = CONTENT_TYPES[typeId];
      scaffoldContentType(projectDir, type, typeId);
      console.log(`  Added content type: ${type.label}`);
    }

    // Summary
    console.log(`
  Done! Your Ink project is ready.

  Next steps:
    cd ${path.relative(process.cwd(), projectDir) || "."}
    npm install
    npm run dev

  Useful commands:
    ink add blog              Add the blog content type
    ink add team "Jane Doe"   Create a new team member entry
    ink generate blog 5       Generate 5 sample blog posts
`);
  } catch (err) {
    rl.close();
    throw err;
  }
}

/**
 * Copy a directory recursively, skipping entries in the ignore list.
 */
function copyDirSync(src, dest, ignore = []) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (ignore.includes(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath, ignore);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Replace --color-primary and --color-secondary in main.css.
 */
function updateBrandColors(projectDir, primary, secondary) {
  const cssPath = path.join(projectDir, "src", "css", "main.css");
  if (!fs.existsSync(cssPath)) return;
  let css = fs.readFileSync(cssPath, "utf-8");
  css = css.replace(
    /(--color-primary:\s*)([^;]+)(;\s*\/\*.*?\*\/)?/,
    `$1${primary}$3`
  );
  css = css.replace(
    /(--color-secondary:\s*)([^;]+)(;\s*\/\*.*?\*\/)?/,
    `$1${secondary}$3`
  );
  fs.writeFileSync(cssPath, css);
}

/**
 * Replace brand color in tailwind.config.js and --color-primary in tailwind.css.
 */
function updateBrandColorsTailwind(projectDir, primary) {
  // Update tailwind.config.js — replace the DEFAULT color value
  const configPath = path.join(projectDir, "tailwind.config.js");
  if (fs.existsSync(configPath)) {
    let config = fs.readFileSync(configPath, "utf-8");
    config = config.replace(
      /(DEFAULT:\s*")#[0-9a-fA-F]{6}(")/,
      `$1${primary}$2`
    );
    fs.writeFileSync(configPath, config);
  }

  // Update tailwind.css — replace --color-primary custom property
  const cssPath = path.join(projectDir, "src", "css", "tailwind.css");
  if (fs.existsSync(cssPath)) {
    let css = fs.readFileSync(cssPath, "utf-8");
    css = css.replace(
      /(--color-primary:\s*)#[0-9a-fA-F]{6}/,
      `$1${primary}`
    );
    fs.writeFileSync(cssPath, css);
  }
}

/**
 * Scaffold a content type into an existing project (same as ink add <type>).
 */
function scaffoldContentType(projectDir, type, typeId) {
  const contentDir = path.join(projectDir, "content", type.dir);
  const layoutDir = path.join(projectDir, "src", "_layouts");
  const dataDir = path.join(projectDir, "src", "_data");

  // Content directory + defaults
  fs.mkdirSync(contentDir, { recursive: true });
  const defaultsPath = path.join(contentDir, `${type.dir}.json`);
  if (!fs.existsSync(defaultsPath)) {
    fs.writeFileSync(defaultsPath, JSON.stringify(type.directoryDefaults, null, 2));
  }

  // Layout
  if (type.layoutTemplate) {
    const layoutPath = path.join(layoutDir, type.layout);
    if (!fs.existsSync(layoutPath)) {
      fs.writeFileSync(layoutPath, type.layoutTemplate);
    }
  }

  // Archive page
  if (type.archivePage) {
    const pagesDir = path.join(projectDir, "content", "pages");
    fs.mkdirSync(pagesDir, { recursive: true });
    const archivePath = path.join(pagesDir, type.archivePage.filename);
    if (!fs.existsSync(archivePath)) {
      fs.writeFileSync(archivePath, type.archivePage.content);
    }
  }

  // Update contentTypes.json
  const contentTypesPath = path.join(dataDir, "contentTypes.json");
  let contentTypes = {};
  try { contentTypes = JSON.parse(fs.readFileSync(contentTypesPath, "utf-8")); } catch { /* ok */ }
  if (!contentTypes[type.tag]) {
    contentTypes[type.tag] = { glob: `content/${type.dir}/*.md`, sort: type.sort };
    fs.writeFileSync(contentTypesPath, JSON.stringify(contentTypes, null, 2));
  }

  // Update navigation.json
  if (type.navEntry) {
    const navPath = path.join(dataDir, "navigation.json");
    let nav = { main: [] };
    try { nav = JSON.parse(fs.readFileSync(navPath, "utf-8")); } catch { /* ok */ }
    if (!nav.main.some((n) => n.url === type.navEntry.url)) {
      nav.main.push(type.navEntry);
      fs.writeFileSync(navPath, JSON.stringify(nav, null, 2));
    }
  }

  // Media directory
  const mediaDir = path.join(projectDir, "media", type.dir);
  if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir, { recursive: true });
  }
}

/**
 * Find the starter template directory. Checks:
 * 1. Sibling directory ../starter or ../starter-tailwind (monorepo)
 * 2. Bundled with the CLI package
 */
function findStarterDir(tailwind = false) {
  const dirName = tailwind ? "starter-tailwind" : "starter";

  // __dirname is cli/src/commands/
  // Monorepo layout: cli/ and starter/ are siblings
  const monorepoPath = path.resolve(__dirname, "..", "..", "..", dirName);
  if (fs.existsSync(path.join(monorepoPath, "eleventy.config.js"))) {
    return monorepoPath;
  }

  // Fallback: check if bundled alongside the CLI
  const bundledPath = path.resolve(__dirname, "..", "..", dirName);
  if (fs.existsSync(path.join(bundledPath, "eleventy.config.js"))) {
    return bundledPath;
  }

  return null;
}
