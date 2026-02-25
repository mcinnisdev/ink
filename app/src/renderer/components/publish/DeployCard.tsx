import { useState } from "react";
import {
  Globe,
  ExternalLink,
  Loader2,
  Check,
} from "lucide-react";
import { useGitHubStore } from "../../stores/github";
import { useGitStore } from "../../stores/git";
import { useNotificationStore } from "../../stores/notifications";

export default function DeployCard() {
  const remote = useGitStore((s) => s.remote);
  const branch = useGitStore((s) => s.status.branch);
  const user = useGitHubStore((s) => s.user);
  const enablePages = useGitHubStore((s) => s.enablePages);
  const addToast = useNotificationStore((s) => s.addToast);

  const [enablingPages, setEnablingPages] = useState(false);
  const [pagesUrl, setPagesUrl] = useState<string | null>(null);

  // Extract owner/repo from remote URL
  const getRepoInfo = (): { owner: string; repo: string } | null => {
    if (!remote) return null;
    // https://github.com/owner/repo.git or git@github.com:owner/repo.git
    const httpsMatch = remote.match(
      /github\.com\/([^/]+)\/([^/.]+)/
    );
    if (httpsMatch) return { owner: httpsMatch[1], repo: httpsMatch[2] };
    const sshMatch = remote.match(
      /github\.com:([^/]+)\/([^/.]+)/
    );
    if (sshMatch) return { owner: sshMatch[1], repo: sshMatch[2] };
    return null;
  };

  const repoInfo = getRepoInfo();
  const isGitHub = !!repoInfo;

  const handleEnablePages = async () => {
    if (!repoInfo) return;
    setEnablingPages(true);
    try {
      const result = await enablePages(
        repoInfo.owner,
        repoInfo.repo,
        branch || "main"
      );
      setPagesUrl(result.html_url);
      addToast("success", "GitHub Pages enabled!");
    } catch (err) {
      addToast(
        "error",
        err instanceof Error ? err.message : "Failed to enable Pages"
      );
    } finally {
      setEnablingPages(false);
    }
  };

  return (
    <div className="bg-ink-800/50 rounded-lg border border-ink-700/50 p-4">
      <h4 className="text-xs font-semibold text-ink-300 mb-3 flex items-center gap-1.5">
        <Globe className="w-3.5 h-3.5" />
        Deploy
      </h4>

      {/* GitHub Pages */}
      {isGitHub && user && (
        <div className="mb-4">
          {pagesUrl ? (
            <div className="flex items-center gap-2 bg-green-900/20 border border-green-800/50 rounded-lg p-3">
              <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-green-300 font-medium">
                  GitHub Pages is live
                </p>
                <button
                  onClick={() => window.ink.shell.openExternal(pagesUrl)}
                  className="text-[10px] text-green-400 hover:underline truncate block"
                >
                  {pagesUrl}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleEnablePages}
              disabled={enablingPages}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-medium bg-ink-700/50 hover:bg-ink-700 text-ink-300 hover:text-ink-50 transition-colors disabled:opacity-50"
            >
              {enablingPages ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Globe className="w-3.5 h-3.5" />
              )}
              Enable GitHub Pages
            </button>
          )}
        </div>
      )}

      {/* Other providers */}
      <div>
        <p className="text-[10px] text-ink-500 mb-2">
          Or deploy with another provider:
        </p>
        <div className="flex gap-2">
          {[
            {
              name: "Netlify",
              url: "https://app.netlify.com/start",
            },
            {
              name: "Vercel",
              url: "https://vercel.com/new",
            },
            {
              name: "Cloudflare",
              url: "https://dash.cloudflare.com/?to=/:account/pages/new",
            },
          ].map((provider) => (
            <button
              key={provider.name}
              onClick={() => window.ink.shell.openExternal(provider.url)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] text-ink-400 hover:text-ink-50 border border-ink-700/50 hover:border-ink-500 transition-colors"
            >
              {provider.name}
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
