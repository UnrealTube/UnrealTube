"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { MovieCard } from "@/components/MovieCard";
import { GenrePanel } from "@/components/GenrePanel";
import { MOVIE_SOURCES, type YTSMovie } from "@/lib/movieSources";
import { Loader2, Film, ChevronDown, Search } from "lucide-react";

type SortKey = "popular" | "trending" | "top_rated";

async function fetchMovies(params: {
  type: SortKey | "genre" | "search";
  genre?: string;
  q?: string;
  page?: number;
}): Promise<{ movies: YTSMovie[]; totalPages: number }> {
  const qs = new URLSearchParams({
    type: params.genre ? "genre" : params.q ? "search" : params.type,
    ...(params.genre ? { genre: params.genre } : {}),
    ...(params.q ? { q: params.q } : {}),
    page: String(params.page ?? 1),
  });
  try {
    const res = await fetch(`/api/movies?${qs}`);
    if (!res.ok) return { movies: [], totalPages: 1 };
    return res.json();
  } catch {
    return { movies: [], totalPages: 1 };
  }
}

export default function MoviesPage() {
  const [movies, setMovies]           = useState<YTSMovie[]>([]);
  const [loading, setLoading]         = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [activeGenre, setActiveGenre] = useState("");
  const [sortKey, setSortKey]         = useState<SortKey>("popular");
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [searchQ, setSearchQ]         = useState("");
  const [searchInput, setSearchInput] = useState("");

  const getSource = (idx: number) => MOVIE_SOURCES[idx % MOVIE_SOURCES.length];

  const load = useCallback(async (
    genre: string, sort: SortKey, pg: number, q: string,
  ) => {
    setLoading(true);
    const result = await fetchMovies({
      type: q ? "search" : genre ? "genre" : sort,
      genre: genre || undefined,
      q: q || undefined,
      page: pg,
    });
    if (pg === 1) setMovies(result.movies);
    else setMovies((prev) => [...prev, ...result.movies]);
    setTotalPages(result.totalPages ?? 1);
    setLoading(false);
  }, []);

  useEffect(() => {
    setPage(1);
    setMovies([]);
    load(activeGenre, sortKey, 1, searchQ);
  }, [activeGenre, sortKey, searchQ, load]);

  const handleGenre = (id: string) => {
    setActiveGenre(id);
    setSearchQ("");
    setSearchInput("");
  };

  const handleSort = (s: SortKey) => {
    setSortKey(s);
    setActiveGenre("");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQ(searchInput.trim());
    setActiveGenre("");
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    load(activeGenre, sortKey, next, searchQ);
  };

  return (
    <div className="min-h-screen grid-bg" style={{ background: "#050810" }}>
      <Navbar onMenuToggle={() => setSidebarCollapsed((v) => !v)} />
      <Sidebar collapsed={sidebarCollapsed} />

      <main
        className="transition-all duration-300 pt-14"
        style={{ marginLeft: sidebarCollapsed ? "72px" : "224px" }}
      >
        <div className="px-4 md:px-6 py-5">

          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#00D4FF,#8B5CF6)" }}>
                <Film size={18} className="text-[#050810]" />
              </div>
              <div>
                <h1 className="text-xl font-black text-[#E8EDF5]"
                  style={{ fontFamily: "var(--font-orbitron)" }}>
                  FİLM İZLE
                </h1>
                <p className="text-xs text-[#7A8BA0]">
                  VidSrc · Embed.su · MultiEmbed · SmashyStream kaynaklı
                </p>
              </div>
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex items-center gap-2 sm:ml-auto">
              <div className="flex items-center gap-2 px-3 py-2 rounded-full"
                style={{ background: "#0D1117", border: "1px solid rgba(0,212,255,0.2)" }}>
                <Search size={14} className="text-[#7A8BA0]" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Film ara…"
                  className="bg-transparent text-sm text-[#E8EDF5] placeholder:text-[#7A8BA0] outline-none w-44"
                />
              </div>
              <button type="submit"
                className="px-4 py-2 rounded-full text-xs font-semibold transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg,#00D4FF,#8B5CF6)", color: "#050810" }}>
                Ara
              </button>
            </form>
          </div>

          {/* Sort tabs */}
          {!searchQ && (
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              {([
                { key: "popular",    label: "Popüler" },
                { key: "trending",   label: "Trend" },
                { key: "top_rated",  label: "En İyi" },
              ] as { key: SortKey; label: string }[]).map((s) => (
                <button key={s.key} onClick={() => handleSort(s.key)}
                  className="px-4 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105"
                  style={{
                    background: sortKey === s.key && activeGenre === ""
                      ? "linear-gradient(135deg,#00D4FF,#8B5CF6)"
                      : "rgba(255,255,255,0.06)",
                    color: sortKey === s.key && activeGenre === "" ? "#050810" : "#7A8BA0",
                    border: sortKey === s.key && activeGenre === ""
                      ? "none" : "1px solid rgba(255,255,255,0.1)",
                  }}>
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Source legend */}
          <SourceLegend />

          {/* Main content: grid + genre panel */}
          <div className="flex gap-5 mt-4">
            {/* Movie grid */}
            <div className="flex-1 min-w-0">
              {loading && movies.length === 0 ? (
                <LoadingGrid />
              ) : movies.length === 0 ? (
                <div className="text-center py-20 text-[#7A8BA0]">Film bulunamadı.</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                    {movies.map((movie, i) => (
                      <div key={`${movie.id}-${i}`}
                        className="animate-in fade-in slide-in-from-bottom-4"
                        style={{ animationDelay: `${Math.min(i % 10, 9) * 40}ms`, animationDuration: "350ms" }}>
                        <MovieCard movie={movie} source={getSource(i)} />
                      </div>
                    ))}
                  </div>

                  {page < totalPages && (
                    <div className="flex justify-center mt-8">
                      <button onClick={loadMore} disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all hover:scale-105 disabled:opacity-60"
                        style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", color: "#00D4FF" }}>
                        {loading
                          ? <Loader2 size={16} className="animate-spin" />
                          : <ChevronDown size={16} />}
                        Daha Fazla Yükle
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Genre panel — right side */}
            <GenrePanel activeGenre={activeGenre} onGenreChange={handleGenre} />
          </div>
        </div>
      </main>
    </div>
  );
}

function SourceLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs text-[#7A8BA0]">Kaynaklar:</span>
      {MOVIE_SOURCES.map((s) => (
        <div key={s.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: s.color + "15", border: `1px solid ${s.color}35`, color: s.color }}>
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
          {s.name}
        </div>
      ))}
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl overflow-hidden"
          style={{ background: "#0D1117", border: "1px solid rgba(0,212,255,0.06)" }}>
          <div className="w-full bg-[#161B22]" style={{ aspectRatio: "2/3" }} />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-[#161B22] rounded w-3/4" />
            <div className="h-3 bg-[#161B22] rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
