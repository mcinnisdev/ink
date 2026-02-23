import { ipcMain, BrowserWindow } from "electron";
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
}
