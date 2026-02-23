import { useProjectStore } from "../../stores/project";

export default function TitleBar() {
  const current = useProjectStore((s) => s.current);

  return (
    <div className="drag-region h-9 flex items-center px-4 bg-ink-900 border-b border-ink-700 shrink-0">
      <span className="text-xs font-semibold text-ink-400 tracking-wide uppercase no-drag">
        Ink
      </span>
      {current && (
        <span className="text-xs text-ink-500 ml-3 no-drag">
          {current.siteName}
        </span>
      )}
    </div>
  );
}
