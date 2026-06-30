"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { COUNTRIES, type Country } from "@/lib/preferences";

interface CountryPickerProps {
  current: Country;
  onChange: (c: Country) => void;
}

export function CountryPicker({ current, onChange }: CountryPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.langName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => { setOpen((v) => !v); setSearch(""); }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105"
        style={{
          background: open
            ? "rgba(0,212,255,0.15)"
            : "rgba(255,255,255,0.05)",
          border: "1px solid rgba(0,212,255,0.25)",
          color: "#E8EDF5",
        }}
        title="Language & Region"
      >
        <Globe size={14} className="text-[#00D4FF]" />
        <span className="hidden sm:block text-base leading-none">{current.flag}</span>
        <span className="hidden md:block text-xs" style={{ color: "#00D4FF" }}>
          {current.code}
        </span>
        <ChevronDown
          size={12}
          className="text-[#7A8BA0] transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-11 w-72 rounded-2xl z-50 overflow-hidden"
          style={{
            background: "rgba(13,17,23,0.98)",
            border: "1px solid rgba(0,212,255,0.2)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,255,0.05)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Header */}
          <div className="px-4 pt-4 pb-2">
            <p
              className="text-xs font-bold tracking-widest uppercase mb-3"
              style={{ color: "#00D4FF" }}
            >
              Language &amp; Region
            </p>
            {/* Search */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: "#161B22", border: "1px solid rgba(0,212,255,0.15)" }}
            >
              <Globe size={13} className="text-[#7A8BA0] flex-shrink-0" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country…"
                className="flex-1 bg-transparent text-sm text-[#E8EDF5] placeholder:text-[#7A8BA0] outline-none"
              />
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-64 px-2 pb-3">
            {filtered.length === 0 && (
              <p className="text-center text-xs text-[#7A8BA0] py-4">No results</p>
            )}
            {filtered.map((c) => {
              const isActive = c.code === current.code;
              return (
                <button
                  key={c.code}
                  onClick={() => { onChange(c); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-white/5"
                  style={{
                    background: isActive ? "rgba(0,212,255,0.1)" : "transparent",
                  }}
                >
                  <span className="text-xl leading-none w-7 text-center">{c.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#E8EDF5] truncate">{c.name}</p>
                    <p className="text-xs text-[#7A8BA0]">{c.langName}</p>
                  </div>
                  {isActive && <Check size={14} className="text-[#00D4FF] flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
