import fs from "fs";
import path from "path";
import { CONTENT_TYPES } from "../content-types.js";
import { requireProject, parseFrontmatter } from "../utils.js";
import { c } from "../colors.js";

/**
 * ink list [type]  — List content entries.
 * No type: show summary of all content directories.
 * With type: show entries for that type with details.
 */
export function list(args) {
  const typeId = args[0];
  const projectRoot = requireProject();

  if (typeId) {
    listType(projectRoot, typeId);
  } else {
    listAll(projectRoot);
  }
}

function listAll(projectRoot) {
  const contentDir = path.join(projectRoot, "content");
  if (!fs.existsSync(contentDir)) {
    console.log(c.dim("\n  No content/ directory found.\n"));
    return;
  }

  const dirs = fs.readdirSync(contentDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== "pages" && !d.name.startsWith("."))
    .map((d) => d.name);

  if (!dirs.length) {
    console.log(c.dim("\n  No content types found. Use 'ink add <type>' to create one.\n"));
    return;
  }

  console.log(c.bold("\n  Content Overview\n"));

  let totalEntries = 0;
  for (const dir of dirs) {
    const dirPath = path.join(contentDir, dir);
    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".md"));
    totalEntries += files.length;

    // Find matching content type for label
    const type = Object.values(CONTENT_TYPES).find((t) => t.dir === dir);
    const label = type ? type.label : dir;

    const countStr = files.length === 1 ? "1 entry" : `${files.length} entries`;
    console.log(`    ${c.info(label.padEnd(20))} ${countStr}`);
  }

  console.log(c.dim(`\n    Total: ${totalEntries} entries across ${dirs.length} types`));
  console.log(c.dim("    Use 'ink list <type>' for details.\n"));
}

function listType(projectRoot, typeId) {
  // Resolve the directory name
  const type = CONTENT_TYPES[typeId];
  const dir = type ? type.dir : typeId;
  const label = type ? type.label : typeId;
  const contentDir = path.join(projectRoot, "content", dir);

  if (!fs.existsSync(contentDir)) {
    console.error(c.error(`\n  Content type "${typeId}" not found at content/${dir}/`));
    console.log(c.dim("  Use 'ink add " + typeId + "' to create it.\n"));
    process.exit(1);
  }

  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"));

  if (!files.length) {
    console.log(c.warn(`\n  ${label} — no entries yet.`));
    console.log(c.dim(`  Use 'ink add ${typeId} "Title"' to create one.\n`));
    return;
  }

  const countStr = files.length === 1 ? "1 entry" : `${files.length} entries`;
  console.log(c.bold(`\n  ${label}`) + c.dim(` (${countStr})\n`));

  for (const file of files.sort()) {
    const filepath = path.join(contentDir, file);
    const { data } = parseFrontmatter(filepath);
    const slug = file.replace(/\.md$/, "");
    const title = data.title || slug;
    const date = data.date || "";
    const status = data.published === false ? c.warn("draft") : c.success("published");

    const slugCol = c.dim(slug.padEnd(28));
    const titleCol = title.padEnd(32);
    const dateCol = date ? c.dim(String(date).padEnd(14)) : c.dim("".padEnd(14));

    console.log(`    ${slugCol} ${titleCol} ${dateCol} ${status}`);
  }

  console.log("");
}
