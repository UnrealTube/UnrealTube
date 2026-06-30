"use client";

import { useState, useEffect, use } from "react";
import { Navbar } from "@/components/Navbar";
import { genreLabel, MOVIE_SOURCES, type YTSDetail, type MovieSource } from "@/lib/movieSources";
import { Star, Play, ChevronLeft, Loader2, RefreshCw, Shield, Clock } from "lucide-react";
import Link from "next/link";

export default function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [movie, setMovie]         = useState<YTSDetail | null>(null);
  const [loading, setLoading]     = useState(true);
  const [sourceIdx, setSourceIdx] = useState(0);
  const [playerLoaded, setPlayerLoaded] = useState(false);
  const [playing, setPlaying]     = useState(false);
  const [showSrcMenu, setShowSrcMenu] = useState(false);

  useEffect(() => {
    fetch(`/api/movies?type=detail&id=${id}`)
      .then((r) => r.json())
      .then((d) => { setMovie(d.movie ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const source: MovieSource = MOVIE_SOURCES[sourceIdx];
  const embedUrl = movie ? source.embedByImdb(movie.imdb_code) : "";

  const switchSource = (idx: number) => {
    setSourceIdx(idx);
    setPlayerLoaded(false);
    setPlaying(true);
    setShowSrcMenu(false);
  };

  if (loading) return (
    <div className="min-h-screen grid-bg flex items-center justify-center" style={{ background: "#050810" }}>
      <Navbar />
      <Loader2 size={36} className="animate-spin text-[#00D4FF]" />
    </div>
  );

  if (!movie) return (
    <div className="min-h-screen grid-bg flex flex-col items-center justify-center gap-4" style={{ background: "#050810" }}>
      <Navbar />
      <p className="text-[#7A8BA0]">Film bulunamadı.</p>
      <Link href="/movies" className="text-[#00D4FF] hover:underline text-sm">← Film İzle</Link>
    </div>
  );

  const backdrop = movie.background_image_original || movie.background_image || "";
  const poster   = movie.large_cover_image || movie.medium_cover_image || "";
  const runtime  = movie.runtime ? `${Math.floor(movie.runtime / 60)}sa ${movie.runtime % 60}dk` : "";

  return (
    <div className="min-h-screen" style={{ background: "#050810" }}>
      <Navbar />

      {/* Backdrop hero */}
      <div className="relative w-full pt-14" style={{ minHeight: 420 }}>
        {backdrop && (
          <div className="absolute inset-0 overflow-hidden">
            <img src={backdrop} alt="" className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(to bottom, rgba(5,8,16,0.3) 0%, rgba(5,8,16,0.95) 80%, #050810 100%)" }} />
          </div>
        )}

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-6 py-8">
          <Link href="/movies"
            className="inline-flex items-center gap-1.5 text-sm text-[#7A8BA0] hover:text-[#00D4FF] transition-colors mb-6">
            <ChevronLeft size={16} /> Film İzle
          </Link>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="flex-shrink-0">
              <div className="w-44 md:w-56 rounded-2xl overflow-hidden shadow-2xl"
                style={{ border: "1px solid rgba(0,212,255,0.2)", boxShadow: "0 0 40px rgba(0,212,255,0.12)" }}>
                {poster
                  ? <img src={poster} alt={movie.title} className="w-full object-cover" />
                  : <div className="w-full aspect-[2/3] bg-[#161B22] flex items-center justify-center">
                      <Play size={32} className="text-[#7A8BA0]" />
                    </div>
                }
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-4xl font-black text-[#E8EDF5] leading-tight">
                {movie.title}
              </h1>
              {movie.title !== movie.title_english && movie.title_english && (
                <p className="text-sm text-[#7A8BA0] mt-1 italic">{movie.title_english}</p>
              )}

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="flex items-center gap-1 text-sm font-bold text-yellow-400">
                  <Star size={14} fill="currentColor" /> {movie.rating?.toFixed(1)}
                </span>
                <MetaBadge>{movie.year}</MetaBadge>
                {runtime && (
                  <MetaBadge>
                    <span className="flex items-center gap-1"><Clock size={11} />{runtime}</span>
                  </MetaBadge>
                )}
                {movie.language && <MetaBadge>{movie.language.toUpperCase()}</MetaBadge>}
                {(movie.genres ?? []).map((g) => <MetaBadge key={g}>{g}</MetaBadge>)}
              </div>

              {/* IMDB */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-[#7A8BA0]">IMDb:</span>
                <a href={`https://www.imdb.com/title/${movie.imdb_code}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-xs text-yellow-400 hover:underline font-mono">
                  {movie.imdb_code}
                </a>
              </div>

              {/* Overview */}
              {movie.description_full && (
                <p className="mt-4 text-sm text-[#A0AEC0] leading-relaxed max-w-2xl">
                  {movie.description_full}
                </p>
              )}

              {/* Play + source buttons */}
              <div className="flex flex-wrap items-center gap-3 mt-6">
                <button onClick={() => { setPlaying(true); setPlayerLoaded(false); }}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg,#00D4FF,#8B5CF6)", color: "#050810", boxShadow: "0 0 20px rgba(0,212,255,0.3)" }}>
                  <Play size={16} fill="currentColor" /> İzle — {source.name}
                </button>

                <div className="relative">
                  <button onClick={() => setShowSrcMenu((v) => !v)}
                    className="flex items-center gap-2 px-4 py-3 rounded-full text-sm font-semibold transition-all hover:scale-105"
                    style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#8B5CF6" }}>
                    <Shield size={15} /> Kaynak Seç
                  </button>
                  {showSrcMenu && (
                    <div className="absolute top-12 left-0 z-30 min-w-[200px] rounded-xl overflow-hidden"
                      style={{ background: "rgba(13,17,23,0.98)", border: "1px solid rgba(0,212,255,0.2)", backdropFilter: "blur(16px)", boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}>
                      <div className="px-3 py-2" style={{ borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
                        <p className="text-xs text-[#7A8BA0] font-semibold tracking-widest uppercase">Film Kaynağı</p>
                      </div>
                      {MOVIE_SOURCES.map((src, i) => (
                        <button key={src.id} onClick={() => switchSource(i)}
                          className="w-full flex items-center gap-3 px-3 py-3 text-sm text-left hover:bg-white/5 transition-colors"
                          style={{ color: i === sourceIdx ? src.color : "#E8EDF5" }}>
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: src.color }} />
                          {src.name}
                          {i === sourceIdx && <span className="ml-auto text-xs" style={{ color: src.color }}>Aktif</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Player */}
      {playing && (
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 pb-10">
          <div className="relative w-full rounded-2xl overflow-hidden"
            style={{ aspectRatio: "16/9", background: "#000", border: "1px solid rgba(0,212,255,0.15)", boxShadow: "0 0 50px rgba(0,212,255,0.1)" }}>
            {!playerLoaded && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3"
                style={{ background: "#050810" }}>
                <div className="w-12 h-12 rounded-full border-2 border-[#00D4FF]/20 border-t-[#00D4FF] animate-spin" />
                <p className="text-sm text-[#7A8BA0]">{source.name} yükleniyor…</p>
              </div>
            )}
            <iframe
              key={`${movie.imdb_code}-${sourceIdx}`}
              src={embedUrl}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              onLoad={() => setPlayerLoaded(true)}
              className="absolute inset-0 w-full h-full border-0"
              title={movie.title}
            />
            <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ background: source.color + "22", border: `1px solid ${source.color}55`, color: source.color, backdropFilter: "blur(8px)" }}>
                {source.shortName}
              </div>
              <button onClick={() => switchSource((sourceIdx + 1) % MOVIE_SOURCES.length)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ background: "rgba(5,8,16,0.85)", border: "1px solid rgba(255,255,255,0.12)", color: "#7A8BA0", backdropFilter: "blur(8px)" }}>
                <RefreshCw size={11} /> Değiştir
              </button>
            </div>
          </div>
          <p className="text-xs text-[#7A8BA0] mt-3 text-center">
            Film yüklenmiyor mu? &nbsp;
            {MOVIE_SOURCES.map((s, i) => (
              <button key={s.id} onClick={() => switchSource(i)}
                className="font-semibold hover:underline mx-1"
                style={{ color: i === sourceIdx ? s.color : "#555" }}>
                {s.name}
              </button>
            ))}
          </p>
        </div>
      )}
    </div>
  );
}

function MetaBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.15)", color: "#7A8BA0" }}>
      {children}
    </span>
  );
}
