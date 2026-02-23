import { useState, useEffect, useCallback } from "react";
import { Globe, Hammer, FileCheck, FileX, Loader2, Upload } from "lucide-react";
import { useProjectStore } from "../../stores/project";

interface ContentStats {
  published: number;
  drafts: number;
  total: number;
}

export default function PublishView() {
  const projectPath = useProjectStore((s) => s.current?.path);
  const [stats, setStats] = useState<ContentStats>({ published: 0, drafts: 0, total: 0 });
  const [building, setBuilding] = useState(false);
  const [buildResult, setBuildResult] = useState<{
    success: boolean;
    output: string;
  } | null>(null);

  // Count published vs draft content
  useEffect(() => {
    if (!projectPath) return;

    async function countContent() {
      try {
        const tree = await window.ink.file.list(`${projectPath}/content`);
        let published = 0;
        let drafts = 0;

        async function walkFiles(nodes: typeof tree) {
          for (const node of nodes) {
            if (node.type === "directory" && node.children) {
              await walkFiles(node.children);
            } else if (node.name.endsWith(".md")) {
              try {
                const raw = await window.ink.file.read(node.path);
                const match = raw.match(/^---\n([\s\S]*?)\n---/);
                if (match) {
                  const hasDraft = /published:\s*false/i.test(match[1]);
                  if (hasDraft) {
                    drafts++;
                  } else {
                    published++;
                  }
                } else {
                  published++;
                }
              } catch {
                published++;
              }
            }
          }
        }

        await walkFiles(tree);
        setStats({ published, drafts, total: published + drafts });
      } catch {
        // Content directory may not exist
      }
    }

    countContent();
  }, [projectPath]);

  const handleBuild = useCallback(async () => {
    if (!projectPath) return;
    setBuilding(true);
    setBuildResult(null);
    try {
      const result = await window.ink.eleventy.build(projectPath);
      setBuildResult(result);
    } catch (err) {
      setBuildResult({ success: false, output: String(err) });
    } finally {
      setBuilding(false);
    }
  }, [projectPath]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-ink-700">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-accent" />
          Publish
        </h2>
        <p className="text-xs text-ink-500 mt-0.5">
          Build and deploy your site
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-6">
          {/* Content Status */}
          <section>
            <h3 className="text-sm font-semibold text-ink-300 mb-3">
              Content Status
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-ink-800/50 rounded-lg border border-ink-700/50 p-4">
                <div className="flex items-center gap-2 text-ink-400 mb-1">
                  <FileCheck className="w-4 h-4 text-green-400" />
                  <span className="text-xs">Published</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.published}</p>
              </div>
              <div className="bg-ink-800/50 rounded-lg border border-ink-700/50 p-4">
                <div className="flex items-center gap-2 text-ink-400 mb-1">
                  <FileX className="w-4 h-4 text-amber-400" />
                  <span className="text-xs">Drafts</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.drafts}</p>
              </div>
              <div className="bg-ink-800/50 rounded-lg border border-ink-700/50 p-4">
                <div className="flex items-center gap-2 text-ink-400 mb-1">
                  <span className="text-xs">Total</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </section>

          {/* Build */}
          <section>
            <h3 className="text-sm font-semibold text-ink-300 mb-3">Build</h3>
            <div className="bg-ink-800/50 rounded-lg border border-ink-700/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-ink-400">
                  Build your site into the <code className="text-ink-300">_site/</code> directory
                </p>
                <button
                  onClick={handleBuild}
                  disabled={building}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent hover:bg-accent-hover text-white transition-colors disabled:opacity-50"
                >
                  {building ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Hammer className="w-3.5 h-3.5" />
                  )}
                  {building ? "Building..." : "Build Site"}
                </button>
              </div>

              {buildResult && (
                <div
                  className={`rounded-lg p-3 text-xs font-mono whitespace-pre-wrap max-h-48 overflow-y-auto ${
                    buildResult.success
                      ? "bg-green-900/20 border border-green-800/50 text-green-300"
                      : "bg-red-900/20 border border-red-800/50 text-red-300"
                  }`}
                >
                  {buildResult.output || (buildResult.success ? "Build completed successfully." : "Build failed.")}
                </div>
              )}
            </div>
          </section>

          {/* Deploy */}
          <section>
            <h3 className="text-sm font-semibold text-ink-300 mb-3">Deploy</h3>
            <div className="bg-ink-800/50 rounded-lg border border-ink-700/50 p-6 text-center">
              <Upload className="w-8 h-8 text-ink-600 mx-auto mb-3" />
              <p className="text-sm text-ink-400 font-medium">
                Deploy integration coming soon
              </p>
              <p className="text-xs text-ink-500 mt-1">
                For now, deploy your <code className="text-ink-400">_site/</code> directory manually to Netlify, Vercel, or any static host.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
