import { create } from "zustand";

type View = "welcome" | "content" | "media" | "search" | "theme" | "git" | "ai" | "settings";
export type Theme = "dark" | "light";

interface UIStore {
  activeView: View;
  sidebarCollapsed: boolean;
  wizardOpen: boolean;
  devMode: boolean;
  theme: Theme;
  searchQuery: string;

  setView: (view: View) => void;
  toggleSidebar: () => void;
  setWizardOpen: (open: boolean) => void;
  toggleDevMode: () => void;
  toggleTheme: () => void;
  setSearchQuery: (query: string) => void;
}

// Read saved theme from localStorage
function getSavedTheme(): Theme {
  try {
    const saved = localStorage.getItem("ink-theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // ignore
  }
  return "dark";
}

export const useUIStore = create<UIStore>((set) => ({
  activeView: "welcome",
  sidebarCollapsed: false,
  wizardOpen: false,
  devMode: false,
  theme: getSavedTheme(),
  searchQuery: "",

  setView: (view) => set({ activeView: view }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setWizardOpen: (open) => set({ wizardOpen: open }),
  toggleDevMode: () =>
    set((s) => ({ devMode: !s.devMode })),
  toggleTheme: () =>
    set((s) => {
      const next = s.theme === "dark" ? "light" : "dark";
      localStorage.setItem("ink-theme", next);
      window.ink.theme.setOverlay(next);
      return { theme: next };
    }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
