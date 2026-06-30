"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Menu, Zap, LogOut, ChevronDown } from "lucide-react";
import { SearchBox } from "@/components/SearchBox";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/lib/authContext";

interface NavbarProps {
  onMenuToggle?: () => void;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  const { user, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const openSignIn = () => { setAuthTab("signin"); setShowAuth(true); };
  const openSignUp = () => { setAuthTab("signup"); setShowAuth(true); };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 gap-3"
        style={{
          background: "rgba(5,8,16,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,212,255,0.12)",
        }}
      >
        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-3 min-w-[180px]">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Menu size={20} className="text-[#7A8BA0]" />
          </button>
          <Link href="/" className="flex items-center gap-2 group">
            <div
              className="relative flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#00D4FF,#8B5CF6)", boxShadow: "0 0 15px rgba(0,212,255,0.4)" }}
            >
              <Zap size={16} className="text-black fill-black" />
            </div>
            <span
              className="text-lg font-bold tracking-wider hidden sm:block"
              style={{
                fontFamily: "var(--font-orbitron)",
                background: "linear-gradient(90deg,#00D4FF,#8B5CF6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              UNREALTUBE
            </span>
          </Link>
        </div>

        {/* Center: Search with voice + history */}
        <SearchBox />

        {/* Right: Bell + Auth */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="p-2 rounded-full hover:bg-white/5 transition-colors hidden sm:flex">
            <Bell size={20} className="text-[#7A8BA0]" />
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-full transition-all hover:bg-white/5"
                style={{ border: "1px solid rgba(0,212,255,0.2)" }}
              >
                {/* Avatar */}
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name}
                    className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "linear-gradient(135deg,#00D4FF,#8B5CF6)", color: "#050810" }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-[#E8EDF5] hidden md:block max-w-[100px] truncate">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown size={14} className="text-[#7A8BA0] hidden md:block" />
              </button>

              {/* User dropdown */}
              {showUserMenu && (
                <div
                  className="absolute right-0 top-11 w-56 rounded-2xl z-50 overflow-hidden"
                  style={{
                    background: "rgba(13,17,23,0.98)",
                    border: "1px solid rgba(0,212,255,0.2)",
                    backdropFilter: "blur(16px)",
                    boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
                  }}
                >
                  {/* User info */}
                  <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(0,212,255,0.08)" }}>
                    <p className="text-sm font-semibold text-[#E8EDF5]">{user.name}</p>
                    <p className="text-xs text-[#7A8BA0] truncate">{user.email}</p>
                    {user.googleLinked && (
                      <span className="inline-flex items-center gap-1 mt-1 text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(0,212,255,0.1)", color: "#00D4FF" }}>
                        ✓ Google linked
                      </span>
                    )}
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { signOut(); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-white/5 transition-colors"
                      style={{ color: "#EF4444" }}
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={openSignIn}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg,rgba(0,212,255,0.15),rgba(139,92,246,0.15))",
                  border: "1px solid rgba(0,212,255,0.3)",
                  color: "#00D4FF",
                }}
              >
                Sign In
              </button>
              <button
                onClick={openSignUp}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105 hidden md:block"
                style={{ background: "linear-gradient(135deg,#00D4FF,#8B5CF6)", color: "#050810" }}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Auth modal */}
      {showAuth && (
        <AuthModal
          defaultTab={authTab}
          onClose={() => setShowAuth(false)}
        />
      )}
    </>
  );
}
