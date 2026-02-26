import { useState, useEffect, useCallback } from "react";
import {
  Puzzle,
  FileText,
  Download,
  ClipboardCopy,
  Check,
  Plus,
  Loader2,
} from "lucide-react";
import { useNotificationStore } from "../../stores/notifications";
import { useEditorStore } from "../../stores/editor";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ComponentEntry {
  name: string;
  label: string;
  description: string;
  category: string;
  tier: number;
  usage: string;
  installed: boolean;
}

interface PageTemplateEntry {
  id: string;
  label: string;
  description: string;
  category: string;
  requires: string[];
}

type Tab = "components" | "templates";

// ---------------------------------------------------------------------------
// Category labels
// ---------------------------------------------------------------------------

const COMPONENT_CATEGORIES: Record<string, string> = {
  content: "Content",
  cta: "CTA & Forms",
  "social-proof": "Social Proof",
  media: "Media",
};

const TEMPLATE_CATEGORIES: Record<string, string> = {
  marketing: "Marketing",
  informational: "Informational",
  cta: "CTA & Forms",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GalleryView() {
  const [tab, setTab] = useState<Tab>("components");
  const [components, setComponents] = useState<ComponentEntry[]>([]);
  const [templates, setTemplates] = useState<PageTemplateEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [installing, setInstalling] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [creatingTemplate, setCreatingTemplate] = useState<string | null>(null);
  const [templateTitle, setTemplateTitle] = useState("");

  const addToast = useNotificationStore((s) => s.addToast);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [comps, tmpls] = await Promise.all([
        window.ink.templates.listComponents(),
        window.ink.templates.listPageTemplates(),
      ]);
      setComponents(comps);
      setTemplates(tmpls);
    } catch {
      /* non-critical */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset filter when switching tabs
  useEffect(() => {
    setFilter("all");
  }, [tab]);

  const categories =
    tab === "components" ? COMPONENT_CATEGORIES : TEMPLATE_CATEGORIES;

  const filteredComponents =
    filter === "all"
      ? components
      : components.filter((c) => c.category === filter);

  const filteredTemplates =
    filter === "all"
      ? templates
      : templates.filter((t) => t.category === filter);

  // --- Actions ---

  const handleCopySnippet = async (comp: ComponentEntry) => {
    // Try to insert at cursor in the active editor
    const activeTab = useEditorStore.getState().activeTabPath;
    if (activeTab) {
      // Dispatch a custom event that MarkdownEditor listens for
      window.dispatchEvent(
        new CustomEvent("ink:insertText", { detail: comp.usage })
      );
      addToast("success", `Inserted ${comp.label} snippet at cursor`);
    } else {
      await navigator.clipboard.writeText(comp.usage);
      setCopied(comp.name);
      setTimeout(() => setCopied(null), 2000);
      addToast("success", `Copied ${comp.label} snippet to clipboard`);
    }
  };

  const handleInstall = async (name: string) => {
    setInstalling(name);
    try {
      const result = await window.ink.templates.installComponent(name);
      if (result.success) {
        addToast("success", `Installed ${name} component`);
        // Refresh component list to update installed status
        const comps = await window.ink.templates.listComponents();
        setComponents(comps);
      } else {
        addToast("error", result.error || "Failed to install component");
      }
    } catch {
      addToast("error", "Failed to install component");
    } finally {
      setInstalling(null);
    }
  };

  const handleCreatePage = async (templateId: string) => {
    if (!templateTitle.trim()) return;
    setInstalling(templateId);
    try {
      const result = await window.ink.templates.createPage(
        templateId,
        templateTitle.trim()
      );
      if (result.success) {
        addToast("success", `Created page: ${templateTitle}`);
        setCreatingTemplate(null);
        setTemplateTitle("");
        // Refresh file tree
        const projectPath =
          (await window.ink.project.list())?.[0]?.path;
        if (projectPath) {
          useEditorStore.getState().loadFileTree(projectPath);
        }
      } else {
        addToast("error", result.error || "Failed to create page");
      }
    } catch {
      addToast("error", "Failed to create page");
    } finally {
      setInstalling(null);
    }
  };

  // --- Render ---

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-ink-700">
        <h1 className="text-lg font-semibold text-ink-100">Gallery</h1>
        <p className="text-xs text-ink-500 mt-0.5">
          Pre-built components and page templates for your site
        </p>
      </div>

      {/* Tab bar */}
      <div className="px-6 pt-3 flex gap-1 border-b border-ink-700">
        <TabButton
          active={tab === "components"}
          onClick={() => setTab("components")}
          icon={<Puzzle className="w-3.5 h-3.5" />}
          label="Components"
          count={components.length}
        />
        <TabButton
          active={tab === "templates"}
          onClick={() => setTab("templates")}
          icon={<FileText className="w-3.5 h-3.5" />}
          label="Page Templates"
          count={templates.length}
        />
      </div>

      {/* Category filter */}
      <div className="px-6 py-2 flex gap-1.5 flex-wrap">
        <FilterChip
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label="All"
        />
        {Object.entries(categories).map(([id, label]) => (
          <FilterChip
            key={id}
            active={filter === id}
            onClick={() => setFilter(id)}
            label={label}
          />
        ))}
      </div>

      {/* Card grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-ink-500 animate-spin" />
          </div>
        ) : tab === "components" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pt-2">
            {filteredComponents.map((comp) => (
              <ComponentCard
                key={comp.name}
                comp={comp}
                installing={installing === comp.name}
                copied={copied === comp.name}
                onCopy={() => handleCopySnippet(comp)}
                onInstall={() => handleInstall(comp.name)}
              />
            ))}
            {filteredComponents.length === 0 && (
              <p className="col-span-full text-sm text-ink-500 py-8 text-center">
                No components in this category
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pt-2">
            {filteredTemplates.map((tmpl) => (
              <TemplateCard
                key={tmpl.id}
                tmpl={tmpl}
                creating={creatingTemplate === tmpl.id}
                installing={installing === tmpl.id}
                title={creatingTemplate === tmpl.id ? templateTitle : ""}
                onTitleChange={setTemplateTitle}
                onStartCreate={() => {
                  setCreatingTemplate(tmpl.id);
                  setTemplateTitle("");
                }}
                onCancelCreate={() => setCreatingTemplate(null)}
                onConfirmCreate={() => handleCreatePage(tmpl.id)}
              />
            ))}
            {filteredTemplates.length === 0 && (
              <p className="col-span-full text-sm text-ink-500 py-8 text-center">
                No templates in this category
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t transition-colors ${
        active
          ? "bg-ink-800 text-ink-100 border-b-2 border-accent"
          : "text-ink-400 hover:text-ink-200 hover:bg-ink-800/50"
      }`}
    >
      {icon}
      {label}
      <span className="text-ink-600 ml-1">{count}</span>
    </button>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 text-[11px] rounded-full transition-colors ${
        active
          ? "bg-accent/20 text-accent border border-accent/30"
          : "bg-ink-800 text-ink-400 border border-ink-700 hover:text-ink-200 hover:border-ink-600"
      }`}
    >
      {label}
    </button>
  );
}

function ComponentCard({
  comp,
  installing,
  copied,
  onCopy,
  onInstall,
}: {
  comp: ComponentEntry;
  installing: boolean;
  copied: boolean;
  onCopy: () => void;
  onInstall: () => void;
}) {
  return (
    <div className="bg-ink-800/50 border border-ink-700 rounded-lg p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium text-ink-100">{comp.label}</h3>
          <p className="text-[11px] text-ink-500 mt-0.5">{comp.description}</p>
        </div>
        {comp.installed && (
          <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-medium bg-green-500/10 text-green-400 border border-green-500/20 rounded">
            Installed
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mt-auto pt-2">
        <span className="text-[10px] text-ink-600 uppercase tracking-wider">
          {COMPONENT_CATEGORIES[comp.category] || comp.category}
        </span>
        <div className="flex-1" />

        {!comp.installed && (
          <button
            onClick={onInstall}
            disabled={installing}
            className="flex items-center gap-1 px-2 py-1 text-[11px] text-ink-300 bg-ink-700 hover:bg-ink-600 border border-ink-600 rounded transition-colors disabled:opacity-50"
          >
            {installing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Download className="w-3 h-3" />
            )}
            Install
          </button>
        )}

        <button
          onClick={onCopy}
          className="flex items-center gap-1 px-2 py-1 text-[11px] text-ink-300 bg-ink-700 hover:bg-ink-600 border border-ink-600 rounded transition-colors"
        >
          {copied ? (
            <Check className="w-3 h-3 text-green-400" />
          ) : (
            <ClipboardCopy className="w-3 h-3" />
          )}
          {copied ? "Copied" : "Insert"}
        </button>
      </div>
    </div>
  );
}

function TemplateCard({
  tmpl,
  creating,
  installing,
  title,
  onTitleChange,
  onStartCreate,
  onCancelCreate,
  onConfirmCreate,
}: {
  tmpl: PageTemplateEntry;
  creating: boolean;
  installing: boolean;
  title: string;
  onTitleChange: (v: string) => void;
  onStartCreate: () => void;
  onCancelCreate: () => void;
  onConfirmCreate: () => void;
}) {
  return (
    <div className="bg-ink-800/50 border border-ink-700 rounded-lg p-4 flex flex-col gap-2">
      <div>
        <h3 className="text-sm font-medium text-ink-100">{tmpl.label}</h3>
        <p className="text-[11px] text-ink-500 mt-0.5">{tmpl.description}</p>
      </div>

      {tmpl.requires.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tmpl.requires.map((r) => (
            <span
              key={r}
              className="px-1.5 py-0.5 text-[9px] bg-ink-700 text-ink-400 rounded"
            >
              {r}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto pt-2">
        {creating ? (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onConfirmCreate();
                if (e.key === "Escape") onCancelCreate();
              }}
              placeholder="Page title..."
              autoFocus
              className="w-full bg-ink-900 border border-ink-600 rounded px-2 py-1.5 text-xs text-ink-50 focus:border-accent focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={onConfirmCreate}
                disabled={!title.trim() || installing}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-medium bg-accent text-white rounded hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {installing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Plus className="w-3 h-3" />
                )}
                Create
              </button>
              <button
                onClick={onCancelCreate}
                className="px-2 py-1.5 text-[11px] text-ink-400 bg-ink-700 border border-ink-600 rounded hover:text-ink-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-ink-600 uppercase tracking-wider">
              {TEMPLATE_CATEGORIES[tmpl.category] || tmpl.category}
            </span>
            <div className="flex-1" />
            <button
              onClick={onStartCreate}
              className="flex items-center gap-1 px-2 py-1 text-[11px] text-ink-300 bg-ink-700 hover:bg-ink-600 border border-ink-600 rounded transition-colors"
            >
              <Plus className="w-3 h-3" />
              Create Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
