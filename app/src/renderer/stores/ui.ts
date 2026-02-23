import { create } from "zustand";

type View = "welcome" | "content" | "media" | "theme" | "git" | "ai" | "settings";

interface UIStore {
  activeView: View;
  sidebarCollapsed: boolean;
  wizardOpen: boolean;
  devMode: boolean;
  previewVisible: boolean;

  setView: (view: View) => void;
  toggleSidebar: () => void;
  setWizardOpen: (open: boolean) => void;
  toggleDevMode: () => void;
  togglePreview: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeView: "welcome",
  sidebarCollapsed: false,
  wizardOpen: false,
  devMode: false,
  previewVisible: false,

  setView: (view) => set({ activeView: view }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setWizardOpen: (open) => set({ wizardOpen: open }),
  toggleDevMode: () =>
    set((s) => {
      const newMode = !s.devMode;
      // Redirect from hidden views when turning dev mode off
      if (!newMode && s.activeView === "theme") {
        return { devMode: newMode, activeView: "content" };
      }
      return { devMode: newMode };
    }),
  togglePreview: () => set((s) => ({ previewVisible: !s.previewVisible })),
}));
