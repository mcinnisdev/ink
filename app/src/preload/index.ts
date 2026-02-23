import { contextBridge, ipcRenderer } from "electron";

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

export interface EleventyStatusEvent {
  status: "stopped" | "installing" | "starting" | "running" | "error";
  port?: number;
  error?: string;
}

export interface MediaFile {
  name: string;
  path: string;
  relativePath: string;
  size: number;
  modified: number;
}

export interface InkAPI {
  project: {
    create: (config: {
      name: string;
      path: string;
      siteName: string;
      siteUrl: string;
    }) => Promise<string>;
    open: () => Promise<{
      name: string;
      path: string;
      siteName: string;
      siteUrl: string;
    } | null>;
    openByPath: (path: string) => Promise<{
      name: string;
      path: string;
      siteName: string;
      siteUrl: string;
    } | null>;
    list: () => Promise<
      Array<{
        name: string;
        path: string;
        siteName: string;
        siteUrl: string;
      }>
    >;
  };
  file: {
    list: (dirPath: string) => Promise<FileNode[]>;
    read: (filePath: string) => Promise<string>;
    write: (filePath: string, content: string) => Promise<void>;
    watchStart: (dirPath: string) => Promise<void>;
    watchStop: () => Promise<void>;
    onChanged: (callback: (event: FileChangedEvent) => void) => () => void;
  };
  eleventy: {
    start: (projectPath: string) => Promise<{ port: number }>;
    stop: () => Promise<void>;
    status: () => Promise<{ status: string; port: number | null }>;
    build: (projectPath: string) => Promise<{ success: boolean; output: string }>;
    onStatus: (callback: (event: EleventyStatusEvent) => void) => () => void;
  };
  shell: {
    openExternal: (url: string) => Promise<void>;
  };
  media: {
    list: (mediaDir: string) => Promise<MediaFile[]>;
    upload: (destDir: string) => Promise<string[] | null>;
    delete: (filePath: string) => Promise<void>;
  };
}

const api: InkAPI = {
  project: {
    create: (config) => ipcRenderer.invoke("project:create", config),
    open: () => ipcRenderer.invoke("project:open"),
    openByPath: (path) => ipcRenderer.invoke("project:openByPath", path),
    list: () => ipcRenderer.invoke("project:list"),
  },
  file: {
    list: (dirPath) => ipcRenderer.invoke("file:list", dirPath),
    read: (filePath) => ipcRenderer.invoke("file:read", filePath),
    write: (filePath, content) =>
      ipcRenderer.invoke("file:write", filePath, content),
    watchStart: (dirPath) => ipcRenderer.invoke("file:watchStart", dirPath),
    watchStop: () => ipcRenderer.invoke("file:watchStop"),
    onChanged: (callback) => {
      const handler = (_event: unknown, data: FileChangedEvent) =>
        callback(data);
      ipcRenderer.on("file:changed", handler);
      return () => {
        ipcRenderer.removeListener("file:changed", handler);
      };
    },
  },
  eleventy: {
    start: (projectPath) => ipcRenderer.invoke("eleventy:start", projectPath),
    stop: () => ipcRenderer.invoke("eleventy:stop"),
    status: () => ipcRenderer.invoke("eleventy:status"),
    build: (projectPath) => ipcRenderer.invoke("eleventy:build", projectPath),
    onStatus: (callback) => {
      const handler = (_event: unknown, data: EleventyStatusEvent) =>
        callback(data);
      ipcRenderer.on("eleventy:status", handler);
      return () => {
        ipcRenderer.removeListener("eleventy:status", handler);
      };
    },
  },
  shell: {
    openExternal: (url) => ipcRenderer.invoke("shell:openExternal", url),
  },
  media: {
    list: (mediaDir) => ipcRenderer.invoke("media:list", mediaDir),
    upload: (destDir) => ipcRenderer.invoke("media:upload", destDir),
    delete: (filePath) => ipcRenderer.invoke("media:delete", filePath),
  },
};

contextBridge.exposeInMainWorld("ink", api);
