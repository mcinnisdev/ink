import { useState, useEffect, useCallback, useMemo } from "react";
import { useEditorStore } from "../../stores/editor";
import { useUIStore } from "../../stores/ui";
import FileTreeNode from "./FileTreeNode";

const contentDirs = new Set(["content", "media"]);

export default function FileExplorer() {
  const fileTree = useEditorStore((s) => s.fileTree);
  const fileTreeLoading = useEditorStore((s) => s.fileTreeLoading);
  const devMode = useUIStore((s) => s.devMode);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Auto-expand content/ on first load
  useEffect(() => {
    if (fileTree.length > 0 && expanded.size === 0) {
      const contentDir = fileTree.find(
        (n) => n.name === "content" && n.type === "directory"
      );
      if (contentDir) {
        setExpanded(new Set([contentDir.path]));
      }
    }
  }, [fileTree]);

  const handleToggle = useCallback((path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const visibleTree = useMemo(() => {
    if (devMode) return fileTree;
    return fileTree.filter(
      (node) => node.type === "directory" && contentDirs.has(node.name)
    );
  }, [fileTree, devMode]);

  if (fileTreeLoading) {
    return (
      <div className="w-60 flex-shrink-0 bg-ink-900 border-r border-ink-700 p-4">
        <div className="text-xs text-ink-500 animate-pulse">
          Loading files...
        </div>
      </div>
    );
  }

  return (
    <div className="w-60 flex-shrink-0 min-h-0 flex-1 bg-ink-900 border-r border-ink-700 overflow-y-auto">
      <div className="py-2">
        <div className="px-3 py-1.5 text-[10px] font-semibold text-ink-500 uppercase tracking-wider">
          {devMode ? "Explorer" : "Content"}
        </div>
        {visibleTree.map((node) => (
          <FileTreeNode
            key={node.path}
            node={node}
            depth={0}
            expanded={expanded}
            onToggle={handleToggle}
            devMode={devMode}
          />
        ))}
      </div>
    </div>
  );
}
