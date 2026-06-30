"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { VideoCard } from "@/components/VideoCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { fetchTrendingVideos, searchVideos, type YouTubeVideo } from "@/lib/youtube";
import { usePrefs } from "@/lib/prefsContext";
import { Loader2, Zap, Sparkles } from "lucide-react";

export default function Home() {
  const { topInterests } = usePrefs();
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [category, setCategory] = useState("All");
  const [showPersonalised, setShowPersonalised] = useState(false);

  const loadVideos = useCallback(async (cat?: string) => {
    setLoading(true);
    try {
      let result;
      if (!cat || cat === "All") {
        result = await fetchTrendingVideos();
      } else {
        result = await searchVideos(cat);
      }
      setVideos(result.videos);
    } catch {
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVideos(category === "All" ? undefined : category);
  }, [loadVideos]);

  function handleCategoryChange(cat: string) {
    setCategory(cat);
    loadVideos(cat === "All" ? undefined : cat);
  }

  const hasInterests = topInterests.length > 0;

  return (
    <div className="min-h-screen grid-bg" style={{ background: "#050810" }}>
      <Navbar onMenuToggle={() => setSidebarCollapsed((p) => !p)} />
      <Sidebar collapsed={sidebarCollapsed} />

      <main
        className="transition-all duration-300 pt-14"
        style={{ marginLeft: sidebarCollapsed ? "72px" : "224px" }}
      >
        <div className="px-6 py-4">
          {/* Category filter */}
          <div className="mb-6">
            <CategoryFilter onCategoryChange={handleCategoryChange} selectedCategory={category} />
          </div>

          {/* Hero */}
          {category === "All" && (
            <div
              className="relative mb-8 rounded-2xl overflow-hidden p-6 md:p-8 flex items-center justify-between gap-4"
              style={{
                background: "linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(139,92,246,0.12) 50%, rgba(5,8,16,0) 100%)",
                border: "1px solid rgba(0, 212, 255, 0.15)",
              }}
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={16} className="text-[#00D4FF]" />
                  <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#00D4FF" }}>
                    100% Ad-Free · Zero Interruptions
                  </span>
                </div>
                <h1
                  className="text-2xl md:text-3xl font-bold mb-2"
                  style={{
                    fontFamily: "var(--font-orbitron)",
                    background: "linear-gradient(90deg, #E8EDF5, #00D4FF)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  UNREALTUBE
                </h1>
                <p className="text-[#7A8BA0] text-sm max-w-md">
                  Watch any YouTube video without ads or interruptions.
                </p>

                {/* Personalised interests toggle */}
                {hasInterests && (
                  <button
                    onClick={() => setShowPersonalised((v) => !v)}
                    className="flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
                    style={{
                      background: showPersonalised ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.06)",
                      border: showPersonalised ? "1px solid rgba(139,92,246,0.4)" : "1px solid rgba(255,255,255,0.1)",
                      color: showPersonalised ? "#8B5CF6" : "#7A8BA0",
                    }}
                  >
                    <Sparkles size={12} />
                    {showPersonalised ? "Showing: For You" : "Switch to: For You"}
                  </button>
                )}
              </div>

              <div className="hidden md:flex flex-col items-end gap-2 flex-shrink-0">
                <div className="px-4 py-2 rounded-xl text-center"
                  style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}>
                  <div className="text-xl font-bold text-[#00D4FF]" style={{ fontFamily: "var(--font-orbitron)" }}>∞</div>
                  <div className="text-xs text-[#7A8BA0]">Videos</div>
                </div>
                <div className="px-4 py-2 rounded-xl text-center"
                  style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
                  <div className="text-xl font-bold text-[#8B5CF6]" style={{ fontFamily: "var(--font-orbitron)" }}>0</div>
                  <div className="text-xs text-[#7A8BA0]">Ads</div>
                </div>
              </div>
            </div>
          )}

          {/* Personalised "For You" section */}
          {showPersonalised && hasInterests && category === "All" && (
            <ForYouSection interests={topInterests} />
          )}

          {/* Section title */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-5 rounded-full"
              style={{ background: "linear-gradient(180deg, #00D4FF, #8B5CF6)" }} />
            <h2 className="text-base font-semibold text-[#E8EDF5]">
              {category === "All" ? "Trending Now" : category}
            </h2>
          </div>

          {/* Video grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="animate-pulse-glow rounded-full p-4"
                style={{ border: "2px solid rgba(0,212,255,0.3)" }}>
                <Loader2 size={32} className="animate-spin text-[#00D4FF]" />
              </div>
              <p className="text-[#7A8BA0] text-sm">Loading videos…</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {videos.map((video, i) => (
                <div key={`${video.id}-${i}`}
                  className="animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${i * 40}ms`, animationDuration: "400ms" }}>
                  <VideoCard video={video} />
                </div>
              ))}
            </div>
          )}

          {!loading && videos.length === 0 && (
            <div className="text-center py-24">
              <p className="text-[#7A8BA0]">No videos found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── For You section ──────────────────────────────────────────────────────────
function ForYouSection({ interests }: { interests: string[] }) {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (interests.length === 0) return;
    const queries = interests.slice(0, 2);
    Promise.all(queries.map((q) => searchVideos(q))).then((results) => {
      const merged = results.flatMap((r) => r.videos).slice(0, 8);
      setVideos(merged);
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interests.join(",")]);

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles size={16} className="text-[#8B5CF6]" />
        <h2 className="text-base font-semibold text-[#E8EDF5]">For You</h2>
        <span className="text-xs text-[#7A8BA0]">based on your watch history</span>
      </div>
      {loading ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-56 animate-pulse">
              <div className="w-full aspect-video rounded-xl bg-[#161B22]" />
              <div className="h-3 bg-[#161B22] rounded mt-2 w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {videos.map((v, i) => (
            <div key={`fy-${v.id}-${i}`}
              className="animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${i * 30}ms`, animationDuration: "300ms" }}>
              <VideoCard video={v} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
