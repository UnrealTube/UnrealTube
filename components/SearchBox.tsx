"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Clock, X, Trash2 } from "lucide-react";
import { VoiceSearch } from "@/components/VoiceSearch";
import {
  pushSearch, getHistory, deleteEntry, clearHistory,
  type SearchEntry,
} from "@/lib/searchHistory";

interface SearchBoxProps {
  initialQuery?: string;
}

export function SearchBox({ initialQuery = "" }: SearchBoxProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [focused, setFocused] = useState(false);
  const [history, setHistory] = useState<SearchEntry[]>([]);
  const [voiceActive, setVoiceActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Reload history whenever dropdown may open
  useEffect(() => {
    if (focused) setHistory(getHistory());
  }, [focused]);

  // Close on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const doSearch = useCallback((q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    pushSearch(trimmed);
    setHistory(getHistory());
    setFocused(false);
    setQuery(trimmed);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(query);
  };

  const handleVoiceResult = useCallback((transcript: string) => {
    setQuery(transcript);
    doSearch(transcript);
  }, [doSearch]);

  const removeEntry = (entry: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteEntry(entry);
    setHistory(getHistory());
  };

  const filteredHistory = query.trim()
    ? history.filter((h) => h.query.toLowerCase().includes(query.toLowerCase()))
    : history;

  const showDropdown = focused && filteredHistory.length > 0;

  return (
    <div ref={boxRef} className="flex-1 max-w-2xl mx-auto relative">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* Input wrapper */}
        <div
          className="flex-1 flex items-center gap-2 px-4 py-2 rounded-full transition-all"
          style={{
            background: "#0D1117",
            border: focused
              ? "1px solid rgba(0,212,255,0.5)"
              : "1px solid rgba(0,212,255,0.2)",
            boxShadow: focused ? "0 0 12px rgba(0,212,255,0.1)" : "none",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Search videos, channels…"
            className="flex-1 bg-transparent text-sm text-[#E8EDF5] placeholder:text-[#7A8BA0] outline-none"
            autoComplete="off"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="p-0.5 rounded-full hover:bg-white/10 transition-colors flex-shrink-0">
              <X size={14} className="text-[#7A8BA0]" />
            </button>
          )}
        </div>

        {/* Search button */}
        <button type="submit"
          className="p-2.5 rounded-full transition-all hover:scale-105 flex-shrink-0"
          style={{ background: "#161B22", border: "1px solid rgba(0,212,255,0.25)", boxShadow: "0 0 10px rgba(0,212,255,0.08)" }}>
          <Search size={18} className="text-[#00D4FF]" />
        </button>

        {/* Voice search */}
        <VoiceSearch onResult={handleVoiceResult} lang="tr-TR" />
      </form>

      {/* History dropdown */}
      {showDropdown && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-2xl z-50 overflow-hidden"
          style={{
            background: "rgba(13,17,23,0.98)",
            border: "1px solid rgba(0,212,255,0.18)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
          }}
        >
          <div className="flex items-center justify-between px-4 py-2.5"
            style={{ borderBottom: "1px solid rgba(0,212,255,0.08)" }}>
            <span className="text-xs font-semibold text-[#7A8BA0] tracking-widest uppercase">
              Search History
            </span>
            <button onClick={() => { clearHistory(); setHistory([]); }}
              className="flex items-center gap-1 text-xs text-[#7A8BA0] hover:text-red-400 transition-colors">
              <Trash2 size={11} /> Clear all
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {filteredHistory.map((entry) => (
              <button
                key={entry.at}
                type="button"
                onClick={() => { setQuery(entry.query); doSearch(entry.query); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-white/5 transition-colors group"
              >
                <Clock size={14} className="text-[#7A8BA0] flex-shrink-0" />
                <span className="flex-1 text-[#E8EDF5] truncate">{entry.query}</span>
                <span onClick={(e) => removeEntry(entry.query, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-all flex-shrink-0">
                  <X size={12} className="text-[#7A8BA0]" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
