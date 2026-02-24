import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createInterface } from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Walk up from cwd to find an Ink project root (has eleventy.config.js).
 */
export function findProjectRoot() {
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, "eleventy.config.js"))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return null;
}

/**
 * Find the CLI templates/ directory relative to this source file.
 */
export function findTemplatesDir() {
  const cliRoot = path.resolve(__dirname, "..");
  const templatesPath = path.join(cliRoot, "templates");
  if (fs.existsSync(templatesPath)) return templatesPath;
  return null;
}

/**
 * Parse YAML frontmatter from a markdown file.
 * Returns { data: { key: value, ... }, content: "..." }
 */
export function parseFrontmatter(filepath) {
  const raw = fs.readFileSync(filepath, "utf-8").replace(/\r\n/g, "\n");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };

  const data = {};
  for (const line of match[1].split("\n")) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (value === "true") value = true;
    else if (value === "false") value = false;
    else if (/^\d+$/.test(value)) value = parseInt(value, 10);
    data[key] = value;
  }

  return { data, content: match[2] };
}

/**
 * Prompt the user for a y/N confirmation.
 */
export function confirm(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "y" || answer.trim().toLowerCase() === "yes");
    });
  });
}

/**
 * Require that we're inside an Ink project. Exits with error if not.
 */
export function requireProject() {
  const root = findProjectRoot();
  if (!root) {
    console.error("Not in an Ink project. Run this from a directory with eleventy.config.js");
    process.exit(1);
  }
  return root;
}
