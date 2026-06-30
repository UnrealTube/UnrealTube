"use client";

import { useState } from "react";
import { X, Zap, Mail, Lock, User, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/authContext";

interface AuthModalProps {
  onClose: () => void;
  defaultTab?: "signin" | "signup";
}

export function AuthModal({ onClose, defaultTab = "signin" }: AuthModalProps) {
  const { signInWithGoogle } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">(defaultTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithGoogle();
      onClose();
    } catch {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(5,8,16,0.88)", backdropFilter: "blur(10px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: "#0D1117",
          border: "1px solid rgba(0,212,255,0.2)",
          boxShadow: "0 0 80px rgba(0,212,255,0.1)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4"
          style={{ borderBottom: "1px solid rgba(0,212,255,0.08)" }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#00D4FF,#8B5CF6)" }}>
              <Zap size={14} className="text-black" />
            </div>
            <span className="font-bold text-[#E8EDF5]" style={{ fontFamily: "var(--font-orbitron)", fontSize: 15 }}>
              UNREALTUBE
            </span>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <X size={18} className="text-[#7A8BA0]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mx-6 mt-5 mb-4 rounded-xl overflow-hidden"
          style={{ background: "#161B22", border: "1px solid rgba(0,212,255,0.1)" }}>
          {(["signin", "signup"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-2.5 text-sm font-semibold transition-all"
              style={{
                background: tab === t ? "linear-gradient(135deg,rgba(0,212,255,0.15),rgba(139,92,246,0.15))" : "transparent",
                color: tab === t ? "#00D4FF" : "#7A8BA0",
                borderBottom: tab === t ? "2px solid #00D4FF" : "2px solid transparent",
              }}>
              {t === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] disabled:opacity-60"
            style={{
              background: "#fff",
              color: "#1a1a1a",
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            }}
          >
            {/* Google SVG */}
            <GoogleLogo />
            {loading ? "Connecting…" : `Continue with Google`}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            <span className="text-xs text-[#7A8BA0]">or</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Email fields */}
          {tab === "signup" && (
            <Field icon={<User size={15} />} placeholder="Full name" type="text" />
          )}
          <Field icon={<Mail size={15} />} placeholder="Email address" type="email" />
          <Field icon={<Lock size={15} />} placeholder="Password" type="password" />

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
              <AlertCircle size={13} /> {error}
            </div>
          )}

          {/* Submit */}
          <button
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg,#00D4FF,#8B5CF6)", color: "#050810" }}
          >
            {tab === "signin" ? "Sign In" : "Create Account"}
          </button>

          {/* YouTube sync notice */}
          <p className="text-xs text-[#7A8BA0] text-center leading-relaxed pt-1">
            Sign in with Google to sync your YouTube history &amp; preferences with UnrealTube.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, placeholder, type }: { icon: React.ReactNode; placeholder: string; type: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ background: "#161B22", border: "1px solid rgba(0,212,255,0.12)" }}>
      <span className="text-[#7A8BA0] flex-shrink-0">{icon}</span>
      <input type={type} placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-[#E8EDF5] placeholder:text-[#7A8BA0] outline-none" />
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
