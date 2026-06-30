"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { VideoCard } from "@/components/VideoCard";
import { searchVideos, type YouTubeVideo } from "@/lib/youtube";
import { Loader2, Search, Users, ChevronRight } from "lucide-react";

type FilterTab = "all" | "videos" | "channels" | "shorts";

// Extract unique channels from video results
function extractChannels(videos: YouTubeVideo[]): { name: string; id: string; count: number }[] {
  const map = new Map<string, { name: string; id: string; count: number }>();
  for (const v of videos) {
    const key = v.channelTitle;
    const existing = map.get(key);
    if (existing) existing.count++;
    else map.set(key, { name: v.channelTitle, id: v.channelId || v.channelTitle, count: 1 });
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";

  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  useEffect(() => {
    if (query) doSearch(query);
  }, [query]);

  // Reset filter on new query
  useEffect(() => { setActiveFilter("all"); }, [query]);

  async function doSearch(q: string) {
    setLoading(true);
    try {
      const result = await searchVideos(q);
      setVideos(result.videos);
    } finally {
      setLoading(false);
    }
  }

  const channels = extractChannels(videos);

  const shortVideos = videos.filter((v) => {
    if (!v.duration) return false;
    const parts = v.duration.split(":").map(Number);
    const secs = parts.length === 2 ? parts[0] * 60 + parts[1] : 9999;
    return secs <= 90;
  });

  const longVideos = videos.filter((v) => {
    if (!v.duration) return true;
    const parts = v.duration.split(":").map(Number);
    const secs = parts.length === 2 ? parts[0] * 60 + parts[1] : 9999;
    return secs > 90;
  });

  const displayVideos =
    activeFilter === "shorts" ? shortVideos
    : activeFilter === "videos" ? longVideos
    : videos;

  const FILTER_TABS: { id: FilterTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "videos", label: "Videos" },
    { id: "channels", label: "Channels" },
    { id: "shorts", label: "Shorts" },
  ];

  return (
    <>
      <Navbar onMenuToggle={() => setSidebarCollapsed((p) => !p)} />
      <Sidebar collapsed={sidebarCollapsed} />
      <main
        className="transition-all duration-300 pt-14"
        style={{ marginLeft: sidebarCollapsed ? "72px" : "224px" }}
      >
        <div className="px-6 py-6 max-w-[1400px]">

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <Search size={18} className="text-[#00D4FF]" />
            <h1 className="text-base font-semibold text-[#E8EDF5]">
              {query
                ? <>Results for <span className="text-[#00D4FF]">&ldquo;{query}&rdquo;</span></>
                : "Search"}
            </h1>
            {!loading && videos.length > 0 && (
              <span className="text-sm text-[#7A8BA0]">({videos.length} results)</span>
            )}
          </div>

          {/* Filter tabs */}
          {!loading && videos.length > 0 && (
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className="px-4 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105"
                  style={{
                    background: activeFilter === tab.id
                      ? "linear-gradient(135deg, #00D4FF, #8B5CF6)"
                      : "rgba(255,255,255,0.06)",
                    color: activeFilter === tab.id ? "#050810" : "#7A8BA0",
                    border: activeFilter === tab.id ? "none" : "1px solid rgba(255,255,255,0.1)",
                    fontWeight: activeFilter === tab.id ? 700 : 500,
                  }}
                >
                  {tab.label}
                  {tab.id === "channels" && channels.length > 0 && (
                    <span className="ml-1 opacity-70">({channels.length})</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="animate-pulse-glow rounded-full p-4"
                style={{ border: "2px solid rgba(0,212,255,0.3)" }}>
                <Loader2 size={32} className="animate-spin text-[#00D4FF]" />
              </div>
              <p className="text-[#7A8BA0] text-sm">Searching…</p>
            </div>
          ) : videos.length > 0 ? (
            <>
              {/* Channel pill buttons — shown in "all" and "channels" tab */}
              {(activeFilter === "all" || activeFilter === "channels") && channels.length > 0 && (
                <div className="mb-7">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 rounded-full"
                      style={{ background: "linear-gradient(180deg, #00D4FF, #8B5CF6)" }} />
                    <h2 className="text-sm font-semibold text-[#E8EDF5]">Channels</h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {channels.map((ch) => (
                      <ChannelPill key={ch.id} name={ch.name} videoCount={ch.count} />
                    ))}
                  </div>
                </div>
              )}

              {/* Video grid — hidden in channels-only view */}
              {activeFilter !== "channels" && (
                <>
                  {displayVideos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {displayVideos.map((video, i) => (
                        <div key={`${video.id}-${i}`}
                          className="animate-in fade-in slide-in-from-bottom-4"
                          style={{ animationDelay: `${i * 40}ms`, animationDuration: "400ms" }}>
                          <VideoCard video={video} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <p className="text-[#7A8BA0]">No {activeFilter} found for this query.</p>
                    </div>
                  )}
                </>
              )}

              {/* Channel cards — channels tab */}
              {activeFilter === "channels" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {channels.map((ch) => (
                    <ChannelCard
                      key={ch.id}
                      name={ch.name}
                      videoCount={ch.count}
                      channelVideos={videos.filter((v) => v.channelTitle === ch.name)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : query ? (
            <div className="text-center py-24">
              <p className="text-[#7A8BA0]">No results for &ldquo;{query}&rdquo;</p>
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}

// ─── Channel Pill ─────────────────────────────────────────────────────────────
function ChannelPill({ name, videoCount }: { name: string; videoCount: number }) {
  return (
    <Link
      href={`/channel/${encodeURIComponent(name)}`}
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl group transition-all hover:scale-105"
      style={{
        background: "rgba(0,212,255,0.07)",
        border: "1px solid rgba(0,212,255,0.2)",
      }}
    >
      {/* Mini avatar */}
      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #00D4FF, #8B5CF6)", color: "#050810" }}>
        {name.charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="text-sm font-semibold text-[#E8EDF5] group-hover:text-[#00D4FF] transition-colors leading-none">
          {name}
        </p>
        <p className="text-xs text-[#7A8BA0] mt-0.5">{videoCount} video{videoCount > 1 ? "s" : ""}</p>
      </div>
      <ChevronRight size={14} className="text-[#7A8BA0] group-hover:text-[#00D4FF] ml-1 transition-colors" />
    </Link>
  );
}

// ─── Channel Card (full) ──────────────────────────────────────────────────────
function ChannelCard({ name, videoCount, channelVideos }: {
  name: string;
  videoCount: number;
  channelVideos: YouTubeVideo[];
}) {
  return (
    <Link
      href={`/channel/${encodeURIComponent(name)}`}
      className="group p-5 rounded-2xl flex items-start gap-4 transition-all hover:scale-[1.02]"
      style={{
        background: "#0D1117",
        border: "1px solid rgba(0,212,255,0.12)",
      }}
    >
      {/* Avatar */}
      <div className="w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #00D4FF, #8B5CF6)", color: "#050810", boxShadow: "0 0 20px rgba(0,212,255,0.3)" }}>
        {name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#E8EDF5] group-hover:text-[#00D4FF] transition-colors">{name}</p>
        <p className="text-xs text-[#7A8BA0] mt-1 flex items-center gap-1">
          <Users size={11} /> {videoCount} video{videoCount > 1 ? "s" : ""}
        </p>
        {channelVideos[0] && (
          <p className="text-xs text-[#7A8BA0] mt-2 line-clamp-1 italic">{channelVideos[0].title}</p>
        )}
      </div>
    </Link>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen grid-bg" style={{ background: "#050810" }}>
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-[#00D4FF]" />
        </div>
      }>
        <SearchContent />
      </Suspense>
    </div>
  );
}
