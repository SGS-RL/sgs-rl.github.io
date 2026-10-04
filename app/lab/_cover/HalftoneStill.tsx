"use client";

import { useEffect, useRef } from "react";

export type HalftoneStillProps = {
  src: string;
  ink: string;
  pitch?: number; // CSS px between dot centres
  angle?: number; // screen angle, degrees
  focus?: [number, number]; // point of the image kept in view, 0..1
  zoom?: number; // 1 = object-fit: cover; >1 crops further around focus
  // Where the focus point lands in the box (0..1). Without it the image is
  // cropped as object-fit: cover around the focus point. With it the image
  // is placed freely and anything beyond the frame prints as paper, so a
  // light sky can run off the top without an edge.
  place?: [number, number];
  // Light ink on a dark ground: ink where the image is light.
  invert?: boolean;
  lo?: number; // luminance that prints as solid ink
  hi?: number; // luminance that prints as paper
  gamma?: number; // >1 keeps mid tones light
  className?: string;
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

// A still image drawn once as a halftone in one ink, on a 2D canvas: no
// video, no animation loop, no WebGL. Redrawn only when its box changes
// size. Same dot model as the poster's shader (dot radius grows with the
// square root of darkness, up to 0.74 of the pitch so full ink closes up).
export default function HalftoneStill({
  src,
  ink,
  pitch = 6,
  angle = 15,
  focus = [0.5, 0.5],
  zoom = 1,
  place,
  invert = false,
  lo = 0.12,
  hi = 0.95,
  gamma = 1.6,
  className = "",
}: HalftoneStillProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fx, fy] = focus;
  const [px0, py0] = place ?? [-1, -1];

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    let cancelled = false;
    let img: HTMLImageElement | null = null;
    let lastW = 0;
    let lastH = 0;

    const draw = () => {
      if (!img || cancelled) return;
      const r = wrap.getBoundingClientRect();
      const w = Math.round(r.width);
      const h = Math.round(r.height);
      if (!w || !h || (w === lastW && h === lastH)) return;
      lastW = w;
      lastH = h;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);

      // Sample the image at three samples per dot, so each dot reads a
      // small local average and edges stay crisp.
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const s = Math.max(w / iw, h / ih) * zoom;
      const k = 3 / pitch;
      const gw = Math.max(2, Math.ceil(w * k));
      const gh = Math.max(2, Math.ceil(h * k));
      const sample = document.createElement("canvas");
      sample.width = gw;
      sample.height = gh;
      const sc = sample.getContext("2d", { willReadFrequently: true });
      if (!sc) return;
      sc.fillStyle = invert ? "#000" : "#fff";
      sc.fillRect(0, 0, gw, gh);
      sc.imageSmoothingQuality = "high";
      if (px0 >= 0) {
        // Free placement: the focus point lands at (px0, py0) of the box.
        const ox = px0 * w - fx * iw * s;
        const oy = py0 * h - fy * ih * s;
        sc.drawImage(img, ox * k, oy * k, iw * s * k, ih * s * k);
      } else {
        // object-fit: cover around the focus point.
        const cw = w / s;
        const ch = h / s;
        const cx = Math.min(Math.max(fx * iw - cw / 2, 0), iw - cw);
        const cy = Math.min(Math.max(fy * ih - ch / 2, 0), ih - ch);
        sc.drawImage(img, cx, cy, cw, ch, 0, 0, gw, gh);
      }
      const px = sc.getImageData(0, 0, gw, gh).data;
      const lum = (x: number, y: number) => {
        const i =
          (Math.min(gh - 1, Math.max(0, Math.round(y * k))) * gw +
            Math.min(gw - 1, Math.max(0, Math.round(x * k)))) *
          4;
        const l = (0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]) / 255;
        return invert ? 1 - l : l;
      };

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = ink;
      ctx.beginPath();
      const a = (angle * Math.PI) / 180;
      const c = Math.cos(a);
      const sn = Math.sin(a);
      // Grid in rotated space: p = R x. Cover the rotated image of the box.
      const corners = [
        [0, 0],
        [w, 0],
        [0, h],
        [w, h],
      ].map(([x, y]) => [c * x - sn * y, sn * x + c * y]);
      const u0 = Math.floor(Math.min(...corners.map((p) => p[0])) / pitch);
      const u1 = Math.ceil(Math.max(...corners.map((p) => p[0])) / pitch);
      const v0 = Math.floor(Math.min(...corners.map((p) => p[1])) / pitch);
      const v1 = Math.ceil(Math.max(...corners.map((p) => p[1])) / pitch);
      const rmax = pitch * 0.74;
      for (let v = v0; v <= v1; v++) {
        for (let u = u0; u <= u1; u++) {
          const pu = (u + 0.5) * pitch;
          const pv = (v + 0.5) * pitch;
          const x = c * pu + sn * pv;
          const y = -sn * pu + c * pv;
          if (x < -rmax || y < -rmax || x > w + rmax || y > h + rmax) continue;
          const dark = Math.pow(clamp01((hi - lum(x, y)) / (hi - lo)), gamma);
          const rad = Math.sqrt(dark) * rmax;
          if (rad < 0.35) continue;
          ctx.moveTo(x + rad, y);
          ctx.arc(x, y, rad, 0, Math.PI * 2);
        }
      }
      ctx.fill();
      wrap.dataset.drawn = "1";
    };

    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      img = image;
      draw();
    };
    image.src = src;
    const ro = new ResizeObserver(() => draw());
    ro.observe(wrap);
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [src, ink, pitch, angle, fx, fy, px0, py0, zoom, invert, lo, hi, gamma]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={`relative overflow-hidden ${className}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
