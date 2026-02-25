import { useEffect } from "react";
import { useProjectStore } from "./stores/project";
import { useUIStore } from "./stores/ui";
import { useEditorStore } from "./stores/editor";
import { useNotificationStore } from "./stores/notifications";
import Sidebar from "./components/layout/Sidebar";
import TitleBar from "./components/layout/TitleBar";
import Welcome from "./components/onboarding/Welcome";
import ProjectWizard from "./components/onboarding/ProjectWizard";
import ContentView from "./components/content/ContentView";
import MediaView from "./components/views/MediaView";
import ThemeView from "./components/views/ThemeView";
import PublishView from "./components/views/PublishView";
import AIView from "./components/views/AIView";
import SettingsView from "./components/views/SettingsView";
import SearchView from "./components/views/SearchView";
import ToastContainer from "./components/layout/Toast";

function ViewRouter() {
  const activeView = useUIStore((s) => s.activeView);

  switch (activeView) {
    case "content":
      return <ContentView />;
    case "media":
      return <MediaView />;
    case "search":
      return <SearchView />;
    case "theme":
      return <ThemeView />;
    case "git":
      return <PublishView />;
    case "ai":
      return <AIView />;
    case "settings":
      return <SettingsView />;
    default:
      return <ContentView />;
  }
}

export default function App() {
  const current = useProjectStore((s) => s.current);
  const loadRecent = useProjectStore((s) => s.loadRecent);
  const wizardOpen = useUIStore((s) => s.wizardOpen);
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    loadRecent();
  }, [loadRecent]);

  // Apply theme class to <html> so body and all elements get the CSS variables
  useEffect(() => {
    document.documentElement.classList.toggle("theme-light", theme === "light");
    window.ink.theme.setOverlay(theme);
  }, [theme]);

  // Listen for update notifications from main process
  useEffect(() => {
    const cleanup = window.ink.updates.onUpdateAvailable((info) => {
      useNotificationStore
        .getState()
        .addToast("info", `Ink v${info.latestVersion} is available! Go to Settings to update.`);
    });
    return cleanup;
  }, []);

  // Flush all pending saves before the window closes
  useEffect(() => {
    const handleBeforeUnload = () => {
      useEditorStore.getState().saveAllDirty();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        {current && <Sidebar />}
        <main className="flex-1 overflow-hidden">
          {!current ? <Welcome /> : <ViewRouter />}
        </main>
      </div>
      {wizardOpen && <ProjectWizard />}
      <ToastContainer />
    </div>
  );
}
