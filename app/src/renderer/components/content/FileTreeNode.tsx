import { useState, useRef, useEffect } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText, Code2, Trash2, Pencil } from "lucide-react";
import { type FileNode, useEditorStore } from "../../stores/editor";
import { useProjectStore } from "../../stores/project";
import { useNotificationStore } from "../../stores/notifications";

// Files only visible in dev mode
const DEV_ONLY_EXTENSIONS = new Set([".njk", ".json", ".11tydata.js", ".11tydata.cjs"]);

function isDevOnlyFile(name: string): boolean {
  return DEV_ONLY_EXTENSIONS.has(
    name.substring(name.lastIndexOf("."))
  ) || name.startsWith("_") || name.startsWith(".");
}

function isEditableFile(name: string): boolean {
  return name.endsWith(".md") || name.endsWith(".njk") || name.endsWith(".json");
}

interface Props {
  node: FileNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (path: string) => void;
  devMode: boolean;
}

export default function FileTreeNode({
  node,
  depth,
  expanded,
  onToggle,
  devMode,
}: Props) {
  const openFile = useEditorStore((s) => s.openFile);
  const activeTabPath = useEditorStore((s) => s.activeTabPath);
  const loadFileTree = useEditorStore((s) => s.loadFileTree);
  const closeTab = useEditorStore((s) => s.closeTab);
  const projectPath = useProjectStore((s) => s.current?.path);
  const addToast = useNotificationStore((s) => s.addToast);
  const isExpanded = expanded.has(node.path);
  const isActive = node.type === "file" && activeTabPath === node.path;
  const [hovered, setHovered] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const renameRef = useRef<HTMLInputElement>(null);

  // Focus rename input when it appears
  useEffect(() => {
    if (renaming && renameRef.current) {
      renameRef.current.focus();
      // Select the filename part without extension
      const dotIdx = renameValue.lastIndexOf(".");
      renameRef.current.setSelectionRange(0, dotIdx > 0 ? dotIdx : renameValue.length);
    }
  }, [renaming]);

  // Hide dev-only files when not in dev mode
  if (!devMode && node.type === "file" && isDevOnlyFile(node.name)) {
    return null;
  }

  const isMd = node.type === "file" && node.name.endsWith(".md");
  const isNjk = node.type === "file" && node.name.endsWith(".njk");
  const isContentFile = isMd && node.relativePath.startsWith("content/");

  const handleClick = () => {
    if (renaming) return;
    if (node.type === "directory") {
      onToggle(node.path);
    } else if (isEditableFile(node.name)) {
      openFile(node.path, node.relativePath);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!projectPath || !isContentFile) return;

    // Parse type and slug from relativePath like "content/blog/my-post.md"
    const parts = node.relativePath.split("/");
    if (parts.length < 3) return;
    const dir = parts[1]; // e.g. "blog"
    const slug = node.name.replace(/\.md$/, "");

    try {
      const result = await window.ink.cli.deleteEntry(projectPath, dir, slug);
      if (result.success) {
        addToast("success", `Deleted ${node.name}`);
        closeTab(node.path);
        loadFileTree(projectPath);
      } else {
        addToast("error", result.stderr || `Failed to delete ${node.name}`);
      }
    } catch {
      addToast("error", `Failed to delete ${node.name}`);
    }
  };

  const handleStartRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRenameValue(node.name);
    setRenaming(true);
  };

  const handleRename = async () => {
    const newName = renameValue.trim();
    setRenaming(false);

    if (!newName || newName === node.name || !projectPath) return;

    // Build new path by replacing the file name in the full path
    const dir = node.path.substring(0, node.path.lastIndexOf(node.path.includes("/") ? "/" : "\\"));
    const sep = node.path.includes("/") ? "/" : "\\";
    const newPath = `${dir}${sep}${newName}`;

    try {
      // If this file is open, save and close it first
      if (activeTabPath === node.path) {
        await useEditorStore.getState().saveFile(node.path);
        closeTab(node.path);
      }

      await window.ink.file.rename(node.path, newPath);
      addToast("success", `Renamed to ${newName}`);
      loadFileTree(projectPath);

      // Re-open the file with its new path
      const newRelative = node.relativePath.replace(node.name, newName);
      if (isEditableFile(newName)) {
        openFile(newPath, newRelative);
      }
    } catch (err) {
      addToast("error", `Failed to rename: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      setRenaming(false);
    }
  };

  // Filter children for non-dev mode (hide empty dirs after filtering)
  const visibleChildren = node.children?.filter((child) => {
    if (devMode) return true;
    if (child.type === "file") return !isDevOnlyFile(child.name);
    return true; // Show all directories, they'll filter their own children
  });

  return (
    <>
      <div
        className="relative group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <button
          onClick={handleClick}
          className={`w-full text-left flex items-center gap-1.5 py-1 px-2 text-xs hover:bg-ink-800 transition-colors ${
            isActive ? "bg-ink-800 text-ink-50" : "text-ink-300"
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {node.type === "directory" ? (
            <span className="text-ink-500 w-3 flex items-center justify-center flex-shrink-0">
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </span>
          ) : (
            <span className="w-3 flex-shrink-0" />
          )}
          <span
            className={`flex-shrink-0 ${
              node.type === "directory" ? "text-ink-400" : "text-ink-500"
            }`}
          >
            {node.type === "directory" ? (
              isExpanded ? (
                <FolderOpen className="w-3.5 h-3.5" />
              ) : (
                <Folder className="w-3.5 h-3.5" />
              )
            ) : isNjk ? (
              <Code2 className="w-3.5 h-3.5" />
            ) : (
              <FileText className="w-3.5 h-3.5" />
            )}
          </span>
          {renaming ? (
            <input
              ref={renameRef}
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={handleRenameKeyDown}
              onBlur={handleRename}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 min-w-0 bg-ink-900 border border-accent rounded px-1 py-0 text-xs text-ink-50 focus:outline-none"
            />
          ) : (
            <span className="truncate">{node.name}</span>
          )}
        </button>
        {hovered && isContentFile && !renaming && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            <button
              onClick={handleStartRename}
              title={`Rename ${node.name}`}
              className="p-0.5 text-ink-600 hover:text-accent transition-colors"
            >
              <Pencil className="w-3 h-3" />
            </button>
            <button
              onClick={handleDelete}
              title={`Delete ${node.name}`}
              className="p-0.5 text-ink-600 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
      {node.type === "directory" && isExpanded && visibleChildren && (
        <>
          {visibleChildren.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
              devMode={devMode}
            />
          ))}
        </>
      )}
    </>
  );
}
