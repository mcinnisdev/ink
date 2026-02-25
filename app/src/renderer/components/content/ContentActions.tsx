import { useState, useEffect, useMemo } from "react";
import { Plus, Wand2, ChevronDown } from "lucide-react";
import { useProjectStore } from "../../stores/project";
import { useEditorStore } from "../../stores/editor";
import { useNotificationStore } from "../../stores/notifications";
import { CONTENT_TYPES } from "../../constants/contentTypes";
import NewEntryDialog from "./NewEntryDialog";

export default function ContentActions() {
  const projectPath = useProjectStore((s) => s.current?.path);
  const loadFileTree = useEditorStore((s) => s.loadFileTree);
  const addToast = useNotificationStore((s) => s.addToast);

  const [installedTypes, setInstalledTypes] = useState<string[]>([]);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedTypeLabel, setSelectedTypeLabel] = useState<string>("");
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Detect installed content types by reading contentTypes.json
  useEffect(() => {
    if (!projectPath) return;
    window.ink.file
      .read(`${projectPath}/src/_data/contentTypes.json`)
      .then((raw) => {
        const data = JSON.parse(raw);
        // Map collection tags back to content type ids
        const tagToId: Record<string, string> = {};
        for (const ct of CONTENT_TYPES) {
          // The tag names in contentTypes.json are: posts, services, employees, docs, features, serviceAreas, projects, faqs
          // We need to map these back to content type IDs
          tagToId[ct.id] = ct.id;
        }
        // contentTypes.json uses tags as keys, e.g. "posts", "services", "employees", etc.
        const tagToContentTypeId: Record<string, string> = {
          posts: "blog",
          services: "services",
          employees: "team",
          docs: "docs",
          features: "features",
          serviceAreas: "service-areas",
          projects: "portfolio",
          faqs: "faq",
        };
        const installed = Object.keys(data)
          .map((tag) => tagToContentTypeId[tag] || tag)
          .filter(Boolean);
        setInstalledTypes(installed);
      })
      .catch(() => {
        // Fallback: services and team are always in the starter
        setInstalledTypes(["services", "team"]);
      });
  }, [projectPath]);

  const installedTypeInfos = useMemo(
    () => CONTENT_TYPES.filter((t) => installedTypes.includes(t.id)),
    [installedTypes]
  );

  const handleNewEntry = (typeId: string, typeLabel: string) => {
    setSelectedType(typeId);
    setSelectedTypeLabel(typeLabel);
    setShowNewEntry(true);
    setShowTypeMenu(false);
  };

  const handleGenerate = async (typeId: string, typeLabel: string) => {
    if (!projectPath) return;
    setGenerating(true);
    setShowTypeMenu(false);
    try {
      const result = await window.ink.cli.generateContent(projectPath, typeId, 3);
      if (result.success) {
        addToast("success", `Generated sample ${typeLabel} content`);
        loadFileTree(projectPath);
      } else {
        addToast("error", result.stderr || `Failed to generate content`);
      }
    } catch {
      addToast("error", "Failed to generate content");
    } finally {
      setGenerating(false);
    }
  };

  if (installedTypeInfos.length === 0) return null;

  return (
    <>
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-ink-700">
        {/* New Entry dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowTypeMenu(!showTypeMenu)}
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-accent hover:bg-ink-800 transition-colors"
          >
            <Plus className="w-3 h-3" />
            New Entry
            <ChevronDown className="w-3 h-3" />
          </button>
          {showTypeMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowTypeMenu(false)}
              />
              <div className="absolute left-0 top-full mt-1 z-50 bg-ink-800 border border-ink-600 rounded-lg shadow-xl py-1 min-w-[180px]">
                {installedTypeInfos.map((type) => (
                  <div key={type.id} className="flex items-center">
                    <button
                      onClick={() => handleNewEntry(type.id, type.label)}
                      className="flex-1 text-left px-3 py-1.5 text-xs text-ink-300 hover:bg-ink-700 hover:text-ink-50 transition-colors flex items-center gap-2"
                    >
                      <type.icon className="w-3 h-3 text-ink-500" />
                      {type.label}
                    </button>
                    <button
                      onClick={() => handleGenerate(type.id, type.label)}
                      disabled={generating}
                      title="Generate sample content"
                      className="px-2 py-1.5 text-ink-500 hover:text-amber-400 transition-colors"
                    >
                      <Wand2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {showNewEntry && (
        <NewEntryDialog
          typeId={selectedType}
          typeLabel={selectedTypeLabel}
          onClose={() => setShowNewEntry(false)}
        />
      )}
    </>
  );
}
