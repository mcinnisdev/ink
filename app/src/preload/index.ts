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

export interface AIConfig {
  provider: "anthropic" | "openai";
  apiKey: string;
  model: string;
}

export interface AIStreamEvent {
  type: "chunk" | "tool_call" | "tool_result" | "done" | "error";
  content?: string;
  toolCall?: { id: string; name: string; arguments: Record<string, unknown> };
  toolResult?: { toolCallId: string; content: string; isError: boolean };
  error?: string;
  messageId: string;
  agentType?: "content" | "site";
}

export interface ProjectContext {
  projectPath: string;
  siteName: string;
  siteUrl: string;
  currentFilePath?: string;
  currentFile?: string;
  agentType?: "content" | "site";
}

export interface CliResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

export interface DeviceFlowStatus {
  phase: "requesting_code" | "waiting_for_auth" | "polling" | "success" | "error";
  userCode?: string;
  verificationUri?: string;
  error?: string;
  user?: {
    login: string;
    avatar_url: string;
    name: string | null;
    html_url: string;
  };
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  clone_url: string;
  default_branch: string;
  description: string | null;
}

export interface SearchResult {
  filePath: string;
  relativePath: string;
  line: string;
  lineNumber: number;
  column: number;
  matchLength: number;
}

export interface InkAPI {
  project: {
    create: (config: {
      name: string;
      path: string;
      siteName: string;
      siteUrl: string;
      tailwind?: boolean;
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
    applyBranding: (
      projectPath: string,
      options: {
        logoPath?: string;
        brandColors?: { primary: string; secondary: string };
        siteDescription?: string;
        siteName?: string;
        siteUrl?: string;
      }
    ) => Promise<void>;
  };
  dialog: {
    pickImage: () => Promise<string | null>;
  };
  file: {
    list: (dirPath: string) => Promise<FileNode[]>;
    read: (filePath: string) => Promise<string>;
    write: (filePath: string, content: string) => Promise<void>;
    rename: (oldPath: string, newPath: string) => Promise<void>;
    search: (projectPath: string, query: string) => Promise<SearchResult[]>;
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
  theme: {
    setOverlay: (theme: "dark" | "light") => Promise<void>;
  };
  media: {
    list: (mediaDir: string) => Promise<MediaFile[]>;
    upload: (destDir: string) => Promise<string[] | null>;
    delete: (filePath: string) => Promise<void>;
  };
  ai: {
    getConfig: () => Promise<AIConfig | null>;
    saveConfig: (config: AIConfig) => Promise<void>;
    sendMessage: (messages: unknown[], context: ProjectContext) => Promise<unknown>;
    stopGeneration: (agentType?: "content" | "site") => Promise<void>;
    onStream: (callback: (event: AIStreamEvent) => void) => () => void;
  };
  cli: {
    addContentType: (projectPath: string, typeId: string) => Promise<CliResult>;
    addEntry: (projectPath: string, typeId: string, title: string) => Promise<CliResult>;
    removeContentType: (projectPath: string, typeId: string) => Promise<CliResult>;
    deleteEntry: (projectPath: string, typeId: string, slug: string) => Promise<CliResult>;
    generateContent: (projectPath: string, typeId: string, count: number) => Promise<CliResult>;
    listContent: (projectPath: string, typeId?: string) => Promise<CliResult>;
    addComponent: (projectPath: string, name: string) => Promise<CliResult>;
    removeComponent: (projectPath: string, name: string) => Promise<CliResult>;
    detectCssFramework: (projectPath: string) => Promise<"vanilla" | "tailwind">;
  };
  git: {
    isRepo: (cwd: string) => Promise<boolean>;
    init: (cwd: string) => Promise<{ success: boolean; error?: string }>;
    status: (cwd: string) => Promise<{
      isRepo: boolean;
      branch: string;
      staged: string[];
      unstaged: string[];
      untracked: string[];
      ahead: number;
      behind: number;
    }>;
    add: (cwd: string, files?: string[]) => Promise<{ success: boolean; error?: string }>;
    commit: (cwd: string, message: string) => Promise<{ success: boolean; error?: string }>;
    log: (cwd: string, count?: number) => Promise<Array<{
      hash: string;
      shortHash: string;
      message: string;
      author: string;
      date: string;
    }>>;
    remoteGet: (cwd: string) => Promise<string | null>;
    remoteSet: (cwd: string, url: string) => Promise<{ success: boolean; error?: string }>;
    push: (cwd: string) => Promise<{ success: boolean; error?: string }>;
    pull: (cwd: string) => Promise<{ success: boolean; error?: string }>;
    pushAuthenticated: (cwd: string) => Promise<{ success: boolean; error?: string }>;
  };
  github: {
    getAuth: () => Promise<{ user: { login: string; avatar_url: string; name: string | null; html_url: string } } | null>;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    createRepo: (name: string, isPrivate: boolean, description?: string) => Promise<GitHubRepo>;
    listRepos: (page?: number) => Promise<GitHubRepo[]>;
    enablePages: (owner: string, repo: string, branch?: string) => Promise<{ html_url: string }>;
    onDeviceFlow: (callback: (status: DeviceFlowStatus) => void) => () => void;
  };
}

const api: InkAPI = {
  project: {
    create: (config) => ipcRenderer.invoke("project:create", config),
    open: () => ipcRenderer.invoke("project:open"),
    openByPath: (path) => ipcRenderer.invoke("project:openByPath", path),
    list: () => ipcRenderer.invoke("project:list"),
    applyBranding: (projectPath, options) =>
      ipcRenderer.invoke("project:applyBranding", projectPath, options),
  },
  dialog: {
    pickImage: () => ipcRenderer.invoke("dialog:pickImage"),
  },
  file: {
    list: (dirPath) => ipcRenderer.invoke("file:list", dirPath),
    read: (filePath) => ipcRenderer.invoke("file:read", filePath),
    write: (filePath, content) =>
      ipcRenderer.invoke("file:write", filePath, content),
    rename: (oldPath, newPath) =>
      ipcRenderer.invoke("file:rename", oldPath, newPath),
    search: (projectPath, query) =>
      ipcRenderer.invoke("file:search", projectPath, query),
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
  theme: {
    setOverlay: (theme) => ipcRenderer.invoke("theme:setOverlay", theme),
  },
  media: {
    list: (mediaDir) => ipcRenderer.invoke("media:list", mediaDir),
    upload: (destDir) => ipcRenderer.invoke("media:upload", destDir),
    delete: (filePath) => ipcRenderer.invoke("media:delete", filePath),
  },
  ai: {
    getConfig: () => ipcRenderer.invoke("ai:getConfig"),
    saveConfig: (config) => ipcRenderer.invoke("ai:saveConfig", config),
    sendMessage: (messages, context) =>
      ipcRenderer.invoke("ai:sendMessage", messages, context),
    stopGeneration: (agentType?) => ipcRenderer.invoke("ai:stopGeneration", agentType),
    onStream: (callback) => {
      const handler = (_event: unknown, data: AIStreamEvent) =>
        callback(data);
      ipcRenderer.on("ai:stream", handler);
      return () => {
        ipcRenderer.removeListener("ai:stream", handler);
      };
    },
  },
  cli: {
    addContentType: (projectPath, typeId) =>
      ipcRenderer.invoke("cli:addContentType", projectPath, typeId),
    addEntry: (projectPath, typeId, title) =>
      ipcRenderer.invoke("cli:addEntry", projectPath, typeId, title),
    removeContentType: (projectPath, typeId) =>
      ipcRenderer.invoke("cli:removeContentType", projectPath, typeId),
    deleteEntry: (projectPath, typeId, slug) =>
      ipcRenderer.invoke("cli:deleteEntry", projectPath, typeId, slug),
    generateContent: (projectPath, typeId, count) =>
      ipcRenderer.invoke("cli:generateContent", projectPath, typeId, count),
    listContent: (projectPath, typeId) =>
      ipcRenderer.invoke("cli:listContent", projectPath, typeId),
    addComponent: (projectPath, name) =>
      ipcRenderer.invoke("cli:addComponent", projectPath, name),
    removeComponent: (projectPath, name) =>
      ipcRenderer.invoke("cli:removeComponent", projectPath, name),
    detectCssFramework: (projectPath) =>
      ipcRenderer.invoke("cli:detectCssFramework", projectPath),
  },
  git: {
    isRepo: (cwd) => ipcRenderer.invoke("git:isRepo", cwd),
    init: (cwd) => ipcRenderer.invoke("git:init", cwd),
    status: (cwd) => ipcRenderer.invoke("git:status", cwd),
    add: (cwd, files?) => ipcRenderer.invoke("git:add", cwd, files),
    commit: (cwd, message) => ipcRenderer.invoke("git:commit", cwd, message),
    log: (cwd, count?) => ipcRenderer.invoke("git:log", cwd, count),
    remoteGet: (cwd) => ipcRenderer.invoke("git:remoteGet", cwd),
    remoteSet: (cwd, url) => ipcRenderer.invoke("git:remoteSet", cwd, url),
    push: (cwd) => ipcRenderer.invoke("git:push", cwd),
    pull: (cwd) => ipcRenderer.invoke("git:pull", cwd),
    pushAuthenticated: (cwd) => ipcRenderer.invoke("git:pushAuthenticated", cwd),
  },
  github: {
    getAuth: () => ipcRenderer.invoke("github:getAuth"),
    connect: () => ipcRenderer.invoke("github:connect"),
    disconnect: () => ipcRenderer.invoke("github:disconnect"),
    createRepo: (name, isPrivate, description?) =>
      ipcRenderer.invoke("github:createRepo", name, isPrivate, description),
    listRepos: (page?) => ipcRenderer.invoke("github:listRepos", page),
    enablePages: (owner, repo, branch?) =>
      ipcRenderer.invoke("github:enablePages", owner, repo, branch),
    onDeviceFlow: (callback) => {
      const handler = (_event: unknown, data: DeviceFlowStatus) =>
        callback(data);
      ipcRenderer.on("github:deviceFlow", handler);
      return () => {
        ipcRenderer.removeListener("github:deviceFlow", handler);
      };
    },
  },
};

contextBridge.exposeInMainWorld("ink", api);
