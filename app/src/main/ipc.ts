import { ipcMain, BrowserWindow, shell, dialog, app } from "electron";
import path from "path";
import {
  createProject,
  openProject,
  openProjectByPath,
  listRecent,
  applyBranding,
} from "./services/project";
import {
  listDirectory,
  readFile,
  writeFile,
  renameFile,
  startWatching,
  stopWatching,
  searchFiles,
} from "./services/file";
import {
  startServer,
  stopServer,
  getStatus,
  buildSite,
} from "./services/eleventy";
import {
  listMedia,
  copyToMedia,
  deleteMedia,
} from "./services/media";
import {
  loadAIConfig,
  saveAIConfig,
  sendMessage as aiSendMessage,
  stopGeneration,
} from "./services/ai";
import {
  isGitRepo,
  gitInit,
  gitStatus,
  gitAdd,
  gitCommit,
  gitLog,
  gitRemoteGet,
  gitRemoteSet,
  gitPush,
  gitPull,
  gitPushAuthenticated,
} from "./services/git";
import {
  getStoredUser,
  getStoredToken,
  clearAuth,
  startDeviceFlow,
  createRepo,
  listRepos,
  enableGitHubPages,
} from "./services/github";
import {
  addContentType as cliAddContentType,
  addEntry as cliAddEntry,
  removeContentType as cliRemoveContentType,
  deleteEntry as cliDeleteEntry,
  generateContent as cliGenerateContent,
  listContent as cliListContent,
  addComponent as cliAddComponent,
  removeComponent as cliRemoveComponent,
  detectCssFramework,
} from "./services/cli";
import { assertWithinProject } from "./services/security";
import { checkForUpdates, downloadUpdate, installUpdate } from "./services/updates";

// Track the active project path for path validation
let activeProjectPath: string | null = null;

function requireProject(): string {
  if (!activeProjectPath) throw new Error("No project is open");
  return activeProjectPath;
}

function validatePath(userPath: string): string {
  return assertWithinProject(userPath, requireProject());
}

export function registerIpcHandlers(): void {
  // --- Project ---
  ipcMain.handle("project:create", async (_event, config) => {
    const projectPath = await createProject(config);
    if (projectPath) activeProjectPath = path.resolve(projectPath);
    return projectPath;
  });

  ipcMain.handle("project:open", async () => {
    const result = await openProject();
    if (result?.path) activeProjectPath = path.resolve(result.path);
    return result;
  });

  ipcMain.handle("project:openByPath", async (_event, projectPath: string) => {
    const result = await openProjectByPath(projectPath);
    if (result?.path) activeProjectPath = path.resolve(result.path);
    return result;
  });

  ipcMain.handle("project:list", async () => {
    return listRecent();
  });

  ipcMain.handle(
    "project:applyBranding",
    async (
      _event,
      projectPath: string,
      options: {
        logoPath?: string;
        brandColors?: { primary: string; secondary: string };
        siteDescription?: string;
        siteName?: string;
        siteUrl?: string;
      }
    ) => {
      validatePath(projectPath);
      return applyBranding(projectPath, options);
    }
  );

  // --- Dialog ---
  ipcMain.handle("dialog:pickImage", async (event) => {
    console.log("[dialog:pickImage] invoked");
    const win = BrowserWindow.fromWebContents(event.sender);
    console.log("[dialog:pickImage] win:", win ? "found" : "null");
    const opts: Electron.OpenDialogOptions = {
      properties: ["openFile"],
      filters: [
        {
          name: "Images",
          extensions: ["jpg", "jpeg", "png", "gif", "svg", "webp", "avif"],
        },
      ],
    };
    try {
      const result = win
        ? await dialog.showOpenDialog(win, opts)
        : await dialog.showOpenDialog(opts);
      console.log("[dialog:pickImage] result:", result);
      if (result.canceled || result.filePaths.length === 0) return null;
      return result.filePaths[0];
    } catch (err) {
      console.error("[dialog:pickImage] error:", err);
      throw err;
    }
  });

  // --- File ---
  ipcMain.handle("file:list", async (_event, dirPath: string) => {
    validatePath(dirPath);
    return listDirectory(dirPath);
  });

  ipcMain.handle("file:read", async (_event, filePath: string) => {
    validatePath(filePath);
    return readFile(filePath);
  });

  ipcMain.handle(
    "file:write",
    async (_event, filePath: string, content: string) => {
      validatePath(filePath);
      return writeFile(filePath, content);
    }
  );

  ipcMain.handle(
    "file:rename",
    async (_event, oldPath: string, newPath: string) => {
      validatePath(oldPath);
      validatePath(newPath);
      return renameFile(oldPath, newPath);
    }
  );

  ipcMain.handle("file:watchStart", async (event, dirPath: string) => {
    validatePath(dirPath);
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) startWatching(dirPath, win);
  });

  ipcMain.handle("file:search", async (_event, projectPath: string, query: string) => {
    validatePath(projectPath);
    return searchFiles(projectPath, query);
  });

  ipcMain.handle("file:watchStop", async () => {
    stopWatching();
  });

  // --- Eleventy ---
  ipcMain.handle("eleventy:start", async (event, projectPath: string) => {
    validatePath(projectPath);
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) throw new Error("No window");
    return startServer(projectPath, win);
  });

  ipcMain.handle("eleventy:stop", async () => {
    return stopServer();
  });

  ipcMain.handle("eleventy:status", async () => {
    return getStatus();
  });

  ipcMain.handle("eleventy:build", async (_event, projectPath: string) => {
    validatePath(projectPath);
    return buildSite(projectPath);
  });

  // --- Shell ---
  ipcMain.handle("shell:openExternal", async (_event, url: string) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      await shell.openExternal(url);
    }
  });

  // --- Media ---
  ipcMain.handle("media:list", async (_event, mediaDir: string) => {
    validatePath(mediaDir);
    return listMedia(mediaDir);
  });

  ipcMain.handle("media:upload", async (event, destDir: string) => {
    validatePath(destDir);
    const win = BrowserWindow.fromWebContents(event.sender);
    const result = await dialog.showOpenDialog(win!, {
      properties: ["openFile", "multiSelections"],
      filters: [
        {
          name: "Images",
          extensions: ["jpg", "jpeg", "png", "gif", "svg", "webp", "avif"],
        },
      ],
    });
    if (result.canceled) return null;
    const paths: string[] = [];
    for (const sourcePath of result.filePaths) {
      const fileName = path.basename(sourcePath);
      const dest = await copyToMedia(sourcePath, destDir, fileName);
      paths.push(dest);
    }
    return paths;
  });

  ipcMain.handle("media:delete", async (_event, filePath: string) => {
    validatePath(filePath);
    return deleteMedia(filePath);
  });

  // --- AI ---
  ipcMain.handle("ai:getConfig", async () => {
    return loadAIConfig();
  });

  ipcMain.handle("ai:saveConfig", async (_event, config) => {
    return saveAIConfig(config);
  });

  ipcMain.handle("ai:sendMessage", async (event, messages, context) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) throw new Error("No window");
    return aiSendMessage(messages, context, win);
  });

  ipcMain.handle("ai:stopGeneration", async (_event, agentType?: "content" | "site") => {
    return stopGeneration(agentType || "site");
  });

  // --- CLI ---
  ipcMain.handle("cli:addContentType", async (_event, projectPath: string, typeId: string) => {
    validatePath(projectPath);
    return cliAddContentType(projectPath, typeId);
  });

  ipcMain.handle("cli:addEntry", async (_event, projectPath: string, typeId: string, title: string) => {
    validatePath(projectPath);
    return cliAddEntry(projectPath, typeId, title);
  });

  ipcMain.handle("cli:removeContentType", async (_event, projectPath: string, typeId: string) => {
    validatePath(projectPath);
    return cliRemoveContentType(projectPath, typeId);
  });

  ipcMain.handle("cli:deleteEntry", async (_event, projectPath: string, typeId: string, slug: string) => {
    validatePath(projectPath);
    return cliDeleteEntry(projectPath, typeId, slug);
  });

  ipcMain.handle("cli:generateContent", async (_event, projectPath: string, typeId: string, count: number) => {
    validatePath(projectPath);
    return cliGenerateContent(projectPath, typeId, count);
  });

  ipcMain.handle("cli:listContent", async (_event, projectPath: string, typeId?: string) => {
    validatePath(projectPath);
    return cliListContent(projectPath, typeId);
  });

  ipcMain.handle("cli:addComponent", async (_event, projectPath: string, name: string) => {
    validatePath(projectPath);
    return cliAddComponent(projectPath, name);
  });

  ipcMain.handle("cli:removeComponent", async (_event, projectPath: string, name: string) => {
    validatePath(projectPath);
    return cliRemoveComponent(projectPath, name);
  });

  ipcMain.handle("cli:detectCssFramework", async (_event, projectPath: string) => {
    validatePath(projectPath);
    return detectCssFramework(projectPath);
  });

  // --- Git ---
  ipcMain.handle("git:isRepo", async (_event, cwd: string) => {
    validatePath(cwd);
    return isGitRepo(cwd);
  });

  ipcMain.handle("git:init", async (_event, cwd: string) => {
    validatePath(cwd);
    return gitInit(cwd);
  });

  ipcMain.handle("git:status", async (_event, cwd: string) => {
    validatePath(cwd);
    return gitStatus(cwd);
  });

  ipcMain.handle("git:add", async (_event, cwd: string, files?: string[]) => {
    validatePath(cwd);
    return gitAdd(cwd, files);
  });

  ipcMain.handle("git:commit", async (_event, cwd: string, message: string) => {
    validatePath(cwd);
    return gitCommit(cwd, message);
  });

  ipcMain.handle("git:log", async (_event, cwd: string, count?: number) => {
    validatePath(cwd);
    return gitLog(cwd, count);
  });

  ipcMain.handle("git:remoteGet", async (_event, cwd: string) => {
    validatePath(cwd);
    return gitRemoteGet(cwd);
  });

  ipcMain.handle("git:remoteSet", async (_event, cwd: string, url: string) => {
    validatePath(cwd);
    return gitRemoteSet(cwd, url);
  });

  ipcMain.handle("git:push", async (_event, cwd: string) => {
    validatePath(cwd);
    return gitPush(cwd);
  });

  ipcMain.handle("git:pull", async (_event, cwd: string) => {
    validatePath(cwd);
    return gitPull(cwd);
  });

  ipcMain.handle("git:pushAuthenticated", async (_event, cwd: string) => {
    validatePath(cwd);
    const token = getStoredToken();
    if (!token) return { success: false, error: "Not connected to GitHub. Connect your account first." };
    return gitPushAuthenticated(cwd, token);
  });

  // --- GitHub ---
  ipcMain.handle("github:getAuth", async () => {
    const user = getStoredUser();
    return user ? { user } : null;
  });

  ipcMain.handle("github:connect", async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) throw new Error("No window");
    startDeviceFlow(win);
  });

  ipcMain.handle("github:disconnect", async () => {
    clearAuth();
  });

  ipcMain.handle(
    "github:createRepo",
    async (_event, name: string, isPrivate: boolean, description?: string) => {
      const token = getStoredToken();
      if (!token) throw new Error("Not connected to GitHub");
      return createRepo(token, name, isPrivate, description);
    }
  );

  ipcMain.handle("github:listRepos", async (_event, page?: number) => {
    const token = getStoredToken();
    if (!token) throw new Error("Not connected to GitHub");
    return listRepos(token, page);
  });

  ipcMain.handle(
    "github:enablePages",
    async (_event, owner: string, repo: string, branch?: string) => {
      const token = getStoredToken();
      if (!token) throw new Error("Not connected to GitHub");
      return enableGitHubPages(token, owner, repo, branch);
    }
  );

  // --- Updates ---
  ipcMain.handle("updates:check", async () => {
    return checkForUpdates();
  });

  ipcMain.handle("updates:download", async () => {
    downloadUpdate();
  });

  ipcMain.handle("updates:install", async () => {
    installUpdate();
  });
}
