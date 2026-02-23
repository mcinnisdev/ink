import type { EleventyStatus } from "../../stores/eleventy";

const messages: Record<EleventyStatus, { title: string; detail: string }> = {
  stopped: {
    title: "Preview not running",
    detail: "Click the preview button to start the dev server",
  },
  installing: {
    title: "Installing dependencies…",
    detail: "Running npm install — this may take a moment",
  },
  starting: {
    title: "Starting preview server…",
    detail: "Eleventy is building your site",
  },
  running: {
    title: "Loading preview…",
    detail: "Connecting to dev server",
  },
  error: {
    title: "Preview error",
    detail: "Something went wrong starting the preview",
  },
};

export default function PreviewLoadingPane({
  status,
  error,
}: {
  status: EleventyStatus;
  error: string | null;
}) {
  const msg = messages[status];

  return (
    <div className="flex-1 flex items-center justify-center bg-ink-950 border-l border-ink-700">
      <div className="text-center max-w-xs">
        {status !== "error" && status !== "stopped" && (
          <div className="mb-3 flex justify-center">
            <div className="w-6 h-6 border-2 border-ink-600 border-t-accent rounded-full animate-spin" />
          </div>
        )}
        {status === "error" && (
          <div className="mb-3 text-red-400 text-lg">!</div>
        )}
        <p className="text-ink-300 text-sm font-medium">{msg.title}</p>
        <p className="text-ink-500 text-xs mt-1">
          {error || msg.detail}
        </p>
      </div>
    </div>
  );
}
