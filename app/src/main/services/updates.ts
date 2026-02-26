import { BrowserWindow } from "electron";
import log from "electron-log";

// Lazy-load autoUpdater to avoid accessing electron.app before it's ready
let _autoUpdater: typeof import("electron-updater").autoUpdater | null = null;

function getAutoUpdater() {
  if (!_autoUpdater) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { autoUpdater } = require("electron-updater");
    autoUpdater.logger = log;
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
    _autoUpdater = autoUpdater;
  }
  return _autoUpdater;
}

export interface UpdateInfo {
  available: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseUrl: string;
  releaseNotes: string;
}

export function initAutoUpdater(mainWindow: BrowserWindow): void {
  const autoUpdater = getAutoUpdater();

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
  const autoUpdater = getAutoUpdater();
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
  getAutoUpdater().downloadUpdate();
}

export function installUpdate(): void {
  getAutoUpdater().quitAndInstall();
}
