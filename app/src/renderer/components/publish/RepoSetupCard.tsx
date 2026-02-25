import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Link,
  Loader2,
  Lock,
  Globe,
  ChevronDown,
  Check,
  FolderGit2,
} from "lucide-react";
import { useGitHubStore, type GitHubRepo } from "../../stores/github";
import { useGitStore } from "../../stores/git";
import { useProjectStore } from "../../stores/project";
import { useNotificationStore } from "../../stores/notifications";

type Tab = "create" | "existing";

export default function RepoSetupCard() {
  const projectPath = useProjectStore((s) => s.current?.path);
  const siteName = useProjectStore((s) => s.current?.siteName || "");
  const addToast = useNotificationStore((s) => s.addToast);

  const createRepoGH = useGitHubStore((s) => s.createRepo);
  const listReposGH = useGitHubStore((s) => s.listRepos);
  const creatingRepo = useGitHubStore((s) => s.creatingRepo);

  const gitStatus = useGitStore((s) => s.status);
  const gitInit = useGitStore((s) => s.init);
  const setRemote = useGitStore((s) => s.setRemote);
  const refresh = useGitStore((s) => s.refresh);

  const [activeTab, setActiveTab] = useState<Tab>("create");
  const [repoName, setRepoName] = useState(
    siteName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "my-site"
  );
  const [isPrivate, setIsPrivate] = useState(true);

  // Existing repos
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const loadRepos = useCallback(async () => {
    setLoadingRepos(true);
    try {
      const list = await listReposGH();
      setRepos(list);
    } catch {
      // ignore
    } finally {
      setLoadingRepos(false);
    }
  }, [listReposGH]);

  useEffect(() => {
    if (activeTab === "existing" && repos.length === 0) {
      loadRepos();
    }
  }, [activeTab, repos.length, loadRepos]);

  const ensureGitRepo = async (): Promise<boolean> => {
    if (!projectPath) return false;
    if (!gitStatus.isRepo) {
      const result = await gitInit(projectPath);
      if (!result.success) {
        addToast("error", result.error || "Failed to initialize git");
        return false;
      }
    }
    return true;
  };

  const handleCreate = async () => {
    if (!projectPath || !repoName.trim()) return;

    try {
      const repo = await createRepoGH(repoName.trim(), isPrivate);

      if (!(await ensureGitRepo())) return;

      const result = await setRemote(projectPath, repo.clone_url);
      if (!result.success) {
        addToast("error", result.error || "Failed to set remote");
        return;
      }

      await refresh(projectPath);
      addToast("success", `Repository "${repo.full_name}" created and linked`);
    } catch (err) {
      addToast(
        "error",
        err instanceof Error ? err.message : "Failed to create repository"
      );
    }
  };

  const handleSelectRepo = async (repo: GitHubRepo) => {
    if (!projectPath) return;
    setShowDropdown(false);

    try {
      if (!(await ensureGitRepo())) return;

      const result = await setRemote(projectPath, repo.clone_url);
      if (!result.success) {
        addToast("error", result.error || "Failed to set remote");
        return;
      }

      await refresh(projectPath);
      addToast("success", `Linked to "${repo.full_name}"`);
    } catch (err) {
      addToast(
        "error",
        err instanceof Error ? err.message : "Failed to link repository"
      );
    }
  };

  return (
    <div className="bg-ink-800/50 rounded-lg border border-ink-700/50">
      {/* Tabs */}
      <div className="flex border-b border-ink-700/50">
        <button
          onClick={() => setActiveTab("create")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors ${
            activeTab === "create"
              ? "text-ink-50 border-b-2 border-accent"
              : "text-ink-400 hover:text-ink-300"
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          Create New
        </button>
        <button
          onClick={() => setActiveTab("existing")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors ${
            activeTab === "existing"
              ? "text-ink-50 border-b-2 border-accent"
              : "text-ink-400 hover:text-ink-300"
          }`}
        >
          <Link className="w-3.5 h-3.5" />
          Connect Existing
        </button>
      </div>

      <div className="p-4">
        {activeTab === "create" ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-ink-400 mb-1">
                Repository Name
              </label>
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="my-site"
                className="w-full bg-ink-900 border border-ink-600 rounded-lg px-3 py-2 text-sm text-ink-50 placeholder-ink-500 focus:border-accent focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPrivate(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  isPrivate
                    ? "border-accent text-ink-50 bg-accent/10"
                    : "border-ink-600 text-ink-400 hover:text-ink-300"
                }`}
              >
                <Lock className="w-3 h-3" />
                Private
              </button>
              <button
                onClick={() => setIsPrivate(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  !isPrivate
                    ? "border-accent text-ink-50 bg-accent/10"
                    : "border-ink-600 text-ink-400 hover:text-ink-300"
                }`}
              >
                <Globe className="w-3 h-3" />
                Public
              </button>
            </div>

            <button
              onClick={handleCreate}
              disabled={!repoName.trim() || creatingRepo}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium bg-accent hover:bg-accent-hover text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creatingRepo ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FolderGit2 className="w-4 h-4" />
              )}
              {creatingRepo ? "Creating..." : "Create Repository"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full flex items-center justify-between bg-ink-900 border border-ink-600 rounded-lg px-3 py-2 text-sm text-ink-400 hover:border-ink-500 transition-colors"
              >
                <span>Select a repository...</span>
                {loadingRepos ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {showDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-ink-900 border border-ink-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {repos.length === 0 ? (
                    <p className="px-3 py-4 text-xs text-ink-500 text-center">
                      {loadingRepos ? "Loading..." : "No repositories found"}
                    </p>
                  ) : (
                    repos.map((repo) => (
                      <button
                        key={repo.id}
                        onClick={() => handleSelectRepo(repo)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-ink-800 transition-colors border-b border-ink-800 last:border-0"
                      >
                        {repo.private ? (
                          <Lock className="w-3 h-3 text-amber-400 flex-shrink-0" />
                        ) : (
                          <Globe className="w-3 h-3 text-green-400 flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs text-ink-50 font-medium truncate">
                            {repo.full_name}
                          </p>
                          {repo.description && (
                            <p className="text-[10px] text-ink-500 truncate">
                              {repo.description}
                            </p>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
