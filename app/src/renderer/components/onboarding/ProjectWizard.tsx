import { useState, useEffect } from "react";
import {
  FileText,
  BookOpen,
  Users,
  Briefcase,
  MapPin,
  Star,
  Layout,
  HelpCircle,
  Sparkles,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Upload,
  Palette,
  Key,
  X,
} from "lucide-react";
import { useProjectStore } from "../../stores/project";
import { useUIStore } from "../../stores/ui";
import { useAIStore, type AIConfig } from "../../stores/ai";

const CONTENT_TYPES = [
  {
    id: "blog",
    label: "Blog",
    desc: "Posts with dates, categories, and author info",
    icon: FileText,
  },
  {
    id: "services",
    label: "Services",
    desc: "Service offerings with descriptions and pricing",
    icon: Briefcase,
    default: true,
  },
  {
    id: "team",
    label: "Team / Staff",
    desc: "Team member profiles with photos and bios",
    icon: Users,
    default: true,
  },
  {
    id: "docs",
    label: "Documentation",
    desc: "Organized docs with sidebar navigation",
    icon: BookOpen,
  },
  {
    id: "features",
    label: "Features",
    desc: "Product or service feature highlights",
    icon: Star,
  },
  {
    id: "service-areas",
    label: "Service Areas",
    desc: "Location-based pages for local SEO",
    icon: MapPin,
  },
  {
    id: "portfolio",
    label: "Portfolio / Projects",
    desc: "Showcase work with images and case studies",
    icon: Layout,
  },
  {
    id: "faq",
    label: "FAQ",
    desc: "Frequently asked questions organized by topic",
    icon: HelpCircle,
  },
];

const STEP_LABELS = ["Project details", "Content structure", "Branding & AI"];

export default function ProjectWizard() {
  const setWizardOpen = useUIStore((s) => s.setWizardOpen);
  const setView = useUIStore((s) => s.setView);
  const createProject = useProjectStore((s) => s.createProject);
  const loading = useProjectStore((s) => s.loading);

  // AI config
  const aiConfig = useAIStore((s) => s.config);
  const aiConfigLoaded = useAIStore((s) => s.configLoaded);
  const loadAIConfig = useAIStore((s) => s.loadConfig);
  const saveAIConfig = useAIStore((s) => s.saveConfig);

  const [step, setStep] = useState(1);

  // Step 1: Basic info
  const [name, setName] = useState("");
  const [folder, setFolder] = useState("");
  const [siteName, setSiteName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");

  // Step 2: Content types + description
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(
    new Set(CONTENT_TYPES.filter((t) => t.default).map((t) => t.id))
  );
  const [siteDescription, setSiteDescription] = useState("");

  // Step 3: CSS framework + Branding + AI
  const [useTailwind, setUseTailwind] = useState(false);
  const [logoPath, setLogoPath] = useState("");
  const [logoName, setLogoName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [secondaryColor, setSecondaryColor] = useState("#1e293b");
  const [localAI, setLocalAI] = useState<AIConfig>({
    provider: "anthropic",
    apiKey: "",
    model: "claude-sonnet-4-20250514",
  });
  const hasAIKey = !!(aiConfig?.apiKey);

  const [error, setError] = useState("");
  const [scaffolding, setScaffolding] = useState(false);

  // Load AI config on mount
  useEffect(() => {
    if (!aiConfigLoaded) loadAIConfig();
  }, [aiConfigLoaded, loadAIConfig]);

  useEffect(() => {
    if (aiConfig) {
      setLocalAI(aiConfig);
    }
  }, [aiConfig]);

  const toggleType = (id: string) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleNext1 = () => {
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }
    if (!folder.trim()) {
      setError("Project folder is required.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleNext2 = () => {
    setError("");
    setStep(3);
  };

  const handlePickLogo = async () => {
    try {
      const picked = await window.ink.dialog.pickImage();
      if (picked) {
        setLogoPath(picked);
        // Extract just the file name for display
        const parts = picked.replace(/\\/g, "/").split("/");
        setLogoName(parts[parts.length - 1]);
      }
    } catch (err) {
      console.error("Logo picker error:", err);
      setError("Failed to open file picker.");
    }
  };

  const [scaffoldStatus, setScaffoldStatus] = useState("");

  const handleCreate = async () => {
    setError("");
    setScaffolding(true);
    try {
      // Save AI config if key was entered or changed in the wizard
      if (localAI.apiKey.trim()) {
        await saveAIConfig(localAI);
      }

      setScaffoldStatus("Creating project...");
      const projectPath = await createProject({
        name: name.trim(),
        path: folder.trim(),
        siteName: siteName.trim() || name.trim(),
        siteUrl: siteUrl.trim() || "https://example.com",
        tailwind: useTailwind,
      });

      // Apply branding (logo + colors + site metadata)
      setScaffoldStatus("Applying branding...");
      try {
        await window.ink.project.applyBranding(projectPath, {
          logoPath: logoPath || undefined,
          brandColors: { primary: primaryColor, secondary: secondaryColor },
          siteDescription: siteDescription.trim(),
          siteName: siteName.trim() || name.trim(),
          siteUrl: siteUrl.trim() || "https://example.com",
        });
      } catch (brandingErr) {
        console.error("Branding error:", brandingErr);
      }

      // Scaffold content types via CLI
      // Add all selected types (CLI gracefully skips types already in the starter)
      setScaffoldStatus("Setting up content types...");
      const allTypes = Array.from(selectedTypes);
      for (const typeId of allTypes) {
        try {
          const result = await window.ink.cli.addContentType(projectPath, typeId);
          if (!result.success) {
            console.warn(`CLI addContentType "${typeId}" exited with code ${result.exitCode}:`, result.stderr);
          }
        } catch (err) {
          console.error(`Failed to add content type ${typeId}:`, err);
        }
      }

      // Remove starter defaults that the user deselected
      const starterDefaults = ["services", "team"];
      for (const typeId of starterDefaults) {
        if (!selectedTypes.has(typeId)) {
          try {
            await window.ink.cli.removeContentType(projectPath, typeId);
          } catch (err) {
            console.error(`Failed to remove content type ${typeId}:`, err);
          }
        }
      }

      // Generate AI content if configured and description was provided
      const aiReady = localAI.apiKey.trim() || hasAIKey;
      if (aiReady && siteDescription.trim()) {
        setScaffoldStatus("Generating content with AI...");
        try {
          const result = await window.ink.ai.generateSiteContent({
            projectPath,
            siteName: siteName.trim() || name.trim(),
            siteUrl: siteUrl.trim() || "https://example.com",
            siteDescription: siteDescription.trim(),
            contentTypes: allTypes,
          });
          if (!result.success) {
            console.warn("AI content generation failed:", result.error);
          }
        } catch (err) {
          console.error("AI content generation error:", err);
        }
      }

      setWizardOpen(false);
      setView("content");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to create project.";
      setError(msg);
      setScaffolding(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-ink-800 rounded-xl border border-ink-600 w-full max-w-lg mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-700">
          <div>
            <h2 className="text-lg font-semibold text-ink-50">New Project</h2>
            <p className="text-xs text-ink-500 mt-0.5">
              Step {step} of 3 — {STEP_LABELS[step - 1]}
            </p>
          </div>
          <button
            onClick={() => setWizardOpen(false)}
            className="text-ink-400 hover:text-ink-50 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* ===== Step 1: Basic Info ===== */}
        {step === 1 && (
          <>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink-400 mb-1.5">
                  Project Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="my-website"
                  className="w-full px-3 py-2 bg-ink-900 border border-ink-600 rounded-lg text-sm text-ink-50 placeholder:text-ink-500 focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-400 mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  placeholder="C:\projects"
                  className="w-full px-3 py-2 bg-ink-900 border border-ink-600 rounded-lg text-sm text-ink-50 placeholder:text-ink-500 focus:outline-none focus:border-accent"
                />
                <p className="text-xs text-ink-500 mt-1">
                  A new folder will be created here with the project name.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-400 mb-1.5">
                  Site Name
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="My Business"
                  className="w-full px-3 py-2 bg-ink-900 border border-ink-600 rounded-lg text-sm text-ink-50 placeholder:text-ink-500 focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-400 mb-1.5">
                  Site URL
                </label>
                <input
                  type="text"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  placeholder="https://mybusiness.com"
                  className="w-full px-3 py-2 bg-ink-900 border border-ink-600 rounded-lg text-sm text-ink-50 placeholder:text-ink-500 focus:outline-none focus:border-accent"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-ink-700">
              <button
                onClick={() => setWizardOpen(false)}
                className="px-4 py-2 text-sm text-ink-400 hover:text-ink-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNext1}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors"
              >
                Next
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}

        {/* ===== Step 2: Content Types + Description ===== */}
        {step === 2 && (
          <>
            <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-ink-400 mb-2">
                  Content Types
                </label>
                <p className="text-xs text-ink-500 mb-3">
                  Select the types of content your site will have. Ink will set
                  up the file structure, layouts, and sample content for each.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {CONTENT_TYPES.map((type) => {
                    const isSelected = selectedTypes.has(type.id);
                    return (
                      <button
                        key={type.id}
                        onClick={() => toggleType(type.id)}
                        className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-colors ${
                          isSelected
                            ? "bg-accent/10 border-accent/40 text-ink-50"
                            : "bg-ink-900/50 border-ink-700/50 text-ink-400 hover:border-ink-600"
                        }`}
                      >
                        <type.icon
                          className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                            isSelected ? "text-accent" : "text-ink-500"
                          }`}
                        />
                        <div className="min-w-0">
                          <p
                            className={`text-xs font-medium ${
                              isSelected ? "text-ink-50" : "text-ink-300"
                            }`}
                          >
                            {type.label}
                          </p>
                          <p className="text-[10px] text-ink-500 mt-0.5 leading-tight">
                            {type.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-400 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Describe your site
                  </span>
                </label>
                <textarea
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  placeholder="e.g. A plumbing company in Denver, CO that offers residential and commercial plumbing services. We want to highlight our team, service areas, and customer reviews."
                  rows={3}
                  className="w-full px-3 py-2 bg-ink-900 border border-ink-600 rounded-lg text-sm text-ink-50 placeholder:text-ink-500 focus:outline-none focus:border-accent resize-none"
                />
                <p className="text-xs text-ink-500 mt-1">
                  The AI will use this to customize your site structure, sample
                  content, and SEO settings.
                </p>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>

            <div className="flex justify-between gap-3 px-6 py-4 border-t border-ink-700">
              <button
                onClick={() => {
                  setStep(1);
                  setError("");
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-ink-400 hover:text-ink-50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
              <button
                onClick={handleNext2}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors"
              >
                Next
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}

        {/* ===== Step 3: Branding & AI ===== */}
        {step === 3 && (
          <>
            <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
              {/* CSS Framework */}
              <div>
                <label className="block text-xs font-medium text-ink-400 mb-2">
                  CSS Framework
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUseTailwind(false)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      !useTailwind
                        ? "bg-accent/10 border-accent/40 text-ink-50"
                        : "bg-ink-900/50 border-ink-700/50 text-ink-400 hover:border-ink-600"
                    }`}
                  >
                    <p className={`text-xs font-medium ${!useTailwind ? "text-ink-50" : "text-ink-300"}`}>
                      Vanilla CSS
                    </p>
                    <p className="text-[10px] text-ink-500 mt-0.5">
                      Design tokens with CSS custom properties
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseTailwind(true)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      useTailwind
                        ? "bg-accent/10 border-accent/40 text-ink-50"
                        : "bg-ink-900/50 border-ink-700/50 text-ink-400 hover:border-ink-600"
                    }`}
                  >
                    <p className={`text-xs font-medium ${useTailwind ? "text-ink-50" : "text-ink-300"}`}>
                      Tailwind CSS
                    </p>
                    <p className="text-[10px] text-ink-500 mt-0.5">
                      Utility-first CSS with Tailwind
                    </p>
                  </button>
                </div>
              </div>

              {/* Logo */}
              <div>
                <label className="block text-xs font-medium text-ink-400 mb-2 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  Logo
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePickLogo}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-ink-900 border border-ink-600 text-ink-300 hover:border-ink-500 transition-colors"
                  >
                    <Upload className="w-3 h-3" />
                    {logoName ? "Change" : "Choose file"}
                  </button>
                  {logoName ? (
                    <div className="flex items-center gap-2 text-xs text-ink-300">
                      <span className="truncate max-w-[200px]">{logoName}</span>
                      <button
                        onClick={() => {
                          setLogoPath("");
                          setLogoName("");
                        }}
                        className="text-ink-500 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-ink-500">
                      Optional — PNG, SVG, or JPG
                    </span>
                  )}
                </div>
              </div>

              {/* Brand Colors */}
              <div>
                <label className="block text-xs font-medium text-ink-400 mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  Brand Colors
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-ink-500 mb-1.5">
                      Primary (buttons, links)
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-ink-600 cursor-pointer bg-transparent [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch-wrapper]:p-0.5"
                        />
                      </div>
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setPrimaryColor(v);
                        }}
                        className="flex-1 px-2.5 py-1.5 bg-ink-900 border border-ink-600 rounded-lg text-xs text-ink-50 font-mono focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-ink-500 mb-1.5">
                      Secondary (headings, nav)
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <input
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-ink-600 cursor-pointer bg-transparent [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch-wrapper]:p-0.5"
                        />
                      </div>
                      <input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (/^#[0-9a-fA-F]{0,6}$/.test(v))
                            setSecondaryColor(v);
                        }}
                        className="flex-1 px-2.5 py-1.5 bg-ink-900 border border-ink-600 rounded-lg text-xs text-ink-50 font-mono focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                </div>
                {/* Color preview */}
                <div className="flex gap-1 mt-3">
                  <div
                    className="h-6 flex-1 rounded-l-lg"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <div
                    className="h-6 flex-1"
                    style={{ backgroundColor: secondaryColor }}
                  />
                  <div className="h-6 flex-1 rounded-r-lg bg-ink-50" />
                </div>
              </div>

              {/* AI Setup */}
              <div className="border border-ink-700/50 rounded-lg p-4 bg-ink-900/30">
                <label className="block text-xs font-medium text-ink-400 mb-2 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  AI Assistant
                  {hasAIKey && (
                    <span className="text-[10px] text-emerald-400 font-normal">
                      Configured
                    </span>
                  )}
                  {!hasAIKey && (
                    <span className="text-[10px] text-ink-500 font-normal">
                      (optional)
                    </span>
                  )}
                </label>
                <p className="text-[11px] text-ink-500 mb-3">
                  {hasAIKey
                    ? "Your AI assistant is configured. You can update the settings below."
                    : "Add an API key to enable the AI assistant for content creation, SEO optimization, and site management."}
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-ink-500 mb-1">
                      Provider
                    </label>
                    <select
                      value={localAI.provider}
                      onChange={(e) => {
                        const provider = e.target.value as
                          | "anthropic"
                          | "openai";
                        setLocalAI((prev) => ({
                          ...prev,
                          provider,
                          model:
                            provider === "anthropic"
                              ? "claude-sonnet-4-20250514"
                              : "gpt-4o",
                        }));
                      }}
                      className="w-full bg-ink-900 border border-ink-600 rounded-lg px-2.5 py-1.5 text-xs text-ink-50 focus:border-accent focus:outline-none"
                    >
                      <option value="anthropic">Anthropic (Claude)</option>
                      <option value="openai">OpenAI (GPT)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-ink-500 mb-1">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={localAI.apiKey}
                      onChange={(e) =>
                        setLocalAI((prev) => ({
                          ...prev,
                          apiKey: e.target.value,
                        }))
                      }
                      placeholder={
                        localAI.provider === "anthropic"
                          ? "sk-ant-..."
                          : "sk-..."
                      }
                      className="w-full bg-ink-900 border border-ink-600 rounded-lg px-2.5 py-1.5 text-xs text-ink-50 focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-ink-500 mb-1">
                      Model
                    </label>
                    <select
                      value={localAI.model}
                      onChange={(e) =>
                        setLocalAI((prev) => ({
                          ...prev,
                          model: e.target.value,
                        }))
                      }
                      className="w-full bg-ink-900 border border-ink-600 rounded-lg px-2.5 py-1.5 text-xs text-ink-50 focus:border-accent focus:outline-none"
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
                </div>

                <p className="text-[10px] text-ink-500 mt-2">
                  You can change this later in Settings. Keys are stored
                  locally and never sent to Ink servers.
                </p>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>

            {/* Footer */}
            <div className="flex justify-between gap-3 px-6 py-4 border-t border-ink-700">
              <button
                onClick={() => {
                  setStep(2);
                  setError("");
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-ink-400 hover:text-ink-50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={loading || scaffolding}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {scaffolding ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {scaffoldStatus || "Setting up..."}
                  </>
                ) : loading ? (
                  "Creating..."
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Create Project
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
