import { useState } from "react";
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
} from "lucide-react";
import { useProjectStore } from "../../stores/project";
import { useUIStore } from "../../stores/ui";

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

export default function ProjectWizard() {
  const setWizardOpen = useUIStore((s) => s.setWizardOpen);
  const setView = useUIStore((s) => s.setView);
  const createProject = useProjectStore((s) => s.createProject);
  const loading = useProjectStore((s) => s.loading);

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

  const [error, setError] = useState("");
  const [scaffolding, setScaffolding] = useState(false);

  const toggleType = (id: string) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleNext = () => {
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

  const handleCreate = async () => {
    setError("");
    setScaffolding(true);
    try {
      const projectPath = await createProject({
        name: name.trim(),
        path: folder.trim(),
        siteName: siteName.trim() || name.trim(),
        siteUrl: siteUrl.trim() || "https://example.com",
        contentTypes: Array.from(selectedTypes),
        siteDescription: siteDescription.trim(),
      });

      // AI scaffolding happens in the background after project opens
      // The main process handles it via project:scaffold IPC
      if (siteDescription.trim() || selectedTypes.size > 0) {
        try {
          await window.ink.project.scaffold(
            projectPath,
            Array.from(selectedTypes),
            siteDescription.trim(),
            siteName.trim() || name.trim(),
            siteUrl.trim() || "https://example.com"
          );
        } catch {
          // Scaffolding failure is non-fatal — project is still created
        }
      }

      setWizardOpen(false);
      setView("content");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create project.";
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
            <h2 className="text-lg font-semibold text-white">New Project</h2>
            <p className="text-xs text-ink-500 mt-0.5">
              Step {step} of 2 —{" "}
              {step === 1 ? "Project details" : "Content structure"}
            </p>
          </div>
          <button
            onClick={() => setWizardOpen(false)}
            className="text-ink-400 hover:text-white text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {step === 1 && (
          <>
            {/* Step 1: Basic Info */}
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
                  className="w-full px-3 py-2 bg-ink-900 border border-ink-600 rounded-lg text-sm text-white placeholder:text-ink-500 focus:outline-none focus:border-accent"
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
                  className="w-full px-3 py-2 bg-ink-900 border border-ink-600 rounded-lg text-sm text-white placeholder:text-ink-500 focus:outline-none focus:border-accent"
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
                  className="w-full px-3 py-2 bg-ink-900 border border-ink-600 rounded-lg text-sm text-white placeholder:text-ink-500 focus:outline-none focus:border-accent"
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
                  className="w-full px-3 py-2 bg-ink-900 border border-ink-600 rounded-lg text-sm text-white placeholder:text-ink-500 focus:outline-none focus:border-accent"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-ink-700">
              <button
                onClick={() => setWizardOpen(false)}
                className="px-4 py-2 text-sm text-ink-400 hover:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors"
              >
                Next
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {/* Step 2: Content Types + Description */}
            <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
              {/* Content Types */}
              <div>
                <label className="block text-xs font-medium text-ink-400 mb-2">
                  Content Types
                </label>
                <p className="text-xs text-ink-500 mb-3">
                  Select the types of content your site will have. The AI
                  assistant will set up the file structure, layouts, and sample
                  content for each.
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
                            ? "bg-accent/10 border-accent/40 text-white"
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
                              isSelected ? "text-white" : "text-ink-300"
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

              {/* Site Description */}
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
                  className="w-full px-3 py-2 bg-ink-900 border border-ink-600 rounded-lg text-sm text-white placeholder:text-ink-500 focus:outline-none focus:border-accent resize-none"
                />
                <p className="text-xs text-ink-500 mt-1">
                  The AI will use this to customize your site structure, sample
                  content, and SEO settings.
                </p>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>

            {/* Footer */}
            <div className="flex justify-between gap-3 px-6 py-4 border-t border-ink-700">
              <button
                onClick={() => {
                  setStep(1);
                  setError("");
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-ink-400 hover:text-white rounded-lg transition-colors"
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
                    Setting up...
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
