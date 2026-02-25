import { useState, useCallback } from "react";
import {
  ChevronRight,
  ChevronDown,
  GitBranch,
  GitCommit,
  Check,
  ArrowUpCircle,
  ArrowDownCircle,
  Link,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useProjectStore } from "../../stores/project";
import { useGitStore } from "../../stores/git";
import { useNotificationStore } from "../../stores/notifications";

export default function AdvancedGitSection() {
  const projectPath = useProjectStore((s) => s.current?.path);
  const addToast = useNotificationStore((s) => s.addToast);

  const gitStatus = useGitStore((s) => s.status);
  const gitLog = useGitStore((s) => s.log);
  const remote = useGitStore((s) => s.remote);
  const loading = useGitStore((s) => s.loading);
  const pushing = useGitStore((s) => s.pushing);
  const refresh = useGitStore((s) => s.refresh);
  const stageAll = useGitStore((s) => s.stageAll);
  const commit = useGitStore((s) => s.commit);
  const setRemote = useGitStore((s) => s.setRemote);
  const push = useGitStore((s) => s.push);

  const [collapsed, setCollapsed] = useState(true);
  const [commitMsg, setCommitMsg] = useState("");
  const [remoteInput, setRemoteInput] = useState("");
  const [editingRemote, setEditingRemote] = useState(false);

  const totalChanges =
    gitStatus.staged.length +
    gitStatus.unstaged.length +
    gitStatus.untracked.length;

  const handleStageAndCommit = useCallback(async () => {
    if (!projectPath || !commitMsg.trim()) return;
    const stageResult = await stageAll(projectPath);
    if (!stageResult.success) {
      addToast("error", stageResult.error || "Failed to stage files");
      return;
    }
    const commitResult = await commit(projectPath, commitMsg.trim());
    if (commitResult.success) {
      addToast("success", "Changes committed");
      setCommitMsg("");
    } else {
      addToast("error", commitResult.error || "Failed to commit");
    }
  }, [projectPath, commitMsg, stageAll, commit, addToast]);

  const handleSetRemote = useCallback(async () => {
    if (!projectPath || !remoteInput.trim()) return;
    const result = await setRemote(projectPath, remoteInput.trim());
    if (result.success) {
      addToast("success", "Remote URL saved");
      setEditingRemote(false);
    } else {
      addToast("error", result.error || "Failed to set remote");
    }
  }, [projectPath, remoteInput, setRemote, addToast]);

  const handlePush = useCallback(async () => {
    if (!projectPath) return;
    const result = await push(projectPath);
    if (result.success) {
      addToast("success", "Pushed to remote");
    } else {
      addToast("error", result.error || "Failed to push");
    }
  }, [projectPath, push, addToast]);

  if (!gitStatus.isRepo) return null;

  return (
    <div className="bg-ink-800/50 rounded-lg border border-ink-700/50">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-2 px-4 py-3 text-xs font-medium text-ink-400 hover:text-ink-300 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
        Advanced Git Controls
        <span className="ml-auto flex items-center gap-2">
          {totalChanges > 0 && (
            <span className="text-amber-400 text-[10px]">
              {totalChanges} change{totalChanges !== 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (projectPath) refresh(projectPath);
            }}
            disabled={loading}
            className="p-0.5 text-ink-500 hover:text-ink-300 transition-colors"
          >
            <RefreshCw
              className={`w-3 h-3 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </span>
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-4 border-t border-ink-700/50 pt-3">
          {/* Branch info */}
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-ink-800 text-ink-300">
              <GitBranch className="w-3 h-3" />
              {gitStatus.branch}
            </span>
            {gitStatus.ahead > 0 && (
              <span className="flex items-center gap-1 text-green-400">
                <ArrowUpCircle className="w-3 h-3" />
                {gitStatus.ahead} ahead
              </span>
            )}
            {gitStatus.behind > 0 && (
              <span className="flex items-center gap-1 text-red-400">
                <ArrowDownCircle className="w-3 h-3" />
                {gitStatus.behind} behind
              </span>
            )}
            {totalChanges === 0 &&
              gitStatus.ahead === 0 &&
              gitStatus.behind === 0 && (
                <span className="flex items-center gap-1 text-green-400">
                  <Check className="w-3 h-3" />
                  Up to date
                </span>
              )}
          </div>

          {/* Changed files */}
          {totalChanges > 0 && (
            <div className="bg-ink-900/50 rounded-lg border border-ink-700/50 p-3">
              <p className="text-xs font-medium text-ink-300 mb-2">
                Changed Files
              </p>
              <div className="max-h-40 overflow-y-auto space-y-0.5">
                {gitStatus.staged.map((f) => (
                  <div
                    key={`s-${f}`}
                    className="flex items-center gap-2 text-xs py-0.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                    <span className="text-ink-300 truncate font-mono">{f}</span>
                    <span className="text-green-400 text-[10px] ml-auto flex-shrink-0">
                      staged
                    </span>
                  </div>
                ))}
                {gitStatus.unstaged.map((f) => (
                  <div
                    key={`u-${f}`}
                    className="flex items-center gap-2 text-xs py-0.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    <span className="text-ink-300 truncate font-mono">{f}</span>
                    <span className="text-amber-400 text-[10px] ml-auto flex-shrink-0">
                      modified
                    </span>
                  </div>
                ))}
                {gitStatus.untracked.map((f) => (
                  <div
                    key={`t-${f}`}
                    className="flex items-center gap-2 text-xs py-0.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                    <span className="text-ink-300 truncate font-mono">{f}</span>
                    <span className="text-blue-400 text-[10px] ml-auto flex-shrink-0">
                      new
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Commit */}
          {totalChanges > 0 && (
            <div className="flex gap-2">
              <input
                type="text"
                value={commitMsg}
                onChange={(e) => setCommitMsg(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleStageAndCommit()
                }
                placeholder="Commit message..."
                className="flex-1 bg-ink-900 border border-ink-600 rounded-lg px-3 py-1.5 text-xs text-ink-50 placeholder-ink-500 focus:border-accent focus:outline-none"
              />
              <button
                onClick={handleStageAndCommit}
                disabled={!commitMsg.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent hover:bg-accent-hover text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-3.5 h-3.5" />
                Commit All
              </button>
            </div>
          )}

          {/* Remote */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-medium text-ink-400 flex items-center gap-1.5">
                <Link className="w-3 h-3" />
                Remote
              </p>
              {remote && !editingRemote && (
                <button
                  onClick={() => {
                    setRemoteInput(remote);
                    setEditingRemote(true);
                  }}
                  className="text-[10px] text-ink-500 hover:text-ink-300 transition-colors"
                >
                  Edit
                </button>
              )}
            </div>
            {!remote || editingRemote ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={remoteInput}
                  onChange={(e) => setRemoteInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSetRemote()
                  }
                  placeholder="https://github.com/user/repo.git"
                  className="flex-1 bg-ink-900 border border-ink-600 rounded-lg px-3 py-1.5 text-xs text-ink-50 font-mono placeholder-ink-500 focus:border-accent focus:outline-none"
                />
                <button
                  onClick={handleSetRemote}
                  disabled={!remoteInput.trim()}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent hover:bg-accent-hover text-white transition-colors disabled:opacity-50"
                >
                  Save
                </button>
                {editingRemote && (
                  <button
                    onClick={() => setEditingRemote(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-ink-400 hover:text-ink-50 hover:bg-ink-700 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-ink-500 font-mono truncate">
                {remote}
              </p>
            )}
          </div>

          {/* Push */}
          {remote && (
            <button
              onClick={handlePush}
              disabled={pushing || gitStatus.ahead === 0}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                gitStatus.ahead > 0
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-ink-800 text-ink-500 cursor-not-allowed"
              }`}
            >
              {pushing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ArrowUpCircle className="w-3.5 h-3.5" />
              )}
              {pushing
                ? "Pushing..."
                : gitStatus.ahead > 0
                ? `Push ${gitStatus.ahead} commit${
                    gitStatus.ahead !== 1 ? "s" : ""
                  }`
                : "Nothing to push"}
            </button>
          )}

          {/* Recent commits */}
          {gitLog.length > 0 && (
            <div className="bg-ink-900/50 rounded-lg border border-ink-700/50 p-3">
              <p className="text-xs font-medium text-ink-300 mb-2">
                Recent Commits
              </p>
              <div className="space-y-1.5">
                {gitLog.slice(0, 5).map((entry) => (
                  <div
                    key={entry.hash}
                    className="flex items-start gap-2 text-xs"
                  >
                    <GitCommit className="w-3 h-3 text-ink-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-ink-300 truncate">{entry.message}</p>
                      <p className="text-ink-600 text-[10px]">
                        {entry.shortHash} &middot; {entry.author} &middot;{" "}
                        {entry.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
