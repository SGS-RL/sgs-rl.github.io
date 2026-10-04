"use client";

import { useEffect, useRef } from "react";
import { registerVideo } from "./media";

// A muted loop that loads near the viewport and plays only on screen (see
// media.ts). Rendered without src so nothing downloads up front.
export default function TileVideo({
  src,
  poster,
  className,
  style,
}: {
  src: string;
  poster?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    return registerVideo(v, src, poster);
  }, [src, poster]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      className={className}
      style={style}
    />
  );
}
