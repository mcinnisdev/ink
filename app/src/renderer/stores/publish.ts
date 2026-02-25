import { create } from "zustand";

export type PublishStep =
  | "idle"
  | "building"
  | "staging"
  | "committing"
  | "pushing"
  | "done"
  | "error";

interface PublishStore {
  step: PublishStep;
  error: string;
  lastPublished: string | null; // ISO timestamp

  publish: (projectPath: string) => Promise<void>;
  reset: () => void;
}

export const usePublishStore = create<PublishStore>((set) => ({
  step: "idle",
  error: "",
  lastPublished: null,

  publish: async (projectPath: string) => {
    try {
      // Step 1: Build
      set({ step: "building", error: "" });
      const buildResult = await window.ink.eleventy.build(projectPath);
      if (!buildResult.success) {
        set({ step: "error", error: `Build failed: ${buildResult.output}` });
        return;
      }

      // Step 2: Stage all changes
      set({ step: "staging" });
      const stageResult = await window.ink.git.add(projectPath);
      if (!stageResult.success) {
        set({
          step: "error",
          error: stageResult.error || "Failed to stage files",
        });
        return;
      }

      // Step 3: Commit
      set({ step: "committing" });
      const timestamp = new Date().toLocaleString();
      const commitResult = await window.ink.git.commit(
        projectPath,
        `Publish site — ${timestamp}`
      );
      // "nothing to commit" is acceptable — just skip to push
      if (!commitResult.success) {
        const nothingToCommit =
          commitResult.error?.includes("nothing to commit") ||
          commitResult.error?.includes("nothing added to commit");
        if (!nothingToCommit) {
          set({
            step: "error",
            error: commitResult.error || "Failed to commit",
          });
          return;
        }
      }

      // Step 4: Push (authenticated)
      set({ step: "pushing" });
      const pushResult = await window.ink.git.pushAuthenticated(projectPath);
      if (!pushResult.success) {
        set({
          step: "error",
          error: pushResult.error || "Failed to push",
        });
        return;
      }

      set({ step: "done", lastPublished: new Date().toISOString() });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ step: "error", error: message });
    }
  },

  reset: () => set({ step: "idle", error: "" }),
}));
