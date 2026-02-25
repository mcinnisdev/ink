const REPO = "mcinnisdev/ink";
const RELEASES_URL = `https://api.github.com/repos/${REPO}/releases/latest`;

export interface UpdateInfo {
  available: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseUrl: string;
  releaseNotes: string;
}

/**
 * Compare two semver-style version strings.
 * Returns true if `latest` is newer than `current`.
 */
function isNewer(current: string, latest: string): boolean {
  const parse = (v: string) =>
    v
      .replace(/^v/, "")
      .split(/[-.]/)
      .map((p) => (/^\d+$/.test(p) ? Number(p) : p));

  const cur = parse(current);
  const lat = parse(latest);
  const len = Math.max(cur.length, lat.length);

  for (let i = 0; i < len; i++) {
    const a = cur[i] ?? 0;
    const b = lat[i] ?? 0;

    // Both numeric — compare directly
    if (typeof a === "number" && typeof b === "number") {
      if (b > a) return true;
      if (b < a) return false;
      continue;
    }

    // A pre-release tag (e.g. "alpha") is less than no tag
    if (typeof a === "string" && typeof b === "number") return false;
    if (typeof a === "number" && typeof b === "string") return true;

    // Both strings — lexicographic
    if (typeof a === "string" && typeof b === "string") {
      if (b > a) return true;
      if (b < a) return false;
    }
  }

  return false;
}

export async function checkForUpdates(
  currentVersion: string
): Promise<UpdateInfo> {
  const base: UpdateInfo = {
    available: false,
    currentVersion,
    latestVersion: currentVersion,
    releaseUrl: `https://github.com/${REPO}/releases`,
    releaseNotes: "",
  };

  try {
    const res = await fetch(RELEASES_URL, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "InkCMS",
      },
    });

    if (!res.ok) return base;

    const data = (await res.json()) as {
      tag_name: string;
      html_url: string;
      body: string | null;
    };

    const latestTag = data.tag_name.replace(/^v/, "");

    return {
      available: isNewer(currentVersion, latestTag),
      currentVersion,
      latestVersion: latestTag,
      releaseUrl: data.html_url,
      releaseNotes: data.body ?? "",
    };
  } catch {
    // Network error — fail silently
    return base;
  }
}
