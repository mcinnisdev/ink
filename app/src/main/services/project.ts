import fs from "fs";
import path from "path";
import { app, dialog } from "electron";

export interface ProjectConfig {
  name: string;
  path: string;
  siteName: string;
  siteUrl: string;
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

export function getStarterPath(): string {
  // In dev: relative to monorepo root
  // In prod: bundled in resources
  const devPath = path.join(__dirname, "../../../starter");
  if (fs.existsSync(devPath)) return devPath;
  return path.join(process.resourcesPath, "starter");
}

export async function createProject(config: ProjectConfig): Promise<string> {
  const projectPath = path.join(config.path, config.name);

  if (fs.existsSync(projectPath)) {
    throw new Error(`Directory already exists: ${projectPath}`);
  }

  // Copy starter template
  const starterPath = getStarterPath();
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
