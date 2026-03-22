// components/VideoHoverCard.tsx
"use client";

import { useHlsHoverVideo } from "@/hooks/useHlsHoverVideo";

interface VideoHoverCardProps {
  hlsUrl: string;
  poster: string;
  title?: string;
  category?: string;
}

export default function VideoHoverCard({
  hlsUrl,
  poster,
  title,
  category,
}: VideoHoverCardProps) {
  const {
    containerRef,
    videoRef,
    isHovering,
    isReady,
    shouldRenderVideo,
    handleMouseEnter,
    handleMouseLeave,
  } = useHlsHoverVideo({ src: hlsUrl });

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative rounded-2xl overflow-hidden bg-[#1a1a1a] aspect-[9/16] cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
    >
      <div className="absolute inset-0 border-4 border-gray-800 rounded-2xl pointer-events-none z-10" />

      {/* Poster image */}
      <img
        src={poster}
        alt={title || "Video preview"}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          isHovering ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Video element */}
      {shouldRenderVideo && (
        <video
          ref={videoRef}
          muted          // ← CRITICAL: enables autoplay on hover
          playsInline    // ← good for mobile
          preload="auto" // optional, helps faster playback
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
            isHovering ? "opacity-100 scale-[1.02]" : "opacity-0 scale-100"
          }`}
          poster={poster}
        />
      )}

      {/* Category */}
      {category && (
        <div className="absolute top-4 left-3 right-3 z-20">
          <span className="text-[10px] font-semibold text-gray-400 tracking-wider">
            {category}
          </span>
        </div>
      )}

      {/* Bottom overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20">
        {title && <h4 className="text-white font-semibold text-sm">{title}</h4>}
      </div>

      <div
        className={`absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${
          isHovering ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden="true"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/85 shadow-lg">
          <svg
            className="ml-0.5 h-5 w-5 text-black"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 5.5v13l10-6.5z" />
          </svg>
        </div>
      </div>
    </div>
  );
}