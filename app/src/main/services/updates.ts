import { autoUpdater } from "electron-updater";
import { BrowserWindow } from "electron";
import log from "electron-log";

// Configure logging
autoUpdater.logger = log;
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

export interface UpdateInfo {
  available: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseUrl: string;
  releaseNotes: string;
}

export function initAutoUpdater(mainWindow: BrowserWindow): void {
  autoUpdater.on("update-available", (info) => {
    const updateInfo: UpdateInfo = {
      available: true,
      currentVersion: autoUpdater.currentVersion.version,
      latestVersion: info.version,
      releaseUrl: `https://github.com/mcinnisdev/ink/releases/tag/v${info.version}`,
      releaseNotes:
        typeof info.releaseNotes === "string" ? info.releaseNotes : "",
    };
    mainWindow.webContents.send("updates:available", updateInfo);
  });

  autoUpdater.on("update-not-available", () => {
    // Silent — no action needed
  });

  autoUpdater.on("download-progress", (progress) => {
    mainWindow.webContents.send("updates:downloadProgress", {
      percent: progress.percent,
      transferred: progress.transferred,
      total: progress.total,
    });
  });

  autoUpdater.on("update-downloaded", () => {
    mainWindow.webContents.send("updates:downloaded");
  });

  autoUpdater.on("error", (err) => {
    log.error("Auto-updater error:", err);
  });
}

export async function checkForUpdates(): Promise<UpdateInfo> {
  const currentVersion = autoUpdater.currentVersion.version;
  try {
    const result = await autoUpdater.checkForUpdates();
    if (result && result.updateInfo) {
      return {
        available: true,
        currentVersion,
        latestVersion: result.updateInfo.version,
        releaseUrl: `https://github.com/mcinnisdev/ink/releases/tag/v${result.updateInfo.version}`,
        releaseNotes:
          typeof result.updateInfo.releaseNotes === "string"
            ? result.updateInfo.releaseNotes
            : "",
      };
    }
  } catch {
    // Network error or no release — fail silently
  }
  return {
    available: false,
    currentVersion,
    latestVersion: currentVersion,
    releaseUrl: "https://github.com/mcinnisdev/ink/releases",
    releaseNotes: "",
  };
}

export function downloadUpdate(): void {
  autoUpdater.downloadUpdate();
}

export function installUpdate(): void {
  autoUpdater.quitAndInstall();
}
