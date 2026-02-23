import { useState, useEffect, useCallback } from "react";
import { Palette, Save, AlertTriangle } from "lucide-react";
import { useProjectStore } from "../../stores/project";
import { useUIStore } from "../../stores/ui";

interface DesignToken {
  name: string;
  value: string;
  comment: string;
  category: string;
  type: "color" | "font" | "size" | "other";
}

function parseDesignTokens(css: string): DesignToken[] {
  const rootMatch = css.match(/:root\s*\{([\s\S]*?)\n\}/);
  if (!rootMatch) return [];

  const tokens: DesignToken[] = [];
  let currentCategory = "";

  for (const line of rootMatch[1].split("\n")) {
    const catMatch = line.match(
      /\/\*\s*-+\s*(.+?)\s*(?:\(.*?\))?\s*-+\s*\*\//
    );
    if (catMatch) {
      currentCategory = catMatch[1].trim();
      continue;
    }

    const varMatch = line.match(
      /\s*(--[\w-]+):\s*(.+?)\s*;(?:\s*\/\*\s*(.+?)\s*\*\/)?/
    );
    if (varMatch) {
      const [, name, value, comment] = varMatch;
      const type = name.includes("color") || name.includes("bg-") || name.includes("text-")
        ? "color"
        : name.includes("font")
        ? "font"
        : name.includes("space") ||
          name.includes("radius") ||
          name.includes("width") ||
          name.includes("text-")
        ? "size"
        : "other";
      tokens.push({
        name,
        value,
        comment: comment || "",
        category: currentCategory,
        type,
      });
    }
  }
  return tokens;
}

function serializeTokens(originalCss: string, tokens: DesignToken[]): string {
  let result = originalCss;
  for (const token of tokens) {
    const escaped = token.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped}:\\s*)([^;]+)(;)`);
    result = result.replace(regex, `$1${token.value}$3`);
  }
  return result;
}

function isColor(value: string): boolean {
  return /^#[0-9a-fA-F]{3,8}$/.test(value.trim());
}

export default function ThemeView() {
  const projectPath = useProjectStore((s) => s.current?.path);
  const devMode = useUIStore((s) => s.devMode);
  const [tokens, setTokens] = useState<DesignToken[]>([]);
  const [originalCss, setOriginalCss] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const cssPath = projectPath ? `${projectPath}/src/css/main.css` : null;

  useEffect(() => {
    if (!cssPath) return;
    window.ink.file
      .read(cssPath)
      .then((css) => {
        setOriginalCss(css);
        setTokens(parseDesignTokens(css));
        setLoaded(true);
        setDirty(false);
      })
      .catch(() => {
        setLoaded(true);
      });
  }, [cssPath]);

  const updateToken = useCallback((index: number, newValue: string) => {
    setTokens((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], value: newValue };
      return updated;
    });
    setDirty(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!cssPath) return;
    setSaving(true);
    try {
      const updated = serializeTokens(originalCss, tokens);
      await window.ink.file.write(cssPath, updated);
      setOriginalCss(updated);
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }, [cssPath, originalCss, tokens]);

  // Group tokens by category
  const categories = tokens.reduce<Record<string, DesignToken[]>>(
    (acc, token, i) => {
      const cat = token.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push({ ...token, name: token.name, comment: String(i) });
      return acc;
    },
    {}
  );

  if (!devMode) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <p className="text-ink-300 text-sm font-medium">Developer Mode Required</p>
          <p className="text-ink-500 text-xs mt-1">
            Enable Dev mode in the title bar to access theme settings
          </p>
        </div>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-ink-500 text-sm animate-pulse">Loading theme...</p>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-6 py-4 border-b border-ink-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-accent" />
            Theme
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-ink-400 text-sm">No design tokens found</p>
            <p className="text-ink-600 text-xs mt-1">
              Add CSS custom properties in <code className="text-ink-400">:root</code> in src/css/main.css
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-ink-700">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-accent" />
            Theme
          </h2>
          <p className="text-xs text-ink-500 mt-0.5">
            Edit design tokens in src/css/main.css
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            dirty
              ? "bg-accent hover:bg-accent-hover text-white"
              : "bg-ink-800 text-ink-500 cursor-not-allowed"
          }`}
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-8">
          {Object.entries(categories).map(([category, catTokens]) => (
            <section key={category}>
              <h3 className="text-sm font-semibold text-ink-300 mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {catTokens.map((token) => {
                  const tokenIndex = parseInt(token.comment);
                  const actualToken = tokens[tokenIndex];
                  const colorValue = isColor(actualToken.value);

                  return (
                    <div
                      key={actualToken.name}
                      className="flex items-center gap-3"
                    >
                      <label className="w-48 text-xs text-ink-400 font-mono truncate flex-shrink-0">
                        {actualToken.name}
                      </label>
                      {colorValue && (
                        <input
                          type="color"
                          value={actualToken.value}
                          onChange={(e) =>
                            updateToken(tokenIndex, e.target.value)
                          }
                          className="w-8 h-8 rounded border border-ink-600 bg-transparent cursor-pointer flex-shrink-0"
                        />
                      )}
                      <input
                        type="text"
                        value={actualToken.value}
                        onChange={(e) =>
                          updateToken(tokenIndex, e.target.value)
                        }
                        className="flex-1 bg-ink-900 border border-ink-600 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-accent focus:outline-none"
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
