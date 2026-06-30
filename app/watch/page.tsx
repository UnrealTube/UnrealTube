"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { VideoCard } from "@/components/VideoCard";
import { AdFreePlayer } from "@/components/AdFreePlayer";
import { ShareModal } from "@/components/ShareModal";
import {
  fetchVideoDetails, fetchRelatedVideos,
  formatViewCount, formatRelativeTime,
  type YouTubeVideo,
} from "@/lib/youtube";
import {
  ThumbsUp, ThumbsDown, Share2, Bookmark,
  ChevronDown, ChevronUp, Loader2, Bell,
  MoreHorizontal, Flag, Scissors,
} from "lucide-react";

// ─── Sub-components ───────────────────────────────────────────────────────────

function ActionBtn({
  icon, label, active, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105 active:scale-95"
      style={{
        background: active ? "rgba(0,212,255,0.15)" : "#161B22",
        border: active ? "1px solid rgba(0,212,255,0.4)" : "1px solid rgba(0,212,255,0.12)",
        color: active ? "#00D4FF" : "#A0AEC0",
      }}
    >
      {icon}
      <span className="hidden sm:block">{label}</span>
    </button>
  );
}

function CommentSkeleton() {
  return (
    <div className="flex gap-3 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-[#161B22] flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 bg-[#161B22] rounded w-1/4" />
        <div className="h-3 bg-[#161B22] rounded w-full" />
        <div className="h-3 bg-[#161B22] rounded w-3/4" />
      </div>
    </div>
  );
}

// Fake comments for UI richness
const MOCK_COMMENTS = [
  { user: "TechEnthusiast", avatar: "T", text: "This is incredible content! Watched it 3 times already 🔥", likes: "2.4K", time: "2 days ago" },
  { user: "NightOwl42", avatar: "N", text: "The production quality is on another level. Keep it up!", likes: "1.1K", time: "5 days ago" },
  { user: "CuriousMind", avatar: "C", text: "I never thought I'd understand this topic so well. Thank you!", likes: "876", time: "1 week ago" },
  { user: "StreamerPro", avatar: "S", text: "UnrealTube is the best — no ads finally! ❤️", likes: "543", time: "1 week ago" },
  { user: "DigitalNomad", avatar: "D", text: "Sharing this with everyone I know. Absolute banger.", likes: "312", time: "2 weeks ago" },
];

// ─── Main watch content ───────────────────────────────────────────────────────

function WatchContent() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get("v") || "";

  const [video, setVideo] = useState<YouTubeVideo | null>(null);
  const [related, setRelated] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [descExpanded, setDescExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [activeTab, setActiveTab] = useState<"comments" | "chapters">("comments");
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if (!videoId) return;
    setVideo(null);
    setRelated([]);
    setLoading(true);
    setLiked(false);
    setDisliked(false);
    setSaved(false);
    setSubscribed(false);

    Promise.all([
      fetchVideoDetails(videoId),
      fetchRelatedVideos(videoId),
    ]).then(([v, r]) => {
      setVideo(v);
      setRelated(r.videos);
      setLoading(false);
    });
  }, [videoId]);

  if (!videoId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#7A8BA0]">No video selected.</p>
      </div>
    );
  }

  return (
    <>
      {showShare && video && (
        <ShareModal
          videoId={videoId}
          title={video.title}
          onClose={() => setShowShare(false)}
        />
      )}

      <div className="flex gap-6 px-4 md:px-6 py-4 max-w-[1800px] mx-auto">
        {/* ── Left: Player + Info ── */}
        <div className="flex-1 min-w-0">
          {/* Ad-Free Player */}
          <AdFreePlayer videoId={videoId} title={video?.title} />

          {/* Video info */}
          <div className="mt-4">
            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-6 bg-[#161B22] rounded w-3/4" />
                <div className="h-4 bg-[#161B22] rounded w-1/2" />
              </div>
            ) : video ? (
              <>
                {/* Title */}
                <h1 className="text-lg md:text-xl font-bold text-[#E8EDF5] leading-snug">
                  {video.title}
                </h1>

                {/* Stats row */}
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#7A8BA0]">
                  {video.viewCount && <span>{formatViewCount(video.viewCount)}</span>}
                  {video.viewCount && <span>·</span>}
                  <span>{formatRelativeTime(video.publishedAt)}</span>
                </div>

                {/* Channel + Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pb-3"
                  style={{ borderBottom: "1px solid rgba(0,212,255,0.08)" }}>
                  {/* Channel info */}
                  <div className="flex items-center gap-3">
                    <Link href={`/channel/${encodeURIComponent(video.channelTitle)}`}>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 hover:scale-110 transition-transform"
                        style={{
                          background: "linear-gradient(135deg, rgba(0,212,255,0.3), rgba(139,92,246,0.3))",
                          border: "1px solid rgba(0,212,255,0.3)",
                          color: "#00D4FF",
                        }}
                      >
                        {video.channelTitle.charAt(0).toUpperCase()}
                      </div>
                    </Link>
                    <div>
                      <Link href={`/channel/${encodeURIComponent(video.channelTitle)}`}>
                        <p className="text-sm font-semibold text-[#E8EDF5] hover:text-[#00D4FF] transition-colors">{video.channelTitle}</p>
                      </Link>
                      <p className="text-xs text-[#7A8BA0]">
                        {subscribed ? "1.2M subscribers" : "1.2M subscribers"}
                      </p>
                    </div>
                    <button
                      onClick={() => setSubscribed((v) => !v)}
                      className="ml-1 px-4 py-1.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
                      style={{
                        background: subscribed
                          ? "#161B22"
                          : "linear-gradient(135deg, #00D4FF, #8B5CF6)",
                        border: subscribed ? "1px solid rgba(0,212,255,0.2)" : "none",
                        color: subscribed ? "#7A8BA0" : "#050810",
                      }}
                    >
                      {subscribed ? "✓ Subscribed" : "Subscribe"}
                    </button>
                    {subscribed && (
                      <button className="p-1.5 rounded-full hover:bg-white/5 transition-colors">
                        <Bell size={16} className="text-[#7A8BA0]" />
                      </button>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center rounded-full overflow-hidden"
                      style={{ border: "1px solid rgba(0,212,255,0.12)" }}>
                      <button
                        onClick={() => { setLiked((v) => !v); if (disliked) setDisliked(false); }}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-all hover:bg-white/5"
                        style={{ color: liked ? "#00D4FF" : "#A0AEC0" }}
                      >
                        <ThumbsUp size={15} fill={liked ? "#00D4FF" : "none"} />
                        <span className="hidden sm:block">
                          {video.viewCount
                            ? (Math.floor(parseInt(video.viewCount) * 0.045 / 100) * 100).toLocaleString()
                            : "Like"}
                        </span>
                      </button>
                      <div className="w-px h-5 bg-white/10" />
                      <button
                        onClick={() => { setDisliked((v) => !v); if (liked) setLiked(false); }}
                        className="px-3 py-1.5 transition-all hover:bg-white/5"
                        style={{ color: disliked ? "#EF4444" : "#A0AEC0" }}
                      >
                        <ThumbsDown size={15} fill={disliked ? "#EF4444" : "none"} />
                      </button>
                    </div>
                    <ActionBtn
                      icon={<Share2 size={15} />}
                      label="Share"
                      onClick={() => setShowShare(true)}
                    />
                    <ActionBtn
                      icon={<Bookmark size={15} />}
                      label="Save"
                      active={saved}
                      onClick={() => setSaved((v) => !v)}
                    />
                    <ActionBtn
                      icon={<Scissors size={15} />}
                      label="Clip"
                    />
                    {/* More */}
                    <button
                      className="p-1.5 rounded-full transition-all hover:bg-white/5"
                      style={{ color: "#7A8BA0" }}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {video.description && (
                  <div
                    className="mt-3 p-4 rounded-xl text-sm text-[#A0AEC0] leading-relaxed cursor-pointer"
                    style={{
                      background: "#0D1117",
                      border: "1px solid rgba(0,212,255,0.08)",
                    }}
                    onClick={() => setDescExpanded((v) => !v)}
                  >
                    <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[#7A8BA0]">
                      {video.viewCount && <span>{formatViewCount(video.viewCount)}</span>}
                      <span>{formatRelativeTime(video.publishedAt)}</span>
                    </div>
                    <div className={descExpanded ? "" : "line-clamp-3"}>
                      {video.description}
                    </div>
                    <button
                      className="flex items-center gap-1 mt-2 text-xs text-[#00D4FF] hover:text-[#8B5CF6] transition-colors"
                    >
                      {descExpanded
                        ? <><ChevronUp size={13} /> Show less</>
                        : <><ChevronDown size={13} /> Show more</>
                      }
                    </button>
                  </div>
                )}

                {/* Comments / Chapters tabs */}
                <div className="mt-5">
                  <div className="flex items-center gap-1 mb-4"
                    style={{ borderBottom: "1px solid rgba(0,212,255,0.08)" }}>
                    {(["comments", "chapters"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className="px-4 py-2 text-sm font-semibold capitalize transition-colors"
                        style={{
                          color: activeTab === tab ? "#00D4FF" : "#7A8BA0",
                          borderBottom: activeTab === tab ? "2px solid #00D4FF" : "2px solid transparent",
                          marginBottom: "-1px",
                        }}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {activeTab === "comments" && (
                    <CommentsSection commentText={commentText} setCommentText={setCommentText} />
                  )}
                  {activeTab === "chapters" && (
                    <ChaptersSection duration={video.duration} />
                  )}
                </div>
              </>
            ) : (
              <p className="text-[#7A8BA0]">Video not found.</p>
            )}
          </div>
        </div>

        {/* ── Right: Related videos ── */}
        <div className="w-[360px] flex-shrink-0 hidden lg:block">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 rounded-full"
              style={{ background: "linear-gradient(180deg, #00D4FF, #8B5CF6)" }} />
            <h2 className="text-sm font-semibold text-[#E8EDF5]">Up Next</h2>
          </div>
          <div className="flex flex-col gap-1">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse p-2">
                  <div className="w-40 aspect-video rounded-lg bg-[#161B22] flex-shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 bg-[#161B22] rounded w-full" />
                    <div className="h-3 bg-[#161B22] rounded w-3/4" />
                    <div className="h-3 bg-[#161B22] rounded w-1/2" />
                  </div>
                </div>
              ))
              : related.map((v, i) => (
                <VideoCard key={`${v.id}-${i}`} video={v} compact />
              ))
            }
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Comments section ─────────────────────────────────────────────────────────
function CommentsSection({
  commentText, setCommentText,
}: {
  commentText: string;
  setCommentText: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#E8EDF5] mb-4">
        {(MOCK_COMMENTS.length * 1234).toLocaleString()} Comments
      </p>

      {/* Add comment */}
      <div className="flex gap-3 mb-6">
        <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs"
          style={{
            background: "linear-gradient(135deg, #00D4FF, #8B5CF6)",
            color: "#050810",
          }}>
          U
        </div>
        <div className="flex-1">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment…"
            className="w-full bg-transparent text-sm text-[#E8EDF5] placeholder:text-[#7A8BA0] outline-none pb-1.5"
            style={{ borderBottom: "1px solid rgba(0,212,255,0.2)" }}
          />
          {commentText && (
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setCommentText("")}
                className="px-3 py-1 text-xs rounded-full text-[#7A8BA0] hover:bg-white/5 transition-colors">
                Cancel
              </button>
              <button
                className="px-4 py-1 text-xs rounded-full font-semibold transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #00D4FF, #8B5CF6)", color: "#050810" }}>
                Comment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments list */}
      <div className="flex flex-col gap-5">
        {MOCK_COMMENTS.map((c, i) => (
          <div key={i} className="flex gap-3 group">
            <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm"
              style={{
                background: `linear-gradient(135deg, hsl(${i * 60}, 70%, 40%), hsl(${i * 60 + 60}, 70%, 50%))`,
                color: "#fff",
              }}>
              {c.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-[#E8EDF5]">@{c.user}</span>
                <span className="text-xs text-[#7A8BA0]">{c.time}</span>
              </div>
              <p className="text-sm text-[#A0AEC0] leading-relaxed">{c.text}</p>
              <div className="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="flex items-center gap-1 text-xs text-[#7A8BA0] hover:text-[#00D4FF] transition-colors">
                  <ThumbsUp size={12} /> {c.likes}
                </button>
                <button className="flex items-center gap-1 text-xs text-[#7A8BA0] hover:text-[#EF4444] transition-colors">
                  <ThumbsDown size={12} />
                </button>
                <button className="text-xs text-[#7A8BA0] hover:text-[#E8EDF5] transition-colors">Reply</button>
                <button className="text-xs text-[#7A8BA0] hover:text-[#EF4444] transition-colors ml-auto">
                  <Flag size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Chapters section ─────────────────────────────────────────────────────────
function ChaptersSection({ duration }: { duration?: string }) {
  const dummyChapters = [
    { time: "0:00", label: "Introduction" },
    { time: "1:30", label: "Main Topic Overview" },
    { time: "4:15", label: "Deep Dive" },
    { time: "8:00", label: "Examples & Demo" },
    { time: "12:20", label: "Q&A Highlights" },
    { time: duration || "15:00", label: "Outro & Credits" },
  ];
  return (
    <div className="flex flex-col gap-2">
      {dummyChapters.map((ch, i) => (
        <div key={i}
          className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-white/5"
          style={{ border: "1px solid rgba(0,212,255,0.06)" }}>
          <span className="text-xs font-mono text-[#00D4FF] w-12 flex-shrink-0">{ch.time}</span>
          <span className="text-sm text-[#E8EDF5]">{ch.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function WatchPage() {
  return (
    <div className="min-h-screen grid-bg" style={{ background: "#050810" }}>
      <Navbar />
      <div className="pt-14">
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <Loader2 size={32} className="animate-spin text-[#00D4FF]" />
          </div>
        }>
          <WatchContent />
        </Suspense>
      </div>
    </div>
  );
}
