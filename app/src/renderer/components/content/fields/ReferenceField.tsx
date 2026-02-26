import { useState, useEffect, useMemo } from "react";
import { Link, AlertTriangle, X } from "lucide-react";
import FieldWrapper from "./FieldWrapper";

interface Entry {
  slug: string;
  title: string;
  filePath: string;
}

interface Props {
  label: string;
  value: string;
  collection: string;
  required?: boolean;
  onChange: (value: string) => void;
}

export default function ReferenceField({
  label,
  value,
  collection,
  required,
  onChange,
}: Props) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    window.ink.content
      .listEntries(collection)
      .then((result) => {
        if (!cancelled) setEntries(result);
      })
      .catch(() => {
        if (!cancelled) setEntries([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [collection]);

  const filtered = useMemo(() => {
    if (!search) return entries;
    const q = search.toLowerCase();
    return entries.filter(
      (e) =>
        e.title.toLowerCase().includes(q) || e.slug.toLowerCase().includes(q)
    );
  }, [entries, search]);

  const selectedEntry = entries.find((e) => e.slug === value);
  const hasUnknownRef = value && !loading && !selectedEntry;

  return (
    <FieldWrapper label={label} required={required}>
      <div className="relative">
        {/* Selected value display */}
        {value ? (
          <div className="flex items-center gap-1.5 bg-ink-900 border border-ink-600 rounded px-2 py-1 text-xs">
            {hasUnknownRef ? (
              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
            ) : (
              <Link className="w-3 h-3 text-ink-400 shrink-0" />
            )}
            <span
              className={`flex-1 truncate ${hasUnknownRef ? "text-amber-300" : "text-ink-50"}`}
              title={
                hasUnknownRef
                  ? `Referenced entry "${value}" not found in ${collection}`
                  : selectedEntry?.title
              }
            >
              {selectedEntry?.title ?? value}
            </span>
            <button
              onClick={() => onChange("")}
              className="text-ink-500 hover:text-ink-200 transition-colors"
              title="Clear reference"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setOpen(!open)}
            className="w-full text-left bg-ink-900 border border-ink-600 rounded px-2 py-1 text-xs text-ink-500 hover:border-ink-400 transition-colors"
          >
            {loading ? "Loading..." : "Select entry..."}
          </button>
        )}

        {/* Dropdown */}
        {open && !value && (
          <div className="absolute z-20 mt-1 w-full bg-ink-800 border border-ink-600 rounded shadow-lg max-h-48 overflow-hidden flex flex-col">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              autoFocus
              className="px-2 py-1.5 text-xs bg-ink-900 border-b border-ink-600 text-ink-50 focus:outline-none"
              onBlur={() => {
                // Delay close to allow click on option
                setTimeout(() => setOpen(false), 150);
              }}
            />
            <div className="overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-2 py-2 text-xs text-ink-500">
                  {loading ? "Loading..." : "No entries found"}
                </div>
              ) : (
                filtered.map((entry) => (
                  <button
                    key={entry.slug}
                    className="w-full text-left px-2 py-1.5 text-xs text-ink-200 hover:bg-ink-700 transition-colors"
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent blur before click registers
                      onChange(entry.slug);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <span className="block truncate">{entry.title}</span>
                    <span className="block text-[10px] text-ink-500 truncate">
                      {entry.slug}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </FieldWrapper>
  );
}
