import { Code2, Pencil } from "lucide-react";
import { useProjectStore } from "../../stores/project";
import { useUIStore } from "../../stores/ui";
import inkLogo from "../../assets/ink-logo.svg";

export default function TitleBar() {
  const current = useProjectStore((s) => s.current);
  const devMode = useUIStore((s) => s.devMode);
  const toggleDevMode = useUIStore((s) => s.toggleDevMode);

  return (
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
  );
}
