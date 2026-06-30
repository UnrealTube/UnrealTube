"use client";

import { GENRES, type Genre } from "@/lib/movieSources";
import { SlidersHorizontal } from "lucide-react";

interface GenrePanelProps {
  activeGenre: string;
  onGenreChange: (id: string) => void;
}

export function GenrePanel({ activeGenre, onGenreChange }: GenrePanelProps) {
  return (
    <aside
      className="w-52 flex-shrink-0 rounded-2xl p-4 sticky top-20 self-start"
      style={{ background: "#0D1117", border: "1px solid rgba(0,212,255,0.12)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal size={15} className="text-[#00D4FF]" />
        <p className="text-sm font-bold text-[#E8EDF5] tracking-wide">Film Türü</p>
      </div>
      <div className="flex flex-col gap-1">
        {GENRES.map((g: Genre) => {
          const isActive = g.id === activeGenre;
          return (
            <button
              key={g.id || "all"}
              onClick={() => onGenreChange(g.id)}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: isActive
                  ? "linear-gradient(135deg,rgba(0,212,255,0.15),rgba(139,92,246,0.15))"
                  : "transparent",
                border: isActive
                  ? "1px solid rgba(0,212,255,0.3)"
                  : "1px solid transparent",
                color: isActive ? "#00D4FF" : "#7A8BA0",
              }}
            >
              {g.trName}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
