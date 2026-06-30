"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { VideoCard } from "@/components/VideoCard";
import { fetchTrendingVideos, type YouTubeVideo } from "@/lib/youtube";
import { Loader2, Flame } from "lucide-react";

export default function TrendingPage() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetchTrendingVideos().then((r) => {
      setVideos(r.videos);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen grid-bg" style={{ background: "#050810" }}>
      <Navbar onMenuToggle={() => setSidebarCollapsed((p) => !p)} />
      <Sidebar collapsed={sidebarCollapsed} />
      <main
        className="transition-all duration-300 pt-14"
        style={{ marginLeft: sidebarCollapsed ? "72px" : "224px" }}
      >
        <div className="px-6 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Flame size={22} className="text-orange-400" />
            <h1
              className="text-xl font-bold"
              style={{ fontFamily: "var(--font-orbitron)", color: "#E8EDF5" }}
            >
              TRENDING
            </h1>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 size={32} className="animate-spin text-[#00D4FF]" />
              <p className="text-[#7A8BA0] text-sm">Loading trending videos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {videos.map((video, i) => (
                <div
                  key={`${video.id}-${i}`}
                  className="animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${i * 40}ms`, animationDuration: "400ms" }}
                >
                  <VideoCard video={video} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
