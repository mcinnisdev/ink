/**
 * Copies starter templates into the CLI package before publishing.
 * Run automatically via `npm pack` / `npm publish` (prepack hook).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliRoot = path.resolve(__dirname, "..");
const SKIP = new Set(["node_modules", "_site", "package-lock.json", ".git"]);

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    if (SKIP.has(entry)) continue;
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// starter/ and starter-tailwind/ are siblings of cli/ in the monorepo
copyDir(path.resolve(cliRoot, "..", "starter"), path.join(cliRoot, "starter"));
copyDir(path.resolve(cliRoot, "..", "starter-tailwind"), path.join(cliRoot, "starter-tailwind"));

console.log("Starter templates copied into CLI package.");
