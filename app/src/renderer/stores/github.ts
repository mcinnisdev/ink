import { create } from "zustand";

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

type DeviceFlowPhase =
  | "idle"
  | "requesting_code"
  | "waiting_for_auth"
  | "polling"
  | "success"
  | "error";

interface GitHubStore {
  // Auth state
  user: GitHubUser | null;
  connected: boolean;
  authLoaded: boolean;

  // Device flow UI state
  deviceFlowPhase: DeviceFlowPhase;
  userCode: string;
  verificationUri: string;
  authError: string;

  // Repo creation
  creatingRepo: boolean;

  // Actions
  loadAuth: () => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  createRepo: (
    name: string,
    isPrivate: boolean,
    description?: string
  ) => Promise<GitHubRepo>;
  listRepos: (page?: number) => Promise<GitHubRepo[]>;
  enablePages: (
    owner: string,
    repo: string,
    branch?: string
  ) => Promise<{ html_url: string }>;
}

export const useGitHubStore = create<GitHubStore>((set) => {
  // Subscribe to device flow events from main process
  let unsubDeviceFlow: (() => void) | null = null;

  function ensureDeviceFlowListener() {
    if (unsubDeviceFlow) return;
    unsubDeviceFlow = window.ink.github.onDeviceFlow((status) => {
      switch (status.phase) {
        case "requesting_code":
          set({ deviceFlowPhase: "requesting_code" });
          break;
        case "waiting_for_auth":
          set({
            deviceFlowPhase: "waiting_for_auth",
            userCode: status.userCode || "",
            verificationUri: status.verificationUri || "",
          });
          break;
        case "polling":
          set({ deviceFlowPhase: "polling" });
          break;
        case "success":
          set({
            deviceFlowPhase: "success",
            user: status.user || null,
            connected: true,
            authError: "",
          });
          break;
        case "error":
          set({
            deviceFlowPhase: "error",
            authError: status.error || "Unknown error",
          });
          break;
      }
    });
  }

  return {
    user: null,
    connected: false,
    authLoaded: false,
    deviceFlowPhase: "idle",
    userCode: "",
    verificationUri: "",
    authError: "",
    creatingRepo: false,

    loadAuth: async () => {
      ensureDeviceFlowListener();
      try {
        const auth = await window.ink.github.getAuth();
        set({
          user: auth?.user || null,
          connected: !!auth,
          authLoaded: true,
        });
      } catch {
        set({ authLoaded: true });
      }
    },

    connect: async () => {
      ensureDeviceFlowListener();
      set({
        deviceFlowPhase: "requesting_code",
        authError: "",
        userCode: "",
        verificationUri: "",
      });
      await window.ink.github.connect();
    },

    disconnect: async () => {
      await window.ink.github.disconnect();
      set({
        user: null,
        connected: false,
        deviceFlowPhase: "idle",
        userCode: "",
        verificationUri: "",
        authError: "",
      });
    },

    createRepo: async (name, isPrivate, description?) => {
      set({ creatingRepo: true });
      try {
        const repo = await window.ink.github.createRepo(
          name,
          isPrivate,
          description
        );
        return repo;
      } finally {
        set({ creatingRepo: false });
      }
    },

    listRepos: async (page?) => {
      return window.ink.github.listRepos(page);
    },

    enablePages: async (owner, repo, branch?) => {
      return window.ink.github.enablePages(owner, repo, branch);
    },
  };
});
