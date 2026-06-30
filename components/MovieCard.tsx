"use client";

import Link from "next/link";
import { Star, Play } from "lucide-react";
import { genreLabel, type YTSMovie, type MovieSource } from "@/lib/movieSources";

interface MovieCardProps {
  movie: YTSMovie;
  source: MovieSource;
}

export function MovieCard({ movie, source }: MovieCardProps) {
  const poster = movie.medium_cover_image || movie.small_cover_image || "";
  const score  = movie.rating?.toFixed(1) ?? "?";

  return (
    <Link
      href={`/movies/${movie.id}`}
      className="group relative block rounded-xl overflow-hidden video-card"
      style={{ background: "#0D1117", border: "1px solid rgba(0,212,255,0.08)" }}
    >
      {/* Poster */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "2/3" }}>
        {poster ? (
          <img
            src={poster}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,rgba(0,212,255,0.1),rgba(139,92,246,0.1))" }}>
            <Play size={32} className="text-[#7A8BA0]" />
          </div>
        )}

        {/* Play overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
          style={{ background: "rgba(5,8,16,0.65)" }}
        >
          <div className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#00D4FF,#8B5CF6)", boxShadow: "0 0 24px rgba(0,212,255,0.5)" }}>
            <Play size={20} className="text-[#050810] fill-[#050810] ml-1" />
          </div>
        </div>

        {/* Score */}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md"
          style={{ background: "rgba(5,8,16,0.88)", backdropFilter: "blur(6px)" }}>
          <Star size={10} className="text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-bold text-[#E8EDF5]">{score}</span>
        </div>

        {/* Source badge */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-xs font-bold"
          style={{
            background: source.color + "22",
            border: `1px solid ${source.color}55`,
            color: source.color,
            backdropFilter: "blur(6px)",
          }}>
          {source.shortName}
        </div>

        {/* Year badge */}
        <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md text-xs font-medium"
          style={{ background: "rgba(5,8,16,0.88)", color: "#7A8BA0", backdropFilter: "blur(6px)" }}>
          {movie.year}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-[#E8EDF5] leading-snug line-clamp-1 group-hover:text-[#00D4FF] transition-colors">
          {movie.title}
        </h3>
        <p className="text-xs text-[#7A8BA0] mt-1 line-clamp-1">
          {genreLabel(movie.genres ?? [])}
        </p>
      </div>
    </Link>
  );
}
