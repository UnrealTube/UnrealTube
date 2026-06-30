// Search history — persisted in localStorage

const KEY = "unrealtube_search_history";
const MAX = 30;

export interface SearchEntry {
  query: string;
  at: number; // timestamp ms
}

function load(): SearchEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as SearchEntry[];
  } catch {
    return [];
  }
}

function save(entries: SearchEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(entries));
}

/** Push a new query. Deduplicates and keeps newest at top. */
export function pushSearch(query: string) {
  const q = query.trim();
  if (!q) return;
  const existing = load().filter((e) => e.query.toLowerCase() !== q.toLowerCase());
  save([{ query: q, at: Date.now() }, ...existing].slice(0, MAX));
}

/** Get all history entries newest-first. */
export function getHistory(): SearchEntry[] {
  return load();
}

/** Delete one entry by query string. */
export function deleteEntry(query: string) {
  save(load().filter((e) => e.query !== query));
}

/** Clear all history. */
export function clearHistory() {
  save([]);
}
