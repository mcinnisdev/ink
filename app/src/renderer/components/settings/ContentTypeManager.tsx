import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, FileText, Loader2, X } from "lucide-react";
import { useProjectStore } from "../../stores/project";
import { useEditorStore } from "../../stores/editor";
import { useNotificationStore } from "../../stores/notifications";
import { CONTENT_TYPES, type ContentTypeInfo } from "../../constants/contentTypes";

// Map contentTypes.json tag keys back to content type IDs
const TAG_TO_ID: Record<string, string> = {
  posts: "blog",
  services: "services",
  employees: "team",
  docs: "docs",
  features: "features",
  serviceAreas: "service-areas",
  projects: "portfolio",
  faqs: "faq",
};

export default function ContentTypeManager() {
  const projectPath = useProjectStore((s) => s.current?.path);
  const loadFileTree = useEditorStore((s) => s.loadFileTree);
  const addToast = useNotificationStore((s) => s.addToast);

  const [installed, setInstalled] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const loadInstalled = useCallback(async () => {
    if (!projectPath) return;
    try {
      const raw = await window.ink.file.read(
        `${projectPath}/src/_data/contentTypes.json`
      );
      const data = JSON.parse(raw);
      const ids = Object.keys(data)
        .map((tag) => TAG_TO_ID[tag] || tag)
        .filter(Boolean);
      setInstalled(ids);
    } catch {
      setInstalled([]);
    }
    setLoading(false);
  }, [projectPath]);

  useEffect(() => {
    loadInstalled();
  }, [loadInstalled]);

  const handleAdd = useCallback(
    async (typeId: string) => {
      if (!projectPath) return;
      setActionId(typeId);
      try {
        const result = await window.ink.cli.addContentType(projectPath, typeId);
        if (result.success) {
          addToast("success", `Added ${typeId} content type`);
          await loadInstalled();
          loadFileTree(projectPath);
        } else {
          addToast("error", result.stderr || `Failed to add ${typeId}`);
        }
      } catch {
        addToast("error", `Failed to add ${typeId}`);
      }
      setActionId(null);
      setShowAdd(false);
    },
    [projectPath, addToast, loadInstalled, loadFileTree]
  );

  const handleRemove = useCallback(
    async (typeId: string) => {
      if (!projectPath) return;
      setActionId(typeId);
      try {
        const result = await window.ink.cli.removeContentType(
          projectPath,
          typeId
        );
        if (result.success) {
          addToast("success", `Removed ${typeId} content type`);
          await loadInstalled();
          loadFileTree(projectPath);
        } else {
          addToast("error", result.stderr || `Failed to remove ${typeId}`);
        }
      } catch {
        addToast("error", `Failed to remove ${typeId}`);
      }
      setActionId(null);
    },
    [projectPath, addToast, loadInstalled, loadFileTree]
  );

  const available = CONTENT_TYPES.filter((t) => !installed.includes(t.id));
  const installedTypes = CONTENT_TYPES.filter((t) => installed.includes(t.id));

  if (loading) {
    return (
      <p className="text-xs text-ink-500 animate-pulse">
        Loading content types...
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-ink-300 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Content Types
        </h3>
        {available.length > 0 && (
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Type
          </button>
        )}
      </div>

      {/* Add dialog */}
      {showAdd && (
        <div className="mb-4 bg-ink-800/50 rounded-lg border border-ink-700/50 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-ink-300">
              Add Content Type
            </p>
            <button
              onClick={() => setShowAdd(false)}
              className="text-ink-500 hover:text-ink-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {available.map((type) => (
              <button
                key={type.id}
                onClick={() => handleAdd(type.id)}
                disabled={actionId !== null}
                className="flex items-center gap-2 p-2 rounded-lg border border-ink-700/50 hover:border-accent/50 hover:bg-ink-800 text-left transition-colors disabled:opacity-50"
              >
                {actionId === type.id ? (
                  <Loader2 className="w-3.5 h-3.5 text-ink-500 animate-spin flex-shrink-0" />
                ) : (
                  <type.icon className="w-3.5 h-3.5 text-ink-500 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-xs text-ink-300">{type.label}</p>
                  <p className="text-[10px] text-ink-500 truncate">
                    {type.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Installed list */}
      {installedTypes.length === 0 ? (
        <p className="text-xs text-ink-500">No content types installed</p>
      ) : (
        <div className="space-y-1.5">
          {installedTypes.map((type) => (
            <div
              key={type.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-ink-800/30"
            >
              <type.icon className="w-4 h-4 text-ink-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-ink-300">{type.label}</p>
                <p className="text-[10px] text-ink-500">{type.description}</p>
              </div>
              <button
                onClick={() => handleRemove(type.id)}
                disabled={actionId !== null}
                title={`Remove ${type.label}`}
                className="p-1 text-ink-600 hover:text-red-400 transition-colors disabled:opacity-50"
              >
                {actionId === type.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
