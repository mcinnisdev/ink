import fs from "fs";
import path from "path";
import { CONTENT_TYPES } from "../content-types.js";
import { COMPONENTS } from "../component-registry.js";
import { requireProject, confirm } from "../utils.js";
import { c } from "../colors.js";

/**
 * ink remove <type>              — Remove a content type and all its entries
 * ink remove component <name>    — Uninstall a CLI component
 */
export async function remove(args) {
  const subcommand = args[0];

  if (subcommand === "component") return removeComponent(args.slice(1));

  if (!subcommand) {
    console.log("\n  Usage:");
    console.log('    ink remove <type>            Remove a content type and all its entries');
    console.log("    ink remove component <name>  Uninstall a CLI component\n");
    return;
  }

  return removeContentType(subcommand);
}

/**
 * ink delete <type> <slug>  — Delete a single content entry
 */
export async function deleteEntry(args) {
  const typeId = args[0];
  const slug = args[1];

  if (!typeId || !slug) {
    console.log("\n  Usage: ink delete <type> <slug>\n");
    console.log("  Example: ink delete blog getting-started\n");
    return;
  }

  const projectRoot = requireProject();
  const type = CONTENT_TYPES[typeId];
  const dir = type ? type.dir : typeId;
  const filePath = path.join(projectRoot, "content", dir, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    console.error(c.error(`\n  File not found: content/${dir}/${slug}.md\n`));
    process.exit(1);
  }

  const ok = await confirm(c.warn(`  Delete content/${dir}/${slug}.md? (y/N): `));
  if (!ok) {
    console.log(c.dim("  Cancelled.\n"));
    return;
  }

  fs.unlinkSync(filePath);
  console.log(c.success(`\n  Deleted content/${dir}/${slug}.md`));

  // Clean up matching media files
  const mediaDir = path.join(projectRoot, "media", dir);
  if (fs.existsSync(mediaDir)) {
    const mediaFiles = fs.readdirSync(mediaDir).filter((f) => f.startsWith(slug + "."));
    for (const mf of mediaFiles) {
      fs.unlinkSync(path.join(mediaDir, mf));
      console.log(c.dim(`  Deleted media/${dir}/${mf}`));
    }
  }

  console.log("");
}

// ─── Remove Content Type ──────────────────────────────────────────────────────

async function removeContentType(typeId) {
  const projectRoot = requireProject();

  const type = CONTENT_TYPES[typeId];
  const dir = type ? type.dir : typeId;
  const label = type ? type.label : typeId;
  const contentDir = path.join(projectRoot, "content", dir);

  if (!fs.existsSync(contentDir)) {
    console.error(c.error(`\n  Content type "${typeId}" not found at content/${dir}/\n`));
    process.exit(1);
  }

  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"));
  const countStr = files.length === 1 ? "1 entry" : `${files.length} entries`;

  const ok = await confirm(
    c.warn(`  Remove content type "${label}" (${countStr})? This deletes all files. (y/N): `)
  );
  if (!ok) {
    console.log(c.dim("  Cancelled.\n"));
    return;
  }

  console.log(c.bold(`\n  Removing: ${label}\n`));
  const removed = [];

  // 1. Delete content directory
  fs.rmSync(contentDir, { recursive: true, force: true });
  removed.push(`content/${dir}/`);

  // 2. Delete layout (only type-specific, not base.njk, page.njk, archive.njk, home.njk)
  const sharedLayouts = ["base.njk", "page.njk", "archive.njk", "home.njk"];
  if (type && type.layout && !sharedLayouts.includes(type.layout)) {
    const layoutPath = path.join(projectRoot, "src", "_layouts", type.layout);
    if (fs.existsSync(layoutPath)) {
      fs.unlinkSync(layoutPath);
      removed.push(`src/_layouts/${type.layout}`);
    }
  }

  // 3. Remove from contentTypes.json
  const tag = type ? type.tag : typeId;
  const contentTypesPath = path.join(projectRoot, "src", "_data", "contentTypes.json");
  if (fs.existsSync(contentTypesPath)) {
    try {
      const contentTypes = JSON.parse(fs.readFileSync(contentTypesPath, "utf-8"));
      if (contentTypes[tag]) {
        delete contentTypes[tag];
        fs.writeFileSync(contentTypesPath, JSON.stringify(contentTypes, null, 2));
        removed.push("contentTypes.json entry");
      }
    } catch { /* ok */ }
  }

  // 4. Remove from navigation.json
  if (type && type.navEntry) {
    const navPath = path.join(projectRoot, "src", "_data", "navigation.json");
    if (fs.existsSync(navPath)) {
      try {
        const nav = JSON.parse(fs.readFileSync(navPath, "utf-8"));
        const before = nav.main.length;
        nav.main = nav.main.filter((n) => n.url !== type.navEntry.url);
        if (nav.main.length < before) {
          fs.writeFileSync(navPath, JSON.stringify(nav, null, 2));
          removed.push("navigation.json entry");
        }
      } catch { /* ok */ }
    }
  }

  // 5. Delete archive page
  if (type && type.archivePage) {
    const archivePath = path.join(projectRoot, "content", "pages", type.archivePage.filename);
    if (fs.existsSync(archivePath)) {
      fs.unlinkSync(archivePath);
      removed.push(`content/pages/${type.archivePage.filename}`);
    }
  }

  // 6. Delete media directory if it exists and is empty
  const mediaDir = path.join(projectRoot, "media", dir);
  if (fs.existsSync(mediaDir)) {
    const mediaFiles = fs.readdirSync(mediaDir);
    if (mediaFiles.length === 0) {
      fs.rmdirSync(mediaDir);
      removed.push(`media/${dir}/`);
    } else {
      console.log(c.warn(`  Kept media/${dir}/ (${mediaFiles.length} files remaining)`));
    }
  }

  for (const item of removed) {
    console.log(`  ${c.success("✓")} Removed ${c.path(item)}`);
  }

  console.log(c.success(`\n  Done! Content type "${label}" has been removed.\n`));
}

// ─── Remove Component ─────────────────────────────────────────────────────────

async function removeComponent(args) {
  const name = args[0];

  if (!name) {
    console.log("\n  Usage: ink remove component <name>\n");
    console.log("  Example: ink remove component testimonials\n");
    return;
  }

  const component = COMPONENTS[name];
  if (!component) {
    console.error(c.error(`\n  Unknown component: "${name}"`));
    console.log(c.dim("  Run 'ink add component' to see available components.\n"));
    process.exit(1);
  }

  const projectRoot = requireProject();
  const removed = [];

  console.log(c.bold(`\n  Removing component: ${component.label}\n`));

  // 1. Delete .njk file
  const njkPath = path.join(projectRoot, "src", "_includes", "components", component.files.njk);
  if (fs.existsSync(njkPath)) {
    fs.unlinkSync(njkPath);
    removed.push(`src/_includes/components/${component.files.njk}`);
  }

  // 2. Strip CSS block from main.css or tailwind.css
  const twCssPath = path.join(projectRoot, "src", "css", "tailwind.css");
  const cssPath = fs.existsSync(twCssPath) ? twCssPath : path.join(projectRoot, "src", "css", "main.css");
  const cssFileName = path.basename(cssPath);
  if (component.files.css && fs.existsSync(cssPath)) {
    const cssMarker = `/* === ${component.label} (added by Ink CLI) === */`;
    let css = fs.readFileSync(cssPath, "utf-8");
    if (css.includes(cssMarker)) {
      css = stripBlock(css, cssMarker, /\n\/\* === .+ \(added by Ink CLI\) === \*\/|\n?$/);
      fs.writeFileSync(cssPath, css);
      removed.push(`CSS block from ${cssFileName}`);
    }
  }

  // 3. Strip JS block from main.js
  const jsPath = path.join(projectRoot, "src", "js", "main.js");
  if (component.files.js && fs.existsSync(jsPath)) {
    const jsMarker = `// --- ${component.label} (added by Ink CLI) ---`;
    let js = fs.readFileSync(jsPath, "utf-8");
    if (js.includes(jsMarker)) {
      js = stripBlock(js, jsMarker, /\n\/\/ --- .+ \(added by Ink CLI\) ---|\n?$/);
      fs.writeFileSync(jsPath, js);
      removed.push("JS block from main.js");
    }
  }

  if (removed.length === 0) {
    console.log(c.dim("  Component is not currently installed.\n"));
    return;
  }

  for (const item of removed) {
    console.log(`  ${c.success("✓")} Removed ${c.path(item)}`);
  }

  console.log(c.success(`\n  Done! Component "${component.label}" has been removed.\n`));
}

/**
 * Strip a marked block from a file's content.
 * Removes everything from the marker line to just before the next marker (or EOF).
 */
function stripBlock(content, marker, nextPattern) {
  const markerIndex = content.indexOf(marker);
  if (markerIndex === -1) return content;

  // Find the start (include the preceding newline)
  let start = markerIndex;
  if (start > 0 && content[start - 1] === "\n") start--;

  // Find the end — search for the next marker after our block
  const afterMarker = content.slice(markerIndex + marker.length);
  const nextMatch = afterMarker.search(nextPattern);

  if (nextMatch === -1 || nextMatch === afterMarker.length) {
    // No next marker — strip to end of file
    return content.slice(0, start).trimEnd() + "\n";
  }

  return content.slice(0, start) + afterMarker.slice(nextMatch);
}
