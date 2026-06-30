"use client";

import { useState } from "react";
import { X, Copy, Check, Twitter, Facebook, Link2 } from "lucide-react";

interface ShareModalProps {
  videoId: string;
  title: string;
  onClose: () => void;
}

export function ShareModal({ videoId, title, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [startAt, setStartAt] = useState("");

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const watchUrl = `${baseUrl}/watch?v=${videoId}${startAt ? `&t=${startAt}` : ""}`;
  const ytUrl = `https://youtu.be/${videoId}${startAt ? `?t=${startAt}` : ""}`;

  const copyLink = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(5, 8, 16, 0.85)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{
          background: "#0D1117",
          border: "1px solid rgba(0, 212, 255, 0.2)",
          boxShadow: "0 0 60px rgba(0,212,255,0.1)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-[#E8EDF5]">Share Video</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={18} className="text-[#7A8BA0]" />
          </button>
        </div>

        {/* Title */}
        <p className="text-xs text-[#7A8BA0] line-clamp-2 mb-4">{title}</p>

        {/* UnrealTube link */}
        <div className="mb-3">
          <p className="text-xs text-[#7A8BA0] mb-1.5 flex items-center gap-1.5">
            <Link2 size={11} /> UnrealTube Link
          </p>
          <div
            className="flex items-center gap-2 p-2 rounded-lg"
            style={{ background: "#161B22", border: "1px solid rgba(0,212,255,0.1)" }}
          >
            <span className="flex-1 text-xs text-[#E8EDF5] truncate">{watchUrl}</span>
            <button
              onClick={() => copyLink(watchUrl)}
              className="flex-shrink-0 p-1.5 rounded-md transition-all hover:scale-105"
              style={{
                background: copied ? "rgba(16, 185, 129, 0.2)" : "rgba(0, 212, 255, 0.15)",
                color: copied ? "#10B981" : "#00D4FF",
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Start at time */}
        <div className="mb-5">
          <label className="text-xs text-[#7A8BA0] block mb-1.5">Start at (seconds)</label>
          <input
            type="number"
            min="0"
            placeholder="e.g. 120"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm text-[#E8EDF5] bg-[#161B22] outline-none"
            style={{ border: "1px solid rgba(0,212,255,0.15)" }}
          />
        </div>

        {/* Social share */}
        <div className="flex items-center gap-3">
          <p className="text-xs text-[#7A8BA0] mr-1">Share on:</p>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(ytUrl)}&text=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105"
            style={{ background: "rgba(29,161,242,0.15)", color: "#1DA1F2", border: "1px solid rgba(29,161,242,0.2)" }}
          >
            <Twitter size={13} /> Twitter
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(ytUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105"
            style={{ background: "rgba(66,103,178,0.15)", color: "#4267B2", border: "1px solid rgba(66,103,178,0.2)" }}
          >
            <Facebook size={13} /> Facebook
          </a>
        </div>
      </div>
    </div>
  );
}
