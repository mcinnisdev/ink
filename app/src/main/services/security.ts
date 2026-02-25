import path from "path";

/**
 * Resolves a user-provided path and asserts it falls within the project root.
 * Throws if the resolved path escapes the project directory (path traversal).
 */
export function assertWithinProject(
  userPath: string,
  projectRoot: string
): string {
  const resolved = path.resolve(userPath);
  const root = path.resolve(projectRoot);
  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    throw new Error("Access denied: path is outside the project directory");
  }
  return resolved;
}

/**
 * Strips directory components from a filename to prevent path traversal.
 * e.g. "../../etc/passwd" → "passwd"
 */
export function safeBasename(fileName: string): string {
  return path.basename(fileName);
}
