import fs from "fs";
import path from "path";

export interface FieldSchema {
  key: string;
  type: "string" | "text" | "number" | "boolean" | "date" | "reference";
  required?: boolean;
  label?: string;
  default?: unknown;
  /** For type:"reference" — the target collection directory name (e.g. "employees", "faq"). */
  collection?: string;
}

export interface ContentTypeSchema {
  typeId: string;
  label: string;
  dir: string;
  frontmatter: FieldSchema[];
}

/**
 * Built-in content type schemas — mirrors cli/src/content-types.js frontmatter
 * arrays. Kept in sync manually (these change rarely).
 */
const BUILTIN_SCHEMAS: Record<string, ContentTypeSchema> = {
  blog: {
    typeId: "blog",
    label: "Blog",
    dir: "blog",
    frontmatter: [
      { key: "title", type: "string", required: true },
      { key: "slug", type: "string", required: true },
      { key: "excerpt", type: "text" },
      { key: "date", type: "date" },
      { key: "author", type: "string" },
      { key: "featured_image", type: "string" },
      { key: "post_tags", type: "string" },
      { key: "author_ref", type: "reference", collection: "employees", label: "Author" },
      { key: "published", type: "boolean", default: true },
    ],
  },
  services: {
    typeId: "services",
    label: "Services",
    dir: "services",
    frontmatter: [
      { key: "title", type: "string", required: true },
      { key: "slug", type: "string", required: true },
      { key: "excerpt", type: "text" },
      { key: "featured_image", type: "string" },
      { key: "order", type: "number" },
      { key: "price_note", type: "string" },
      { key: "related_faq", type: "reference", collection: "faq", label: "Related FAQ" },
      { key: "published", type: "boolean", default: true },
    ],
  },
  team: {
    typeId: "team",
    label: "Team / Staff",
    dir: "employees",
    frontmatter: [
      { key: "title", type: "string", required: true, label: "Full Name" },
      { key: "slug", type: "string", required: true },
      { key: "role", type: "string" },
      { key: "photo", type: "string" },
      { key: "order", type: "number" },
      { key: "published", type: "boolean", default: true },
    ],
  },
  docs: {
    typeId: "docs",
    label: "Documentation",
    dir: "docs",
    frontmatter: [
      { key: "title", type: "string", required: true },
      { key: "slug", type: "string", required: true },
      { key: "excerpt", type: "text" },
      { key: "order", type: "number" },
      { key: "published", type: "boolean", default: true },
    ],
  },
  features: {
    typeId: "features",
    label: "Features",
    dir: "features",
    frontmatter: [
      { key: "title", type: "string", required: true },
      { key: "slug", type: "string", required: true },
      { key: "excerpt", type: "text" },
      { key: "subtitle", type: "string" },
      { key: "featured_image", type: "string" },
      { key: "order", type: "number" },
      { key: "published", type: "boolean", default: true },
    ],
  },
  "service-areas": {
    typeId: "service-areas",
    label: "Service Areas",
    dir: "service-areas",
    frontmatter: [
      { key: "title", type: "string", required: true },
      { key: "slug", type: "string", required: true },
      { key: "excerpt", type: "text" },
      { key: "featured_image", type: "string" },
      { key: "order", type: "number" },
      { key: "cta_title", type: "string" },
      { key: "cta_text", type: "text" },
      { key: "cta_url", type: "string" },
      { key: "cta_label", type: "string" },
      { key: "published", type: "boolean", default: true },
    ],
  },
  portfolio: {
    typeId: "portfolio",
    label: "Portfolio / Projects",
    dir: "portfolio",
    frontmatter: [
      { key: "title", type: "string", required: true },
      { key: "slug", type: "string", required: true },
      { key: "excerpt", type: "text" },
      { key: "date", type: "date" },
      { key: "client", type: "string" },
      { key: "featured_image", type: "string" },
      { key: "published", type: "boolean", default: true },
    ],
  },
  faq: {
    typeId: "faq",
    label: "FAQ",
    dir: "faq",
    frontmatter: [
      { key: "title", type: "string", required: true, label: "Question" },
      { key: "slug", type: "string", required: true },
      { key: "excerpt", type: "text" },
      { key: "category", type: "string" },
      { key: "order", type: "number" },
      { key: "published", type: "boolean", default: true },
    ],
  },
};

/** Index built-in schemas by directory name for fast path-based lookup. */
const DIR_TO_SCHEMA: Record<string, ContentTypeSchema> = {};
for (const schema of Object.values(BUILTIN_SCHEMAS)) {
  DIR_TO_SCHEMA[schema.dir] = schema;
}

/**
 * Load custom content type schemas from the project's ink-custom-types.json.
 */
function loadCustomSchemas(
  projectRoot: string
): Record<string, ContentTypeSchema> {
  const filePath = path.join(projectRoot, "ink-custom-types.json");
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const result: Record<string, ContentTypeSchema> = {};
    for (const [id, config] of Object.entries(raw as Record<string, any>)) {
      const fields: FieldSchema[] = (config.fields || []).map(
        (f: { name: string; type: string; required?: boolean }) => ({
          key: f.name,
          type: f.type as FieldSchema["type"],
          required: f.required || false,
        })
      );
      result[id] = {
        typeId: id,
        label: config.label || id,
        dir: config.slug || id,
        frontmatter: fields,
      };
    }
    return result;
  } catch {
    return {};
  }
}

/**
 * Detect the content type from a file path by matching the content directory.
 * Returns the schema or null if the file doesn't belong to a known type.
 */
export function getSchemaForFile(
  filePath: string,
  projectRoot: string
): ContentTypeSchema | null {
  const normalized = filePath.replace(/\\/g, "/");
  const root = projectRoot.replace(/\\/g, "/");

  // Get relative path from project root
  let rel = normalized;
  if (normalized.startsWith(root)) {
    rel = normalized.slice(root.length).replace(/^\//, "");
  }

  // Expected format: content/<dir>/filename.md
  if (!rel.startsWith("content/")) return null;

  const parts = rel.split("/");
  if (parts.length < 3) return null;

  const contentDir = parts[1]; // e.g. "blog", "employees", "services"

  // Check built-in schemas by directory
  if (DIR_TO_SCHEMA[contentDir]) {
    return DIR_TO_SCHEMA[contentDir];
  }

  // Check custom schemas
  const custom = loadCustomSchemas(projectRoot);
  for (const schema of Object.values(custom)) {
    if (schema.dir === contentDir) return schema;
  }

  return null;
}

export interface CollectionEntry {
  slug: string;
  title: string;
  filePath: string;
}

/**
 * List all entries in a content collection directory.
 * Parses frontmatter from each .md file to extract title and slug.
 */
export function listCollectionEntries(
  collection: string,
  projectRoot: string
): CollectionEntry[] {
  const contentDir = path.join(projectRoot, "content", collection);
  if (!fs.existsSync(contentDir)) return [];

  const entries: CollectionEntry[] = [];
  let files: string[];
  try {
    files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }

  for (const file of files) {
    const filePath = path.join(contentDir, file);
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!fmMatch) continue;

      const fmBlock = fmMatch[1];
      let title = "";
      let slug = "";

      for (const line of fmBlock.split(/\r?\n/)) {
        const titleMatch = line.match(/^title:\s*["']?(.+?)["']?\s*$/);
        if (titleMatch) title = titleMatch[1];
        const slugMatch = line.match(/^slug:\s*["']?(.+?)["']?\s*$/);
        if (slugMatch) slug = slugMatch[1];
      }

      if (!slug) {
        slug = file.replace(/\.md$/, "");
      }
      if (!title) {
        title = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      }

      entries.push({ slug, title, filePath });
    } catch {
      // Skip files that can't be read
    }
  }

  return entries.sort((a, b) => a.title.localeCompare(b.title));
}
