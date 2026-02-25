import { useMemo } from "react";
import { useEditorStore } from "../../stores/editor";
import TabBar from "./TabBar";
import FrontmatterForm from "./FrontmatterForm";
import MarkdownEditor, { type EditorMode } from "./MarkdownEditor";
import InlineContentAI from "./InlineContentAI";

function getEditorMode(filePath: string): EditorMode {
  if (filePath.endsWith(".njk")) return "html";
  if (filePath.endsWith(".json")) return "json";
  return "markdown";
}

export default function EditorPanel() {
  const tabs = useEditorStore((s) => s.tabs);
  const activeTabPath = useEditorStore((s) => s.activeTabPath);
  const updateFrontmatter = useEditorStore((s) => s.updateFrontmatter);
  const updateBody = useEditorStore((s) => s.updateBody);

  const activeTab = tabs.find((t) => t.filePath === activeTabPath);

  const isMd = useMemo(
    () => activeTab?.filePath.endsWith(".md") ?? false,
    [activeTab?.filePath]
  );

  const editorMode = useMemo(
    () => (activeTab ? getEditorMode(activeTab.filePath) : "markdown"),
    [activeTab?.filePath]
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
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
            {isMd && (
              <FrontmatterForm
                frontmatter={activeTab.content.frontmatter}
                onChange={(key, value) =>
                  updateFrontmatter(activeTab.filePath, key, value)
                }
              />
            )}
            <div className="flex-1 min-h-0">
              <MarkdownEditor
                key={activeTab.filePath}
                value={activeTab.content.body}
                onChange={(body) => updateBody(activeTab.filePath, body)}
                mode={editorMode}
              />
            </div>
            {isMd && <InlineContentAI />}
          </div>
        )
      )}
    </div>
  );
}
