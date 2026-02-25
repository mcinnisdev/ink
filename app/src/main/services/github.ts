import { app, safeStorage, BrowserWindow, shell } from "electron";
import fs from "fs";
import path from "path";

// --- Types ---

export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string | null;
  html_url: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  clone_url: string;
  default_branch: string;
  description: string | null;
}

export interface DeviceFlowStatus {
  phase: "requesting_code" | "waiting_for_auth" | "polling" | "success" | "error";
  userCode?: string;
  verificationUri?: string;
  error?: string;
  user?: GitHubUser;
}

interface StoredAuth {
  token: string; // encrypted or base64-encoded
  user: GitHubUser;
  encrypted: boolean;
}

// --- Configuration ---

// Replace with your GitHub OAuth App's client_id (public, not secret).
// Register at: GitHub Settings > Developer Settings > OAuth Apps
// Enable "Device Flow" in the app settings.
const GITHUB_CLIENT_ID = "Ov23liJAvNKCnHVOAAJd";

const GITHUB_API = "https://api.github.com";

// --- Token Storage ---

function authPath(): string {
  return path.join(app.getPath("userData"), "github-auth.json");
}

function encryptToken(token: string): { value: string; encrypted: boolean } {
  if (safeStorage.isEncryptionAvailable()) {
    const encrypted = safeStorage.encryptString(token);
    return { value: encrypted.toString("base64"), encrypted: true };
  }
  // Fallback: base64 (not secure, but functional)
  return { value: Buffer.from(token).toString("base64"), encrypted: false };
}

function decryptToken(value: string, encrypted: boolean): string {
  if (encrypted && safeStorage.isEncryptionAvailable()) {
    return safeStorage.decryptString(Buffer.from(value, "base64"));
  }
  return Buffer.from(value, "base64").toString("utf-8");
}

export function getStoredToken(): string | null {
  try {
    const raw = fs.readFileSync(authPath(), "utf-8");
    const stored: StoredAuth = JSON.parse(raw);
    return decryptToken(stored.token, stored.encrypted);
  } catch {
    return null;
  }
}

export function getStoredUser(): GitHubUser | null {
  try {
    const raw = fs.readFileSync(authPath(), "utf-8");
    const stored: StoredAuth = JSON.parse(raw);
    return stored.user;
  } catch {
    return null;
  }
}

function saveAuth(token: string, user: GitHubUser): void {
  const { value, encrypted } = encryptToken(token);
  const stored: StoredAuth = { token: value, user, encrypted };
  fs.writeFileSync(authPath(), JSON.stringify(stored, null, 2), "utf-8");
}

export function clearAuth(): void {
  try {
    fs.unlinkSync(authPath());
  } catch {
    // File may not exist
  }
}

// --- GitHub API ---

async function githubFetch(
  urlPath: string,
  token: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = urlPath.startsWith("http") ? urlPath : `${GITHUB_API}${urlPath}`;
  return fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "InkCMS",
      ...(options.headers || {}),
    },
  });
}

export async function fetchUser(token: string): Promise<GitHubUser> {
  const res = await githubFetch("/user", token);
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}

export async function createRepo(
  token: string,
  name: string,
  isPrivate: boolean,
  description?: string
): Promise<GitHubRepo> {
  const res = await githubFetch("/user/repos", token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      private: isPrivate,
      description: description || "",
      auto_init: false,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as Record<string, string>).message || `Failed to create repo: ${res.status}`
    );
  }
  return res.json();
}

export async function listRepos(
  token: string,
  page: number = 1
): Promise<GitHubRepo[]> {
  const res = await githubFetch(
    `/user/repos?sort=updated&per_page=30&page=${page}`,
    token
  );
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}

export async function enableGitHubPages(
  token: string,
  owner: string,
  repo: string,
  branch: string = "main"
): Promise<{ html_url: string }> {
  const res = await githubFetch(
    `/repos/${owner}/${repo}/pages`,
    token,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: { branch, path: "/" },
      }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as Record<string, string>).message || `Failed to enable Pages: ${res.status}`
    );
  }
  return res.json();
}

// --- OAuth Device Flow ---

let activeDeviceFlow: AbortController | null = null;

function emit(win: BrowserWindow, status: DeviceFlowStatus): void {
  if (!win.isDestroyed()) {
    win.webContents.send("github:deviceFlow", status);
  }
}

export async function startDeviceFlow(win: BrowserWindow): Promise<void> {
  // Cancel any existing flow
  if (activeDeviceFlow) {
    activeDeviceFlow.abort();
  }
  activeDeviceFlow = new AbortController();
  const { signal } = activeDeviceFlow;

  try {
    // Step 1: Request device code
    emit(win, { phase: "requesting_code" });

    const codeRes = await fetch("https://github.com/login/device/code", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        scope: "repo",
      }),
      signal,
    });

    if (!codeRes.ok) {
      throw new Error(`Failed to start device flow: ${codeRes.status}`);
    }

    const codeData = await codeRes.json();
    const {
      device_code,
      user_code,
      verification_uri,
      interval: pollInterval,
      expires_in,
    } = codeData;

    // Step 2: Show code to user and open browser
    emit(win, {
      phase: "waiting_for_auth",
      userCode: user_code,
      verificationUri: verification_uri,
    });

    // Open the verification URL in the user's browser
    await shell.openExternal(verification_uri);

    // Step 3: Poll for authorization
    emit(win, {
      phase: "polling",
      userCode: user_code,
      verificationUri: verification_uri,
    });

    const deadline = Date.now() + expires_in * 1000;
    const interval = Math.max((pollInterval || 5) * 1000, 5000);

    while (Date.now() < deadline) {
      if (signal.aborted) return;

      await new Promise((resolve) => setTimeout(resolve, interval));
      if (signal.aborted) return;

      const tokenRes = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: GITHUB_CLIENT_ID,
            device_code,
            grant_type: "urn:ietf:params:oauth:grant-type:device_code",
          }),
          signal,
        }
      );

      const tokenData = await tokenRes.json();

      if (tokenData.access_token) {
        // Success! Fetch user info and store
        const user = await fetchUser(tokenData.access_token);
        saveAuth(tokenData.access_token, user);

        emit(win, { phase: "success", user });
        activeDeviceFlow = null;
        return;
      }

      if (tokenData.error === "authorization_pending") {
        // User hasn't authorized yet, keep polling
        continue;
      }

      if (tokenData.error === "slow_down") {
        // Need to slow down, wait extra 5 seconds
        await new Promise((resolve) => setTimeout(resolve, 5000));
        continue;
      }

      if (tokenData.error === "expired_token") {
        throw new Error("Authorization expired. Please try again.");
      }

      if (tokenData.error === "access_denied") {
        throw new Error("Authorization was denied.");
      }

      // Unknown error
      throw new Error(tokenData.error_description || tokenData.error || "Unknown error");
    }

    throw new Error("Authorization timed out. Please try again.");
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") return;
    const message = err instanceof Error ? err.message : String(err);
    emit(win, { phase: "error", error: message });
    activeDeviceFlow = null;
  }
}

export function cancelDeviceFlow(): void {
  if (activeDeviceFlow) {
    activeDeviceFlow.abort();
    activeDeviceFlow = null;
  }
}
