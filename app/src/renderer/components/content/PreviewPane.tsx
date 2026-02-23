import { useRef, useCallback } from "react";
import { RotateCw, ExternalLink } from "lucide-react";
import { useEleventyStore } from "../../stores/eleventy";
import PreviewLoadingPane from "./PreviewLoadingPane";

export default function PreviewPane() {
  const status = useEleventyStore((s) => s.status);
  const port = useEleventyStore((s) => s.port);
  const error = useEleventyStore((s) => s.error);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleRefresh = useCallback(() => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  }, []);

  if (status !== "running" || !port) {
    return <PreviewLoadingPane status={status} error={error} />;
  }

  const url = `http://localhost:${port}`;

  return (
    <div className="flex-1 flex flex-col border-l border-ink-700 min-w-0">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-ink-900 border-b border-ink-700">
        <span className="text-[10px] text-ink-500 truncate flex-1">
          {url}
        </span>
        <button
          onClick={handleRefresh}
          className="text-ink-400 hover:text-white p-1 rounded hover:bg-ink-700 transition-colors"
          title="Refresh preview"
        >
          <RotateCw className="w-3 h-3" />
        </button>
        <button
          onClick={() => window.ink.shell.openExternal(url)}
          className="text-ink-400 hover:text-white p-1 rounded hover:bg-ink-700 transition-colors"
          title="Open in browser"
        >
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* iframe */}
      <iframe
        ref={iframeRef}
        src={url}
        className="flex-1 w-full bg-white"
        sandbox="allow-scripts allow-same-origin allow-forms"
        title="Site preview"
      />
    </div>
  );
}
