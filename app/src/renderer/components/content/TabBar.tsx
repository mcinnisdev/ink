import { useEditorStore, type TabData } from "../../stores/editor";

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
        ×
      </button>
    </div>
  );
}

export default function TabBar() {
  const tabs = useEditorStore((s) => s.tabs);

  if (tabs.length === 0) return null;

  return (
    <div className="flex bg-ink-900 border-b border-ink-700 overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => (
        <Tab key={tab.filePath} tab={tab} />
      ))}
    </div>
  );
}
