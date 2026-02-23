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

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <TabBar />
      {tabs.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-ink-500 text-sm mb-1">No file open</p>
            <p className="text-ink-600 text-xs">
              Select a file from the explorer to start editing
            </p>
          </div>
        </div>
      ) : (
        activeTab && (
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
        )
      )}
    </div>
  );
}
