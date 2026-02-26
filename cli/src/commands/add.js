import fs from "fs";
import path from "path";
import { createInterface } from "readline";
import { CONTENT_TYPES, slugify, buildCustomType, loadCustomTypes } from "../content-types.js";
import { COMPONENTS } from "../component-registry.js";
import { findProjectRoot, findTemplatesDir } from "../utils.js";
import { c } from "../colors.js";

/**
 * ink add <type>                — scaffold a content type
 * ink add <type> "<title>"      — create a new entry for a content type
 * ink add component <name>      — install a UI component
 * ink add custom                — interactive custom content type wizard
 * ink add icons                 — add Lucide icon system
 */
export async function add(args) {
  const subcommand = args[0];

  // Special subcommands
  if (subcommand === "component") return addComponent(args.slice(1));
  if (subcommand === "custom") return addCustomType();
  if (subcommand === "icons") return addIcons();

  // Content type operations
  const typeId = subcommand;
  const title = args.slice(1).join(" ");

  if (!typeId) {
    showHelp();
    return;
  }

  // Check built-in types, then custom types
  let type = CONTENT_TYPES[typeId];
  if (!type) {
    const customTypes = loadCustomTypes(findProjectRoot());
    type = customTypes[typeId];
  }

  if (!type) {
    console.error(`Unknown content type: "${typeId}"`);
    console.log("Available types:", [...Object.keys(CONTENT_TYPES), ...Object.keys(loadCustomTypes(findProjectRoot()))].join(", "));
    console.log('Use "ink add custom" to create a new content type.');
    process.exit(1);
  }

  const projectRoot = findProjectRoot();
  if (!projectRoot) {
    console.error("Not in an Ink project. Run this from a directory with eleventy.config.js");
    process.exit(1);
  }

  if (title) {
    await addEntry(projectRoot, type, typeId, title);
  } else {
    await addContentType(projectRoot, type, typeId);
  }
}

function showHelp() {
  const projectRoot = findProjectRoot();
  const customTypes = projectRoot ? loadCustomTypes(projectRoot) : {};

  console.log("\n  Available content types:\n");
  for (const [id, type] of Object.entries(CONTENT_TYPES)) {
    console.log(`    ${id.padEnd(16)} ${type.label}`);
  }
  for (const [id, type] of Object.entries(customTypes)) {
    console.log(`    ${id.padEnd(16)} ${type.label} (custom)`);
  }
  console.log("\n  Usage:");
  console.log('    ink add blog              Add the blog content type');
  console.log('    ink add team "Jane Doe"   Create a new team member entry');
  console.log("    ink add component         List installable components");
  console.log("    ink add custom            Create a custom content type");
  console.log("    ink add icons             Add Lucide icon system\n");
}

// ─── Component Install ────────────────────────────────────────────────────────

async function addComponent(args) {
  const name = args[0];

  if (!name) {
    listComponents();
    return;
  }

  const component = COMPONENTS[name];
  if (!component) {
    console.error(`Unknown component: "${name}"`);
    console.log("Run 'ink add component' to see available components.");
    process.exit(1);
  }

  const projectRoot = findProjectRoot();
  if (!projectRoot) {
    console.error("Not in an Ink project. Run this from a directory with eleventy.config.js");
    process.exit(1);
  }

  const templatesDir = findTemplatesDir();
  if (!templatesDir) {
    console.error("Could not find component templates. Make sure ink-cli is installed properly.");
    process.exit(1);
  }

  const componentDir = path.join(templatesDir, "components", name);
  const targetDir = path.join(projectRoot, "src", "_includes", "components");
  const twCssPath = path.join(projectRoot, "src", "css", "tailwind.css");
  const cssPath = fs.existsSync(twCssPath) ? twCssPath : path.join(projectRoot, "src", "css", "main.css");
  const cssFileName = path.basename(cssPath);
  const jsPath = path.join(projectRoot, "src", "js", "main.js");

  console.log(`\n  Installing component: ${component.label}\n`);

  // 1. Copy .njk macro
  const njkSrc = path.join(componentDir, component.files.njk);
  const njkDest = path.join(targetDir, component.files.njk);
  fs.mkdirSync(targetDir, { recursive: true });

  if (fs.existsSync(njkDest)) {
    console.log(`  Skipped ${component.files.njk} (already exists)`);
  } else {
    fs.copyFileSync(njkSrc, njkDest);
    console.log(`  Created src/_includes/components/${component.files.njk}`);
  }

  // 2. Append CSS
  if (component.files.css) {
    const cssSrc = path.join(componentDir, component.files.css);
    const cssMarker = `/* === ${component.label} (added by Ink CLI) === */`;
    const existingCss = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, "utf-8") : "";

    if (existingCss.includes(cssMarker)) {
      console.log(`  Skipped CSS (already installed)`);
    } else {
      const cssBlock = fs.readFileSync(cssSrc, "utf-8");
      fs.appendFileSync(cssPath, `\n${cssMarker}\n${cssBlock}\n`);
      console.log(`  Appended CSS to src/css/${cssFileName}`);
    }
  }

  // 3. Append JS
  if (component.files.js) {
    const jsSrc = path.join(componentDir, component.files.js);
    const jsMarker = `// --- ${component.label} (added by Ink CLI) ---`;
    const existingJs = fs.existsSync(jsPath) ? fs.readFileSync(jsPath, "utf-8") : "";

    if (existingJs.includes(jsMarker)) {
      console.log(`  Skipped JS (already installed)`);
    } else {
      const jsBlock = fs.readFileSync(jsSrc, "utf-8");
      fs.appendFileSync(jsPath, `\n${jsMarker}\n${jsBlock}\n`);
      console.log(`  Appended JS to src/js/main.js`);
    }
  }

  console.log(`\n  Done! Usage example:\n`);
  console.log(`  ${component.usage}\n`);
}

function listComponents() {
  const projectRoot = findProjectRoot();
  const componentsDir = projectRoot
    ? path.join(projectRoot, "src", "_includes", "components")
    : null;

  console.log("\n  Installable components:\n");
  for (const [name, comp] of Object.entries(COMPONENTS)) {
    const installed =
      componentsDir && fs.existsSync(path.join(componentsDir, comp.files.njk));
    const status = installed ? " [installed]" : "";
    console.log(`    ${name.padEnd(20)} ${comp.description}${status}`);
  }
  console.log('\n  Usage: ink add component <name>\n');
}

// ─── Custom Content Type ──────────────────────────────────────────────────────

async function addCustomType() {
  const projectRoot = findProjectRoot();
  if (!projectRoot) {
    console.error("Not in an Ink project. Run this from a directory with eleventy.config.js");
    process.exit(1);
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

  try {
    console.log("\n  Create a Custom Content Type\n");

    const label = (await ask("  Type name (e.g. Testimonials): ")).trim();
    if (!label) { console.error("  Name is required."); return; }

    const slug = (await ask(`  Slug (default: ${slugify(label)}): `)).trim() || slugify(label);
    const tag = (await ask(`  Collection tag (default: ${slug}): `)).trim() || slug;

    // Frontmatter fields
    console.log("\n  Define frontmatter fields (press Enter with empty name to finish):\n");
    const fields = [];
    let fieldNum = 1;
    while (true) {
      const fieldName = (await ask(`  Field ${fieldNum} name: `)).trim();
      if (!fieldName) break;

      const fieldType = (
        await ask(`  Field ${fieldNum} type (string/text/number/boolean/date): `)
      ).trim() || "string";

      const fieldRequired =
        (await ask(`  Field ${fieldNum} required? (y/N): `)).trim().toLowerCase() === "y";

      fields.push({ name: fieldName, type: fieldType, required: fieldRequired });
      fieldNum++;
    }

    const sort = (await ask("\n  Sort by (date/order): ")).trim() || "order";
    const addNav = (await ask("  Add to navigation? (Y/n): ")).trim().toLowerCase() !== "n";

    rl.close();

    // Build the content type definition
    const config = { label, slug, tag, fields, sort, addToNav: addNav };
    const type = buildCustomType(config);

    // Save to project custom types
    const customTypesPath = path.join(projectRoot, "ink-custom-types.json");
    let customTypes = {};
    try { customTypes = JSON.parse(fs.readFileSync(customTypesPath, "utf-8")); } catch { /* ok */ }

    if (customTypes[slug]) {
      console.log(`\n  Custom type "${slug}" already exists. Delete it from ink-custom-types.json to recreate.\n`);
      return;
    }

    customTypes[slug] = config;
    fs.writeFileSync(customTypesPath, JSON.stringify(customTypes, null, 2));

    // Scaffold it
    console.log(`\n  Creating content type: ${label}\n`);
    await addContentType(projectRoot, type, slug);

  } catch (err) {
    rl.close();
    throw err;
  }
}

// ─── Icons ────────────────────────────────────────────────────────────────────

async function addIcons() {
  const projectRoot = findProjectRoot();
  if (!projectRoot) {
    console.error("Not in an Ink project. Run this from a directory with eleventy.config.js");
    process.exit(1);
  }

  const configPath = path.join(projectRoot, "eleventy.config.js");
  const configContent = fs.readFileSync(configPath, "utf-8");

  // Check if already installed
  if (configContent.includes("lucide-icons")) {
    console.log("\n  Lucide icons are already installed.\n");
    console.log('  Usage in templates: {% lucide "check" %}\n');
    return;
  }

  console.log("\n  Adding Lucide icon system...\n");

  // Patch eleventy.config.js
  const importLine = 'import lucideIcons from "@grimlink/eleventy-plugin-lucide-icons";';
  const pluginLine = '  eleventyConfig.addPlugin(lucideIcons);';

  let updated = configContent;

  // Add import at top (after existing imports)
  const lastImportIndex = updated.lastIndexOf("import ");
  const endOfLastImport = updated.indexOf("\n", lastImportIndex);
  updated =
    updated.slice(0, endOfLastImport + 1) +
    importLine +
    "\n" +
    updated.slice(endOfLastImport + 1);

  // Add plugin call after the first line of the default function
  const configFnMatch = updated.match(/export default function\s*\([^)]*\)\s*\{/);
  if (configFnMatch) {
    const insertPos = updated.indexOf("{", updated.indexOf(configFnMatch[0])) + 1;
    updated =
      updated.slice(0, insertPos) +
      "\n" +
      pluginLine +
      "\n" +
      updated.slice(insertPos);
  }

  fs.writeFileSync(configPath, updated);
  console.log("  Patched eleventy.config.js");

  console.log("\n  Next: Install the plugin dependency:");
  console.log("    npm install --save-dev @grimlink/eleventy-plugin-lucide-icons\n");
  console.log('  Usage in templates: {% lucide "check" %}\n');
  console.log("  Icon browser: https://lucide.dev/icons\n");
}

// ─── Content Type Scaffolding (unchanged logic) ──────────────────────────────

async function addContentType(projectRoot, type, typeId) {
  const contentDir = path.join(projectRoot, "content", type.dir);
  const layoutDir = path.join(projectRoot, "src", "_layouts");
  const dataDir = path.join(projectRoot, "src", "_data");

  if (fs.existsSync(contentDir) && fs.readdirSync(contentDir).some(f => f.endsWith(".md"))) {
    console.log(`Content type "${typeId}" already exists at content/${type.dir}/`);
    console.log(`To add a new entry, use: ink add ${typeId} "Title"`);
    return;
  }

  console.log(`\nScaffolding content type: ${type.label}\n`);

  fs.mkdirSync(contentDir, { recursive: true });
  console.log(`  Created content/${type.dir}/`);

  const defaultsPath = path.join(contentDir, `${type.dir}.json`);
  if (!fs.existsSync(defaultsPath)) {
    fs.writeFileSync(defaultsPath, JSON.stringify(type.directoryDefaults, null, 2));
    console.log(`  Created content/${type.dir}/${type.dir}.json`);
  }

  if (type.layoutTemplate) {
    const layoutPath = path.join(layoutDir, type.layout);
    if (!fs.existsSync(layoutPath)) {
      fs.writeFileSync(layoutPath, type.layoutTemplate);
      console.log(`  Created src/_layouts/${type.layout}`);
    }
  }

  // Write any additional layouts (e.g., archive layouts for FAQ)
  if (type.additionalLayouts) {
    for (const extra of type.additionalLayouts) {
      const extraPath = path.join(layoutDir, extra.filename);
      if (!fs.existsSync(extraPath)) {
        fs.writeFileSync(extraPath, extra.content);
        console.log(`  Created src/_layouts/${extra.filename}`);
      }
    }
  }

  if (type.sampleEntry) {
    const sampleTitle = getSampleTitle(typeId);
    const sampleSlug = slugify(sampleTitle);
    const samplePath = path.join(contentDir, `${sampleSlug}.md`);
    if (!fs.existsSync(samplePath)) {
      fs.writeFileSync(samplePath, type.sampleEntry(sampleTitle, sampleSlug));
      console.log(`  Created content/${type.dir}/${sampleSlug}.md`);
    }
  }

  if (type.archivePage) {
    const pagesDir = path.join(projectRoot, "content", "pages");
    fs.mkdirSync(pagesDir, { recursive: true });
    const archivePath = path.join(pagesDir, type.archivePage.filename);
    if (!fs.existsSync(archivePath)) {
      fs.writeFileSync(archivePath, type.archivePage.content);
      console.log(`  Created content/pages/${type.archivePage.filename}`);
    }
  }

  const contentTypesPath = path.join(dataDir, "contentTypes.json");
  let contentTypes = {};
  try { contentTypes = JSON.parse(fs.readFileSync(contentTypesPath, "utf-8")); } catch { /* ok */ }
  if (!contentTypes[type.tag]) {
    contentTypes[type.tag] = { glob: `content/${type.dir}/*.md`, sort: type.sort };
    fs.writeFileSync(contentTypesPath, JSON.stringify(contentTypes, null, 2));
    console.log(`  Updated src/_data/contentTypes.json`);
  }

  if (type.navEntry) {
    const navPath = path.join(dataDir, "navigation.json");
    let nav = { main: [] };
    try { nav = JSON.parse(fs.readFileSync(navPath, "utf-8")); } catch { /* ok */ }
    if (!nav.main.some((n) => n.url === type.navEntry.url)) {
      nav.main.push(type.navEntry);
      fs.writeFileSync(navPath, JSON.stringify(nav, null, 2));
      console.log(`  Updated src/_data/navigation.json`);
    }
  }

  const mediaDir = path.join(projectRoot, "media", type.dir);
  if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir, { recursive: true });
    console.log(`  Created media/${type.dir}/`);
  }

  console.log(`\n  Done! Content type "${type.label}" is ready.`);
  console.log(`  Add entries with: ink add ${typeId} "Title"\n`);
}

async function addEntry(projectRoot, type, typeId, title) {
  const slug = slugify(title);
  const contentDir = path.join(projectRoot, "content", type.dir);

  fs.mkdirSync(contentDir, { recursive: true });

  const defaultsPath = path.join(contentDir, `${type.dir}.json`);
  if (!fs.existsSync(defaultsPath)) {
    fs.writeFileSync(defaultsPath, JSON.stringify(type.directoryDefaults, null, 2));
  }

  const filePath = path.join(contentDir, `${slug}.md`);
  if (fs.existsSync(filePath)) {
    console.error(`File already exists: content/${type.dir}/${slug}.md`);
    process.exit(1);
  }

  if (!type.sampleEntry) {
    console.error(`Content type "${typeId}" does not support entry creation.`);
    process.exit(1);
  }

  fs.writeFileSync(filePath, type.sampleEntry(title, slug));
  console.log(`\n  Created content/${type.dir}/${slug}.md`);
  console.log(`  Edit this file to fill in the details.\n`);
}

function getSampleTitle(typeId) {
  const samples = {
    blog: "Welcome to Our Blog",
    services: "Our Service",
    team: "Team Member",
    docs: "Getting Started",
    features: "Key Feature",
    "service-areas": "Downtown",
    portfolio: "Sample Project",
    faq: "How do I get started?",
  };
  return samples[typeId] || "Sample Entry";
}

// findProjectRoot and findTemplatesDir imported from ../utils.js
