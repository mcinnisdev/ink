import { useEffect } from "react";
import { useProjectStore } from "../../stores/project";
import { useEditorStore } from "../../stores/editor";
import FileExplorer from "./FileExplorer";
import EditorPanel from "./EditorPanel";

export default function ContentView() {
  const projectPath = useProjectStore((s) => s.current?.path);
  const loadFileTree = useEditorStore((s) => s.loadFileTree);
  const handleExternalChange = useEditorStore((s) => s.handleExternalChange);
  const closeAllTabs = useEditorStore((s) => s.closeAllTabs);
  const saveFile = useEditorStore((s) => s.saveFile);
  const activeTabPath = useEditorStore((s) => s.activeTabPath);

  // Load file tree and start watcher when project opens
  useEffect(() => {
    if (!projectPath) return;

    loadFileTree(projectPath);
    window.ink.file.watchStart(projectPath);

    const unsub = window.ink.file.onChanged((event) => {
      if (event.type === "change") {
        handleExternalChange(event.path);
      }
      if (event.type === "add" || event.type === "unlink") {
        loadFileTree(projectPath);
      }
    });

    return () => {
      unsub();
      window.ink.file.watchStop();
      closeAllTabs();
    };
  }, [projectPath]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (activeTabPath) saveFile(activeTabPath);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "w") {
        e.preventDefault();
        if (activeTabPath) {
          useEditorStore.getState().closeTab(activeTabPath);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTabPath, saveFile]);

  return (
    <div className="flex h-full">
      <FileExplorer />
      <EditorPanel />
    </div>
  );
}
