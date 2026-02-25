import fs from "fs";
import path from "path";

export interface MediaFile {
  name: string;
  path: string;
  relativePath: string;
  size: number;
  modified: number;
}

const IMAGE_EXTS = new Set([
  ".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp", ".avif", ".ico",
]);

export async function listMedia(mediaDir: string): Promise<MediaFile[]> {
  const results: MediaFile[] = [];

  function walk(dir: string): void {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (IMAGE_EXTS.has(path.extname(entry.name).toLowerCase())) {
        const stat = fs.statSync(fullPath);
        results.push({
          name: entry.name,
          path: fullPath,
          relativePath: path.relative(mediaDir, fullPath).replace(/\\/g, "/"),
          size: stat.size,
          modified: stat.mtimeMs,
        });
      }
    }
  }

  walk(mediaDir);
  return results;
}

export async function copyToMedia(
  sourcePath: string,
  destDir: string,
  fileName: string
): Promise<string> {
  fs.mkdirSync(destDir, { recursive: true });
  const safeName = path.basename(fileName);
  const destPath = path.join(destDir, safeName);
  fs.copyFileSync(sourcePath, destPath);
  return destPath;
}

export async function deleteMedia(filePath: string): Promise<void> {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
