import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText } from "lucide-react";
import { type FileNode, useEditorStore } from "../../stores/editor";

interface Props {
  node: FileNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (path: string) => void;
}

export default function FileTreeNode({
  node,
  depth,
  expanded,
  onToggle,
}: Props) {
  const openFile = useEditorStore((s) => s.openFile);
  const activeTabPath = useEditorStore((s) => s.activeTabPath);
  const isExpanded = expanded.has(node.path);
  const isActive = node.type === "file" && activeTabPath === node.path;

  const handleClick = () => {
    if (node.type === "directory") {
      onToggle(node.path);
    } else if (node.name.endsWith(".md") || node.name.endsWith(".json")) {
      openFile(node.path, node.relativePath);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`w-full text-left flex items-center gap-1.5 py-1 px-2 text-xs hover:bg-ink-800 transition-colors ${
          isActive ? "bg-ink-800 text-white" : "text-ink-300"
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
          ) : (
            <FileText className="w-3.5 h-3.5" />
          )}
        </span>
        <span className="truncate">{node.name}</span>
      </button>
      {node.type === "directory" && isExpanded && node.children && (
        <>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
        </>
      )}
    </>
  );
}
