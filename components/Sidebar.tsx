"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Flame, Compass, Clock, ThumbsUp, PlaySquare,
  Music2, Gamepad2, Trophy, Newspaper, Lightbulb,
  Film, Radio, ChevronRight, Zap,
} from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
}

const mainNavItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Flame, label: "Trending", href: "/trending" },
  { icon: Zap, label: "Shorts", href: "/shorts" },
  { icon: Film, label: "Film İzle", href: "/movies" },
  { icon: Compass, label: "Explore", href: "/explore" },
];

const libraryItems = [
  { icon: Clock, label: "Watch Later", href: "/watch-later" },
  { icon: ThumbsUp, label: "Liked Videos", href: "/liked" },
  { icon: PlaySquare, label: "History", href: "/history" },
];

const categories = [
  { icon: Music2, label: "Music", href: "/category/music" },
  { icon: Gamepad2, label: "Gaming", href: "/category/gaming" },
  { icon: Trophy, label: "Sports", href: "/category/sports" },
  { icon: Film, label: "Movies", href: "/category/movies" },
  { icon: Newspaper, label: "News", href: "/category/news" },
  { icon: Lightbulb, label: "Learning", href: "/category/learning" },
  { icon: Radio, label: "Podcasts", href: "/category/podcasts" },
];

function NavItem({ icon: Icon, label, href, collapsed }: {
  icon: typeof Home;
  label: string;
  href: string;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${
        isActive ? "text-[#00D4FF]" : "text-[#7A8BA0] hover:text-[#E8EDF5]"
      }`}
      style={{
        background: isActive ? "rgba(0, 212, 255, 0.1)" : "transparent",
        border: isActive ? "1px solid rgba(0, 212, 255, 0.2)" : "1px solid transparent",
      }}
    >
      <Icon
        size={20}
        className={`flex-shrink-0 ${isActive ? "text-[#00D4FF]" : "text-[#7A8BA0] group-hover:text-[#E8EDF5]"} transition-colors`}
      />
      {!collapsed && (
        <span className="font-medium truncate">{label}</span>
      )}
    </Link>
  );
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  return (
    <aside
      className={`fixed left-0 top-14 bottom-0 z-40 overflow-y-auto transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-56"
      }`}
      style={{
        background: "#0A0D14",
        borderRight: "1px solid rgba(0, 212, 255, 0.08)",
      }}
    >
      <div className="p-2 flex flex-col gap-1">
        {mainNavItems.map((item) => (
          <NavItem key={item.href} {...item} collapsed={collapsed} />
        ))}

        {!collapsed && (
          <div className="my-2 px-3">
            <div
              className="h-px"
              style={{ background: "rgba(0, 212, 255, 0.1)" }}
            />
          </div>
        )}
        {collapsed && <div className="my-1" />}

        {!collapsed && (
          <p className="px-3 py-1 text-xs font-semibold tracking-widest uppercase"
            style={{ color: "rgba(0, 212, 255, 0.5)" }}>
            Library
          </p>
        )}
        {libraryItems.map((item) => (
          <NavItem key={item.href} {...item} collapsed={collapsed} />
        ))}

        {!collapsed && (
          <div className="my-2 px-3">
            <div
              className="h-px"
              style={{ background: "rgba(0, 212, 255, 0.1)" }}
            />
          </div>
        )}
        {collapsed && <div className="my-1" />}

        {!collapsed && (
          <p className="px-3 py-1 text-xs font-semibold tracking-widest uppercase"
            style={{ color: "rgba(0, 212, 255, 0.5)" }}>
            Categories
          </p>
        )}
        {categories.map((item) => (
          <NavItem key={item.href} {...item} collapsed={collapsed} />
        ))}

        {!collapsed && (
          <button className="flex items-center gap-2 px-3 py-2 mt-1 text-sm rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: "#7A8BA0" }}>
            <ChevronRight size={16} />
            <span>Show more</span>
          </button>
        )}
      </div>
    </aside>
  );
}
