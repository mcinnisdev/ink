import { create } from "zustand";

export interface FileNode {
  name: string;
  path: string;
  relativePath: string;
  type: "file" | "directory";
  children?: FileNode[];
}

export interface ParsedFile {
  frontmatter: Record<string, unknown>;
  body: string;
  raw: string;
}

export interface TabData {
  filePath: string;
  relativePath: string;
  fileName: string;
  content: ParsedFile;
  diskContent: string;
  dirty: boolean;
}

// --- Frontmatter parsing utilities ---

function parseFrontmatter(raw: string): ParsedFile {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: raw, raw };

  const yamlBlock = match[1];
  const body = match[2];
  const frontmatter: Record<string, unknown> = {};

  for (const line of yamlBlock.split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    if (!key) continue;
    let value: unknown = line.slice(colonIdx + 1).trim();

    if (typeof value === "string") {
      // Remove surrounding quotes
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      } else if (value === "true") {
        value = true;
      } else if (value === "false") {
        value = false;
      } else if (value !== "" && !isNaN(Number(value))) {
        value = Number(value);
      }
    }

    frontmatter[key] = value;
  }

  return { frontmatter, body, raw };
}

function serializeFrontmatter(
  frontmatter: Record<string, unknown>,
  body: string
): string {
  const lines = Object.entries(frontmatter).map(([key, value]) => {
    if (typeof value === "string") return `${key}: "${value}"`;
    return `${key}: ${value}`;
  });
  return `---\n${lines.join("\n")}\n---\n${body}`;
}

// --- Store ---

interface EditorStore {
  tabs: TabData[];
  activeTabPath: string | null;
  fileTree: FileNode[];
  fileTreeLoading: boolean;

  loadFileTree: (projectPath: string) => Promise<void>;
  openFile: (filePath: string, relativePath: string) => Promise<void>;
  closeTab: (filePath: string) => void;
  setActiveTab: (filePath: string) => void;
  updateFrontmatter: (filePath: string, key: string, value: unknown) => void;
  updateBody: (filePath: string, body: string) => void;
  saveFile: (filePath: string) => Promise<void>;
  scheduleSave: (filePath: string) => void;
  handleExternalChange: (changedPath: string) => Promise<void>;
  closeAllTabs: () => void;
  saveAllDirty: () => Promise<void>;
  hasDirtyTabs: () => boolean;
}

const saveTimers: Record<string, number> = {};

export const useEditorStore = create<EditorStore>((set, get) => ({
  tabs: [],
  activeTabPath: null,
  fileTree: [],
  fileTreeLoading: false,

  loadFileTree: async (projectPath) => {
    set({ fileTreeLoading: true });
    try {
      const tree = await window.ink.file.list(projectPath);
      set({ fileTree: tree, fileTreeLoading: false });
    } catch {
      set({ fileTreeLoading: false });
    }
  },

  openFile: async (filePath, relativePath) => {
    const { tabs } = get();
    // If already open, just activate
    const existing = tabs.find((t) => t.filePath === filePath);
    if (existing) {
      set({ activeTabPath: filePath });
      return;
    }

    // Single-file mode: save and close the previous file before opening
    for (const tab of tabs) {
      if (tab.dirty) {
        await get().saveFile(tab.filePath);
      }
      if (saveTimers[tab.filePath]) {
        clearTimeout(saveTimers[tab.filePath]);
        delete saveTimers[tab.filePath];
      }
    }

    const raw = await window.ink.file.read(filePath);
    // Only parse frontmatter for .md files
    const content = filePath.endsWith(".md")
      ? parseFrontmatter(raw)
      : { frontmatter: {}, body: raw, raw };
    const fileName = relativePath.split("/").pop() || filePath;

    set({
      tabs: [
        {
          filePath,
          relativePath,
          fileName,
          content,
          diskContent: raw,
          dirty: false,
        },
      ],
      activeTabPath: filePath,
    });
  },

  closeTab: (filePath) => {
    // Clear any pending save
    if (saveTimers[filePath]) {
      clearTimeout(saveTimers[filePath]);
      delete saveTimers[filePath];
    }

    set((s) => {
      const newTabs = s.tabs.filter((t) => t.filePath !== filePath);
      let newActive = s.activeTabPath;
      if (s.activeTabPath === filePath) {
        const idx = s.tabs.findIndex((t) => t.filePath === filePath);
        newActive =
          newTabs[Math.min(idx, newTabs.length - 1)]?.filePath || null;
      }
      return { tabs: newTabs, activeTabPath: newActive };
    });
  },

  setActiveTab: (filePath) => {
    set({ activeTabPath: filePath });
  },

  updateFrontmatter: (filePath, key, value) => {
    // Only .md files have frontmatter
    if (!filePath.endsWith(".md")) return;
    set((s) => ({
      tabs: s.tabs.map((t) => {
        if (t.filePath !== filePath) return t;
        const newFm = { ...t.content.frontmatter, [key]: value };
        const newRaw = serializeFrontmatter(newFm, t.content.body);
        return {
          ...t,
          content: { ...t.content, frontmatter: newFm, raw: newRaw },
          dirty: newRaw !== t.diskContent,
        };
      }),
    }));
    get().scheduleSave(filePath);
  },

  updateBody: (filePath, body) => {
    set((s) => ({
      tabs: s.tabs.map((t) => {
        if (t.filePath !== filePath) return t;
        // Only serialize frontmatter for .md files
        const hasFm = filePath.endsWith(".md") && Object.keys(t.content.frontmatter).length > 0;
        const newRaw = hasFm ? serializeFrontmatter(t.content.frontmatter, body) : body;
        return {
          ...t,
          content: { ...t.content, body, raw: newRaw },
          dirty: newRaw !== t.diskContent,
        };
      }),
    }));
    get().scheduleSave(filePath);
  },

  saveFile: async (filePath) => {
    const tab = get().tabs.find((t) => t.filePath === filePath);
    if (!tab || !tab.dirty) return;

    await window.ink.file.write(filePath, tab.content.raw);
    set((s) => ({
      tabs: s.tabs.map((t) =>
        t.filePath === filePath
          ? { ...t, diskContent: tab.content.raw, dirty: false }
          : t
      ),
    }));
  },

  scheduleSave: (filePath) => {
    if (saveTimers[filePath]) {
      clearTimeout(saveTimers[filePath]);
    }
    saveTimers[filePath] = window.setTimeout(() => {
      delete saveTimers[filePath];
      get().saveFile(filePath);
    }, 1000);
  },

  handleExternalChange: async (changedPath) => {
    const tab = get().tabs.find((t) => t.filePath === changedPath);
    if (!tab) return;
    // Only reload if not dirty (user edits take priority)
    if (tab.dirty) return;

    try {
      const raw = await window.ink.file.read(changedPath);
      const content = parseFrontmatter(raw);
      set((s) => ({
        tabs: s.tabs.map((t) =>
          t.filePath === changedPath
            ? { ...t, content, diskContent: raw, dirty: false }
            : t
        ),
      }));
    } catch {
      // File may have been deleted
    }
  },

  closeAllTabs: () => {
    for (const timer of Object.values(saveTimers)) {
      clearTimeout(timer);
    }
    Object.keys(saveTimers).forEach((k) => delete saveTimers[k]);
    set({ tabs: [], activeTabPath: null });
  },

  saveAllDirty: async () => {
    // Flush all pending save timers
    for (const [filePath, timer] of Object.entries(saveTimers)) {
      clearTimeout(timer);
      delete saveTimers[filePath];
    }
    // Save all dirty tabs
    const { tabs } = get();
    for (const tab of tabs) {
      if (tab.dirty) {
        await get().saveFile(tab.filePath);
      }
    }
  },

  hasDirtyTabs: () => {
    return get().tabs.some((t) => t.dirty);
  },
}));
