import { create } from "zustand";

interface ProjectData {
  name: string;
  path: string;
  siteName: string;
  siteUrl: string;
}

interface ProjectStore {
  current: ProjectData | null;
  recentProjects: ProjectData[];
  loading: boolean;

  setCurrent: (project: ProjectData | null) => void;
  loadRecent: () => Promise<void>;
  createProject: (config: {
    name: string;
    path: string;
    siteName: string;
    siteUrl: string;
    contentTypes?: string[];
    siteDescription?: string;
  }) => Promise<string>;
  openProject: () => Promise<void>;
  openByPath: (path: string) => Promise<void>;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  current: null,
  recentProjects: [],
  loading: false,

  setCurrent: (project) => set({ current: project }),

  loadRecent: async () => {
    const projects = await window.ink.project.list();
    set({ recentProjects: projects });
  },

  createProject: async (config) => {
    set({ loading: true });
    try {
      const projectPath = await window.ink.project.create(config);
      const project: ProjectData = {
        name: config.name,
        path: projectPath,
        siteName: config.siteName,
        siteUrl: config.siteUrl,
      };
      set({ current: project, loading: false });
      return projectPath;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  openProject: async () => {
    const project = await window.ink.project.open();
    if (project) {
      set({ current: project });
    }
  },

  openByPath: async (path) => {
    const project = await window.ink.project.openByPath(path);
    if (project) {
      set({ current: project });
    }
  },
}));
