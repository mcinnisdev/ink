import { create } from "zustand";

type View = "welcome" | "content" | "media" | "theme" | "git" | "ai" | "settings";

interface UIStore {
  activeView: View;
  sidebarCollapsed: boolean;
  wizardOpen: boolean;

  setView: (view: View) => void;
  toggleSidebar: () => void;
  setWizardOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeView: "welcome",
  sidebarCollapsed: false,
  wizardOpen: false,

  setView: (view) => set({ activeView: view }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setWizardOpen: (open) => set({ wizardOpen: open }),
}));
