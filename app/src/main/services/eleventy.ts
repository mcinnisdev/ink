import { spawn, execSync, type ChildProcess } from "child_process";
import path from "path";
import fs from "fs";
import { BrowserWindow } from "electron";

export interface EleventyStatusEvent {
  status: "stopped" | "installing" | "starting" | "running" | "error";
  port?: number;
  error?: string;
}

let childProcess: ChildProcess | null = null;
let port: number | null = null;
let status: EleventyStatusEvent["status"] = "stopped";
let projectPath: string | null = null;
let win: BrowserWindow | null = null;

function pushStatus(event: EleventyStatusEvent): void {
  try {
    if (win && !win.isDestroyed()) {
      win.webContents.send("eleventy:status", event);
    }
  } catch {
    // Window may have been closed
  }
}

function killProcessTree(pid: number): void {
  try {
    if (process.platform === "win32") {
      execSync(`taskkill /pid ${pid} /T /F`, { stdio: "ignore" });
    } else {
      process.kill(-pid, "SIGTERM");
      setTimeout(() => {
        try {
          process.kill(-pid, "SIGKILL");
        } catch {
          // Already dead
        }
      }, 5000);
    }
  } catch {
    // Process already exited
  }
}

export async function startServer(
  projPath: string,
  browserWindow: BrowserWindow
): Promise<{ port: number }> {
  // Stop any existing server
  await stopServer();

  projectPath = projPath;
  win = browserWindow;

  // Check if node_modules exists, install if not
  const nodeModulesPath = path.join(projPath, "node_modules");
  if (!fs.existsSync(nodeModulesPath)) {
    status = "installing";
    pushStatus({ status: "installing" });

    await new Promise<void>((resolve, reject) => {
      const install = spawn("npm", ["install"], {
        cwd: projPath,
        shell: true,
        stdio: "pipe",
      });

      install.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`npm install failed with code ${code}`));
        }
      });

      install.on("error", reject);
    });
  }

  // Start Eleventy dev server
  status = "starting";
  pushStatus({ status: "starting" });

  return new Promise<{ port: number }>((resolve, reject) => {
    const proc = spawn("npx", ["@11ty/eleventy", "--serve", "--watch"], {
      cwd: projPath,
      shell: true,
      stdio: "pipe",
      detached: process.platform !== "win32", // For POSIX process group killing
    });

    childProcess = proc;

    const timeout = setTimeout(() => {
      if (status === "starting") {
        status = "error";
        pushStatus({
          status: "error",
          error: "Eleventy server startup timed out (30s)",
        });
        reject(new Error("Startup timeout"));
      }
    }, 30000);

    const handleOutput = (data: Buffer) => {
      const text = data.toString();

      // Parse for server URL
      const match = text.match(/Server at http:\/\/localhost:(\d+)/);
      if (match && status === "starting") {
        clearTimeout(timeout);
        port = parseInt(match[1], 10);
        status = "running";
        pushStatus({ status: "running", port });
        resolve({ port });
      }
    };

    proc.stdout?.on("data", handleOutput);
    proc.stderr?.on("data", handleOutput);

    proc.on("close", (code) => {
      clearTimeout(timeout);
      if (status === "running" || status === "starting") {
        status = "stopped";
        port = null;
        childProcess = null;
        pushStatus({ status: "stopped" });
      }
    });

    proc.on("error", (err) => {
      clearTimeout(timeout);
      status = "error";
      pushStatus({ status: "error", error: err.message });
      reject(err);
    });
  });
}

export async function stopServer(): Promise<void> {
  if (childProcess && childProcess.pid) {
    killProcessTree(childProcess.pid);
    childProcess = null;
  }
  port = null;
  status = "stopped";
  pushStatus({ status: "stopped" });
}

export function getStatus(): { status: string; port: number | null } {
  return { status, port };
}

export async function buildSite(
  projPath: string
): Promise<{ success: boolean; output: string }> {
  return new Promise((resolve) => {
    const build = spawn("npx", ["@11ty/eleventy"], {
      cwd: projPath,
      shell: true,
      stdio: "pipe",
    });

    let output = "";
    build.stdout?.on("data", (data: Buffer) => {
      output += data.toString();
    });
    build.stderr?.on("data", (data: Buffer) => {
      output += data.toString();
    });

    build.on("close", (code) => {
      resolve({ success: code === 0, output });
    });

    build.on("error", (err) => {
      resolve({ success: false, output: err.message });
    });
  });
}

export function cleanup(): void {
  if (childProcess && childProcess.pid) {
    killProcessTree(childProcess.pid);
    childProcess = null;
  }
  port = null;
  status = "stopped";
}
