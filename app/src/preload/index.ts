import { contextBridge, ipcRenderer } from "electron";

export interface InkAPI {
  project: {
    create: (config: {
      name: string;
      path: string;
      siteName: string;
      siteUrl: string;
    }) => Promise<string>;
    open: () => Promise<{
      name: string;
      path: string;
      siteName: string;
      siteUrl: string;
    } | null>;
    openByPath: (path: string) => Promise<{
      name: string;
      path: string;
      siteName: string;
      siteUrl: string;
    } | null>;
    list: () => Promise<
      Array<{
        name: string;
        path: string;
        siteName: string;
        siteUrl: string;
      }>
    >;
  };
}

const api: InkAPI = {
  project: {
    create: (config) => ipcRenderer.invoke("project:create", config),
    open: () => ipcRenderer.invoke("project:open"),
    openByPath: (path) => ipcRenderer.invoke("project:openByPath", path),
    list: () => ipcRenderer.invoke("project:list"),
  },
};

contextBridge.exposeInMainWorld("ink", api);
