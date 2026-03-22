// hooks/useHlsHoverVideo.ts
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface UseHlsHoverVideoProps {
  src: string;
}

export function useHlsHoverVideo({ src }: UseHlsHoverVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [shouldRenderVideo, setShouldRenderVideo] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Load HLS stream
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setShouldRenderVideo(true);
        setIsReady(true);
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        console.error('HLS error:', data);
        setIsReady(false);
      });
      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS (Safari)
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        setShouldRenderVideo(true);
        setIsReady(true);
      });
      video.addEventListener('error', () => {
        console.error('Native HLS load error');
        setIsReady(false);
      });
      return () => {
        video.removeEventListener('loadedmetadata', () => {});
        video.removeEventListener('error', () => {});
      };
    } else {
      console.warn('HLS not supported in this browser');
      setIsReady(false);
    }
  }, [src]);

  // Play/pause on hover
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldRenderVideo) return;

    if (isHovering) {
      video.play().catch((err) => {
        console.warn('Autoplay failed:', err);
      });
    } else {
      video.pause();
    }
  }, [isHovering, shouldRenderVideo]);

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  return {
    containerRef,
    videoRef,
    isHovering,
    isReady,
    shouldRenderVideo,
    handleMouseEnter,
    handleMouseLeave,
  };
}