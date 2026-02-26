import { spawn, execSync, type ChildProcess } from "child_process";
import net from "net";
import path from "path";
import fs from "fs";
import { BrowserWindow } from "electron";
import log from "electron-log";

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

/** Try to connect to a port. Resolves true if something is listening. */
function isPortListening(p: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ port: p, host: "127.0.0.1" }, () => {
      socket.end();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
    socket.setTimeout(800, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

function markRunning(
  detectedPort: number,
  timeout: ReturnType<typeof setTimeout>,
  pollTimer: ReturnType<typeof setInterval> | null,
  resolve: (value: { port: number }) => void
): void {
  if (status !== "starting") return;
  clearTimeout(timeout);
  if (pollTimer) clearInterval(pollTimer);
  port = detectedPort;
  status = "running";
  pushStatus({ status: "running", port: detectedPort });
  resolve({ port: detectedPort });
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

  // Snapshot which ports are already listening so poll only detects NEW ones
  const preExistingPorts = new Set<number>();
  for (let p = 8080; p <= 8100; p++) {
    if (await isPortListening(p)) {
      preExistingPorts.add(p);
    }
  }

  return new Promise<{ port: number }>((resolve, reject) => {
    const proc = spawn("npx", ["@11ty/eleventy", "--serve", "--watch"], {
      cwd: projPath,
      shell: true,
      stdio: "pipe",
      detached: process.platform !== "win32",
    });

    childProcess = proc;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let stderrOutput = "";

    const timeout = setTimeout(() => {
      if (status === "starting") {
        if (pollTimer) clearInterval(pollTimer);
        status = "error";
        pushStatus({
          status: "error",
          error: "Eleventy server startup timed out (45s)",
        });
        reject(new Error("Startup timeout"));
      }
    }, 45000);

    // Strategy 1: Parse port from stdout/stderr
    const handleOutput = (data: Buffer) => {
      const text = data.toString();
      log.info("[Eleventy]", text.trim());

      const match = text.match(/https?:\/\/localhost:(\d+)/);
      if (match && status === "starting") {
        markRunning(parseInt(match[1], 10), timeout, pollTimer, resolve);
      }
    };

    proc.stdout?.on("data", handleOutput);
    proc.stderr?.on("data", (data: Buffer) => {
      const text = data.toString();
      stderrOutput += text;
      handleOutput(data);
    });

    // Strategy 2: Poll ports as fallback (Windows often buffers stdout)
    // Start polling after 3 seconds, check every 2 seconds
    setTimeout(() => {
      if (status !== "starting") return;

      pollTimer = setInterval(async () => {
        if (status !== "starting") {
          if (pollTimer) clearInterval(pollTimer);
          return;
        }

        // Check ports 8080-8100 (Eleventy default range), skip pre-existing
        for (let p = 8080; p <= 8100; p++) {
          if (preExistingPorts.has(p)) continue;
          if (await isPortListening(p)) {
            markRunning(p, timeout, pollTimer, resolve);
            return;
          }
        }
      }, 2000);
    }, 3000);

    proc.on("close", (code) => {
      clearTimeout(timeout);
      if (pollTimer) clearInterval(pollTimer);
      if (status === "running" || status === "starting") {
        if (status === "starting") {
          // Process died before server started — extract meaningful error
          const errorLine = stderrOutput
            .split("\n")
            .find((l) => l.includes("Error") || l.includes("Problem"))
            ?.replace(/^\[11ty\]\s*/, "")
            .trim();
          const errorMsg = errorLine || `Eleventy process exited with code ${code}`;
          status = "error";
          pushStatus({ status: "error", error: errorMsg });
          reject(new Error(errorMsg));
        } else {
          status = "stopped";
          port = null;
          childProcess = null;
          pushStatus({ status: "stopped" });
        }
      }
    });

    proc.on("error", (err) => {
      clearTimeout(timeout);
      if (pollTimer) clearInterval(pollTimer);
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
