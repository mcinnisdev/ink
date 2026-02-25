import { useState, useEffect, useCallback } from "react";
import { Palette, Save, Sparkles } from "lucide-react";
import { useProjectStore } from "../../stores/project";
import { useNotificationStore } from "../../stores/notifications";

interface DesignToken {
  name: string;
  value: string;
  comment: string;
  category: string;
  type: "color" | "font" | "size" | "other";
}

const COLOR_PRESETS = [
  { name: "Ocean Blue", primary: "#2563eb", secondary: "#1e3a5f" },
  { name: "Forest Green", primary: "#16a34a", secondary: "#14532d" },
  { name: "Sunset Warm", primary: "#ea580c", secondary: "#7c2d12" },
  { name: "Royal Purple", primary: "#7c3aed", secondary: "#3b0764" },
  { name: "Slate Professional", primary: "#475569", secondary: "#0f172a" },
  { name: "Rose", primary: "#e11d48", secondary: "#4c0519" },
];

function parseDesignTokens(css: string): DesignToken[] {
  // Support both plain :root and @layer base { :root { ... } }
  let rootContent = "";
  const layerMatch = css.match(/@layer\s+base\s*\{[\s\S]*?:root\s*\{([\s\S]*?)\}/);
  if (layerMatch) {
    rootContent = layerMatch[1];
  } else {
    const rootMatch = css.match(/:root\s*\{([\s\S]*?)\n\}/);
    if (rootMatch) rootContent = rootMatch[1];
  }
  if (!rootContent) return [];

  const tokens: DesignToken[] = [];
  let currentCategory = "";

  for (const line of rootContent.split("\n")) {
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
      const type =
        name.includes("color") || name.includes("bg-") || name.includes("text-")
          ? "color"
          : name.includes("font")
          ? "font"
          : name.includes("space") ||
            name.includes("radius") ||
            name.includes("width")
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
  const addToast = useNotificationStore((s) => s.addToast);
  const [tokens, setTokens] = useState<DesignToken[]>([]);
  const [originalCss, setOriginalCss] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [cssFramework, setCssFramework] = useState<"vanilla" | "tailwind">("vanilla");
  const [cssPath, setCssPath] = useState<string | null>(null);

  // Detect CSS framework and load tokens
  useEffect(() => {
    if (!projectPath) return;

    async function load() {
      const framework = await window.ink.cli.detectCssFramework(projectPath!);
      setCssFramework(framework);

      const filePath =
        framework === "tailwind"
          ? `${projectPath}/src/css/tailwind.css`
          : `${projectPath}/src/css/main.css`;
      setCssPath(filePath);

      try {
        const css = await window.ink.file.read(filePath);
        setOriginalCss(css);
        setTokens(parseDesignTokens(css));
      } catch {
        // File may not exist
      }
      setLoaded(true);
      setDirty(false);
    }

    load();
  }, [projectPath]);

  const updateToken = useCallback((index: number, newValue: string) => {
    setTokens((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], value: newValue };
      return updated;
    });
    setDirty(true);
  }, []);

  const applyPreset = useCallback(
    (preset: (typeof COLOR_PRESETS)[0]) => {
      setTokens((prev) => {
        const updated = [...prev];
        for (let i = 0; i < updated.length; i++) {
          if (updated[i].name === "--color-primary") {
            updated[i] = { ...updated[i], value: preset.primary };
          } else if (updated[i].name === "--color-secondary") {
            updated[i] = { ...updated[i], value: preset.secondary };
          }
        }
        return updated;
      });
      setDirty(true);
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!cssPath) return;
    setSaving(true);
    try {
      const updated = serializeTokens(originalCss, tokens);
      await window.ink.file.write(cssPath, updated);
      setOriginalCss(updated);
      setDirty(false);
      addToast("success", "Theme saved");
    } catch {
      addToast("error", "Failed to save theme");
    } finally {
      setSaving(false);
    }
  }, [cssPath, originalCss, tokens, addToast]);

  // Group tokens by category
  const categories = tokens.reduce<Record<string, DesignToken[]>>(
    (acc, token, i) => {
      const cat = token.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      // Store original index in comment field for lookup
      acc[cat].push({ ...token, comment: String(i) });
      return acc;
    },
    {}
  );

  // Get primary and secondary colors for preview
  const primaryToken = tokens.find((t) => t.name === "--color-primary");
  const secondaryToken = tokens.find((t) => t.name === "--color-secondary");

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
          <h2 className="text-lg font-semibold text-ink-50 flex items-center gap-2">
            <Palette className="w-5 h-5 text-accent" />
            Theme
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-ink-400 text-sm">No design tokens found</p>
            <p className="text-ink-600 text-xs mt-1">
              Add CSS custom properties in{" "}
              <code className="text-ink-400">:root</code> in your CSS file
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
          <h2 className="text-lg font-semibold text-ink-50 flex items-center gap-2">
            <Palette className="w-5 h-5 text-accent" />
            Theme
          </h2>
          <p className="text-xs text-ink-500 mt-0.5">
            {cssFramework === "tailwind" ? "Tailwind CSS" : "Vanilla CSS"} design
            tokens
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
          {/* Color Presets */}
          <section>
            <h3 className="text-sm font-semibold text-ink-300 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Quick Presets
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="flex items-center gap-2 p-2 rounded-lg border border-ink-700/50 hover:border-ink-500 bg-ink-800/50 transition-colors text-left"
                >
                  <div className="flex gap-0.5 flex-shrink-0">
                    <div
                      className="w-4 h-4 rounded-l"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div
                      className="w-4 h-4 rounded-r"
                      style={{ backgroundColor: preset.secondary }}
                    />
                  </div>
                  <span className="text-[10px] text-ink-400">{preset.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Color Preview Strip */}
          {primaryToken && secondaryToken && (
            <section>
              <h3 className="text-sm font-semibold text-ink-300 mb-3">
                Preview
              </h3>
              <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
                <div
                  className="flex-1"
                  style={{ backgroundColor: primaryToken.value }}
                />
                <div
                  className="flex-1"
                  style={{ backgroundColor: secondaryToken.value }}
                />
                <div className="flex-1 bg-ink-50" />
                <div className="flex-1 bg-ink-200" />
                <div className="flex-1 bg-ink-800" />
              </div>
            </section>
          )}

          {/* Token Categories */}
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
                        className="flex-1 bg-ink-900 border border-ink-600 rounded-lg px-3 py-1.5 text-xs text-ink-50 font-mono focus:border-accent focus:outline-none"
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
