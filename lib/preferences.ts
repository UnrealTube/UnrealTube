// User preferences — persisted in localStorage

export interface Country {
  code: string;   // ISO 3166-1 alpha-2, used as SerpAPI gl=
  lang: string;   // BCP-47, used as SerpAPI hl=
  flag: string;   // emoji flag
  name: string;   // display name
  langName: string;
}

export const COUNTRIES: Country[] = [
  { code: "US", lang: "en", flag: "🇺🇸", name: "United States",    langName: "English" },
  { code: "TR", lang: "tr", flag: "🇹🇷", name: "Turkey",           langName: "Türkçe" },
  { code: "GB", lang: "en", flag: "🇬🇧", name: "United Kingdom",   langName: "English" },
  { code: "DE", lang: "de", flag: "🇩🇪", name: "Germany",          langName: "Deutsch" },
  { code: "FR", lang: "fr", flag: "🇫🇷", name: "France",           langName: "Français" },
  { code: "ES", lang: "es", flag: "🇪🇸", name: "Spain",            langName: "Español" },
  { code: "MX", lang: "es", flag: "🇲🇽", name: "Mexico",           langName: "Español" },
  { code: "BR", lang: "pt", flag: "🇧🇷", name: "Brazil",           langName: "Português" },
  { code: "IN", lang: "hi", flag: "🇮🇳", name: "India",            langName: "Hindi" },
  { code: "JP", lang: "ja", flag: "🇯🇵", name: "Japan",            langName: "日本語" },
  { code: "KR", lang: "ko", flag: "🇰🇷", name: "South Korea",      langName: "한국어" },
  { code: "RU", lang: "ru", flag: "🇷🇺", name: "Russia",           langName: "Русский" },
  { code: "SA", lang: "ar", flag: "🇸🇦", name: "Saudi Arabia",     langName: "العربية" },
  { code: "IT", lang: "it", flag: "🇮🇹", name: "Italy",            langName: "Italiano" },
  { code: "NL", lang: "nl", flag: "🇳🇱", name: "Netherlands",      langName: "Nederlands" },
  { code: "PL", lang: "pl", flag: "🇵🇱", name: "Poland",           langName: "Polski" },
  { code: "ID", lang: "id", flag: "🇮🇩", name: "Indonesia",        langName: "Indonesia" },
  { code: "AU", lang: "en", flag: "🇦🇺", name: "Australia",        langName: "English" },
  { code: "CA", lang: "en", flag: "🇨🇦", name: "Canada",           langName: "English" },
  { code: "AE", lang: "ar", flag: "🇦🇪", name: "UAE",              langName: "العربية" },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // US

const STORAGE_KEY = "unrealtube_prefs";

export interface WatchedVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  category?: string;
  watchedAt: number;
}

export interface UserPrefs {
  countryCode: string;
  watchHistory: WatchedVideo[];
}

function load(): UserPrefs {
  if (typeof window === "undefined") return { countryCode: "US", watchHistory: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as UserPrefs;
  } catch { /* ignore */ }
  return { countryCode: "US", watchHistory: [] };
}

function save(prefs: UserPrefs) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function getPrefs(): UserPrefs { return load(); }

export function setCountry(code: string) {
  const p = load();
  save({ ...p, countryCode: code });
}

export function getCountry(): Country {
  const { countryCode } = load();
  return COUNTRIES.find((c) => c.code === countryCode) ?? DEFAULT_COUNTRY;
}

export function addWatchHistory(video: Omit<WatchedVideo, "watchedAt">) {
  const p = load();
  const existing = p.watchHistory.filter((v) => v.id !== video.id);
  const updated: WatchedVideo[] = [{ ...video, watchedAt: Date.now() }, ...existing].slice(0, 200);
  save({ ...p, watchHistory: updated });
}

/** Returns the top-N most-watched categories/channels */
export function getTopInterests(n = 5): string[] {
  const { watchHistory } = load();
  const freq: Record<string, number> = {};
  for (const v of watchHistory) {
    const key = v.category || v.channelTitle;
    freq[key] = (freq[key] || 0) + 1;
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k);
}
