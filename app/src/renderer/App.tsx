import { useEffect } from "react";
import { useProjectStore } from "./stores/project";
import { useUIStore } from "./stores/ui";
import Sidebar from "./components/layout/Sidebar";
import TitleBar from "./components/layout/TitleBar";
import Welcome from "./components/onboarding/Welcome";
import ProjectWizard from "./components/onboarding/ProjectWizard";
import ContentView from "./components/content/ContentView";

export default function App() {
  const current = useProjectStore((s) => s.current);
  const loadRecent = useProjectStore((s) => s.loadRecent);
  const activeView = useUIStore((s) => s.activeView);
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
          {!current && <Welcome />}
          {current && activeView === "content" && <ContentView />}
        </main>
      </div>
      {wizardOpen && <ProjectWizard />}
    </div>
  );
}
