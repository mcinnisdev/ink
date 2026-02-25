import fs from "fs";
import path from "path";
import { app, dialog } from "electron";
import { readFile, writeFile } from "./file";

export interface ProjectConfig {
  name: string;
  path: string;
  siteName: string;
  siteUrl: string;
  tailwind?: boolean;
}

export interface ProjectData {
  name: string;
  path: string;
  siteName: string;
  siteUrl: string;
}

const RECENT_FILE = "recent-projects.json";

function getRecentPath(): string {
  return path.join(app.getPath("userData"), RECENT_FILE);
}

function copyDirSync(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.name === "node_modules" || entry.name === "_site") continue;
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export function getStarterPath(tailwind: boolean = false): string {
  const dirName = tailwind ? "starter-tailwind" : "starter";
  // In dev: relative to monorepo root
  const devPath = path.join(__dirname, "../../../" + dirName);
  if (fs.existsSync(devPath)) return devPath;
  // In prod: bundled in resources
  return path.join(process.resourcesPath, dirName);
}

export async function createProject(config: ProjectConfig): Promise<string> {
  const projectPath = path.join(config.path, config.name);

  if (fs.existsSync(projectPath)) {
    throw new Error(`Directory already exists: ${projectPath}`);
  }

  // Copy starter template (vanilla CSS or Tailwind)
  const starterPath = getStarterPath(config.tailwind);
  copyDirSync(starterPath, projectPath);

  // Update site.json with user's config
  const siteJsonPath = path.join(projectPath, "src", "_data", "site.json");
  if (fs.existsSync(siteJsonPath)) {
    const siteJson = JSON.parse(fs.readFileSync(siteJsonPath, "utf-8"));
    siteJson.name = config.siteName || config.name;
    siteJson.url = config.siteUrl || "https://example.com";
    fs.writeFileSync(siteJsonPath, JSON.stringify(siteJson, null, 2));
  }

  // Add to recent projects
  addRecent({ name: config.name, path: projectPath, siteName: config.siteName, siteUrl: config.siteUrl });

  return projectPath;
}

export async function openProject(): Promise<ProjectData | null> {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
    title: "Open Ink Project",
  });

  if (result.canceled || result.filePaths.length === 0) return null;

  const projectPath = result.filePaths[0];

  // Verify it's an Ink project (has eleventy.config.js)
  if (!fs.existsSync(path.join(projectPath, "eleventy.config.js"))) {
    throw new Error("Not a valid Ink project (missing eleventy.config.js)");
  }

  // Read site.json for project info
  const siteJsonPath = path.join(projectPath, "src", "_data", "site.json");
  let siteName = path.basename(projectPath);
  let siteUrl = "";
  if (fs.existsSync(siteJsonPath)) {
    const siteJson = JSON.parse(fs.readFileSync(siteJsonPath, "utf-8"));
    siteName = siteJson.name || siteName;
    siteUrl = siteJson.url || "";
  }

  const data: ProjectData = {
    name: path.basename(projectPath),
    path: projectPath,
    siteName,
    siteUrl,
  };

  addRecent(data);
  return data;
}

export function listRecent(): ProjectData[] {
  const recentPath = getRecentPath();
  if (!fs.existsSync(recentPath)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(recentPath, "utf-8"));
    // Filter out projects that no longer exist
    return data.filter((p: ProjectData) => fs.existsSync(p.path));
  } catch {
    return [];
  }
}

function addRecent(project: ProjectData): void {
  const recent = listRecent().filter((p) => p.path !== project.path);
  recent.unshift(project);
  // Keep max 10 recent projects
  const trimmed = recent.slice(0, 10);
  fs.writeFileSync(getRecentPath(), JSON.stringify(trimmed, null, 2));
}

export function openProjectByPath(projectPath: string): ProjectData | null {
  if (!fs.existsSync(projectPath)) return null;
  if (!fs.existsSync(path.join(projectPath, "eleventy.config.js"))) return null;

  const siteJsonPath = path.join(projectPath, "src", "_data", "site.json");
  let siteName = path.basename(projectPath);
  let siteUrl = "";
  if (fs.existsSync(siteJsonPath)) {
    const siteJson = JSON.parse(fs.readFileSync(siteJsonPath, "utf-8"));
    siteName = siteJson.name || siteName;
    siteUrl = siteJson.url || "";
  }

  const data: ProjectData = {
    name: path.basename(projectPath),
    path: projectPath,
    siteName,
    siteUrl,
  };

  addRecent(data);
  return data;
}

// ---------------------------------------------------------------------------
// Branding — logo + brand colors (extracted from scaffold.ts)
// ---------------------------------------------------------------------------

export interface BrandingOptions {
  logoPath?: string;
  brandColors?: { primary: string; secondary: string };
  siteDescription?: string;
  siteName?: string;
  siteUrl?: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) =>
        Math.max(0, Math.min(255, Math.round(v)))
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
  );
}

function darkenHex(hex: string, percent: number): string {
  const [r, g, b] = hexToRgb(hex);
  const f = 1 - percent / 100;
  return rgbToHex(r * f, g * f, b * f);
}

function lightenHex(hex: string, percent: number): string {
  const [r, g, b] = hexToRgb(hex);
  const f = percent / 100;
  return rgbToHex(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f);
}

export async function applyBranding(
  projectPath: string,
  options: BrandingOptions
): Promise<void> {
  // Update site.json with description/name/url if provided
  const siteJsonPath = path.join(projectPath, "src", "_data", "site.json");
  try {
    const siteJson = JSON.parse(await readFile(siteJsonPath));
    if (options.siteDescription) siteJson.description = options.siteDescription;
    if (options.siteName) siteJson.name = options.siteName;
    if (options.siteUrl) siteJson.url = options.siteUrl;
    await writeFile(siteJsonPath, JSON.stringify(siteJson, null, 2));
  } catch {
    /* non-critical */
  }

  // Copy logo if provided
  if (options.logoPath && fs.existsSync(options.logoPath)) {
    const siteMediaDir = path.join(projectPath, "media", "site");
    if (!fs.existsSync(siteMediaDir)) {
      fs.mkdirSync(siteMediaDir, { recursive: true });
    }
    const ext = path.extname(options.logoPath);
    const dest = path.join(siteMediaDir, `logo${ext}`);
    fs.copyFileSync(options.logoPath, dest);
  }

  // Apply brand colors to CSS
  if (options.brandColors) {
    // Try tailwind.css first, fall back to main.css
    const twCssPath = path.join(projectPath, "src", "css", "tailwind.css");
    const vanillaCssPath = path.join(projectPath, "src", "css", "main.css");
    const cssPath = fs.existsSync(twCssPath) ? twCssPath : vanillaCssPath;

    try {
      let css = await readFile(cssPath);
      const { primary, secondary } = options.brandColors;

      css = css.replace(/--color-primary: #[0-9a-fA-F]{6};/, `--color-primary: ${primary};`);
      css = css.replace(/--color-primary-dark: #[0-9a-fA-F]{6};/, `--color-primary-dark: ${darkenHex(primary, 15)};`);
      css = css.replace(/--color-primary-light: #[0-9a-fA-F]{6};/, `--color-primary-light: ${lightenHex(primary, 30)};`);
      css = css.replace(/--color-secondary: #[0-9a-fA-F]{6};/, `--color-secondary: ${secondary};`);
      css = css.replace(/--color-secondary-dark: #[0-9a-fA-F]{6};/, `--color-secondary-dark: ${darkenHex(secondary, 15)};`);
      css = css.replace(/--color-secondary-light: #[0-9a-fA-F]{6};/, `--color-secondary-light: ${lightenHex(secondary, 30)};`);

      await writeFile(cssPath, css);
    } catch {
      /* CSS update is non-critical */
    }
  }
}
