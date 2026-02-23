import { useProjectStore } from "../../stores/project";
import { useUIStore } from "../../stores/ui";

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
          <h1 className="text-4xl font-bold text-white mb-2">Ink</h1>
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
                  <p className="text-sm text-ink-200 group-hover:text-white">
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
