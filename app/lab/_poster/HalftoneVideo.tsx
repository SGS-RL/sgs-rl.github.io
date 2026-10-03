"use client";

import { useEffect, useRef } from "react";
import { drawHalftone, halftoneAvailable, hexToRgb } from "./halftone";

// A single rAF loop serves every visible halftone on the page.
const jobs = new Set<() => void>();
let loop = 0;
function tick() {
  jobs.forEach((job) => job());
  loop = jobs.size ? requestAnimationFrame(tick) : 0;
}
function schedule(job: () => void) {
  jobs.add(job);
  if (!loop) loop = requestAnimationFrame(tick);
  return () => {
    jobs.delete(job);
  };
}

export type HalftoneVideoProps = {
  src: string;
  poster?: string;
  ink: string;
  pitch: number; // CSS px between dots
  angle?: number; // degrees
  focus?: [number, number];
  lo?: number;
  hi?: number;
  gamma?: number;
  // "loop" plays itself while on screen; "manual" leaves time to the parent,
  // which finds the <video> inside this component's wrapper.
  mode?: "loop" | "manual";
  className?: string;
  blend?: boolean;
};

export default function HalftoneVideo({
  src,
  poster,
  ink,
  pitch,
  angle = 45,
  focus,
  lo,
  hi,
  gamma,
  mode = "loop",
  className = "",
  blend = true,
}: HalftoneVideoProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const localVideo = useRef<HTMLVideoElement>(null);
  const params = useRef({ ink, pitch, angle, focus, lo, hi, gamma });
  useEffect(() => {
    params.current = { ink, pitch, angle, focus, lo, hi, gamma };
  });

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const video = localVideo.current;
    if (!wrap || !canvas || !video) return;

    if (!halftoneAvailable()) {
      // No WebGL: show the plain video, toned down to sit on the ground.
      video.style.opacity = "1";
      video.style.filter = "grayscale(1) contrast(1.2)";
      canvas.style.display = "none";
      if (mode === "loop") video.play().catch(() => {});
      return;
    }

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let dirty = true;
    let lastT = -1;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = wrap.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      dirty = true;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let img: HTMLImageElement | null = null;
    if (poster) {
      img = new Image();
      img.onload = () => (dirty = true);
      img.src = poster;
    }
    const markDirty = () => (dirty = true);
    video.addEventListener("seeked", markDirty);
    video.addEventListener("loadeddata", markDirty);

    const render = () => {
      const t = video.currentTime;
      if (!dirty && t === lastT) return;
      const p = params.current;
      const source =
        video.readyState >= 2 ? video : img && img.complete ? img : null;
      if (!source) return;
      const ok = drawHalftone(source, canvas, {
        ink: hexToRgb(p.ink),
        pitch: p.pitch * dpr,
        angle: (p.angle * Math.PI) / 180,
        focus: p.focus,
        lo: p.lo,
        hi: p.hi,
        gamma: p.gamma,
      });
      if (ok) {
        dirty = false;
        lastT = t;
      }
    };

    let unschedule: (() => void) | null = null;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          unschedule ??= schedule(render);
          if (mode === "loop" && !reduce) video.play().catch(() => {});
        } else {
          unschedule?.();
          unschedule = null;
          if (mode === "loop") video.pause();
        }
      },
      { rootMargin: "100px" },
    );
    io.observe(wrap);

    return () => {
      io.disconnect();
      ro.disconnect();
      unschedule?.();
      video.removeEventListener("seeked", markDirty);
      video.removeEventListener("loadeddata", markDirty);
    };
  }, [mode, poster]);

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${className}`}>
      <video
        ref={localVideo}
        src={src}
        poster={poster}
        muted
        loop={mode === "loop"}
        playsInline
        preload={mode === "loop" ? "none" : "auto"}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-0"
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full ${blend ? "mix-blend-multiply" : ""}`}
      />
    </div>
  );
}
