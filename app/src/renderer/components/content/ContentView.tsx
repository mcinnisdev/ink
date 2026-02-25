import { useEffect } from "react";
import { useProjectStore } from "../../stores/project";
import { useEditorStore } from "../../stores/editor";
import { useEleventyStore } from "../../stores/eleventy";
import FileExplorer from "./FileExplorer";
import ContentActions from "./ContentActions";
import EditorPanel from "./EditorPanel";

export default function ContentView() {
  const projectPath = useProjectStore((s) => s.current?.path);
  const loadFileTree = useEditorStore((s) => s.loadFileTree);
  const handleExternalChange = useEditorStore((s) => s.handleExternalChange);
  const closeAllTabs = useEditorStore((s) => s.closeAllTabs);
  const saveFile = useEditorStore((s) => s.saveFile);
  const activeTabPath = useEditorStore((s) => s.activeTabPath);
  const setEleventyStatus = useEleventyStore((s) => s.setStatus);

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

  // Listen for eleventy status push events from main process
  useEffect(() => {
    const unsub = window.ink.eleventy.onStatus((event) => {
      setEleventyStatus(event.status, event.port, event.error);
    });
    return unsub;
  }, [setEleventyStatus]);

  // Stop Eleventy when project closes
  useEffect(() => {
    return () => {
      if (useEleventyStore.getState().status !== "stopped") {
        useEleventyStore.getState().stop();
      }
    };
  }, [projectPath]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (activeTabPath) saveFile(activeTabPath);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTabPath, saveFile]);

  return (
    <div className="flex h-full">
      <div className="flex flex-col flex-shrink-0">
        <ContentActions />
        <FileExplorer />
      </div>
      <EditorPanel />
    </div>
  );
}
