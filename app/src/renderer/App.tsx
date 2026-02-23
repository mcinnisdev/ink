import { useEffect } from "react";
import { useProjectStore } from "./stores/project";
import { useUIStore } from "./stores/ui";
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

function ViewRouter() {
  const activeView = useUIStore((s) => s.activeView);

  switch (activeView) {
    case "content":
      return <ContentView />;
    case "media":
      return <MediaView />;
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

  useEffect(() => {
    loadRecent();
  }, [loadRecent]);

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
    </div>
  );
}
