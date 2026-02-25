import { useState, useEffect } from "react";
import {
  Rocket,
  FileCheck,
  FileX,
  Clock,
} from "lucide-react";
import { useProjectStore } from "../../stores/project";
import { usePublishStore } from "../../stores/publish";

interface ContentStats {
  published: number;
  drafts: number;
  total: number;
}

export default function OneClickPublishCard() {
  const projectPath = useProjectStore((s) => s.current?.path);
  const step = usePublishStore((s) => s.step);
  const lastPublished = usePublishStore((s) => s.lastPublished);
  const publish = usePublishStore((s) => s.publish);

  const [stats, setStats] = useState<ContentStats>({
    published: 0,
    drafts: 0,
    total: 0,
  });

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
  }, [projectPath, step]);

  const isPublishing = step !== "idle" && step !== "done" && step !== "error";

  const handlePublish = () => {
    if (!projectPath || isPublishing) return;
    publish(projectPath);
  };

  const formatLastPublished = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-ink-800/50 rounded-lg border border-ink-700/50 p-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-ink-400 mb-1">
            <FileCheck className="w-3.5 h-3.5 text-green-400" />
            <span className="text-[10px]">Published</span>
          </div>
          <p className="text-lg font-bold text-ink-50">{stats.published}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-ink-400 mb-1">
            <FileX className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px]">Drafts</span>
          </div>
          <p className="text-lg font-bold text-ink-50">{stats.drafts}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-ink-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-ink-500" />
            <span className="text-[10px]">Last Published</span>
          </div>
          <p className="text-xs font-medium text-ink-50 mt-0.5">
            {lastPublished ? formatLastPublished(lastPublished) : "Never"}
          </p>
        </div>
      </div>

      {/* Publish button */}
      <button
        onClick={handlePublish}
        disabled={isPublishing}
        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg text-sm font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Rocket className="w-4.5 h-4.5" />
        {isPublishing ? "Publishing..." : "Publish Site"}
      </button>
    </div>
  );
}
