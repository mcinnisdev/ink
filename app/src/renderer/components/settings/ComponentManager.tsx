import { useState, useEffect, useCallback } from "react";
import { Package, Loader2, Download, Trash2 } from "lucide-react";
import { useProjectStore } from "../../stores/project";
import { useNotificationStore } from "../../stores/notifications";
import { COMPONENTS, type ComponentInfo } from "../../constants/components";

export default function ComponentManager() {
  const projectPath = useProjectStore((s) => s.current?.path);
  const addToast = useNotificationStore((s) => s.addToast);

  const [installed, setInstalled] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const detectInstalled = useCallback(async () => {
    if (!projectPath) return;
    const found = new Set<string>();
    for (const comp of COMPONENTS) {
      try {
        await window.ink.file.read(
          `${projectPath}/src/_includes/components/${comp.id}.njk`
        );
        found.add(comp.id);
      } catch {
        // Not installed
      }
    }
    setInstalled(found);
    setLoading(false);
  }, [projectPath]);

  useEffect(() => {
    detectInstalled();
  }, [detectInstalled]);

  const handleInstall = useCallback(
    async (compId: string) => {
      if (!projectPath) return;
      setActionId(compId);
      try {
        const result = await window.ink.cli.addComponent(projectPath, compId);
        if (result.success) {
          addToast("success", `Installed ${compId} component`);
          setInstalled((prev) => new Set([...prev, compId]));
        } else {
          addToast("error", result.stderr || `Failed to install ${compId}`);
        }
      } catch {
        addToast("error", `Failed to install ${compId}`);
      }
      setActionId(null);
    },
    [projectPath, addToast]
  );

  const handleUninstall = useCallback(
    async (compId: string) => {
      if (!projectPath) return;
      setActionId(compId);
      try {
        const result = await window.ink.cli.removeComponent(
          projectPath,
          compId
        );
        if (result.success) {
          addToast("success", `Removed ${compId} component`);
          setInstalled((prev) => {
            const next = new Set(prev);
            next.delete(compId);
            return next;
          });
        } else {
          addToast("error", result.stderr || `Failed to remove ${compId}`);
        }
      } catch {
        addToast("error", `Failed to remove ${compId}`);
      }
      setActionId(null);
    },
    [projectPath, addToast]
  );

  if (loading) {
    return (
      <p className="text-xs text-ink-500 animate-pulse">
        Loading components...
      </p>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-ink-300 mb-3 flex items-center gap-2">
        <Package className="w-4 h-4" />
        Components
      </h3>
      <p className="text-xs text-ink-500 mb-3">
        Installable UI components for your templates
      </p>
      <div className="grid grid-cols-2 gap-2">
        {COMPONENTS.map((comp) => {
          const isInstalled = installed.has(comp.id);
          const isActive = actionId === comp.id;

          return (
            <div
              key={comp.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                isInstalled
                  ? "bg-ink-800/50 border-green-800/30"
                  : "bg-ink-800/20 border-ink-700/50"
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs text-ink-300 font-medium">
                  {comp.label}
                </p>
                <p className="text-[10px] text-ink-500 mt-0.5">
                  {comp.description}
                </p>
              </div>
              <button
                onClick={() =>
                  isInstalled
                    ? handleUninstall(comp.id)
                    : handleInstall(comp.id)
                }
                disabled={actionId !== null}
                title={isInstalled ? `Remove ${comp.label}` : `Install ${comp.label}`}
                className={`p-1.5 rounded transition-colors disabled:opacity-50 flex-shrink-0 ${
                  isInstalled
                    ? "text-red-400/60 hover:text-red-400 hover:bg-red-900/20"
                    : "text-accent/60 hover:text-accent hover:bg-accent/10"
                }`}
              >
                {isActive ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isInstalled ? (
                  <Trash2 className="w-4 h-4" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
