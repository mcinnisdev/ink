import { create } from "zustand";

export type EleventyStatus = "stopped" | "installing" | "starting" | "running" | "error";

interface EleventyStore {
  status: EleventyStatus;
  port: number | null;
  error: string | null;

  start: (projectPath: string) => Promise<void>;
  stop: () => Promise<void>;
  setStatus: (status: string, port?: number, error?: string) => void;
}

export const useEleventyStore = create<EleventyStore>((set) => ({
  status: "stopped",
  port: null,
  error: null,

  start: async (projectPath) => {
    set({ status: "starting", error: null });
    try {
      const result = await window.ink.eleventy.start(projectPath);
      set({ status: "running", port: result.port });
    } catch (err) {
      set({ status: "error", error: String(err) });
    }
  },

  stop: async () => {
    try {
      await window.ink.eleventy.stop();
    } catch {
      // Ignore stop errors
    }
    set({ status: "stopped", port: null, error: null });
  },

  setStatus: (status, port, error) =>
    set({
      status: status as EleventyStatus,
      port: port ?? null,
      error: error ?? null,
    }),
}));
