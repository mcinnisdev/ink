import { create } from "zustand";

export type PublishStep =
  | "idle"
  | "building"
  | "staging"
  | "committing"
  | "pushing"
  | "done"
  | "error";

function translateError(raw: string): string {
  const s = raw.toLowerCase();
  if (s.includes("rejected") || s.includes("non-fast-forward") || s.includes("fetch first"))
    return "Publishing failed because your site was updated elsewhere. Click Retry to sync and try again.";
  if (s.includes("authentication failed") || s.includes("401") || s.includes("403"))
    return "Your account connection expired. Please disconnect and reconnect your account.";
  if (s.includes("enoent") || s.includes("not installed") || s.includes("git is not installed"))
    return "Git is not installed on your computer. Download it from git-scm.com.";
  if (s.includes("timed out") || s.includes("timeout"))
    return "Connection timed out. Check your internet connection and try again.";
  if (s.includes("no remote") || s.includes("remote configured"))
    return "Your site isn't connected to an online repository. Go back and set up your repository first.";
  return `Something went wrong. Details: ${raw}`;
}

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
        set({ step: "error", error: `Your site couldn't be prepared for publishing. Details: ${buildResult.output}` });
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
          error: translateError(pushResult.error || "Failed to push"),
        });
        return;
      }

      set({ step: "done", lastPublished: new Date().toISOString() });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ step: "error", error: translateError(message) });
    }
  },

  reset: () => set({ step: "idle", error: "" }),
}));
