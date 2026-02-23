import { ipcMain } from "electron";
import {
  createProject,
  openProject,
  openProjectByPath,
  listRecent,
} from "./services/project";

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
}
