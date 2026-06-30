"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Maximize2, Minimize2, Volume2, VolumeX,
  SkipForward, RefreshCw, Shield, CheckCircle,
} from "lucide-react";

interface AdFreePlayerProps {
  videoId: string;
  title?: string;
}

const EMBED_SOURCES = [
  {
    id: "nocookie",
    label: "YouTube Privacy",
    url: (id: string, muted: boolean) =>
      `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=${muted ? 1 : 0}&rel=0&modestbranding=1&iv_load_policy=3&fs=1`,
  },
  {
    id: "youtube",
    label: "YouTube Direct",
    url: (id: string, muted: boolean) =>
      `https://www.youtube.com/embed/${id}?autoplay=1&mute=${muted ? 1 : 0}&rel=0&modestbranding=1&fs=1`,
  },
  {
    id: "piped",
    label: "Piped (Ad-Free)",
    url: (id: string, _muted: boolean) =>
      `https://piped.video/embed/${id}?autoplay=1`,
  },
  {
    id: "invidious",
    label: "Invidious",
    url: (id: string, _muted: boolean) =>
      `https://invidious.nerdvpn.de/embed/${id}?autoplay=1`,
  },
];

export function AdFreePlayer({ videoId, title }: AdFreePlayerProps) {
  const [sourceIdx, setSourceIdx] = useState(0);
  const [theatreMode, setTheatreMode] = useState(false);
  const [muted, setMuted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentSource = EMBED_SOURCES[sourceIdx];
  const iframeSrc = currentSource.url(videoId, muted);

  // Reset loaded state when video or source changes
  useEffect(() => {
    setLoaded(false);
  }, [videoId, sourceIdx]);

  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  const trySource = (idx: number) => {
    setSourceIdx(idx);
    setLoaded(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "t" || e.key === "T") setTheatreMode((v) => !v);
      if (e.key === "m" || e.key === "M") setMuted((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className={`relative w-full overflow-hidden transition-all duration-300 ${theatreMode ? "" : "rounded-xl"}`}
      style={{
        aspectRatio: theatreMode ? "21/9" : "16/9",
        background: "#000",
        border: theatreMode ? "none" : "1px solid rgba(0,212,255,0.15)",
        boxShadow: theatreMode ? "none" : "0 0 40px rgba(0,212,255,0.08)",
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => { setShowControls(false); setShowSourceMenu(false); }}
    >
      {/* Spinner while loading */}
      {!loaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3"
          style={{ background: "#050810" }}>
          <div className="w-14 h-14 rounded-full border-2 border-[#00D4FF]/20 border-t-[#00D4FF] animate-spin" />
          <p className="text-[#7A8BA0] text-sm">{currentSource.label}…</p>
        </div>
      )}

      {/* The iframe — always rendered so it starts loading immediately */}
      <iframe
        ref={iframeRef}
        key={`${videoId}-${sourceIdx}-${muted}`}
        src={iframeSrc}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        onLoad={handleLoad}
        className="absolute inset-0 w-full h-full border-0"
        title={title || "Video"}
      />

      {/* Hover overlay controls */}
      <div className={`absolute top-3 right-3 z-20 flex items-center gap-2 transition-all duration-200 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        {loaded && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: "rgba(5,8,16,0.85)", border: "1px solid rgba(0,212,255,0.3)", color: "#00D4FF", backdropFilter: "blur(8px)" }}>
            <CheckCircle size={11} />
            Ad-Free · {currentSource.label}
          </div>
        )}

        <button onClick={() => setMuted((v) => !v)}
          className="p-2 rounded-full transition-all hover:scale-105"
          style={{ background: "rgba(5,8,16,0.85)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}
          title={muted ? "Unmute (M)" : "Mute (M)"}>
          {muted ? <VolumeX size={16} className="text-orange-400" /> : <Volume2 size={16} className="text-[#E8EDF5]" />}
        </button>

        <button onClick={() => setTheatreMode((v) => !v)}
          className="p-2 rounded-full transition-all hover:scale-105"
          style={{ background: "rgba(5,8,16,0.85)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}
          title="Theatre Mode (T)">
          {theatreMode ? <Minimize2 size={16} className="text-[#00D4FF]" /> : <Maximize2 size={16} className="text-[#E8EDF5]" />}
        </button>

        {/* Source switcher */}
        <div className="relative">
          <button onClick={() => setShowSourceMenu((v) => !v)}
            className="p-2 rounded-full transition-all hover:scale-105"
            style={{ background: "rgba(5,8,16,0.85)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}
            title="Switch source">
            <Shield size={16} className="text-[#8B5CF6]" />
          </button>

          {showSourceMenu && (
            <div className="absolute top-10 right-0 min-w-[190px] rounded-xl overflow-hidden z-30"
              style={{ background: "rgba(13,17,23,0.97)", border: "1px solid rgba(0,212,255,0.2)", backdropFilter: "blur(16px)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
              <div className="px-3 py-2" style={{ borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
                <p className="text-xs text-[#7A8BA0] font-semibold tracking-widest uppercase">Player Source</p>
              </div>
              {EMBED_SOURCES.map((src, i) => (
                <button key={src.id}
                  onClick={() => { trySource(i); setShowSourceMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors hover:bg-white/5"
                  style={{ color: i === sourceIdx ? "#00D4FF" : "#E8EDF5" }}>
                  <SkipForward size={13} className={i === sourceIdx ? "text-[#00D4FF]" : "text-[#7A8BA0]"} />
                  {src.label}
                  {i === sourceIdx && <span className="ml-auto text-xs text-[#00D4FF]">Active</span>}
                </button>
              ))}
              <div className="px-3 py-2" style={{ borderTop: "1px solid rgba(0,212,255,0.08)" }}>
                <p className="text-xs text-[#7A8BA0]">If video won&apos;t play, try another source</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom hint */}
      {showControls && loaded && (
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-3 text-xs pointer-events-none"
          style={{ color: "rgba(255,255,255,0.35)" }}>
          <span>T: Theatre</span>
          <span>M: Mute</span>
        </div>
      )}
    </div>
  );
}
