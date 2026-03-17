'use client';

import { useState, useEffect, useRef } from 'react';

const videos = [
  { id: 1, label: 'Production Reel — 2025', src: 'https://res.cloudinary.com/dvxqb1wge/video/upload/v1773657403/25ac9ad3-ab7e-4cf3-b5e2-8346fcade600_ehfif0.mp4' },
  { id: 2, label: 'Shoot Day Bloopers', src: 'https://res.cloudinary.com/dvxqb1wge/video/upload/v1773716576/IMG_3556_u4rwtg.mp4' },
  { id: 3, label: 'Studio Tour', src: 'https://res.cloudinary.com/dvxqb1wge/video/upload/v1773657422/2918C6FE-635D-42A8-8AA4-A6571CA0FF0B_dnj7bo.mp4' },
  { id: 4, label: 'Client Reactions', src: 'https://res.cloudinary.com/dvxqb1wge/video/upload/v1773716588/IMG_3300_f5fdx6.mp4' },
  { id: 5, label: 'Team Moments', src: 'https://res.cloudinary.com/dvxqb1wge/video/upload/v1773716592/IMG_8981_xrtm2x.mp4' },
];

export default function BehindTheScenes() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(Array(videos.length).fill(true));
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-slide every 3 seconds
  useEffect(() => {
    if (!isAutoPlaying || !isMuted[currentIndex]) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isMuted, currentIndex]);

  // Ensure only current video is playing and others are paused
  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (idx === currentIndex) {
        video.play();
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [currentIndex]);

  // Handle touch/swipe
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    // Ignore taps on interactive controls like mute/unmute button.
    if (target.closest('button')) {
      touchStartX.current = null;
      touchEndX.current = null;
      return;
    }

    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
    setIsAutoPlaying(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setCurrentIndex((prev) => (prev + 1) % videos.length);
      } else {
        setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;

    setTimeout(() => {
      if (isMuted[currentIndex]) setIsAutoPlaying(true);
    }, 5000);
  };

  const handleMuteToggle = (idx: number) => {
    setIsMuted((prev) => {
      // Only one video can be unmuted at a time
      const next = prev.map((m, i) => (i === idx ? !m : true));
      // If unmuting, pause auto-play immediately
      if (!prev[idx]) {
        setIsAutoPlaying(true); // muting, so resume auto-play
      } else {
        setIsAutoPlaying(false); // unmuting, so pause auto-play
      }
      return next;
    });
  };

  // When mute state changes, update video element
  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      video.muted = isMuted[idx];
      if (idx === currentIndex && !isMuted[idx]) {
        video.play();
      }
    });
  }, [isMuted, currentIndex]);

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
                <div className="relative aspect-9/16 max-w-[320px] mx-auto rounded-3xl overflow-hidden bg-linear-to-br from-gray-700 to-gray-900 group">
                  {/* Video Element */}
                  <video
                    ref={(el) => {
                      videoRefs.current[index] = el;
                    }}
                    src={video.src}
                    className="w-full h-full object-cover"
                    playsInline
                    autoPlay
                    muted={isMuted[index]}
                    loop
                    controls={false}
                    onClick={() => handleMuteToggle(index)}
                    style={{ cursor: 'pointer' }}
                  />
                  {/* Top Label */}
                  <div className="absolute top-4 left-4 right-4 z-10">
                    <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-gray-900 inline-block">
                      {video.label}
                    </span>
                  </div>
                  {/* Mute/Unmute Button */}
                  <button
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/70 text-white rounded-full px-4 py-2 flex items-center gap-2 text-xs font-semibold shadow-lg hover:bg-black/90 transition-colors"
                    onClick={e => { e.stopPropagation(); handleMuteToggle(index); }}
                    aria-label={isMuted[index] ? 'Unmute video' : 'Mute video'}
                  >
                    {isMuted[index] ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9v6h4l5 5V4l-5 5H9z" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9v6h4l5 5V4l-5 5H9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 19L5 5" /></svg>
                    )}
                    {isMuted[index] ? 'Unmute' : 'Mute'}
                  </button>
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
