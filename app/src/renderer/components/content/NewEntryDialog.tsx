import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { useProjectStore } from "../../stores/project";
import { useEditorStore } from "../../stores/editor";
import { useNotificationStore } from "../../stores/notifications";

interface Props {
  typeId: string;
  typeLabel: string;
  onClose: () => void;
}

export default function NewEntryDialog({ typeId, typeLabel, onClose }: Props) {
  const projectPath = useProjectStore((s) => s.current?.path);
  const loadFileTree = useEditorStore((s) => s.loadFileTree);
  const addToast = useNotificationStore((s) => s.addToast);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !projectPath) return;
    setCreating(true);
    try {
      const result = await window.ink.cli.addEntry(projectPath, typeId, title.trim());
      if (result.success) {
        addToast("success", `Created "${title.trim()}" in ${typeLabel}`);
        loadFileTree(projectPath);
        onClose();
      } else {
        addToast("error", result.stderr || `Failed to create entry`);
      }
    } catch (err) {
      addToast("error", "Failed to create entry");
    } finally {
      setCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && title.trim()) {
      handleCreate();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-ink-800 rounded-xl border border-ink-600 w-full max-w-sm mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3 border-b border-ink-700">
          <h3 className="text-sm font-semibold text-ink-50">
            New {typeLabel} Entry
          </h3>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4">
          <label className="block text-xs font-medium text-ink-400 mb-1.5">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`e.g. My New ${typeLabel}`}
            autoFocus
            className="w-full px-3 py-2 bg-ink-900 border border-ink-600 rounded-lg text-sm text-ink-50 placeholder:text-ink-500 focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-ink-700">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-ink-400 hover:text-ink-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!title.trim() || creating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent hover:bg-accent-hover text-white transition-colors disabled:opacity-50"
          >
            {creating && <Loader2 className="w-3 h-3 animate-spin" />}
            {creating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
