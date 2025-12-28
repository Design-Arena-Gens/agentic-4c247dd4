export function normalizeUsername(input: string): string {
  return input.trim().replace(/^@+/, "").toLowerCase();
}

export function extractHandleFromProfileUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  if (!lower.startsWith("http")) {
    return normalizeUsername(lower.replace("instagram.com/", ""));
  }

  try {
    const parsed = new URL(lower);
    if (!parsed.hostname.includes("instagram.com")) {
      return null;
    }
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length === 0) return null;
    return normalizeUsername(segments[0]);
  } catch {
    return null;
  }
}

export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
