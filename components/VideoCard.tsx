"use client";

import Link from "next/link";
import Image from "next/image";
import { formatViewCount, formatRelativeTime, type YouTubeVideo } from "@/lib/youtube";

// Stop propagation so channel clicks don't also trigger the video link
function ChannelLink({ name, className }: { name: string; className?: string }) {
  return (
    <Link
      href={`/channel/${encodeURIComponent(name)}`}
      onClick={(e) => e.stopPropagation()}
      className={className}
    >
      {name}
    </Link>
  );
}

interface VideoCardProps {
  video: YouTubeVideo;
  compact?: boolean;
}

export function VideoCard({ video, compact = false }: VideoCardProps) {
  if (compact) {
    return (
      <Link
        href={`/watch?v=${video.id}`}
        className="flex gap-3 group hover:bg-white/5 rounded-lg p-2 transition-all"
      >
        <div className="relative flex-shrink-0 w-40 rounded-lg overflow-hidden aspect-video">
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
          {video.duration && (
            <span
              className="absolute bottom-1 right-1 px-1.5 py-0.5 text-xs font-medium rounded"
              style={{
                background: "rgba(5, 8, 16, 0.9)",
                color: "#E8EDF5",
                backdropFilter: "blur(4px)",
              }}
            >
              {video.duration}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-[#E8EDF5] line-clamp-2 leading-snug group-hover:text-[#00D4FF] transition-colors">
            {video.title}
          </h3>
          <ChannelLink
            name={video.channelTitle}
            className="text-xs text-[#7A8BA0] mt-1 hover:text-[#00D4FF] transition-colors block"
          />
          <div className="flex items-center gap-1 text-xs text-[#7A8BA0] mt-0.5">
            {video.viewCount && <span>{formatViewCount(video.viewCount)}</span>}
            {video.viewCount && <span>•</span>}
            <span>{formatRelativeTime(video.publishedAt)}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/watch?v=${video.id}`} className="group video-card block">
      {/* Thumbnail */}
      <div
        className="relative w-full rounded-xl overflow-hidden"
        style={{ aspectRatio: "16/9" }}
      >
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized
        />
        {/* Duration badge */}
        {video.duration && (
          <span
            className="absolute bottom-2 right-2 px-2 py-1 text-xs font-semibold rounded-md"
            style={{
              background: "rgba(5, 8, 16, 0.88)",
              color: "#E8EDF5",
              backdropFilter: "blur(4px)",
            }}
          >
            {video.duration}
          </span>
        )}
        {/* Hover overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(139,92,246,0.15))",
          }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(5, 8, 16, 0.8)",
              border: "2px solid rgba(0, 212, 255, 0.6)",
              boxShadow: "0 0 20px rgba(0, 212, 255, 0.4)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#00D4FF">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex gap-3 mt-3">
        {/* Channel avatar */}
        <div
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
          style={{
            background: "linear-gradient(135deg, rgba(0,212,255,0.3), rgba(139,92,246,0.3))",
            border: "1px solid rgba(0, 212, 255, 0.2)",
            color: "#00D4FF",
          }}
        >
          {video.channelTitle.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[#E8EDF5] line-clamp-2 leading-snug group-hover:text-[#00D4FF] transition-colors">
            {video.title}
          </h3>
          <ChannelLink
            name={video.channelTitle}
            className="text-xs text-[#7A8BA0] mt-1 hover:text-[#00D4FF] transition-colors block"
          />
          <div className="flex items-center gap-1 text-xs text-[#7A8BA0] mt-0.5">
            {video.viewCount && (
              <>
                <span>{formatViewCount(video.viewCount)}</span>
                <span>•</span>
              </>
            )}
            <span>{formatRelativeTime(video.publishedAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
