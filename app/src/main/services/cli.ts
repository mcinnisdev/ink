import { spawn } from "child_process";
import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// CLI path resolution
// ---------------------------------------------------------------------------

let cachedCliPath: string | null = null;

function getCliPath(): string {
  if (cachedCliPath) return cachedCliPath;

  // Dev: monorepo layout (app is at <root>/app, cli at <root>/cli)
  const devPath = path.resolve(__dirname, "../../../cli/src/index.js");
  if (fs.existsSync(devPath)) {
    cachedCliPath = devPath;
    return devPath;
  }

  // Production: bundled in Electron resources
  const prodPath = path.join(process.resourcesPath, "cli", "src", "index.js");
  if (fs.existsSync(prodPath)) {
    cachedCliPath = prodPath;
    return prodPath;
  }

  throw new Error("Ink CLI not found. Checked:\n  " + devPath + "\n  " + prodPath);
}

// ---------------------------------------------------------------------------
// Core runner
// ---------------------------------------------------------------------------

export interface CliResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

interface CliOptions {
  cwd: string;
  timeout?: number;
}

export function runCli(args: string[], options: CliOptions): Promise<CliResult> {
  return new Promise((resolve, reject) => {
    const cliPath = getCliPath();
    const timeout = options.timeout ?? 30_000;

    const child = spawn("node", [cliPath, ...args], {
      cwd: options.cwd,
      stdio: "pipe",
      shell: false,
      env: { ...process.env, FORCE_COLOR: "0" },
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`CLI command timed out after ${timeout}ms: ink ${args.join(" ")}`));
    }, timeout);

    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        success: code === 0,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: code,
      });
    });
  });
}

// ---------------------------------------------------------------------------
// Convenience wrappers — content types
// ---------------------------------------------------------------------------

export function addContentType(cwd: string, typeId: string): Promise<CliResult> {
  return runCli(["add", typeId], { cwd });
}

export function addEntry(cwd: string, typeId: string, title: string): Promise<CliResult> {
  return runCli(["add", typeId, title], { cwd });
}

export function removeContentType(cwd: string, typeId: string): Promise<CliResult> {
  return runCli(["remove", typeId, "--yes"], { cwd });
}

export function deleteEntry(cwd: string, typeId: string, slug: string): Promise<CliResult> {
  return runCli(["delete", typeId, slug, "--yes"], { cwd });
}

export function generateContent(cwd: string, typeId: string, count: number): Promise<CliResult> {
  return runCli(["generate", typeId, String(count)], { cwd });
}

export function listContent(cwd: string, typeId?: string): Promise<CliResult> {
  const args = typeId ? ["list", typeId] : ["list"];
  return runCli(args, { cwd });
}

// ---------------------------------------------------------------------------
// Convenience wrappers — components
// ---------------------------------------------------------------------------

export function addComponent(cwd: string, name: string): Promise<CliResult> {
  return runCli(["add", "component", name], { cwd });
}

export function removeComponent(cwd: string, name: string): Promise<CliResult> {
  return runCli(["remove", "component", name], { cwd });
}

// ---------------------------------------------------------------------------
// Project detection helpers
// ---------------------------------------------------------------------------

export function detectCssFramework(
  projectPath: string
): "vanilla" | "tailwind" {
  const twConfig = path.join(projectPath, "tailwind.config.js");
  const twCss = path.join(projectPath, "src", "css", "tailwind.css");
  if (fs.existsSync(twConfig) || fs.existsSync(twCss)) return "tailwind";
  return "vanilla";
}
