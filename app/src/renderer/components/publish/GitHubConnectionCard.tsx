import { useEffect } from "react";
import { Github, Loader2, Copy, ExternalLink, LogOut } from "lucide-react";
import { useGitHubStore } from "../../stores/github";

export default function GitHubConnectionCard() {
  const user = useGitHubStore((s) => s.user);
  const connected = useGitHubStore((s) => s.connected);
  const authLoaded = useGitHubStore((s) => s.authLoaded);
  const loadAuth = useGitHubStore((s) => s.loadAuth);
  const connect = useGitHubStore((s) => s.connect);
  const disconnect = useGitHubStore((s) => s.disconnect);
  const deviceFlowPhase = useGitHubStore((s) => s.deviceFlowPhase);
  const userCode = useGitHubStore((s) => s.userCode);
  const verificationUri = useGitHubStore((s) => s.verificationUri);
  const authError = useGitHubStore((s) => s.authError);

  useEffect(() => {
    if (!authLoaded) loadAuth();
  }, [authLoaded, loadAuth]);

  const handleCopyCode = () => {
    if (userCode) {
      navigator.clipboard.writeText(userCode);
    }
  };

  if (!authLoaded) {
    return (
      <div className="bg-ink-800/50 rounded-lg border border-ink-700/50 p-6 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-ink-400" />
      </div>
    );
  }

  // Connected state
  if (connected && user) {
    return (
      <div className="bg-ink-800/50 rounded-lg border border-ink-700/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar_url}
              alt={user.login}
              className="w-8 h-8 rounded-full border border-ink-600"
            />
            <div>
              <p className="text-sm font-medium text-ink-50">{user.name || user.login}</p>
              <p className="text-xs text-ink-400">@{user.login}</p>
            </div>
          </div>
          <button
            onClick={disconnect}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-ink-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  // Device flow in progress
  if (
    deviceFlowPhase === "requesting_code" ||
    deviceFlowPhase === "waiting_for_auth" ||
    deviceFlowPhase === "polling"
  ) {
    return (
      <div className="bg-ink-800/50 rounded-lg border border-ink-700/50 p-6">
        {deviceFlowPhase === "requesting_code" ? (
          <div className="flex items-center justify-center gap-2 text-ink-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Connecting to GitHub...</span>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-ink-300 mb-3">
              Enter this code on GitHub to connect your account:
            </p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <code className="text-2xl font-bold text-ink-50 tracking-widest bg-ink-900 px-4 py-2 rounded-lg border border-ink-600">
                {userCode}
              </code>
              <button
                onClick={handleCopyCode}
                className="p-2 rounded-lg text-ink-400 hover:text-ink-50 hover:bg-ink-700 transition-colors"
                title="Copy code"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => window.ink.shell.openExternal(verificationUri)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-accent hover:bg-accent-hover text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open GitHub
            </button>
            <div className="flex items-center justify-center gap-2 mt-4 text-ink-500 text-xs">
              <Loader2 className="w-3 h-3 animate-spin" />
              Waiting for authorization...
            </div>
          </div>
        )}
      </div>
    );
  }

  // Error state
  if (deviceFlowPhase === "error") {
    return (
      <div className="bg-ink-800/50 rounded-lg border border-red-800/50 p-6 text-center">
        <p className="text-sm text-red-400 mb-3">{authError}</p>
        <button
          onClick={connect}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-accent hover:bg-accent-hover text-white transition-colors"
        >
          <Github className="w-3.5 h-3.5" />
          Try Again
        </button>
      </div>
    );
  }

  // Disconnected — show connect button
  return (
    <div className="bg-ink-800/50 rounded-lg border border-ink-700/50 p-6 text-center">
      <Github className="w-8 h-8 text-ink-500 mx-auto mb-3" />
      <p className="text-sm text-ink-300 font-medium mb-1">
        Connect to GitHub
      </p>
      <p className="text-xs text-ink-500 mb-4">
        Push your site to GitHub and deploy with one click
      </p>
      <button
        onClick={connect}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-ink-100 text-ink-900 hover:bg-ink-200 transition-colors"
      >
        <Github className="w-3.5 h-3.5" />
        Connect GitHub Account
      </button>
    </div>
  );
}
