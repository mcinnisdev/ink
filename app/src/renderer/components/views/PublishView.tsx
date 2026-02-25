import { useEffect } from "react";
import { Globe } from "lucide-react";
import { useProjectStore } from "../../stores/project";
import { useGitStore } from "../../stores/git";
import { useGitHubStore } from "../../stores/github";
import { usePublishStore } from "../../stores/publish";
import GitHubConnectionCard from "../publish/GitHubConnectionCard";
import RepoSetupCard from "../publish/RepoSetupCard";
import OneClickPublishCard from "../publish/OneClickPublishCard";
import PublishProgress from "../publish/PublishProgress";
import DeployCard from "../publish/DeployCard";
import AdvancedGitSection from "../publish/AdvancedGitSection";

export default function PublishView() {
  const projectPath = useProjectStore((s) => s.current?.path);

  const gitStatus = useGitStore((s) => s.status);
  const remote = useGitStore((s) => s.remote);
  const refresh = useGitStore((s) => s.refresh);

  const connected = useGitHubStore((s) => s.connected);
  const authLoaded = useGitHubStore((s) => s.authLoaded);
  const loadAuth = useGitHubStore((s) => s.loadAuth);

  const publishStep = usePublishStore((s) => s.step);

  // Load git status and github auth on mount
  useEffect(() => {
    if (!projectPath) return;
    refresh(projectPath);
  }, [projectPath, refresh]);

  useEffect(() => {
    if (!authLoaded) loadAuth();
  }, [authLoaded, loadAuth]);

  const hasRemote = !!remote;
  const isPublishing =
    publishStep !== "idle" && publishStep !== "done" && publishStep !== "error";
  const showProgress = publishStep !== "idle";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-ink-700 flex-shrink-0">
        <h2 className="text-lg font-semibold text-ink-50 flex items-center gap-2">
          <Globe className="w-5 h-5 text-accent" />
          Publish
        </h2>
        <p className="text-xs text-ink-500 mt-0.5">
          Connect to GitHub and publish your site with one click
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Step 1: GitHub Connection */}
          <section>
            <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-2">
              {connected ? "GitHub Account" : "Step 1 — Connect GitHub"}
            </h3>
            <GitHubConnectionCard />
          </section>

          {/* Step 2: Repository Setup (show only if connected but no remote) */}
          {connected && !hasRemote && (
            <section>
              <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-2">
                Step 2 — Set Up Repository
              </h3>
              <RepoSetupCard />
            </section>
          )}

          {/* One-Click Publish (show if connected + remote configured) */}
          {connected && hasRemote && (
            <section>
              <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-2">
                Publish
              </h3>
              {showProgress ? <PublishProgress /> : <OneClickPublishCard />}
            </section>
          )}

          {/* Deploy (show after at least one push) */}
          {connected && hasRemote && (
            <section>
              <DeployCard />
            </section>
          )}

          {/* Advanced Git Controls — always available if git repo exists */}
          {gitStatus.isRepo && (
            <section>
              <AdvancedGitSection />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
