import { useState } from "react";
import { ExternalLink, Loader2, FileText, Check } from "lucide-react";
import { useEditorStore } from "../../stores/editor";
import { useProjectStore } from "../../stores/project";
import { useEleventyStore } from "../../stores/eleventy";
import { useNotificationStore } from "../../stores/notifications";

function PreviewButton() {
  const projectPath = useProjectStore((s) => s.current?.path);
  const status = useEleventyStore((s) => s.status);
  const port = useEleventyStore((s) => s.port);
  const start = useEleventyStore((s) => s.start);
  const addToast = useNotificationStore((s) => s.addToast);
  const [opening, setOpening] = useState(false);

  const isLoading = status === "installing" || status === "starting" || opening;

  const handleClick = async () => {
    if (!projectPath || opening) return;

    // If server is already running, just open the browser
    if (status === "running" && port) {
      await window.ink.shell.openExternal(`http://localhost:${port}`);
      return;
    }

    // Start the server, then open browser
    setOpening(true);
    try {
      await start(projectPath);
      // After start resolves, read the port from the store
      const currentPort = useEleventyStore.getState().port;
      if (currentPort) {
        await window.ink.shell.openExternal(`http://localhost:${currentPort}`);
      } else {
        addToast("error", "Dev server started but no port detected");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addToast("error", `Preview failed: ${msg}`);
    } finally {
      setOpening(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors text-ink-400 hover:text-ink-200 hover:bg-ink-800 disabled:opacity-50"
      title={isLoading ? "Starting dev server..." : "Open site preview in browser"}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <ExternalLink className="w-3.5 h-3.5" />
      )}
      <span>{isLoading ? "Starting..." : "Preview"}</span>
    </button>
  );
}

export default function TabBar() {
  const activeTab = useEditorStore((s) =>
    s.tabs.find((t) => t.filePath === s.activeTabPath)
  );

  return (
    <div className="flex items-center bg-ink-900 border-b border-ink-700 h-9">
      {activeTab ? (
        <div className="flex items-center gap-2 px-3 flex-1 min-w-0">
          <FileText className="w-3.5 h-3.5 text-ink-500 flex-shrink-0" />
          <span className="text-xs text-ink-300 truncate">
            {activeTab.relativePath}
          </span>
          {activeTab.dirty ? (
            <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
          ) : (
            <Check className="w-3 h-3 text-ink-600 flex-shrink-0" />
          )}
        </div>
      ) : (
        <div className="flex-1" />
      )}
      <div className="flex-shrink-0 px-2">
        <PreviewButton />
      </div>
    </div>
  );
}
