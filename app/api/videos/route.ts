import { NextRequest, NextResponse } from "next/server";

const SERPAPI_KEY = process.env.SERPAPI_KEY || "";
const SERPAPI_BASE = "https://serpapi.com/search";

export interface SerpVideo {
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

function mapSerpResult(item: Record<string, unknown>): SerpVideo {
  const videoId =
    (item.video_id as string) ||
    (item.id as string) ||
    extractIdFromLink(item.link as string) ||
    "";

  const thumbnails = item.thumbnails as Array<{ static?: string; rich?: string }> | undefined;
  // thumbnail can be a string or an object with { static, rich }
  const rawThumb = item.thumbnail;
  const thumbStr =
    typeof rawThumb === "string"
      ? rawThumb
      : (rawThumb as Record<string, string> | undefined)?.static ||
        (rawThumb as Record<string, string> | undefined)?.rich ||
        thumbnails?.[0]?.static ||
        thumbnails?.[0]?.rich ||
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const thumbnail = thumbStr || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  const channel = item.channel as Record<string, string> | undefined;

  return {
    id: videoId,
    title: (item.title as string) || "Untitled",
    thumbnail,
    channelTitle:
      (channel?.name as string) ||
      (item.channel as string) ||
      "Unknown Channel",
    channelId: (channel?.id as string) || "",
    publishedAt:
      (item.published_date as string)
        ? parseSerpDate(item.published_date as string)
        : new Date(Date.now() - 86400000 * 3).toISOString(),
    viewCount: parseViewCount(item.views as string | number | undefined),
    duration: (item.length as string) || undefined,
    description: (item.description as string) || undefined,
  };
}

function extractIdFromLink(link?: string): string {
  if (!link) return "";
  const m = link.match(/[?&]v=([^&]+)/);
  return m?.[1] || "";
}

function parseViewCount(views?: string | number): string | undefined {
  if (!views) return undefined;
  const str = String(views).replace(/,/g, "").replace(/\s.*/, "").trim();
  return str || undefined;
}

function parseSerpDate(dateStr: string): string {
  // SerpAPI returns strings like "2 days ago", "3 weeks ago", etc.
  const now = Date.now();
  const lower = dateStr.toLowerCase();
  const num = parseInt(lower) || 1;

  if (lower.includes("second")) return new Date(now - num * 1000).toISOString();
  if (lower.includes("minute")) return new Date(now - num * 60000).toISOString();
  if (lower.includes("hour")) return new Date(now - num * 3600000).toISOString();
  if (lower.includes("day")) return new Date(now - num * 86400000).toISOString();
  if (lower.includes("week")) return new Date(now - num * 604800000).toISOString();
  if (lower.includes("month")) return new Date(now - num * 2592000000).toISOString();
  if (lower.includes("year")) return new Date(now - num * 31536000000).toISOString();

  // Try parsing as a date
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date(now - 86400000).toISOString() : d.toISOString();
}

// GET /api/videos?type=trending|search|video|related|channel|shorts&q=...&id=...&channelId=...
export async function GET(req: NextRequest) {
  if (!SERPAPI_KEY) {
    return NextResponse.json({ error: "No API key configured", videos: [], channels: [] }, { status: 200 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "trending";
  const query = searchParams.get("q") || "";
  const videoId = searchParams.get("id") || "";
  const channelId = searchParams.get("channelId") || "";
  const pageToken = searchParams.get("page") || "";
  // Region/language — passed from client prefs
  const gl = searchParams.get("gl") || "US";   // country code
  const hl = searchParams.get("hl") || "en";   // language

  try {
    if (type === "video" && videoId) return await handleVideoDetails(videoId);
    if (type === "search" && query) return await handleSearch(query, pageToken, gl, hl);
    if (type === "related" && videoId) return await handleRelated(videoId);
    if (type === "channel" && channelId) return await handleChannel(channelId, pageToken, gl, hl);
    if (type === "channel_shorts" && channelId) return await handleChannelShorts(channelId, gl, hl);
    if (type === "shorts") return await handleShorts(query || "shorts", gl, hl);
    return await handleTrending(pageToken, gl, hl);
  } catch (err) {
    console.error("SerpAPI error:", err);
    return NextResponse.json({ error: "API error", videos: [] }, { status: 200 });
  }
}

async function handleTrending(pageToken?: string, gl = "US", hl = "en") {
  const params = new URLSearchParams({
    engine: "youtube",
    search_query: "trending",
    api_key: SERPAPI_KEY,
    gl,
    hl,
    ...(pageToken ? { next_page_token: pageToken } : {}),
  });

  const res = await fetch(`${SERPAPI_BASE}?${params}`);
  if (!res.ok) return NextResponse.json({ videos: [] });
  const data = await res.json();

  const items = (data.video_results || data.movie_results || []) as Array<Record<string, unknown>>;
  const videos = items.map(mapSerpResult).filter((v) => v.id);

  return NextResponse.json({
    videos,
    nextPageToken: data.serpapi_pagination?.next_page_token || null,
  });
}

async function handleSearch(query: string, pageToken?: string, gl = "US", hl = "en") {
  const params = new URLSearchParams({
    engine: "youtube",
    search_query: query,
    api_key: SERPAPI_KEY,
    gl,
    hl,
    ...(pageToken ? { next_page_token: pageToken } : {}),
  });

  const res = await fetch(`${SERPAPI_BASE}?${params}`);
  if (!res.ok) return NextResponse.json({ videos: [] });
  const data = await res.json();

  const items = (data.video_results || []) as Array<Record<string, unknown>>;
  const videos = items.map(mapSerpResult).filter((v) => v.id);

  return NextResponse.json({
    videos,
    nextPageToken: data.serpapi_pagination?.next_page_token || null,
  });
}

async function handleRelated(videoId: string) {
  const params = new URLSearchParams({
    engine: "youtube_video",
    v: videoId,
    api_key: SERPAPI_KEY,
  });

  const res = await fetch(`${SERPAPI_BASE}?${params}`);
  if (!res.ok) return NextResponse.json({ videos: [] });
  const data = await res.json();

  const items = (data.related_videos || []) as Array<Record<string, unknown>>;
  const videos = items.map(mapSerpResult).filter((v) => v.id);

  return NextResponse.json({ videos });
}

async function handleChannel(channelId: string, pageToken?: string, gl = "US", hl = "en") {
  // Search YouTube filtered strictly to this channel name
  // We use the channel name as the query and filter results to only that channel.
  // SerpAPI doesn't have a direct "by channel" param so we fetch up to 2 pages and filter.
  const fetchPage = async (token?: string) => {
    const p = new URLSearchParams({
      engine: "youtube",
      search_query: `"${channelId}"`,   // quoted = exact phrase match
      api_key: SERPAPI_KEY,
      gl,
      hl,
      ...(token ? { next_page_token: token } : {}),
    });
    const r = await fetch(`${SERPAPI_BASE}?${p}`);
    if (!r.ok) return { items: [], nextToken: null, rawData: null };
    const d = await r.json();
    return {
      items: (d.video_results || []) as Array<Record<string, unknown>>,
      nextToken: (d.serpapi_pagination?.next_page_token as string) || null,
      rawData: d,
    };
  };

  // Fetch first page (and optionally a second page if coming from pagination)
  const { items: page1, nextToken: tok2, rawData: raw1 } = await fetchPage(pageToken || undefined);

  // If no pageToken was supplied, also fetch page 2 to get more results
  let page2Items: Array<Record<string, unknown>> = [];
  let finalNextToken: string | null = tok2;
  if (!pageToken && tok2) {
    const { items, nextToken } = await fetchPage(tok2);
    page2Items = items;
    finalNextToken = nextToken;
  }

  const allItems = [...page1, ...page2Items];

  // Filter: only keep videos whose channel name matches (case-insensitive)
  const channelLower = channelId.toLowerCase();
  const filtered = allItems.filter((item) => {
    const ch = item.channel as Record<string, string> | undefined;
    const name = (ch?.name || (item.channel as string) || "").toLowerCase();
    return name.includes(channelLower) || channelLower.includes(name.split(" ")[0]);
  });

  // If strict filter returns nothing, fall back to all results (channel name may differ slightly)
  const videos = (filtered.length > 0 ? filtered : allItems)
    .map(mapSerpResult)
    .filter((v) => v.id);

  // Deduplicate by video id
  const seen = new Set<string>();
  const unique = videos.filter((v) => { if (seen.has(v.id)) return false; seen.add(v.id); return true; });

  // Build channel info from best match
  const bestItem = (filtered[0] || allItems[0]) as Record<string, unknown> | undefined;
  const ch = bestItem?.channel as Record<string, string> | undefined;
  const channelInfo = {
    id: channelId,
    name: ch?.name || channelId,
    link: ch?.link || `https://www.youtube.com/@${encodeURIComponent(channelId)}`,
    subscribers: ch?.subscribers || "",
    thumbnail: ch?.thumbnail || "",
    verified: !!(raw1?.channel_results?.[0]?.verified),
    description: (raw1?.channel_results?.[0]?.description as string) || "",
    videoCount: String(unique.length),
  };

  return NextResponse.json({ videos: unique, channelInfo, nextPageToken: finalNextToken });
}

async function handleChannelShorts(channelId: string, gl = "US", hl = "en") {
  // Search for shorts specifically from this channel
  const p = new URLSearchParams({
    engine: "youtube",
    search_query: `"${channelId}" #shorts`,
    api_key: SERPAPI_KEY,
    gl,
    hl,
  });
  const res = await fetch(`${SERPAPI_BASE}?${p}`);
  if (!res.ok) return NextResponse.json({ videos: [] });
  const data = await res.json();

  const items = (data.video_results || []) as Array<Record<string, unknown>>;
  const all = items.map(mapSerpResult).filter((v) => v.id);

  // Filter short duration ≤ 3 min
  const shorts = all.filter((v) => {
    if (!v.duration) return true;
    const parts = v.duration.split(":").map(Number);
    const secs = parts.length === 2 ? parts[0] * 60 + parts[1] : 9999;
    return secs <= 180;
  });

  return NextResponse.json({ videos: shorts.length > 0 ? shorts : all.slice(0, 8) });
}

async function handleShorts(query: string, gl = "US", hl = "en") {
  const params = new URLSearchParams({
    engine: "youtube",
    search_query: query + " #shorts",
    api_key: SERPAPI_KEY,
    gl,
    hl,
  });

  const res = await fetch(`${SERPAPI_BASE}?${params}`);
  if (!res.ok) return NextResponse.json({ videos: [] });
  const data = await res.json();

  const items = (data.video_results || []) as Array<Record<string, unknown>>;
  // Filter for short videos (under ~1 min) or all if not available
  const all = items.map(mapSerpResult).filter((v) => v.id);
  const shorts = all.filter((v) => {
    if (!v.duration) return true;
    const parts = v.duration.split(":").map(Number);
    const secs = parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0] * 3600 + parts[1] * 60 + parts[2];
    return secs <= 180; // ≤ 3 min
  });

  return NextResponse.json({ videos: shorts.length > 0 ? shorts : all.slice(0, 10) });
}

async function handleVideoDetails(videoId: string) {
  const params = new URLSearchParams({
    engine: "youtube_video",
    v: videoId,
    api_key: SERPAPI_KEY,
  });

  const res = await fetch(`${SERPAPI_BASE}?${params}`);
  if (!res.ok) return NextResponse.json({ video: null });
  const data = await res.json();

  if (!data.title) return NextResponse.json({ video: null });

  const video: SerpVideo = {
    id: videoId,
    title: data.title || "Untitled",
    thumbnail: data.thumbnail?.static || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    channelTitle: data.channel?.name || "Unknown",
    channelId: data.channel?.id || "",
    publishedAt: data.published_date
      ? parseSerpDate(data.published_date)
      : new Date().toISOString(),
    viewCount: parseViewCount(data.views),
    duration: data.length || undefined,
    description: data.description || undefined,
  };

  return NextResponse.json({ video });
}
