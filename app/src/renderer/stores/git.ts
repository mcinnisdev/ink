import { create } from "zustand";

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

interface GitStore {
  status: GitStatus;
  log: GitLogEntry[];
  remote: string | null;
  loading: boolean;
  pushing: boolean;

  refresh: (projectPath: string) => Promise<void>;
  init: (projectPath: string) => Promise<{ success: boolean; error?: string }>;
  stageAll: (projectPath: string) => Promise<{ success: boolean; error?: string }>;
  stageFiles: (projectPath: string, files: string[]) => Promise<{ success: boolean; error?: string }>;
  commit: (projectPath: string, message: string) => Promise<{ success: boolean; error?: string }>;
  setRemote: (projectPath: string, url: string) => Promise<{ success: boolean; error?: string }>;
  push: (projectPath: string) => Promise<{ success: boolean; error?: string }>;
  pull: (projectPath: string) => Promise<{ success: boolean; error?: string }>;
}

export const useGitStore = create<GitStore>((set) => ({
  status: {
    isRepo: false,
    branch: "",
    staged: [],
    unstaged: [],
    untracked: [],
    ahead: 0,
    behind: 0,
  },
  log: [],
  remote: null,
  loading: false,
  pushing: false,

  refresh: async (projectPath) => {
    set({ loading: true });
    try {
      const [status, log, remote] = await Promise.all([
        window.ink.git.status(projectPath),
        window.ink.git.log(projectPath, 20),
        window.ink.git.remoteGet(projectPath),
      ]);
      set({ status, log, remote, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  init: async (projectPath) => {
    const result = await window.ink.git.init(projectPath);
    if (result.success) {
      await useGitStore.getState().refresh(projectPath);
    }
    return result;
  },

  stageAll: async (projectPath) => {
    const result = await window.ink.git.add(projectPath);
    if (result.success) {
      await useGitStore.getState().refresh(projectPath);
    }
    return result;
  },

  stageFiles: async (projectPath, files) => {
    const result = await window.ink.git.add(projectPath, files);
    if (result.success) {
      await useGitStore.getState().refresh(projectPath);
    }
    return result;
  },

  commit: async (projectPath, message) => {
    const result = await window.ink.git.commit(projectPath, message);
    if (result.success) {
      await useGitStore.getState().refresh(projectPath);
    }
    return result;
  },

  setRemote: async (projectPath, url) => {
    const result = await window.ink.git.remoteSet(projectPath, url);
    if (result.success) {
      set({ remote: url });
    }
    return result;
  },

  push: async (projectPath) => {
    set({ pushing: true });
    const result = await window.ink.git.push(projectPath);
    set({ pushing: false });
    if (result.success) {
      await useGitStore.getState().refresh(projectPath);
    }
    return result;
  },

  pull: async (projectPath) => {
    set({ loading: true });
    const result = await window.ink.git.pull(projectPath);
    set({ loading: false });
    if (result.success) {
      await useGitStore.getState().refresh(projectPath);
    }
    return result;
  },
}));
