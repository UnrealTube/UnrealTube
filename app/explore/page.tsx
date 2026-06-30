"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import {
  Music2, Gamepad2, Trophy, Film, Newspaper,
  Lightbulb, Radio, Mic2, Palette, FlaskConical,
  Globe, Utensils, Heart, Car, Mountain,
} from "lucide-react";

const exploreCategories = [
  { icon: Music2, label: "Music", href: "/search?q=music", color: "#00D4FF", bg: "rgba(0,212,255,0.1)" },
  { icon: Gamepad2, label: "Gaming", href: "/search?q=gaming", color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" },
  { icon: Trophy, label: "Sports", href: "/search?q=sports", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  { icon: Film, label: "Movies & TV", href: "/search?q=movies", color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
  { icon: Newspaper, label: "News", href: "/search?q=news", color: "#10B981", bg: "rgba(16,185,129,0.1)" },
  { icon: Lightbulb, label: "Education", href: "/search?q=education tutorial", color: "#F97316", bg: "rgba(249,115,22,0.1)" },
  { icon: Radio, label: "Podcasts", href: "/search?q=podcast", color: "#06B6D4", bg: "rgba(6,182,212,0.1)" },
  { icon: Mic2, label: "Comedy", href: "/search?q=comedy funny", color: "#FBBF24", bg: "rgba(251,191,36,0.1)" },
  { icon: Palette, label: "Art & Design", href: "/search?q=art design", color: "#EC4899", bg: "rgba(236,72,153,0.1)" },
  { icon: FlaskConical, label: "Science", href: "/search?q=science discovery", color: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  { icon: Globe, label: "Travel", href: "/search?q=travel vlog", color: "#84CC16", bg: "rgba(132,204,22,0.1)" },
  { icon: Utensils, label: "Food", href: "/search?q=food cooking", color: "#F97316", bg: "rgba(249,115,22,0.1)" },
  { icon: Heart, label: "Health & Fitness", href: "/search?q=fitness workout", color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
  { icon: Car, label: "Cars", href: "/search?q=cars automotive", color: "#6B7280", bg: "rgba(107,114,128,0.1)" },
  { icon: Mountain, label: "Outdoors", href: "/search?q=outdoor adventure", color: "#10B981", bg: "rgba(16,185,129,0.1)" },
];

export default function ExplorePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen grid-bg" style={{ background: "#050810" }}>
      <Navbar onMenuToggle={() => setSidebarCollapsed((p) => !p)} />
      <Sidebar collapsed={sidebarCollapsed} />
      <main
        className="transition-all duration-300 pt-14"
        style={{ marginLeft: sidebarCollapsed ? "72px" : "224px" }}
      >
        <div className="px-6 py-6">
          <h1
            className="text-xl font-bold mb-8"
            style={{ fontFamily: "var(--font-orbitron)", color: "#E8EDF5" }}
          >
            EXPLORE
          </h1>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {exploreCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className="group relative rounded-xl p-6 flex flex-col items-center gap-3 text-center video-card transition-all"
                  style={{
                    background: cat.bg,
                    border: `1px solid ${cat.color}22`,
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110"
                    style={{
                      background: `${cat.color}20`,
                      boxShadow: `0 0 20px ${cat.color}30`,
                    }}
                  >
                    <Icon size={28} style={{ color: cat.color }} />
                  </div>
                  <span className="text-sm font-semibold text-[#E8EDF5]">{cat.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
