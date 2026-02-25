import { app, BrowserWindow, shell, ipcMain } from "electron";
import path from "path";
import { registerIpcHandlers } from "./ipc";
import { cleanup as eleventyCleanup } from "./services/eleventy";
import { initAutoUpdater, checkForUpdates } from "./services/updates";

let mainWindow: BrowserWindow | null = null;

const iconPath = app.isPackaged
  ? path.join(process.resourcesPath, "icon.ico")
  : path.join(__dirname, "../../resources/icon.ico");

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "Ink",
    icon: iconPath,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#0f172a",
      symbolColor: "#e2e8f0",
      height: 36,
    },
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Content Security Policy
  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' file: data:; font-src 'self' data:; connect-src 'self' https://api.anthropic.com https://api.openai.com https://github.com https://api.github.com",
          ],
        },
      });
    }
  );

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Load renderer
  if (process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  registerIpcHandlers();

  // Theme toggle — update title bar overlay colors
  ipcMain.handle("theme:setOverlay", (_event, theme: "dark" | "light") => {
    if (!mainWindow) return;
    mainWindow.setTitleBarOverlay({
      color: theme === "dark" ? "#0f172a" : "#f8fafc",
      symbolColor: theme === "dark" ? "#e2e8f0" : "#1e293b",
    });
  });

  createWindow();

  // Auto-update (only in packaged builds — electron-updater errors in dev)
  if (app.isPackaged && mainWindow) {
    initAutoUpdater(mainWindow);
    setTimeout(() => {
      checkForUpdates();
    }, 5000);
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("before-quit", () => {
  eleventyCleanup();
});

app.on("window-all-closed", () => {
  eleventyCleanup();
  if (process.platform !== "darwin") {
    app.quit();
  }
});
