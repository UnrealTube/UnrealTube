"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { fetchShorts, formatViewCount, formatRelativeTime, type YouTubeVideo } from "@/lib/youtube";
import { usePrefs } from "@/lib/prefsContext";
// Default region — country picker removed
import {
  ThumbsUp, MessageCircle, Share2, Bookmark,
  ChevronDown, ChevronUp, Loader2, Zap, RefreshCw,
} from "lucide-react";

export default function ShortsPage() {
  const { trackWatch } = usePrefs();
  const [shorts, setShorts] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    fetchShorts().then((r) => {
      setShorts(r.videos);
      setCurrentIndex(0);
      setLoading(false);
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  const go = useCallback((dir: 1 | -1) => {
    setCurrentIndex((i) => {
      const next = Math.max(0, Math.min(i + dir, shorts.length - 1));
      return next;
    });
  }, [shorts.length]);

  // Keyboard nav
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") go(1);
      if (e.key === "ArrowUp") go(-1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [go]);

  // Track watch when index changes
  useEffect(() => {
    const v = shorts[currentIndex];
    if (!v) return;
    trackWatch({
      id: v.id,
      title: v.title,
      channelTitle: v.channelTitle,
      thumbnail: v.thumbnail,
      category: "Shorts",
    });
  }, [currentIndex, shorts, trackWatch]);

  const current = shorts[currentIndex];

  return (
    <div className="min-h-screen" style={{ background: "#050810" }}>
      <Navbar />
      <div className="pt-14 flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={36} className="animate-spin text-[#00D4FF]" />
            <p className="text-[#7A8BA0]">Loading Shorts…</p>
          </div>
        ) : shorts.length === 0 ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-[#7A8BA0]">No shorts found for this region.</p>
            <button onClick={load}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
              style={{ background: "linear-gradient(135deg,#00D4FF,#8B5CF6)", color: "#050810" }}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : (
          <div className="flex gap-5 items-center px-4">
            {/* Up/Down nav */}
            <div className="flex flex-col gap-3">
              <button onClick={() => go(-1)} disabled={currentIndex === 0}
                className="p-3 rounded-full transition-all hover:scale-110 disabled:opacity-25"
                style={{ background: "#161B22", border: "1px solid rgba(0,212,255,0.25)" }}>
                <ChevronUp size={20} className="text-[#00D4FF]" />
              </button>
              <span className="text-xs text-[#7A8BA0] text-center tabular-nums">
                {currentIndex + 1}/{shorts.length}
              </span>
              <button onClick={() => go(1)} disabled={currentIndex === shorts.length - 1}
                className="p-3 rounded-full transition-all hover:scale-110 disabled:opacity-25"
                style={{ background: "#161B22", border: "1px solid rgba(0,212,255,0.25)" }}>
                <ChevronDown size={20} className="text-[#00D4FF]" />
              </button>
            </div>

            {/* Player */}
            <ShortPlayer video={current} />

            {/* Side actions */}
            <ShortActions video={current} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Short Player ─────────────────────────────────────────────────────────────
function ShortPlayer({ video }: { video: YouTubeVideo | undefined }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setLoaded(false); }, [video?.id]);

  if (!video) return null;

  return (
    <div
      className="relative rounded-2xl overflow-hidden flex-shrink-0"
      style={{
        width: "min(360px, 85vw)",
        aspectRatio: "9/16",
        background: "#000",
        border: "1px solid rgba(0,212,255,0.2)",
        boxShadow: "0 0 50px rgba(0,212,255,0.12)",
      }}
    >
      {/* Loading shimmer */}
      {!loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center"
          style={{ background: "#050810" }}>
          <div className="w-10 h-10 rounded-full border-2 border-[#00D4FF]/30 border-t-[#00D4FF] animate-spin" />
        </div>
      )}

      <iframe
        key={video.id}
        src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&loop=1&playlist=${video.id}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => setLoaded(true)}
        className="absolute inset-0 w-full h-full border-0"
        title={video.title}
        style={{ opacity: loaded ? 1 : 0 }}
      />

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)" }}>
        <a href={`/channel/${encodeURIComponent(video.channelTitle)}`}
          className="text-xs font-bold pointer-events-auto"
          style={{ color: "#00D4FF" }}>
          @{video.channelTitle}
        </a>
        <p className="text-sm text-white mt-1 leading-snug line-clamp-2">{video.title}</p>
        <div className="flex items-center gap-2 mt-1.5 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
          {video.viewCount && <span>{formatViewCount(video.viewCount)}</span>}
          <span>·</span>
          <span>{formatRelativeTime(video.publishedAt)}</span>
        </div>
      </div>

      {/* Top badges */}
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold"
          style={{ background: "rgba(0,0,0,0.75)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.3)", backdropFilter: "blur(8px)" }}>
          <Zap size={10} fill="#00D4FF" /> Shorts
        </div>
        <div className="px-2 py-1 rounded-full text-xs font-semibold"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", color: "rgba(255,255,255,0.7)" }}>
          ⚡
        </div>
      </div>
    </div>
  );
}

// ─── Side Actions ─────────────────────────────────────────────────────────────
function ShortActions({ video }: { video: YouTubeVideo | undefined }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);

  useEffect(() => { setLiked(false); setSaved(false); setCommentOpen(false); }, [video?.id]);

  if (!video) return null;

  const likeCount = video.viewCount
    ? Math.floor(parseInt(video.viewCount) * 0.05).toLocaleString()
    : "—";

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Channel avatar */}
      <a href={`/channel/${encodeURIComponent(video.channelTitle)}`}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl border-2 transition-all hover:scale-110"
          style={{ background: "linear-gradient(135deg,#00D4FF,#8B5CF6)", borderColor: "#050810", color: "#050810" }}>
          {video.channelTitle.charAt(0).toUpperCase()}
        </div>
      </a>

      <ActionBtn
        icon={<ThumbsUp size={22} fill={liked ? "#00D4FF" : "none"} className={liked ? "text-[#00D4FF]" : "text-[#E8EDF5]"} />}
        label={likeCount}
        active={liked}
        onClick={() => setLiked((v) => !v)}
        activeColor="rgba(0,212,255,0.2)"
        activeBorder="rgba(0,212,255,0.4)"
      />

      <ActionBtn
        icon={<MessageCircle size={22} className="text-[#E8EDF5]" />}
        label="Comments"
        onClick={() => setCommentOpen((v) => !v)}
      />

      <ActionBtn
        icon={<Share2 size={22} className="text-[#E8EDF5]" />}
        label="Share"
      />

      <ActionBtn
        icon={<Bookmark size={22} fill={saved ? "#8B5CF6" : "none"} className={saved ? "text-[#8B5CF6]" : "text-[#E8EDF5]"} />}
        label="Save"
        active={saved}
        onClick={() => setSaved((v) => !v)}
        activeColor="rgba(139,92,246,0.2)"
        activeBorder="rgba(139,92,246,0.4)"
      />
    </div>
  );
}

function ActionBtn({
  icon, label, active, onClick, activeColor, activeBorder,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  activeColor?: string;
  activeBorder?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={onClick}
        className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{
          background: active && activeColor ? activeColor : "#161B22",
          border: active && activeBorder ? `1px solid ${activeBorder}` : "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {icon}
      </button>
      <span className="text-xs text-[#7A8BA0] text-center max-w-[52px] truncate">{label}</span>
    </div>
  );
}
