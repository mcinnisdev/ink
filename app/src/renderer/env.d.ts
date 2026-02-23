/// <reference types="electron-vite/node" />

import type { InkAPI } from "../preload/index";

declare global {
  interface Window {
    ink: InkAPI;
  }
}
