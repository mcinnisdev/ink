import { useState, useEffect, useCallback } from "react";
import { Upload, Trash2, Image, FolderOpen } from "lucide-react";
import { useProjectStore } from "../../stores/project";

interface MediaFile {
  name: string;
  path: string;
  relativePath: string;
  size: number;
  modified: number;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaView() {
  const projectPath = useProjectStore((s) => s.current?.path);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MediaFile | null>(null);
  const [activeFolder, setActiveFolder] = useState<string>("all");

  const mediaDir = projectPath ? `${projectPath}/media` : null;

  const loadFiles = useCallback(async () => {
    if (!mediaDir) return;
    setLoading(true);
    try {
      const list = await window.ink.media.list(mediaDir);
      setFiles(list);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [mediaDir]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const folders = Array.from(
    new Set(
      files
        .map((f) => f.relativePath.split("/")[0])
        .filter((f) => f !== f) // only folders, not root files
    )
  );
  // Get unique top-level folders
  const topFolders = Array.from(
    new Set(
      files
        .map((f) => {
          const parts = f.relativePath.split("/");
          return parts.length > 1 ? parts[0] : null;
        })
        .filter(Boolean) as string[]
    )
  );

  const filteredFiles =
    activeFolder === "all"
      ? files
      : files.filter((f) => f.relativePath.startsWith(activeFolder + "/"));

  const handleUpload = useCallback(async () => {
    if (!mediaDir) return;
    const subDir =
      activeFolder !== "all" ? `${mediaDir}/${activeFolder}` : mediaDir;
    const result = await window.ink.media.upload(subDir);
    if (result) {
      loadFiles();
    }
  }, [mediaDir, activeFolder, loadFiles]);

  const handleDelete = useCallback(
    async (file: MediaFile) => {
      await window.ink.media.delete(file.path);
      setSelected(null);
      loadFiles();
    },
    [loadFiles]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-ink-700">
        <div>
          <h2 className="text-lg font-semibold text-ink-50 flex items-center gap-2">
            <Image className="w-5 h-5 text-accent" />
            Media
          </h2>
          <p className="text-xs text-ink-500 mt-0.5">
            {files.length} file{files.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={handleUpload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent hover:bg-accent-hover text-white transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload
        </button>
      </div>

      {/* Folder tabs */}
      {topFolders.length > 0 && (
        <div className="flex items-center gap-1 px-6 py-2 border-b border-ink-700 overflow-x-auto">
          <button
            onClick={() => setActiveFolder("all")}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              activeFolder === "all"
                ? "bg-ink-700 text-ink-50"
                : "text-ink-400 hover:text-ink-200"
            }`}
          >
            All
          </button>
          {topFolders.map((folder) => (
            <button
              key={folder}
              onClick={() => setActiveFolder(folder)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                activeFolder === folder
                  ? "bg-ink-700 text-ink-50"
                  : "text-ink-400 hover:text-ink-200"
              }`}
            >
              <FolderOpen className="w-3 h-3" />
              {folder}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <p className="text-ink-500 text-sm animate-pulse">
              Loading media...
            </p>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Image className="w-10 h-10 text-ink-700 mb-3" />
              <p className="text-ink-400 text-sm">No media files</p>
              <p className="text-ink-600 text-xs mt-1">
                Upload images to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {filteredFiles.map((file) => (
                <button
                  key={file.path}
                  onClick={() => setSelected(file)}
                  className={`group relative aspect-square rounded-lg overflow-hidden border transition-colors ${
                    selected?.path === file.path
                      ? "border-accent ring-1 ring-accent"
                      : "border-ink-700 hover:border-ink-500"
                  }`}
                >
                  <img
                    src={`file:///${file.path.replace(/\\/g, "/")}`}
                    alt={file.name}
                    className="w-full h-full object-cover bg-ink-900"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5">
                    <p className="text-[10px] text-white truncate">
                      {file.name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-64 border-l border-ink-700 bg-ink-900 p-4 overflow-y-auto flex-shrink-0">
            <img
              src={`file:///${selected.path.replace(/\\/g, "/")}`}
              alt={selected.name}
              className="w-full aspect-square object-contain bg-ink-800 rounded-lg mb-4"
            />
            <div className="space-y-2">
              <div>
                <p className="text-[10px] text-ink-500 uppercase">Name</p>
                <p className="text-xs text-ink-200 break-all">{selected.name}</p>
              </div>
              <div>
                <p className="text-[10px] text-ink-500 uppercase">Path</p>
                <p className="text-xs text-ink-400 font-mono break-all">
                  media/{selected.relativePath}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-ink-500 uppercase">Size</p>
                <p className="text-xs text-ink-200">
                  {formatSize(selected.size)}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(selected)}
              className="flex items-center gap-1.5 w-full mt-4 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-900/20 border border-red-800/30 transition-colors justify-center"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
