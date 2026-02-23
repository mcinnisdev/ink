import { X, Eye, EyeOff, Loader2 } from "lucide-react";
import { useEditorStore, type TabData } from "../../stores/editor";
import { useUIStore } from "../../stores/ui";
import { useEleventyStore } from "../../stores/eleventy";

function Tab({ tab }: { tab: TabData }) {
  const activeTabPath = useEditorStore((s) => s.activeTabPath);
  const setActiveTab = useEditorStore((s) => s.setActiveTab);
  const closeTab = useEditorStore((s) => s.closeTab);
  const isActive = tab.filePath === activeTabPath;

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer border-r border-ink-700 select-none flex-shrink-0 ${
        isActive
          ? "bg-ink-800 text-white border-b-2 border-b-accent"
          : "bg-ink-900 text-ink-400 hover:bg-ink-800/50 border-b-2 border-b-transparent"
      }`}
      onClick={() => setActiveTab(tab.filePath)}
      onAuxClick={(e) => {
        if (e.button === 1) closeTab(tab.filePath);
      }}
    >
      {tab.dirty && (
        <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
      )}
      <span className="truncate max-w-[120px]">{tab.fileName}</span>
      <button
        className="ml-1 text-ink-500 hover:text-white transition-colors flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          closeTab(tab.filePath);
        }}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

function PreviewToggle() {
  const previewVisible = useUIStore((s) => s.previewVisible);
  const togglePreview = useUIStore((s) => s.togglePreview);
  const status = useEleventyStore((s) => s.status);

  const isLoading = status === "installing" || status === "starting";

  return (
    <button
      onClick={togglePreview}
      className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors ${
        previewVisible
          ? "bg-accent/20 text-accent hover:bg-accent/30"
          : "text-ink-400 hover:text-ink-200 hover:bg-ink-800"
      }`}
      title={previewVisible ? "Hide preview" : "Show preview"}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : previewVisible ? (
        <EyeOff className="w-3.5 h-3.5" />
      ) : (
        <Eye className="w-3.5 h-3.5" />
      )}
      <span>Preview</span>
    </button>
  );
}

export default function TabBar() {
  const tabs = useEditorStore((s) => s.tabs);

  return (
    <div className="flex items-center bg-ink-900 border-b border-ink-700">
      <div className="flex flex-1 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <Tab key={tab.filePath} tab={tab} />
        ))}
      </div>
      <div className="flex-shrink-0 px-2">
        <PreviewToggle />
      </div>
    </div>
  );
}
