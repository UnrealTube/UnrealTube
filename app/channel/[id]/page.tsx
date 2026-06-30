"use client";

import { useState, useEffect, use, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { VideoCard } from "@/components/VideoCard";
import {
  fetchChannelVideos, fetchChannelShorts,
  type YouTubeVideo, type ChannelInfo,
} from "@/lib/youtube";
import { usePrefs } from "@/lib/prefsContext";
import {
  Loader2, Users, Bell, CheckCircle, Video,
  Zap, Info, ChevronDown, BadgeCheck, ExternalLink,
} from "lucide-react";

type Tab = "videos" | "shorts" | "about";

export default function ChannelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const channelName = decodeURIComponent(id);
  usePrefs(); // keep context alive
  const region = { gl: "US", hl: "en" };

  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [shorts, setShorts] = useState<YouTubeVideo[]>([]);
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingShorts, setLoadingShorts] = useState(false);

  const [subscribed, setSubscribed] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("videos");

  // Initial load — videos
  useEffect(() => {
    setVideos([]);
    setShorts([]);
    setNextPageToken(null);
    setLoading(true);

    fetchChannelVideos(channelName, undefined, region).then(({ videos, channelInfo, nextPageToken }) => {
      setVideos(videos);
      setChannelInfo(channelInfo);
      setNextPageToken(nextPageToken ?? null);
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName]);

  // Load more videos (pagination)
  const loadMore = useCallback(async () => {
    if (!nextPageToken || loadingMore) return;
    setLoadingMore(true);
    const { videos: more, nextPageToken: tok } = await fetchChannelVideos(channelName, nextPageToken, region);
    setVideos((prev) => {
      const ids = new Set(prev.map((v) => v.id));
      return [...prev, ...more.filter((v) => !ids.has(v.id))];
    });
    setNextPageToken(tok ?? null);
    setLoadingMore(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName, nextPageToken, loadingMore]);

  // Lazy-load shorts when Shorts tab is opened
  const openShorts = useCallback(() => {
    setActiveTab("shorts");
    if (shorts.length > 0) return;
    setLoadingShorts(true);
    fetchChannelShorts(channelName, region).then(({ videos }) => {
      setShorts(videos);
      setLoadingShorts(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName, shorts.length]);

  const displayName = channelInfo?.name || channelName;

  // Categorise: separate long videos from shorts
  const longVideos = videos.filter((v) => {
    if (!v.duration) return true;
    const p = v.duration.split(":").map(Number);
    return p.length === 3 || (p.length === 2 && p[0] >= 1);
  });

  return (
    <div className="min-h-screen grid-bg" style={{ background: "#050810" }}>
      <Navbar />
      <div className="pt-14">
        <ChannelBanner name={displayName} />

        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          {/* Channel header */}
          <ChannelHeader
            displayName={displayName}
            channelInfo={channelInfo}
            videoCount={videos.length}
            subscribed={subscribed}
            onSubscribe={() => setSubscribed((v) => !v)}
          />

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-6"
            style={{ borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
            {([
              { id: "videos" as Tab, icon: <Video size={14} />, label: `Videos${longVideos.length > 0 ? ` (${longVideos.length})` : ""}` },
              { id: "shorts" as Tab, icon: <Zap size={14} />, label: "Shorts" },
              { id: "about" as Tab, icon: <Info size={14} />, label: "About" },
            ]).map((tab) => (
              <button key={tab.id}
                onClick={() => tab.id === "shorts" ? openShorts() : setActiveTab(tab.id)}
                className="flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors"
                style={{
                  color: activeTab === tab.id ? "#00D4FF" : "#7A8BA0",
                  borderBottom: activeTab === tab.id ? "2px solid #00D4FF" : "2px solid transparent",
                  marginBottom: "-1px",
                }}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {loading ? (
            <LoadingGrid />
          ) : (
            <>
              {activeTab === "videos" && (
                <VideosTab
                  videos={longVideos.length > 0 ? longVideos : videos}
                  loadMore={loadMore}
                  loadingMore={loadingMore}
                  hasMore={!!nextPageToken}
                />
              )}
              {activeTab === "shorts" && (
                <ShortsTab shorts={shorts} loading={loadingShorts} />
              )}
              {activeTab === "about" && (
                <AboutTab channelInfo={channelInfo} name={displayName} videoCount={videos.length} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ChannelBanner ────────────────────────────────────────────────────────────
function ChannelBanner({ name }: { name: string }) {
  return (
    <div className="w-full h-32 md:h-44 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(139,92,246,0.2) 50%, rgba(5,8,16,0.8) 100%)",
        borderBottom: "1px solid rgba(0,212,255,0.1)",
      }}>
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute -top-10 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-20"
        style={{ background: "radial-gradient(circle, #00D4FF, transparent)" }} />
      <p className="absolute bottom-4 right-6 text-xs text-[#7A8BA0] font-mono tracking-widest uppercase opacity-40">
        {name}
      </p>
    </div>
  );
}

// ─── ChannelHeader ────────────────────────────────────────────────────────────
function ChannelHeader({
  displayName, channelInfo, videoCount, subscribed, onSubscribe,
}: {
  displayName: string;
  channelInfo: ChannelInfo | null;
  videoCount: number;
  subscribed: boolean;
  onSubscribe: () => void;
}) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-10 mb-6 relative z-10">
      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-3xl font-black flex-shrink-0 border-4"
        style={{ background: "linear-gradient(135deg, #00D4FF, #8B5CF6)", borderColor: "#050810", color: "#050810", boxShadow: "0 0 30px rgba(0,212,255,0.4)" }}>
        {displayName.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 pb-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl md:text-3xl font-black text-[#E8EDF5] tracking-wide"
            style={{ fontFamily: "var(--font-orbitron)" }}>
            {displayName}
          </h1>
          {channelInfo?.verified && <BadgeCheck size={22} className="text-[#00D4FF]" />}
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-[#7A8BA0]">
          {channelInfo?.subscribers && (
            <span className="flex items-center gap-1"><Users size={13} />{channelInfo.subscribers}</span>
          )}
          <span>{videoCount} videos loaded</span>
        </div>
      </div>
      <div className="flex items-center gap-2 pb-1">
        <button onClick={onSubscribe}
          className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-sm transition-all hover:scale-105"
          style={{
            background: subscribed ? "#161B22" : "linear-gradient(135deg, #00D4FF, #8B5CF6)",
            border: subscribed ? "1px solid rgba(0,212,255,0.3)" : "none",
            color: subscribed ? "#7A8BA0" : "#050810",
          }}>
          {subscribed ? <><CheckCircle size={15} /> Subscribed</> : "Subscribe"}
        </button>
        {subscribed && (
          <button className="p-2 rounded-full hover:bg-white/5 transition-colors"
            style={{ border: "1px solid rgba(0,212,255,0.15)" }}>
            <Bell size={16} className="text-[#7A8BA0]" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-10">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="w-full aspect-video rounded-xl bg-[#161B22]" />
          <div className="flex gap-2 mt-3">
            <div className="w-9 h-9 rounded-full bg-[#161B22] flex-shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3 bg-[#161B22] rounded w-full" />
              <div className="h-3 bg-[#161B22] rounded w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── VideosTab ────────────────────────────────────────────────────────────────
function VideosTab({
  videos, loadMore, loadingMore, hasMore,
}: {
  videos: YouTubeVideo[];
  loadMore: () => void;
  loadingMore: boolean;
  hasMore: boolean;
}) {
  if (videos.length === 0) {
    return <p className="text-[#7A8BA0] text-center py-16">No videos found for this channel.</p>;
  }
  return (
    <div className="pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {videos.map((v, i) => (
          <div key={`${v.id}-${i}`}
            className="animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${Math.min(i, 8) * 40}ms`, animationDuration: "400ms" }}>
            <VideoCard video={v} />
          </div>
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all hover:scale-105 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(139,92,246,0.15))", border: "1px solid rgba(0,212,255,0.3)", color: "#00D4FF" }}>
            {loadingMore ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={16} />}
            {loadingMore ? "Loading…" : "Load More Videos"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── ShortsTab ────────────────────────────────────────────────────────────────
function ShortsTab({ shorts, loading }: { shorts: YouTubeVideo[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pb-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl bg-[#161B22]" style={{ aspectRatio: "9/16" }} />
        ))}
      </div>
    );
  }
  if (shorts.length === 0) {
    return <p className="text-[#7A8BA0] text-center py-16">No Shorts found for this channel.</p>;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pb-10">
      {shorts.map((v, i) => (
        <a key={`${v.id}-${i}`} href={`/watch?v=${v.id}`}
          className="group relative block rounded-xl overflow-hidden video-card"
          style={{ aspectRatio: "9/16", background: "#0D1117" }}>
          <img src={v.thumbnail} alt={v.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          {v.duration && (
            <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-xs font-bold"
              style={{ background: "rgba(0,0,0,0.85)", color: "#00D4FF" }}>
              {v.duration}
            </span>
          )}
          <p className="absolute bottom-2 left-2 right-2 text-xs font-medium text-white line-clamp-2 leading-snug">
            {v.title}
          </p>
        </a>
      ))}
    </div>
  );
}

// ─── AboutTab ─────────────────────────────────────────────────────────────────
function AboutTab({ channelInfo, name, videoCount }: {
  channelInfo: ChannelInfo | null;
  name: string;
  videoCount: number;
}) {
  return (
    <div className="max-w-xl pb-10 space-y-4">
      {channelInfo?.description && (
        <div className="p-5 rounded-xl" style={{ background: "#0D1117", border: "1px solid rgba(0,212,255,0.1)" }}>
          <h3 className="text-sm font-semibold text-[#E8EDF5] mb-2">About</h3>
          <p className="text-sm text-[#7A8BA0] leading-relaxed">{channelInfo.description}</p>
        </div>
      )}
      <div className="p-5 rounded-xl" style={{ background: "#0D1117", border: "1px solid rgba(0,212,255,0.1)" }}>
        <h3 className="text-sm font-semibold text-[#E8EDF5] mb-3">Channel Details</h3>
        <div className="space-y-2 text-sm text-[#7A8BA0]">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-[#00D4FF]" />
            <span>{channelInfo?.subscribers || "N/A"} subscribers</span>
          </div>
          <div className="flex items-center gap-2">
            <Video size={14} className="text-[#00D4FF]" />
            <span>{videoCount}+ videos</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-[#8B5CF6]" />
            <span>Streaming on UnrealTube · 100% Ad-Free</span>
          </div>
        </div>
      </div>
      {channelInfo?.link && (
        <a href={channelInfo.link} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-[#00D4FF] hover:underline">
          <ExternalLink size={14} /> View on YouTube
        </a>
      )}
    </div>
  );
}
