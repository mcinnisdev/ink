import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2, FileText, ArrowRight } from "lucide-react";
import { useProjectStore } from "../../stores/project";
import { useEditorStore } from "../../stores/editor";
import { useUIStore } from "../../stores/ui";

interface SearchResult {
  filePath: string;
  relativePath: string;
  line: string;
  lineNumber: number;
  column: number;
  matchLength: number;
}

interface GroupedResults {
  relativePath: string;
  filePath: string;
  matches: SearchResult[];
}

function groupByFile(results: SearchResult[]): GroupedResults[] {
  const map = new Map<string, GroupedResults>();
  for (const r of results) {
    let group = map.get(r.relativePath);
    if (!group) {
      group = { relativePath: r.relativePath, filePath: r.filePath, matches: [] };
      map.set(r.relativePath, group);
    }
    group.matches.push(r);
  }
  return Array.from(map.values());
}

function HighlightedLine({ line, query }: { line: string; query: string }) {
  if (!query) return <span>{line}</span>;
  const lower = line.toLowerCase();
  const lowerQ = query.toLowerCase();
  const parts: Array<{ text: string; highlight: boolean }> = [];
  let idx = 0;
  let pos = lower.indexOf(lowerQ);
  while (pos !== -1) {
    if (pos > idx) parts.push({ text: line.slice(idx, pos), highlight: false });
    parts.push({ text: line.slice(pos, pos + query.length), highlight: true });
    idx = pos + query.length;
    pos = lower.indexOf(lowerQ, idx);
  }
  if (idx < line.length) parts.push({ text: line.slice(idx), highlight: false });
  return (
    <span>
      {parts.map((p, i) =>
        p.highlight ? (
          <mark key={i} className="bg-amber-400/30 text-amber-200 rounded-sm px-0.5">
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </span>
  );
}

export default function SearchView() {
  const projectPath = useProjectStore((s) => s.current?.path);
  const openFile = useEditorStore((s) => s.openFile);
  const setView = useUIStore((s) => s.setView);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);

  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const doSearch = useCallback(
    async (query: string) => {
      if (!projectPath || query.length < 2) {
        setResults([]);
        setHasSearched(false);
        return;
      }
      setSearching(true);
      setError(null);
      try {
        const res = await window.ink.file.search(projectPath, query);
        setResults(res);
        setHasSearched(true);
      } catch (err) {
        setResults([]);
        setHasSearched(true);
        setError(err instanceof Error ? err.message : "Search failed");
      } finally {
        setSearching(false);
      }
    },
    [projectPath]
  );

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 300);
  };

  // Run search on mount if there's an existing query
  useEffect(() => {
    if (searchQuery.length >= 2) {
      doSearch(searchQuery);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResultClick = async (result: SearchResult) => {
    await openFile(result.filePath, result.relativePath);
    setView("content");
  };

  const grouped = groupByFile(results);

  return (
    <div className="h-full flex flex-col bg-ink-950">
      {/* Header */}
      <div className="px-6 py-4 border-b border-ink-700 flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-5 h-5 text-ink-400" />
          <h2 className="text-lg font-semibold text-ink-50">Search</h2>
          {hasSearched && (
            <span className="text-xs text-ink-500 ml-2">
              {results.length} {results.length === 1 ? "match" : "matches"}
              {results.length >= 200 && " (limit reached)"}
            </span>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Search across all project files..."
            className="w-full pl-10 pr-4 py-2.5 bg-ink-900 border border-ink-600 rounded-lg text-sm text-ink-50 placeholder:text-ink-500 focus:outline-none focus:border-accent"
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 animate-spin" />
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {!hasSearched && !searching && (
          <div className="flex flex-col items-center justify-center h-full text-ink-500">
            <Search className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">Search across all project files</p>
            <p className="text-xs mt-1">Type at least 2 characters to begin</p>
          </div>
        )}

        {hasSearched && error && (
          <div className="flex flex-col items-center justify-center h-full text-ink-500">
            <p className="text-sm text-red-400">Search error: {error}</p>
          </div>
        )}

        {hasSearched && !error && results.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-ink-500">
            <p className="text-sm">No results found for "{searchQuery}"</p>
          </div>
        )}

        {grouped.length > 0 && (
          <div className="py-2">
            {grouped.map((group) => (
              <div key={group.relativePath} className="mb-1">
                {/* File header */}
                <button
                  onClick={() =>
                    handleResultClick(group.matches[0])
                  }
                  className="w-full flex items-center gap-2 px-6 py-1.5 text-xs font-medium text-accent hover:bg-ink-800/50 transition-colors group"
                >
                  <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{group.relativePath}</span>
                  <span className="text-ink-600 ml-auto flex-shrink-0">
                    {group.matches.length}
                  </span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity" />
                </button>

                {/* Match lines */}
                {group.matches.map((match, i) => (
                  <button
                    key={i}
                    onClick={() => handleResultClick(match)}
                    className="w-full flex items-start gap-3 px-6 pl-12 py-1 text-xs hover:bg-ink-800/30 transition-colors text-left"
                  >
                    <span className="text-ink-600 w-8 text-right flex-shrink-0 font-mono">
                      {match.lineNumber}
                    </span>
                    <span className="text-ink-300 truncate font-mono">
                      <HighlightedLine
                        line={match.line}
                        query={searchQuery}
                      />
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
