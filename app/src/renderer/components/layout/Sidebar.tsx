import { useUIStore } from "../../stores/ui";
import { useProjectStore } from "../../stores/project";

const navItems = [
  { id: "content" as const, label: "Content", icon: "M" },
  { id: "media" as const, label: "Media", icon: "I" },
  { id: "theme" as const, label: "Theme", icon: "T" },
  { id: "git" as const, label: "Publish", icon: "G" },
  { id: "ai" as const, label: "AI", icon: "A" },
  { id: "settings" as const, label: "Settings", icon: "S" },
];

export default function Sidebar() {
  const activeView = useUIStore((s) => s.activeView);
  const setView = useUIStore((s) => s.setView);
  const current = useProjectStore((s) => s.current);
  const setCurrent = useProjectStore((s) => s.setCurrent);
  const setWizardOpen = useUIStore((s) => s.setWizardOpen);

  return (
    <aside className="w-52 bg-ink-900 border-r border-ink-700 flex flex-col shrink-0">
      {/* Project name */}
      <div className="px-4 py-3 border-b border-ink-700">
        <p className="text-sm font-medium text-ink-200 truncate">
          {current?.siteName}
        </p>
        <p className="text-xs text-ink-500 truncate">{current?.siteUrl}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors ${
              activeView === item.id
                ? "bg-ink-800 text-white"
                : "text-ink-400 hover:text-ink-200 hover:bg-ink-800/50"
            }`}
          >
            <span className="w-5 h-5 rounded bg-ink-700 text-[10px] font-bold flex items-center justify-center text-ink-300">
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-ink-700 space-y-1">
        <button
          onClick={() => setWizardOpen(true)}
          className="w-full text-left px-3 py-1.5 text-xs text-ink-400 hover:text-ink-200 rounded hover:bg-ink-800"
        >
          + New Project
        </button>
        <button
          onClick={() => setCurrent(null)}
          className="w-full text-left px-3 py-1.5 text-xs text-ink-400 hover:text-ink-200 rounded hover:bg-ink-800"
        >
          Switch Project
        </button>
      </div>
    </aside>
  );
}
