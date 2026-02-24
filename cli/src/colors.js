import pc from "picocolors";

// Semantic color helpers for consistent CLI output
export const c = {
  success: pc.green,
  error: pc.red,
  warn: pc.yellow,
  info: pc.cyan,
  dim: pc.dim,
  bold: pc.bold,
  path: pc.cyan,
  label: (s) => pc.bold(pc.cyan(s)),
};
