import { useMemo, useState, useEffect, lazy, Suspense } from "react";
import { Code, Eye } from "lucide-react";
import { useEditorStore } from "../../stores/editor";
import TabBar from "./TabBar";
import FrontmatterForm from "./FrontmatterForm";
import MarkdownEditor, { type EditorMode } from "./MarkdownEditor";
import InlineContentAI from "./InlineContentAI";

const TipTapEditor = lazy(() => import("./TipTapEditor"));

interface FieldSchema {
  key: string;
  type: "string" | "text" | "number" | "boolean" | "date" | "reference";
  required?: boolean;
  label?: string;
  default?: unknown;
  collection?: string;
}

type WritingMode = "code" | "visual";

function getSavedWritingMode(): WritingMode {
  try {
    const saved = localStorage.getItem("ink-editor-mode");
    if (saved === "visual") return "visual";
  } catch {
    // ignore
  }
  return "code";
}

function getEditorMode(filePath: string): EditorMode {
  if (filePath.endsWith(".njk")) return "html";
  if (filePath.endsWith(".json")) return "json";
  return "markdown";
}

// Cache schemas per content directory to avoid repeated IPC calls
const schemaCache = new Map<string, FieldSchema[] | null>();

function getContentDir(filePath: string): string | null {
  const normalized = filePath.replace(/\\/g, "/");
  const match = normalized.match(/\/content\/([^/]+)\//);
  return match ? match[1] : null;
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

  // Writing mode: "code" (CodeMirror) or "visual" (TipTap)
  const [writingMode, setWritingMode] = useState<WritingMode>(getSavedWritingMode);

  const handleModeSwitch = (mode: WritingMode) => {
    setWritingMode(mode);
    try {
      localStorage.setItem("ink-editor-mode", mode);
    } catch {
      // ignore
    }
  };

  // Fetch schema for the active file
  const [schema, setSchema] = useState<FieldSchema[] | null>(null);

  useEffect(() => {
    if (!activeTab || !isMd) {
      setSchema(null);
      return;
    }

    const filePath = activeTab.filePath;
    const contentDir = getContentDir(filePath);

    // Check cache first
    if (contentDir && schemaCache.has(contentDir)) {
      setSchema(schemaCache.get(contentDir)!);
      return;
    }

    let cancelled = false;
    window.ink.content.getSchema(filePath).then((result) => {
      if (cancelled) return;
      const fields = result?.frontmatter ?? null;
      if (contentDir) schemaCache.set(contentDir, fields);
      setSchema(fields);
    });

    return () => {
      cancelled = true;
    };
  }, [activeTab?.filePath, isMd]);

  // Only show toggle for .md files
  const showModeToggle = isMd && editorMode === "markdown";

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
                schema={schema}
              />
            )}

            {/* Mode toggle bar */}
            {showModeToggle && (
              <div className="flex items-center gap-1 px-4 py-1 border-b border-ink-700 bg-ink-800/30 flex-shrink-0">
                <button
                  onClick={() => handleModeSwitch("code")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors ${
                    writingMode === "code"
                      ? "bg-ink-700 text-ink-100"
                      : "text-ink-500 hover:text-ink-300 hover:bg-ink-800"
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  Code
                </button>
                <button
                  onClick={() => handleModeSwitch("visual")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors ${
                    writingMode === "visual"
                      ? "bg-ink-700 text-ink-100"
                      : "text-ink-500 hover:text-ink-300 hover:bg-ink-800"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Visual
                </button>
              </div>
            )}

            <div className="flex-1 min-h-0">
              {showModeToggle && writingMode === "visual" ? (
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center h-full text-ink-500 text-sm">
                      Loading editor...
                    </div>
                  }
                >
                  <TipTapEditor
                    key={activeTab.filePath}
                    value={activeTab.content.body}
                    onChange={(body) => updateBody(activeTab.filePath, body)}
                  />
                </Suspense>
              ) : (
                <MarkdownEditor
                  key={activeTab.filePath}
                  value={activeTab.content.body}
                  onChange={(body) => updateBody(activeTab.filePath, body)}
                  mode={editorMode}
                />
              )}
            </div>
            {isMd && <InlineContentAI />}
          </div>
        )
      )}
    </div>
  );
}
