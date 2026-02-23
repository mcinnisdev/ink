import { useEditorStore } from "../../stores/editor";
import TabBar from "./TabBar";
import FrontmatterForm from "./FrontmatterForm";
import MarkdownEditor from "./MarkdownEditor";

export default function EditorPanel() {
  const tabs = useEditorStore((s) => s.tabs);
  const activeTabPath = useEditorStore((s) => s.activeTabPath);
  const updateFrontmatter = useEditorStore((s) => s.updateFrontmatter);
  const updateBody = useEditorStore((s) => s.updateBody);

  const activeTab = tabs.find((t) => t.filePath === activeTabPath);

  if (tabs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-ink-500 text-sm mb-1">No file open</p>
          <p className="text-ink-600 text-xs">
            Select a file from the explorer to start editing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <TabBar />
      {activeTab && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <FrontmatterForm
            frontmatter={activeTab.content.frontmatter}
            onChange={(key, value) =>
              updateFrontmatter(activeTab.filePath, key, value)
            }
          />
          <MarkdownEditor
            key={activeTab.filePath}
            value={activeTab.content.body}
            onChange={(body) => updateBody(activeTab.filePath, body)}
          />
        </div>
      )}
    </div>
  );
}
