"use client";

import { useEffect, useRef } from "react";

// Muted looping video that only downloads and plays while on screen, so a
// page with many clips stays light.
export default function InViewVideo({
  src,
  poster,
  className,
  threshold = 0.35,
  controlsWhenReduced = true,
}: {
  src: string;
  poster?: string;
  className?: string;
  threshold?: number;
  // Off when the video sits inside a button (e.g. a tile that opens a viewer).
  controlsWhenReduced?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.controls = controlsWhenReduced;
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [threshold, controlsWhenReduced]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      className={className}
    />
  );
}
