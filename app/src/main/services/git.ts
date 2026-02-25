import { spawn } from "child_process";
import fs from "fs";
import path from "path";

export interface GitStatus {
  isRepo: boolean;
  branch: string;
  staged: string[];
  unstaged: string[];
  untracked: string[];
  ahead: number;
  behind: number;
}

export interface GitLogEntry {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  date: string;
}

function runGit(
  args: string[],
  cwd: string,
  extraEnv?: Record<string, string>
): Promise<{ success: boolean; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const proc = spawn("git", args, {
      cwd,
      stdio: "pipe",
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0", ...extraEnv },
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));

    const timer = setTimeout(() => {
      proc.kill();
      resolve({ success: false, stdout, stderr: "Git command timed out" });
    }, 30_000);

    proc.on("close", (code) => {
      clearTimeout(timer);
      resolve({ success: code === 0, stdout, stderr });
    });

    proc.on("error", (err) => {
      clearTimeout(timer);
      resolve({
        success: false,
        stdout,
        stderr: err.message.includes("ENOENT")
          ? "Git is not installed. Please install Git to use source control features."
          : err.message,
      });
    });
  });
}

export async function isGitRepo(cwd: string): Promise<boolean> {
  return fs.existsSync(path.join(cwd, ".git"));
}

export async function gitInit(cwd: string): Promise<{ success: boolean; error?: string }> {
  const result = await runGit(["init"], cwd);
  if (!result.success) return { success: false, error: result.stderr };

  // Create initial .gitignore if it doesn't exist
  const gitignorePath = path.join(cwd, ".gitignore");
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(
      gitignorePath,
      "node_modules/\n_site/\n.DS_Store\n*.log\n"
    );
  }

  return { success: true };
}

export async function gitStatus(cwd: string): Promise<GitStatus> {
  const isRepo = await isGitRepo(cwd);
  if (!isRepo) {
    return { isRepo: false, branch: "", staged: [], unstaged: [], untracked: [], ahead: 0, behind: 0 };
  }

  // Get branch name
  const branchResult = await runGit(["rev-parse", "--abbrev-ref", "HEAD"], cwd);
  const branch = branchResult.success ? branchResult.stdout.trim() : "main";

  // Get status
  const statusResult = await runGit(["status", "--porcelain"], cwd);
  const staged: string[] = [];
  const unstaged: string[] = [];
  const untracked: string[] = [];

  if (statusResult.success) {
    for (const line of statusResult.stdout.split("\n")) {
      if (!line.trim()) continue;
      const x = line[0]; // staged status
      const y = line[1]; // unstaged status
      const file = line.substring(3);

      if (x === "?" && y === "?") {
        untracked.push(file);
      } else {
        if (x !== " " && x !== "?") staged.push(file);
        if (y !== " " && y !== "?") unstaged.push(file);
      }
    }
  }

  // Get ahead/behind
  let ahead = 0;
  let behind = 0;
  const abResult = await runGit(
    ["rev-list", "--left-right", "--count", `@{upstream}...HEAD`],
    cwd
  );
  if (abResult.success) {
    const parts = abResult.stdout.trim().split(/\s+/);
    behind = parseInt(parts[0]) || 0;
    ahead = parseInt(parts[1]) || 0;
  }

  return { isRepo: true, branch, staged, unstaged, untracked, ahead, behind };
}

export async function gitAdd(
  cwd: string,
  files?: string[]
): Promise<{ success: boolean; error?: string }> {
  const args = files && files.length > 0 ? ["add", ...files] : ["add", "-A"];
  const result = await runGit(args, cwd);
  if (!result.success) return { success: false, error: result.stderr };
  return { success: true };
}

export async function gitCommit(
  cwd: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const result = await runGit(["commit", "-m", message], cwd);
  if (!result.success) return { success: false, error: result.stderr };
  return { success: true };
}

export async function gitLog(
  cwd: string,
  count: number = 20
): Promise<GitLogEntry[]> {
  const sep = "||INK_SEP||";
  const format = `%H${sep}%h${sep}%s${sep}%an${sep}%ar`;
  const result = await runGit(
    ["log", `--format=${format}`, `-${count}`],
    cwd
  );

  if (!result.success) return [];

  return result.stdout
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [hash, shortHash, message, author, date] = line.split(sep);
      return { hash, shortHash, message, author, date };
    });
}

export async function gitRemoteGet(
  cwd: string
): Promise<string | null> {
  const result = await runGit(["remote", "get-url", "origin"], cwd);
  return result.success ? result.stdout.trim() : null;
}

export async function gitRemoteSet(
  cwd: string,
  url: string
): Promise<{ success: boolean; error?: string }> {
  // Check if origin exists
  const existing = await gitRemoteGet(cwd);
  const args = existing
    ? ["remote", "set-url", "origin", url]
    : ["remote", "add", "origin", url];
  const result = await runGit(args, cwd);
  if (!result.success) return { success: false, error: result.stderr };
  return { success: true };
}

export async function gitPush(
  cwd: string
): Promise<{ success: boolean; error?: string }> {
  // First check if there's a remote
  const remote = await gitRemoteGet(cwd);
  if (!remote) return { success: false, error: "No remote configured. Set a remote URL first." };

  // Get current branch
  const branchResult = await runGit(["rev-parse", "--abbrev-ref", "HEAD"], cwd);
  const branch = branchResult.success ? branchResult.stdout.trim() : "main";

  const result = await runGit(["push", "-u", "origin", branch], cwd);
  if (!result.success) return { success: false, error: result.stderr };
  return { success: true };
}

export async function gitPull(
  cwd: string
): Promise<{ success: boolean; error?: string }> {
  const result = await runGit(["pull"], cwd);
  if (!result.success) return { success: false, error: result.stderr };
  return { success: true };
}

export async function gitPushAuthenticated(
  cwd: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  // First check if there's a remote
  const remote = await gitRemoteGet(cwd);
  if (!remote) return { success: false, error: "No remote configured. Set a remote URL first." };

  // Get current branch
  const branchResult = await runGit(["rev-parse", "--abbrev-ref", "HEAD"], cwd);
  const branch = branchResult.success ? branchResult.stdout.trim() : "main";

  // Use http.extraHeader to pass the token for this single push command.
  // The token is never stored in .git/config, remote URL, or credential store.
  const encodedAuth = Buffer.from(`x-access-token:${token}`).toString("base64");
  const result = await runGit(
    [
      "-c",
      `http.extraHeader=Authorization: Basic ${encodedAuth}`,
      "push",
      "-u",
      "origin",
      branch,
    ],
    cwd
  );

  if (!result.success) return { success: false, error: result.stderr };
  return { success: true };
}
