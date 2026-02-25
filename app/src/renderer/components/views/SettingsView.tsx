import { useState, useEffect, useCallback } from "react";
import { Save, Plus, Trash2, Sparkles, Download, RefreshCw, ExternalLink } from "lucide-react";
import { useProjectStore } from "../../stores/project";
import { useAIStore, type AIConfig } from "../../stores/ai";
import { useNotificationStore } from "../../stores/notifications";
import ContentTypeManager from "../settings/ContentTypeManager";
import ComponentManager from "../settings/ComponentManager";

interface SiteConfig {
  name: string;
  tagline: string;
  url: string;
  description: string;
  phone: string;
  email: string;
  address: { street: string; city: string; state: string; zip: string };
  social: { facebook: string; linkedin: string; instagram: string };
  gtm_id: string;
}

interface NavConfig {
  main: Array<{ label: string; url: string }>;
}

const defaultSite: SiteConfig = {
  name: "",
  tagline: "",
  url: "",
  description: "",
  phone: "",
  email: "",
  address: { street: "", city: "", state: "", zip: "" },
  social: { facebook: "", linkedin: "", instagram: "" },
  gtm_id: "",
};

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink-400 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-ink-900 border border-ink-600 rounded-lg px-3 py-2 text-sm text-ink-50 focus:border-accent focus:outline-none"
      />
    </div>
  );
}

interface UpdateInfo {
  available: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseUrl: string;
  releaseNotes: string;
}

function UpdateSection() {
  const [checking, setChecking] = useState(false);
  const [update, setUpdate] = useState<UpdateInfo | null>(null);
  const addToast = useNotificationStore((s) => s.addToast);

  const handleCheck = async () => {
    setChecking(true);
    try {
      const info = await window.ink.updates.check();
      setUpdate(info);
      if (!info.available) {
        addToast("success", "You're on the latest version!");
      }
    } catch {
      addToast("error", "Failed to check for updates");
    } finally {
      setChecking(false);
    }
  };

  return (
    <section>
      <h3 className="text-sm font-semibold text-ink-300 mb-3">
        About & Updates
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ink-200">Ink</p>
            <p className="text-xs text-ink-500">
              v{update?.currentVersion ?? "0.1.0-alpha.1"}
            </p>
          </div>
          <button
            onClick={handleCheck}
            disabled={checking}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-ink-800 text-ink-200 rounded-lg hover:bg-ink-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />
            {checking ? "Checking..." : "Check for Updates"}
          </button>
        </div>

        {update?.available && (
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
            <p className="text-sm text-ink-100 font-medium mb-1">
              v{update.latestVersion} is available!
            </p>
            {update.releaseNotes && (
              <p className="text-xs text-ink-400 mb-2 line-clamp-3">
                {update.releaseNotes}
              </p>
            )}
            <button
              onClick={() => window.ink.shell.openExternal(update.releaseUrl)}
              className="flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Update
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default function SettingsView() {
  const projectPath = useProjectStore((s) => s.current?.path);
  const addToast = useNotificationStore((s) => s.addToast);
  const [site, setSite] = useState<SiteConfig>(defaultSite);
  const [nav, setNav] = useState<NavConfig>({ main: [] });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // AI config (per-user, stored in userData)
  const aiConfig = useAIStore((s) => s.config);
  const aiConfigLoaded = useAIStore((s) => s.configLoaded);
  const loadAIConfig = useAIStore((s) => s.loadConfig);
  const saveAIConfig = useAIStore((s) => s.saveConfig);
  const [localAI, setLocalAI] = useState<AIConfig>({
    provider: "anthropic",
    apiKey: "",
    model: "claude-sonnet-4-20250514",
  });
  const [aiDirty, setAiDirty] = useState(false);
  const [aiSaving, setAiSaving] = useState(false);

  useEffect(() => {
    if (!projectPath) return;
    const siteJsonPath = `${projectPath}/src/_data/site.json`;
    const navJsonPath = `${projectPath}/src/_data/navigation.json`;
    Promise.all([
      window.ink.file.read(siteJsonPath).catch(() => "{}"),
      window.ink.file.read(navJsonPath).catch(() => '{"main":[]}'),
    ]).then(([siteRaw, navRaw]) => {
      setSite({ ...defaultSite, ...JSON.parse(siteRaw) });
      setNav(JSON.parse(navRaw));
      setLoaded(true);
      setDirty(false);
    });
  }, [projectPath]);

  // Load AI config
  useEffect(() => {
    if (!aiConfigLoaded) loadAIConfig();
  }, [aiConfigLoaded, loadAIConfig]);

  useEffect(() => {
    if (aiConfig) {
      setLocalAI(aiConfig);
    }
  }, [aiConfig]);

  const updateSite = useCallback(
    (updates: Partial<SiteConfig>) => {
      setSite((prev) => ({ ...prev, ...updates }));
      setDirty(true);
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!projectPath) return;
    setSaving(true);
    try {
      await window.ink.file.write(
        `${projectPath}/src/_data/site.json`,
        JSON.stringify(site, null, 2)
      );
      await window.ink.file.write(
        `${projectPath}/src/_data/navigation.json`,
        JSON.stringify(nav, null, 2)
      );
      setDirty(false);
      addToast("success", "Settings saved");
    } catch {
      addToast("error", "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }, [projectPath, site, nav]);

  if (!loaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-ink-500 text-sm animate-pulse">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-ink-700">
        <div>
          <h2 className="text-lg font-semibold text-ink-50">Settings</h2>
          <p className="text-xs text-ink-500 mt-0.5">Site configuration</p>
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
          {/* General */}
          <section>
            <h3 className="text-sm font-semibold text-ink-300 mb-3">General</h3>
            <div className="grid grid-cols-2 gap-4">
              <TextInput
                label="Site Name"
                value={site.name}
                onChange={(v) => updateSite({ name: v })}
              />
              <TextInput
                label="Tagline"
                value={site.tagline}
                onChange={(v) => updateSite({ tagline: v })}
              />
              <TextInput
                label="Site URL"
                value={site.url}
                onChange={(v) => updateSite({ url: v })}
              />
              <div className="col-span-2">
                <label className="block text-xs font-medium text-ink-400 mb-1">
                  Description
                </label>
                <textarea
                  value={site.description}
                  onChange={(e) => {
                    updateSite({ description: e.target.value });
                  }}
                  rows={2}
                  className="w-full bg-ink-900 border border-ink-600 rounded-lg px-3 py-2 text-sm text-ink-50 focus:border-accent focus:outline-none resize-none"
                />
              </div>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h3 className="text-sm font-semibold text-ink-300 mb-3">Contact</h3>
            <div className="grid grid-cols-2 gap-4">
              <TextInput
                label="Email"
                value={site.email}
                onChange={(v) => updateSite({ email: v })}
              />
              <TextInput
                label="Phone"
                value={site.phone}
                onChange={(v) => updateSite({ phone: v })}
              />
              <TextInput
                label="Street"
                value={site.address.street}
                onChange={(v) =>
                  updateSite({ address: { ...site.address, street: v } })
                }
              />
              <TextInput
                label="City"
                value={site.address.city}
                onChange={(v) =>
                  updateSite({ address: { ...site.address, city: v } })
                }
              />
              <TextInput
                label="State"
                value={site.address.state}
                onChange={(v) =>
                  updateSite({ address: { ...site.address, state: v } })
                }
              />
              <TextInput
                label="ZIP"
                value={site.address.zip}
                onChange={(v) =>
                  updateSite({ address: { ...site.address, zip: v } })
                }
              />
            </div>
          </section>

          {/* Social */}
          <section>
            <h3 className="text-sm font-semibold text-ink-300 mb-3">Social</h3>
            <div className="grid grid-cols-2 gap-4">
              <TextInput
                label="Facebook"
                value={site.social.facebook}
                onChange={(v) =>
                  updateSite({ social: { ...site.social, facebook: v } })
                }
              />
              <TextInput
                label="LinkedIn"
                value={site.social.linkedin}
                onChange={(v) =>
                  updateSite({ social: { ...site.social, linkedin: v } })
                }
              />
              <TextInput
                label="Instagram"
                value={site.social.instagram}
                onChange={(v) =>
                  updateSite({ social: { ...site.social, instagram: v } })
                }
              />
            </div>
          </section>

          {/* Analytics */}
          <section>
            <h3 className="text-sm font-semibold text-ink-300 mb-3">
              Analytics
            </h3>
            <div className="max-w-xs">
              <TextInput
                label="Google Tag Manager ID"
                value={site.gtm_id}
                onChange={(v) => updateSite({ gtm_id: v })}
              />
            </div>
          </section>

          {/* Content Types */}
          <section>
            <ContentTypeManager />
          </section>

          {/* Components */}
          <section>
            <ComponentManager />
          </section>

          {/* AI Assistant */}
          <section>
            <h3 className="text-sm font-semibold text-ink-300 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              AI Assistant
            </h3>
            <div className="space-y-4 max-w-sm">
              <div>
                <label className="block text-xs font-medium text-ink-400 mb-1">
                  Provider
                </label>
                <select
                  value={localAI.provider}
                  onChange={(e) => {
                    const provider = e.target.value as "anthropic" | "openai";
                    setLocalAI((prev) => ({
                      ...prev,
                      provider,
                      model:
                        provider === "anthropic"
                          ? "claude-sonnet-4-20250514"
                          : "gpt-4o",
                    }));
                    setAiDirty(true);
                  }}
                  className="w-full bg-ink-900 border border-ink-600 rounded-lg px-3 py-2 text-sm text-ink-50 focus:border-accent focus:outline-none"
                >
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="openai">OpenAI (GPT)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-400 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={localAI.apiKey}
                  onChange={(e) => {
                    setLocalAI((prev) => ({ ...prev, apiKey: e.target.value }));
                    setAiDirty(true);
                  }}
                  placeholder={
                    localAI.provider === "anthropic" ? "sk-ant-..." : "sk-..."
                  }
                  className="w-full bg-ink-900 border border-ink-600 rounded-lg px-3 py-2 text-sm text-ink-50 focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-400 mb-1">
                  Model
                </label>
                <select
                  value={localAI.model}
                  onChange={(e) => {
                    setLocalAI((prev) => ({ ...prev, model: e.target.value }));
                    setAiDirty(true);
                  }}
                  className="w-full bg-ink-900 border border-ink-600 rounded-lg px-3 py-2 text-sm text-ink-50 focus:border-accent focus:outline-none"
                >
                  {localAI.provider === "anthropic" ? (
                    <>
                      <option value="claude-sonnet-4-20250514">
                        Claude Sonnet 4
                      </option>
                      <option value="claude-haiku-4-20250414">
                        Claude Haiku 4
                      </option>
                    </>
                  ) : (
                    <>
                      <option value="gpt-4o">GPT-4o</option>
                      <option value="gpt-4o-mini">GPT-4o Mini</option>
                    </>
                  )}
                </select>
              </div>

              <button
                onClick={async () => {
                  setAiSaving(true);
                  try {
                    await saveAIConfig(localAI);
                    setAiDirty(false);
                  } finally {
                    setAiSaving(false);
                  }
                }}
                disabled={!aiDirty || aiSaving}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  aiDirty
                    ? "bg-accent hover:bg-accent-hover text-white"
                    : "bg-ink-800 text-ink-500 cursor-not-allowed"
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                {aiSaving ? "Saving..." : "Save AI Settings"}
              </button>
            </div>
          </section>

          {/* Navigation */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-ink-300">Navigation</h3>
              <button
                onClick={() => {
                  setNav((prev) => ({
                    ...prev,
                    main: [...prev.main, { label: "", url: "" }],
                  }));
                  setDirty(true);
                }}
                className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover"
              >
                <Plus className="w-3 h-3" /> Add Link
              </button>
            </div>
            <div className="space-y-2">
              {nav.main.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Label"
                    value={item.label}
                    onChange={(e) => {
                      const updated = [...nav.main];
                      updated[i] = { ...updated[i], label: e.target.value };
                      setNav({ ...nav, main: updated });
                      setDirty(true);
                    }}
                    className="flex-1 bg-ink-900 border border-ink-600 rounded-lg px-3 py-2 text-sm text-ink-50 focus:border-accent focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="/url/"
                    value={item.url}
                    onChange={(e) => {
                      const updated = [...nav.main];
                      updated[i] = { ...updated[i], url: e.target.value };
                      setNav({ ...nav, main: updated });
                      setDirty(true);
                    }}
                    className="flex-1 bg-ink-900 border border-ink-600 rounded-lg px-3 py-2 text-sm text-ink-50 focus:border-accent focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      setNav((prev) => ({
                        ...prev,
                        main: prev.main.filter((_, j) => j !== i),
                      }));
                      setDirty(true);
                    }}
                    className="text-ink-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* About & Updates */}
          <UpdateSection />

          {/* Project Info */}
          <section>
            <h3 className="text-sm font-semibold text-ink-300 mb-3">
              Project
            </h3>
            <p className="text-xs text-ink-500 font-mono">{projectPath}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
