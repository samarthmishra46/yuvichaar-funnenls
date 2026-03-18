'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import Hls from 'hls.js';

interface UseHlsHoverVideoOptions {
  src: string;
  rootMargin?: string;
}

interface UseHlsHoverVideoResult {
  containerRef: RefObject<HTMLDivElement>;
  videoRef: RefObject<HTMLVideoElement>;
  isHovering: boolean;
  isReady: boolean;
  shouldRenderVideo: boolean;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
}

export function useHlsHoverVideo({
  src,
  rootMargin = '200px',
}: UseHlsHoverVideoOptions): UseHlsHoverVideoResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasUserGesture, setHasUserGesture] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin, threshold: 0.15 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [rootMargin]);

  useEffect(() => {
    const handleUserGesture = () => {
      setHasUserGesture(true);
      window.removeEventListener('pointerdown', handleUserGesture);
      window.removeEventListener('keydown', handleUserGesture);
    };

    window.addEventListener('pointerdown', handleUserGesture, { once: true });
    window.addEventListener('keydown', handleUserGesture, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleUserGesture);
      window.removeEventListener('keydown', handleUserGesture);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (!isInView || !video) {
      setIsReady(false);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
      return;
    }

    const handleReady = () => setIsReady(true);

    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.loop = true;

    if (Hls.isSupported()) {
      const hls = new Hls({
        startLevel: 0,
        capLevelToPlayerSize: true,
        maxBufferLength: 20,
        backBufferLength: 5,
        lowLatencyMode: true,
      });

      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }

    video.addEventListener('loadeddata', handleReady);
    video.addEventListener('canplay', handleReady);

    return () => {
      video.removeEventListener('loadeddata', handleReady);
      video.removeEventListener('canplay', handleReady);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [isInView, src]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    if (!isReady) return;
    const video = videoRef.current;
    if (video) {
      video.muted = !hasUserGesture;
      void video.play();
    }
  }, [hasUserGesture, isReady]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  }, []);

  return {
    containerRef,
    videoRef,
    isHovering,
    isReady,
    shouldRenderVideo: isInView,
    handleMouseEnter,
    handleMouseLeave,
  };
}
