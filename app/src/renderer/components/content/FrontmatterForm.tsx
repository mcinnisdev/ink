import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

interface Props {
  frontmatter: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}

function toLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function FrontmatterForm({ frontmatter, onChange }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const entries = Object.entries(frontmatter);

  if (entries.length === 0) return null;

  return (
    <div className="border-b border-ink-700">
      <button
        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-ink-400 uppercase tracking-wider hover:bg-ink-800/50 transition-colors"
        onClick={() => setCollapsed(!collapsed)}
      >
        <span className="text-ink-500">
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </span>
        Frontmatter
        <span className="text-ink-600 font-normal normal-case">
          ({entries.length} fields)
        </span>
      </button>
      {!collapsed && (
        <div className="px-4 pb-3 grid grid-cols-2 gap-x-4 gap-y-2">
          {entries.map(([key, value]) => {
            const isLong =
              typeof value === "string" && value.length > 80;
            const isBool = typeof value === "boolean";
            const isNumber = typeof value === "number";

            return (
              <div
                key={key}
                className={isLong ? "col-span-2" : "col-span-1"}
              >
                <label className="block text-[10px] font-medium text-ink-500 mb-1">
                  {toLabel(key)}
                </label>
                {isBool ? (
                  <button
                    className={`relative w-8 h-4 rounded-full transition-colors ${
                      value ? "bg-accent" : "bg-ink-600"
                    }`}
                    onClick={() => onChange(key, !value)}
                  >
                    <span
                      className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                        value ? "left-4" : "left-0.5"
                      }`}
                    />
                  </button>
                ) : isNumber ? (
                  <input
                    type="number"
                    value={value as number}
                    onChange={(e) =>
                      onChange(
                        key,
                        e.target.value === ""
                          ? ""
                          : Number(e.target.value)
                      )
                    }
                    className="w-full bg-ink-900 border border-ink-600 rounded px-2 py-1 text-xs text-white focus:border-accent focus:outline-none"
                  />
                ) : isLong ? (
                  <textarea
                    value={String(value ?? "")}
                    onChange={(e) => onChange(key, e.target.value)}
                    rows={2}
                    className="w-full bg-ink-900 border border-ink-600 rounded px-2 py-1 text-xs text-white focus:border-accent focus:outline-none resize-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={String(value ?? "")}
                    onChange={(e) => onChange(key, e.target.value)}
                    className="w-full bg-ink-900 border border-ink-600 rounded px-2 py-1 text-xs text-white focus:border-accent focus:outline-none"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
