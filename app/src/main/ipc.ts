import { ipcMain, BrowserWindow, shell, dialog } from "electron";
import path from "path";
import {
  createProject,
  openProject,
  openProjectByPath,
  listRecent,
} from "./services/project";
import {
  listDirectory,
  readFile,
  writeFile,
  startWatching,
  stopWatching,
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
import { scaffoldProject } from "./services/scaffold";

export function registerIpcHandlers(): void {
  // --- Project ---
  ipcMain.handle("project:create", async (_event, config) => {
    return createProject(config);
  });

  ipcMain.handle("project:open", async () => {
    return openProject();
  });

  ipcMain.handle("project:openByPath", async (_event, projectPath: string) => {
    return openProjectByPath(projectPath);
  });

  ipcMain.handle("project:list", async () => {
    return listRecent();
  });

  ipcMain.handle(
    "project:scaffold",
    async (
      _event,
      projectPath: string,
      contentTypes: string[],
      siteDescription: string,
      siteName: string,
      siteUrl: string
    ) => {
      return scaffoldProject(projectPath, contentTypes, siteDescription, siteName, siteUrl);
    }
  );

  // --- File ---
  ipcMain.handle("file:list", async (_event, dirPath: string) => {
    return listDirectory(dirPath);
  });

  ipcMain.handle("file:read", async (_event, filePath: string) => {
    return readFile(filePath);
  });

  ipcMain.handle(
    "file:write",
    async (_event, filePath: string, content: string) => {
      return writeFile(filePath, content);
    }
  );

  ipcMain.handle("file:watchStart", async (event, dirPath: string) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) startWatching(dirPath, win);
  });

  ipcMain.handle("file:watchStop", async () => {
    stopWatching();
  });

  // --- Eleventy ---
  ipcMain.handle("eleventy:start", async (event, projectPath: string) => {
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
    return listMedia(mediaDir);
  });

  ipcMain.handle("media:upload", async (event, destDir: string) => {
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

  ipcMain.handle("ai:stopGeneration", async () => {
    return stopGeneration();
  });
}
