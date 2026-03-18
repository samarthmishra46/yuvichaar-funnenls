'use client';

import { useMemo } from 'react';
import { useHlsHoverVideo } from '@/hooks/useHlsHoverVideo';

export interface VideoHoverItem {
  id: number | string;
  title: string;
  category: string;
  poster: string;
  hlsUrl: string;
}

interface VideoHoverGridProps {
  items: VideoHoverItem[];
  className?: string;
}

export default function VideoHoverGrid({ items, className = '' }: VideoHoverGridProps) {
  const gridItems = useMemo(() => items, [items]);

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 ${className}`}>
      {gridItems.map((item) => (
        <VideoHoverCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function VideoHoverCard({ item }: { item: VideoHoverItem }) {
  const {
    containerRef,
    videoRef,
    isHovering,
    isReady,
    shouldRenderVideo,
    handleMouseEnter,
    handleMouseLeave,
  } = useHlsHoverVideo({ src: item.hlsUrl });

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative rounded-2xl overflow-hidden bg-[#1a1a1a] aspect-[9/16] cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
    >
      <div className="absolute inset-0 border-4 border-gray-800 rounded-2xl pointer-events-none z-10" />

      <img
        src={item.poster}
        alt={item.title}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          isHovering ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {shouldRenderVideo && (
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
            isHovering ? 'opacity-100 scale-[1.02]' : 'opacity-0 scale-100'
          }`}
          poster={item.poster}
        />
      )}

      <div className="absolute top-4 left-3 right-3 z-20">
        <span className="text-[10px] font-semibold text-gray-400 tracking-wider">
          {item.category}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20">
        <h4 className="text-white font-semibold text-sm">{item.title}</h4>
        <p className="text-[11px] text-gray-400 mt-1">
          {isReady ? 'Hover to preview' : 'Loading preview'}
        </p>
      </div>
    </div>
  );
}
