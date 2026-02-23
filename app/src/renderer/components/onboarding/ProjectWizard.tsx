import { useState } from "react";
import { useProjectStore } from "../../stores/project";
import { useUIStore } from "../../stores/ui";

export default function ProjectWizard() {
  const setWizardOpen = useUIStore((s) => s.setWizardOpen);
  const setView = useUIStore((s) => s.setView);
  const createProject = useProjectStore((s) => s.createProject);
  const loading = useProjectStore((s) => s.loading);

  const [name, setName] = useState("");
  const [folder, setFolder] = useState("");
  const [siteName, setSiteName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [error, setError] = useState("");

  const handleBrowse = async () => {
    // Use the open dialog to pick a folder
    const result = await window.ink.project.open();
    // We don't actually want to open — we just want the dialog
    // For now, user types the path. We'll improve this in Phase 2.
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }
    if (!folder.trim()) {
      setError("Project folder is required.");
      return;
    }

    setError("");
    try {
      await createProject({
        name: name.trim(),
        path: folder.trim(),
        siteName: siteName.trim() || name.trim(),
        siteUrl: siteUrl.trim() || "https://example.com",
      });
      setWizardOpen(false);
      setView("content");
    } catch (err: any) {
      setError(err.message || "Failed to create project.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-ink-800 rounded-xl border border-ink-600 w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-700">
          <h2 className="text-lg font-semibold text-white">New Project</h2>
          <button
            onClick={() => setWizardOpen(false)}
            className="text-ink-400 hover:text-white text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1.5">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="my-website"
              className="w-full px-3 py-2 bg-ink-900 border border-ink-600 rounded-lg text-sm text-white placeholder:text-ink-500 focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1.5">
              Location
            </label>
            <input
              type="text"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              placeholder="C:\projects"
              className="w-full px-3 py-2 bg-ink-900 border border-ink-600 rounded-lg text-sm text-white placeholder:text-ink-500 focus:outline-none focus:border-accent"
            />
            <p className="text-xs text-ink-500 mt-1">
              A new folder will be created here with the project name.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1.5">
              Site Name
            </label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="My Business"
              className="w-full px-3 py-2 bg-ink-900 border border-ink-600 rounded-lg text-sm text-white placeholder:text-ink-500 focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1.5">
              Site URL
            </label>
            <input
              type="text"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="https://mybusiness.com"
              className="w-full px-3 py-2 bg-ink-900 border border-ink-600 rounded-lg text-sm text-white placeholder:text-ink-500 focus:outline-none focus:border-accent"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-ink-700">
          <button
            onClick={() => setWizardOpen(false)}
            className="px-4 py-2 text-sm text-ink-400 hover:text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="px-4 py-2 text-sm bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
}
