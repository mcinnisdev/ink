import { useState } from "react";
import { Code2, Pencil, Keyboard, Sun, Moon } from "lucide-react";
import { useProjectStore } from "../../stores/project";
import { useUIStore } from "../../stores/ui";
import ShortcutsDialog from "./ShortcutsDialog";
import inkLogo from "../../assets/ink-logo.svg";

export default function TitleBar() {
  const current = useProjectStore((s) => s.current);
  const devMode = useUIStore((s) => s.devMode);
  const toggleDevMode = useUIStore((s) => s.toggleDevMode);
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const [showShortcuts, setShowShortcuts] = useState(false);

  return (
    <>
      <div className="drag-region h-9 flex items-center pl-4 pr-[140px] bg-ink-900 border-b border-ink-700 shrink-0">
        <img src={inkLogo} alt="Ink" className="w-5 h-5 mr-2 no-drag" />
        <span className="text-xs font-semibold text-ink-400 tracking-wide uppercase no-drag">
          Ink
        </span>
        {current && (
          <span className="text-xs text-ink-500 ml-3 no-drag">
            {current.siteName}
          </span>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Theme toggle */}
        {current && (
          <button
            onClick={toggleTheme}
            className="no-drag p-1 text-ink-600 hover:text-ink-300 transition-colors mr-1"
            title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? (
              <Sun className="w-3.5 h-3.5" />
            ) : (
              <Moon className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        {/* Keyboard shortcuts */}
        {current && (
          <button
            onClick={() => setShowShortcuts(true)}
            className="no-drag p-1 text-ink-600 hover:text-ink-300 transition-colors mr-1"
            title="Keyboard shortcuts"
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Dev mode toggle */}
        {current && (
          <button
            onClick={toggleDevMode}
            className={`no-drag flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              devMode
                ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                : "text-ink-500 hover:text-ink-300 hover:bg-ink-800"
            }`}
            title={devMode ? "Switch to content mode" : "Switch to developer mode"}
          >
            {devMode ? <Code2 className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
            {devMode ? "Dev" : "Editor"}
          </button>
        )}
      </div>

      {showShortcuts && (
        <ShortcutsDialog onClose={() => setShowShortcuts(false)} />
      )}
    </>
  );
}
