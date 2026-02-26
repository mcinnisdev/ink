import {
  FileText,
  Image,
  Search,
  Palette,
  Globe,
  Sparkles,
  Settings,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import { useUIStore } from "../../stores/ui";
import { useProjectStore } from "../../stores/project";

const navItems: Array<{
  id: "content" | "media" | "search" | "theme" | "gallery" | "git" | "ai" | "settings";
  label: string;
  icon: LucideIcon;
  devOnly: boolean;
}> = [
  { id: "content", label: "Content", icon: FileText, devOnly: false },
  { id: "media", label: "Media", icon: Image, devOnly: false },
  { id: "search", label: "Search", icon: Search, devOnly: false },
  { id: "gallery", label: "Gallery", icon: LayoutGrid, devOnly: false },
  { id: "theme", label: "Theme", icon: Palette, devOnly: false },
  { id: "git", label: "Publish", icon: Globe, devOnly: false },
  { id: "ai", label: "AI", icon: Sparkles, devOnly: false },
  { id: "settings", label: "Settings", icon: Settings, devOnly: false },
];

export default function Sidebar() {
  const activeView = useUIStore((s) => s.activeView);
  const setView = useUIStore((s) => s.setView);
  const devMode = useUIStore((s) => s.devMode);
  const current = useProjectStore((s) => s.current);
  const setCurrent = useProjectStore((s) => s.setCurrent);
  const setWizardOpen = useUIStore((s) => s.setWizardOpen);

  const visibleItems = devMode
    ? navItems
    : navItems.filter((item) => !item.devOnly);

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
        {visibleItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors ${
              activeView === item.id
                ? "bg-ink-800 text-ink-50"
                : "text-ink-400 hover:text-ink-200 hover:bg-ink-800/50"
            }`}
          >
            <item.icon className="w-4 h-4" />
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
