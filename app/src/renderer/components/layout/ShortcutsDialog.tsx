import { X, Keyboard } from "lucide-react";

const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
const mod = isMac ? "\u2318" : "Ctrl";

const SHORTCUT_GROUPS = [
  {
    title: "File",
    shortcuts: [
      { keys: `${mod}+S`, action: "Save current file" },
      { keys: `${mod}+F`, action: "Find in file" },
      { keys: `${mod}+H`, action: "Find and replace" },
    ],
  },
  {
    title: "Editor",
    shortcuts: [
      { keys: `${mod}+Z`, action: "Undo" },
      { keys: `${mod}+Shift+Z`, action: "Redo" },
      { keys: `${mod}+A`, action: "Select all" },
      { keys: `${mod}+D`, action: "Select next occurrence" },
    ],
  },
  {
    title: "Navigation",
    shortcuts: [
      { keys: `${mod}+G`, action: "Go to line" },
      { keys: "Escape", action: "Close search / dialog" },
    ],
  },
];

interface Props {
  onClose: () => void;
}

export default function ShortcutsDialog({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-ink-800 border border-ink-600 rounded-xl shadow-2xl w-[400px] max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-ink-700">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-ink-50">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-ink-400 hover:text-ink-50 rounded hover:bg-ink-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[60vh] space-y-5">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-[10px] font-semibold text-ink-400 uppercase tracking-wider mb-2">
                {group.title}
              </h3>
              <div className="space-y-1.5">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.keys}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-xs text-ink-300">
                      {shortcut.action}
                    </span>
                    <kbd className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-ink-900 border border-ink-600 text-[10px] font-mono text-ink-300">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-ink-700">
          <p className="text-[10px] text-ink-500">
            The editor supports all standard text editing shortcuts.
          </p>
        </div>
      </div>
    </div>
  );
}
