// Lowercases and treats "ё" as "е", so "Королев" finds "Королёв"
export function normalizeForSearch(value: string): string {
  return value.toLowerCase().replaceAll("ё", "е");
}

// Builds a LIKE pattern for a substring match against a normalized name.
// Returns null when there is nothing to search for.
export function buildNameSearchPattern(query: string | null | undefined): string | null {
  const normalized = normalizeForSearch(query?.trim() ?? "");
  if (normalized === "") {
    return null;
  }

  const escaped = normalized.replace(/[\\%_]/g, (char) => `\\${char}`);
  return `%${escaped}%`;
}
