#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import { init } from "./commands/init.js";
import { add } from "./commands/add.js";
import { generate } from "./commands/generate.js";
import { list } from "./commands/list.js";
import { remove, deleteEntry } from "./commands/remove.js";
import { printBanner } from "./ascii.js";
import { c } from "./colors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const [,, command, ...args] = process.argv;

function getVersion() {
  const pkgPath = path.resolve(__dirname, "..", "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  return pkg.version;
}

const HELP = `
  ${c.bold("Usage:")}
    ink init                          Create a new Ink project
    ink add <type>                    Add a content type (blog, faq, docs, etc.)
    ink add <type> "<title>"          Create a new entry for a content type
    ink add component <name>          Install a UI component
    ink add custom                    Create a custom content type interactively
    ink add icons                     Add Lucide SVG icon system
    ink generate <type> [count]       Generate sample content for a type
    ink list [type]                   List content entries
    ink remove <type>                 Remove a content type and all entries
    ink remove component <name>       Uninstall a component
    ink delete <type> <slug>          Delete a single entry
    ink serve                         Start the dev server
    ink build                         Build for production
    ink help                          Show this help message

  ${c.bold("Content Types:")}
    blog          Blog posts with dates and categories
    services      Service offerings (included in starter)
    team          Team member profiles (included in starter)
    docs          Documentation with sidebar navigation
    features      Product/service feature highlights
    service-areas Location-based pages for local SEO
    portfolio     Portfolio projects and case studies
    faq           Frequently asked questions

  ${c.bold("Components:")}
    contact-form  Styled form with Formspree/Netlify support
    feature-grid  Icon + title + description grid
    testimonials  Customer quotes with star ratings
    pricing-table Tiered pricing comparison cards
    stats-counter Animated number counters
    image-gallery Responsive grid with lightbox
    tabs          Tabbed content panels
    logo-cloud    Partner/client logo display
    newsletter-signup  Email capture form
    timeline      Vertical timeline
    modal         Accessible dialog overlay
    social-share  Share buttons

  ${c.bold("Examples:")}
    ink init
    ink add blog
    ink add team "Jane Doe"
    ink add component testimonials
    ink generate blog 5
    ink list blog
    ink remove component testimonials
    ink delete blog old-post
    ink serve
`;

function serve() {
  printBanner();
  console.log(c.info("  Starting dev server...\n"));
  const child = spawn("npx", ["@11ty/eleventy", "--serve"], {
    stdio: "inherit",
    shell: true,
    cwd: process.cwd(),
  });
  child.on("error", (err) => {
    console.error(c.error("Failed to start server:"), err.message);
    process.exit(1);
  });
  child.on("exit", (code) => process.exit(code || 0));
}

function build() {
  printBanner();
  console.log(c.info("  Building for production...\n"));
  const child = spawn("npx", ["@11ty/eleventy"], {
    stdio: "inherit",
    shell: true,
    cwd: process.cwd(),
  });
  child.on("error", (err) => {
    console.error(c.error("Build failed:"), err.message);
    process.exit(1);
  });
  child.on("exit", (code) => process.exit(code || 0));
}

async function main() {
  switch (command) {
    case "init":
      await init(args);
      break;
    case "add":
      await add(args);
      break;
    case "generate":
    case "gen":
      await generate(args);
      break;
    case "list":
    case "ls":
      list(args);
      break;
    case "remove":
    case "rm":
      await remove(args);
      break;
    case "delete":
    case "del":
      await deleteEntry(args);
      break;
    case "serve":
    case "dev":
      serve();
      break;
    case "build":
      build();
      break;
    case "--version":
    case "-v":
      console.log(`ink-cli v${getVersion()}`);
      break;
    case "help":
    case "--help":
    case "-h":
    case undefined:
      printBanner();
      console.log(HELP);
      break;
    default:
      console.error(c.error(`Unknown command: ${command}`));
      console.log(HELP);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(c.error("Error:"), err.message);
  process.exit(1);
});
