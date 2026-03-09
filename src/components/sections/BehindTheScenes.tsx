'use client';

import { Play } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const videos = [
  { id: 1, label: 'Production Reel — 2025', thumbnail: '/bts/video-1.jpg' },
  { id: 2, label: 'Shoot Day Bloopers', thumbnail: '/bts/video-2.jpg' },
  { id: 3, label: 'Studio Tour', thumbnail: '/bts/video-3.jpg' },
  { id: 4, label: 'Client Reactions', thumbnail: '/bts/video-4.jpg' },
  { id: 5, label: 'Team Moments', thumbnail: '/bts/video-5.jpg' },
];

export default function BehindTheScenes() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-slide every 3 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Handle touch/swipe
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsAutoPlaying(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setCurrentIndex((prev) => (prev + 1) % videos.length);
      } else {
        setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
      }
    }
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-xs font-semibold tracking-wider text-primary uppercase mb-3">
            BTS & Bloopers
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
            Team Yuvichaar<br />
            Behind The Scenes
          </h2>
        </div>

        {/* Video Carousel */}
        <div 
          ref={containerRef}
          className="relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slides Container */}
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {videos.map((video, index) => (
              <div
                key={video.id}
                className="w-full shrink-0 px-2 first:pl-0 last:pr-0"
              >
                <div className="relative aspect-[9/16] max-w-[320px] mx-auto rounded-3xl overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900 group cursor-pointer">
                  {/* Video Thumbnail Placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
                  
                  {/* Placeholder pattern for demo */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900" />
                  </div>
                  
                  {/* Top Label */}
                  <div className="absolute top-4 left-4 right-4">
                    <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-gray-900 inline-block">
                      {video.label}
                    </span>
                  </div>
                  
                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 via-pink-500 to-fuchsia-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 text-white ml-1" fill="white" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dot Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {videos.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsAutoPlaying(false);
                  setTimeout(() => setIsAutoPlaying(true), 5000);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-primary w-6' 
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
