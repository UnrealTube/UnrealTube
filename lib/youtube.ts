// YouTube data helpers — backed by SerpAPI via /api/videos server route

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  viewCount?: string;
  duration?: string;
  description?: string;
}

export interface YouTubeSearchResult {
  videos: YouTubeVideo[];
  nextPageToken?: string;
}

// ─── Formatters ──────────────────────────────────────────────────────────────

export function formatViewCount(count: string): string {
  const num = parseInt(count, 10);
  if (isNaN(num)) return count;
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B views`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M views`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K views`;
  return `${num} views`;
}

export function formatDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return iso; // Already formatted (e.g. "12:34")
  const h = parseInt(match[1] || "0");
  const m = parseInt(match[2] || "0");
  const s = parseInt(match[3] || "0");
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffYear > 0) return `${diffYear} year${diffYear > 1 ? "s" : ""} ago`;
  if (diffMonth > 0) return `${diffMonth} month${diffMonth > 1 ? "s" : ""} ago`;
  if (diffWeek > 0) return `${diffWeek} week${diffWeek > 1 ? "s" : ""} ago`;
  if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  return "Just now";
}

// ─── API helpers (call our own server route) ─────────────────────────────────

export interface RegionParams { gl?: string; hl?: string; }

async function apiFetch(params: Record<string, string>): Promise<Response> {
  const qs = new URLSearchParams(params).toString();
  return fetch(`/api/videos?${qs}`);
}

export async function fetchTrendingVideos(
  pageToken?: string,
  region: RegionParams = {},
): Promise<YouTubeSearchResult> {
  try {
    const res = await apiFetch({
      type: "trending",
      ...(pageToken ? { page: pageToken } : {}),
      ...(region.gl ? { gl: region.gl } : {}),
      ...(region.hl ? { hl: region.hl } : {}),
    });
    if (!res.ok) return getMockVideos();
    const data = await res.json();
    if (!data.videos?.length) return getMockVideos();
    return { videos: data.videos, nextPageToken: data.nextPageToken };
  } catch {
    return getMockVideos();
  }
}

export async function searchVideos(
  query: string,
  pageToken?: string,
  region: RegionParams = {},
): Promise<YouTubeSearchResult> {
  try {
    const res = await apiFetch({
      type: "search",
      q: query,
      ...(pageToken ? { page: pageToken } : {}),
      ...(region.gl ? { gl: region.gl } : {}),
      ...(region.hl ? { hl: region.hl } : {}),
    });
    if (!res.ok) return getMockVideos(query);
    const data = await res.json();
    if (!data.videos?.length) return getMockVideos(query);
    return { videos: data.videos, nextPageToken: data.nextPageToken };
  } catch {
    return getMockVideos(query);
  }
}

export async function fetchVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
  try {
    const res = await apiFetch({ type: "video", id: videoId });
    if (!res.ok) return getMockVideoById(videoId);
    const data = await res.json();
    return data.video || getMockVideoById(videoId);
  } catch {
    return getMockVideoById(videoId);
  }
}

export async function fetchRelatedVideos(videoId: string): Promise<YouTubeSearchResult> {
  try {
    const res = await apiFetch({ type: "related", id: videoId });
    if (!res.ok) return getMockVideos();
    const data = await res.json();
    if (!data.videos?.length) return getMockVideos();
    return { videos: data.videos };
  } catch {
    return getMockVideos();
  }
}

export interface ChannelInfo {
  id: string;
  name: string;
  link: string;
  subscribers: string;
  thumbnail: string;
  verified?: boolean;
  description?: string;
  videoCount?: string;
}

export interface ChannelResult {
  videos: YouTubeVideo[];
  channelInfo: ChannelInfo | null;
  nextPageToken?: string | null;
}

export async function fetchChannelVideos(
  channelId: string,
  pageToken?: string,
  region: RegionParams = {},
): Promise<ChannelResult> {
  try {
    const res = await apiFetch({
      type: "channel",
      channelId,
      ...(pageToken ? { page: pageToken } : {}),
      ...(region.gl ? { gl: region.gl } : {}),
      ...(region.hl ? { hl: region.hl } : {}),
    });
    if (!res.ok) return { videos: getMockVideos(channelId).videos, channelInfo: null };
    const data = await res.json();
    return {
      videos: data.videos?.length ? data.videos : getMockVideos(channelId).videos,
      channelInfo: data.channelInfo || null,
      nextPageToken: data.nextPageToken || null,
    };
  } catch {
    return { videos: getMockVideos(channelId).videos, channelInfo: null };
  }
}

export async function fetchChannelShorts(
  channelId: string,
  region: RegionParams = {},
): Promise<YouTubeSearchResult> {
  try {
    const res = await apiFetch({
      type: "channel_shorts",
      channelId,
      ...(region.gl ? { gl: region.gl } : {}),
      ...(region.hl ? { hl: region.hl } : {}),
    });
    if (!res.ok) return getMockVideos(channelId);
    const data = await res.json();
    return { videos: data.videos?.length ? data.videos : getMockVideos(channelId).videos };
  } catch {
    return getMockVideos(channelId);
  }
}

export async function fetchShorts(
  query?: string,
  region: RegionParams = {},
): Promise<YouTubeSearchResult> {
  try {
    const res = await apiFetch({
      type: "shorts",
      ...(query ? { q: query } : {}),
      ...(region.gl ? { gl: region.gl } : {}),
      ...(region.hl ? { hl: region.hl } : {}),
    });
    if (!res.ok) return getMockShorts();
    const data = await res.json();
    if (!data.videos?.length) return getMockShorts();
    return { videos: data.videos };
  } catch {
    return getMockShorts();
  }
}

function getMockShorts(): YouTubeSearchResult {
  const ids = ["dQw4w9WgXcQ", "jNQXAC9IVRw", "9bZkp7q19f0", "kJQP7kiw5Fk", "OPf0YbXqDm0", "hT_nvWreIhg"];
  return {
    videos: [
      "Amazing life hack #shorts",
      "Funniest moment ever 😂 #shorts",
      "Mind-blowing science trick #shorts",
      "Satisfying video compilation #shorts",
      "Quick cooking tip #shorts",
      "Incredible street art #shorts",
    ].map((title, i) => ({
      id: ids[i],
      title,
      thumbnail: `https://i.ytimg.com/vi/${ids[i]}/hqdefault.jpg`,
      channelTitle: ["LifeHacks", "Comedy", "Science", "Satisfying", "FoodTips", "ArtWorld"][i],
      channelId: `UC${i}`,
      publishedAt: new Date(Date.now() - i * 86400000).toISOString(),
      viewCount: String(Math.floor(Math.random() * 5000000 + 100000)),
      duration: `0:${String(Math.floor(Math.random() * 50 + 10)).padStart(2, "0")}`,
    })),
  };
}

// ─── Mock fallback data ───────────────────────────────────────────────────────

function getMockVideos(query?: string): YouTubeSearchResult {
  const mockTitles = query
    ? [
        `${query} - Official Tutorial`,
        `Best ${query} Videos 2024`,
        `${query} Explained Simply`,
        `Top 10 ${query} Moments`,
        `${query} Full Documentary`,
        `${query} Highlights Compilation`,
      ]
    : [
        "The Future of AI: What's Coming Next",
        "Epic Mountain Climbing Adventure",
        "How to Build a Modern Web App in 2024",
        "Quantum Computing Explained Simply",
        "Deep Sea Creatures Discovery",
        "The Science of Black Holes",
        "Street Food Around the World",
        "Space Exploration: Mars Mission Update",
        "Music Production Masterclass",
        "Cybersecurity in the Modern Age",
        "Wildlife Photography Tips & Tricks",
        "The Art of Minimalist Living",
        "Electric Cars vs. Hydrogen: The Future",
        "Amazing Architecture Around the World",
        "Learning Piano in 30 Days Challenge",
        "The History of the Internet",
        "Extreme Sports Compilation 2024",
        "Cooking with Science: Molecular Gastronomy",
        "Exploring Abandoned Places",
        "How Microchips Are Made",
        "The World's Fastest Cars Tested",
        "Urban Exploration Documentary",
        "AI Art Revolution Explained",
        "Incredible Animal Behavior",
      ];

  const channels = [
    "TechVision", "NatureExplorer", "CodeCraft", "ScienceNow",
    "OceanDepths", "SpaceHub", "FoodWorld", "MusicLab",
    "CyberSec Pro", "WildLife HD", "ArchVision", "FutureMoves",
  ];

  const videoIds = [
    "dQw4w9WgXcQ", "jNQXAC9IVRw", "9bZkp7q19f0", "kJQP7kiw5Fk",
    "OPf0YbXqDm0", "hT_nvWreIhg", "e-ORhEE9VVg", "60ItHLz5WEA",
    "tgbNymZ7vqY", "JGwWNGJdvx8", "YQHsXMglC9A", "RgKAFK5djSk",
    "fRh_vgS2dFE", "CevxZvSJLk8", "M7lc1UVf-VE", "xuCn8ux2gbs",
    "nfWlot6h_JM", "09R8_2nJtjg", "ZbZSe6N_BXs", "2vjPBrBU-TM",
  ];

  const viewCounts = [
    "1234567", "890234", "45678901", "2345678", "987654",
    "12345678", "3456789", "567890", "8901234", "234567",
  ];

  const durations = [
    "12:34", "8:45", "24:15", "6:30", "45:00",
    "3:22", "15:45", "9:12", "32:00", "7:55",
  ];

  return {
    videos: mockTitles.map((title, i) => ({
      id: videoIds[i % videoIds.length],
      title,
      thumbnail: `https://i.ytimg.com/vi/${videoIds[i % videoIds.length]}/hqdefault.jpg`,
      channelTitle: channels[i % channels.length],
      channelId: `UC${i}`,
      publishedAt: new Date(Date.now() - (i + 1) * 86400000 * 3).toISOString(),
      viewCount: viewCounts[i % viewCounts.length],
      duration: durations[i % durations.length],
    })),
  };
}

function getMockVideoById(videoId: string): YouTubeVideo {
  return {
    id: videoId,
    title: "Amazing Video — UnrealTube",
    thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    channelTitle: "UnrealTube Creator",
    channelId: "UC123",
    publishedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    viewCount: "1234567",
    duration: "12:34",
    description: "Watch this content ad-free on UnrealTube.",
  };
}
