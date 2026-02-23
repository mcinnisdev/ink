import fs from "fs";
import path from "path";
import { BrowserWindow } from "electron";

export interface FileNode {
  name: string;
  path: string;
  relativePath: string;
  type: "file" | "directory";
  children?: FileNode[];
}

export interface FileChangedEvent {
  path: string;
  type: "add" | "change" | "unlink";
}

const IGNORE = new Set([
  "node_modules",
  "_site",
  ".git",
  ".obsidian-templates",
  ".DS_Store",
  "Thumbs.db",
]);

let watcher: fs.FSWatcher | null = null;
let debounceTimers: Record<string, NodeJS.Timeout> = {};

function buildTree(dirPath: string, rootPath: string): FileNode[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return [];
  }

  const nodes: FileNode[] = [];

  for (const entry of entries) {
    if (IGNORE.has(entry.name) || entry.name.startsWith(".")) continue;

    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(rootPath, fullPath).replace(/\\/g, "/");

    if (entry.isDirectory()) {
      nodes.push({
        name: entry.name,
        path: fullPath,
        relativePath,
        type: "directory",
        children: buildTree(fullPath, rootPath),
      });
    } else {
      nodes.push({
        name: entry.name,
        path: fullPath,
        relativePath,
        type: "file",
      });
    }
  }

  // Sort: directories first, then alphabetical
  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return nodes;
}

export async function listDirectory(dirPath: string): Promise<FileNode[]> {
  return buildTree(dirPath, dirPath);
}

export async function readFile(filePath: string): Promise<string> {
  return fs.promises.readFile(filePath, "utf-8");
}

export async function writeFile(
  filePath: string,
  content: string
): Promise<void> {
  await fs.promises.writeFile(filePath, content, "utf-8");
}

export function startWatching(dirPath: string, win: BrowserWindow): void {
  stopWatching();
  watcher = fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    if (IGNORE.has(filename.split(/[/\\]/)[0])) return;

    const fullPath = path.join(dirPath, filename);

    // Debounce duplicate events (Windows fires multiples)
    if (debounceTimers[fullPath]) {
      clearTimeout(debounceTimers[fullPath]);
    }
    debounceTimers[fullPath] = setTimeout(() => {
      delete debounceTimers[fullPath];
      let type: FileChangedEvent["type"];
      if (eventType === "rename") {
        type = fs.existsSync(fullPath) ? "add" : "unlink";
      } else {
        type = "change";
      }
      try {
        win.webContents.send("file:changed", { path: fullPath, type });
      } catch {
        // Window may have been closed
      }
    }, 100);
  });
}

export function stopWatching(): void {
  if (watcher) {
    watcher.close();
    watcher = null;
  }
  for (const timer of Object.values(debounceTimers)) {
    clearTimeout(timer);
  }
  debounceTimers = {};
}
