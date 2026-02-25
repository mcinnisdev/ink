import { useProjectStore } from "../../stores/project";
import { useUIStore } from "../../stores/ui";
import inkLogo from "../../assets/ink-logo.svg";

export default function Welcome() {
  const recentProjects = useProjectStore((s) => s.recentProjects);
  const openProject = useProjectStore((s) => s.openProject);
  const openByPath = useProjectStore((s) => s.openByPath);
  const setWizardOpen = useUIStore((s) => s.setWizardOpen);
  const setView = useUIStore((s) => s.setView);

  const handleOpen = async () => {
    await openProject();
    setView("content");
  };

  const handleRecent = async (path: string) => {
    await openByPath(path);
    setView("content");
  };

  return (
    <div className="flex items-center justify-center h-full">
      <div className="max-w-md w-full px-8">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src={inkLogo} alt="Ink" className="w-10 h-10" />
            <h1 className="text-4xl font-bold text-ink-50">Ink</h1>
          </div>
          <p className="text-ink-400 text-sm">
            Websites written in Markdown
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3 mb-8">
          <button
            onClick={() => setWizardOpen(true)}
            className="w-full py-3 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors text-sm"
          >
            New Project
          </button>
          <button
            onClick={handleOpen}
            className="w-full py-3 px-4 bg-ink-800 hover:bg-ink-700 text-ink-200 font-medium rounded-lg transition-colors text-sm border border-ink-600"
          >
            Open Existing Project
          </button>
        </div>

        {/* Recent projects */}
        {recentProjects.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-3">
              Recent Projects
            </h3>
            <div className="space-y-1">
              {recentProjects.map((project) => (
                <button
                  key={project.path}
                  onClick={() => handleRecent(project.path)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-ink-800 transition-colors group"
                >
                  <p className="text-sm text-ink-200 group-hover:text-ink-50">
                    {project.siteName}
                  </p>
                  <p className="text-xs text-ink-500 truncate">
                    {project.path}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
