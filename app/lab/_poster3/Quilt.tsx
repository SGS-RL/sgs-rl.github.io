"use client";

// Copy of _gallery/QuiltSeparator for /lab/poster-3, over the owner's
// footage. Changes: LIBRARY items through ./Gallery, focus points for the
// new footage (./data focusOf), and the Index cell counts the whole
// collection even when some clips are left out of the quilt (the 32:9
// simulation pairs are, since a square cell would crop one of their runs).

import { useEffect, useRef, type CSSProperties } from "react";
import type { Item } from "../library";
import { drawHalftone, halftoneAvailable } from "../_poster/halftone";
import { P } from "../_poster/palettes";
import { hideAt, STEPS } from "../_gallery/data";
import {
  mediaHeld,
  prefersReducedMotion,
  registerVideo,
} from "../_gallery/media";
import { useGallery } from "./Gallery";
import {
  domainWord,
  focusOf,
  groupByRobot,
  objectPosition,
  plural,
  smallSrc,
  type Group,
} from "./data";

// Columns at each container step (see data.ts).
const COLS = [3, 4, 6, 8, 10];

const FLATS = [
  "linear-gradient(135deg, #e2231a 50%, #ffffff 50%)",
  "#1e9ad6",
  "linear-gradient(45deg, #f3d400 50%, #111111 50%)",
  "#c9ab6b",
  "#0f9d58",
  "linear-gradient(135deg, #f5a3b7 50%, #1e9ad6 50%)",
  "#f3d400",
  "#e2231a",
];

type Cell =
  | { kind: "index"; w: 2 }
  | { kind: "label"; w: 1; group: Group }
  | { kind: "clip"; w: 1 | 2; clip: Item; ground: string }
  | { kind: "flat"; w: 1; bg: string; hide?: number[] };

// Up to `max` clips, shared out across robots, in collection order.
function pick(groups: Group[], max: number) {
  const take = groups.map(() => 0);
  let left = max;
  for (let round = 0; left > 0; round++) {
    let moved = false;
    groups.forEach((g, i) => {
      if (left > 0 && take[i] < g.clips.length) {
        take[i]++;
        left--;
        moved = true;
      }
    });
    if (!moved) break;
  }
  return groups.map((g, i) => ({ ...g, clips: g.clips.slice(0, take[i]) }));
}

// Empty slots left by `grid-auto-flow: dense` for these widths, i.e. how
// many 1x1 flat cells complete the quilt with no hole.
function holes(widths: number[], cols: number) {
  const rows: boolean[][] = [];
  for (const w0 of widths) {
    const w = Math.min(w0, cols);
    for (let r = 0; ; r++) {
      rows[r] ??= new Array(cols).fill(false);
      let at = -1;
      for (let c = 0; c + w <= cols && at < 0; c++)
        if (rows[r].slice(c, c + w).every((x) => !x)) at = c;
      if (at >= 0) {
        for (let x = at; x < at + w; x++) rows[r][x] = true;
        break;
      }
    }
  }
  return rows.reduce((n, row) => n + row.filter((x) => !x).length, 0);
}

function layout(groups: Group[], inks: readonly string[]): Cell[] {
  const cells: Cell[] = [{ kind: "index", w: 2 }];
  let ink = 0;
  groups.forEach((g) => {
    cells.push({ kind: "label", w: 1, group: g });
    g.clips.forEach((clip, ci) => {
      cells.push({
        kind: "clip",
        w: ci === 0 ? 2 : 1,
        clip,
        ground: inks[ink++ % inks.length],
      });
    });
  });
  const need = COLS.map((c) =>
    holes(
      cells.map((x) => x.w),
      c,
    ),
  );
  const fills = Math.max(...need);
  for (let j = 0; j < fills; j++)
    cells.push({
      kind: "flat",
      w: 1,
      bg: FLATS[j % FLATS.length],
      hide: STEPS.filter((s) => j >= need[s]),
    });
  return cells;
}

const rand = (i: number) => {
  const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453;
  return x - Math.floor(x);
};
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const INK: [number, number, number] = [17 / 255, 17 / 255, 17 / 255];

// A quilt of flat inks after the NOF posters: an Index cell two squares
// wide, a white label per robot, flat colour cells, and clips. Clip cells
// change between a black halftone on a flat ground and the real, unaltered
// video as the band moves up the screen, each at its own moment, tied to
// the scroll position (scroll back and they change back).
//   direction "toReal":   rasters on entry, real video once read
//   direction "toRaster": the reverse
// Without WebGL the raster is the poster in greyscale; with reduced motion
// every cell shows the real poster. Every clip cell opens the player.
export default function Quilt({
  clips,
  direction = "toReal",
  max = 24,
  title = "Index",
  inks = P.quilt,
  className = "",
}: {
  // Defaults to the gallery's whole collection.
  clips?: Item[];
  direction?: "toReal" | "toRaster";
  // Most clip cells to show; the excerpt is shared out across robots.
  max?: number;
  title?: string;
  // Ground colours for clip cells, cycled.
  inks?: readonly string[];
  className?: string;
}) {
  const g = useGallery();
  const all = clips ? groupByRobot(clips) : g.groups;
  const groups = pick(all, max);
  const cells = layout(groups, inks);
  // The Index counts the whole collection, pairs included.
  const total = g.clips.length;
  const robots = g.groups.length;
  const bandRef = useRef<HTMLDivElement>(null);
  const ids = cells.map((c) => (c.kind === "clip" ? c.clip.id : "")).join();

  useEffect(() => {
    const band = bandRef.current;
    if (!band) return;
    const gl = halftoneAvailable();
    band.dataset.gl = gl ? "1" : "0";
    const reduce = prefersReducedMotion();
    const S = 0.9; // stagger: share of the change that is per-cell delay

    const cells = [...band.querySelectorAll<HTMLElement>("[data-q-clip]")].map(
      (el, i) => ({
        el,
        video: el.querySelector("video")!,
        canvas: el.querySelector("canvas")!,
        focus: JSON.parse(el.dataset.focus ?? "[0.5,0.5]") as [number, number],
        poster: el.dataset.poster ?? "",
        pitch: el.dataset.wide ? 5 : 4.5,
        jitter: rand(i),
        top: 0,
        h: 0,
        reveal: -1,
        state: "",
        lastT: -1,
        dirty: true,
        img: null as HTMLImageElement | null,
      }),
    );
    const cleanups = cells.map((c) =>
      registerVideo(c.video, c.el.dataset.src ?? "", c.poster),
    );
    const onData = (e: Event) => {
      const c = cells.find((x) => x.video === e.target);
      if (c) c.dirty = true;
    };
    cells.forEach((c) => c.video.addEventListener("loadeddata", onData));

    let dpr = 1;
    const measure = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const sizes = cells.map((c) => [
        c.el.offsetTop,
        c.el.offsetWidth,
        c.el.offsetHeight,
      ]);
      cells.forEach((c, i) => {
        const [top, w, h] = sizes[i];
        c.top = top;
        c.h = h;
        const cw = Math.max(1, Math.round(w * dpr));
        const ch = Math.max(1, Math.round(h * dpr));
        if (c.canvas.width !== cw || c.canvas.height !== ch) {
          c.canvas.width = cw;
          c.canvas.height = ch;
        }
        c.dirty = true;
      });
    };

    const draw = (c: (typeof cells)[number]) => {
      const v = c.video;
      let src: HTMLVideoElement | HTMLImageElement | null = null;
      if (v.readyState >= 2) src = v;
      else if (c.img?.complete && c.img.naturalWidth) src = c.img;
      else if (!c.img && c.poster) {
        c.img = new Image();
        c.img.onload = () => (c.dirty = true);
        c.img.src = c.poster;
      }
      if (!src) return;
      const t = src === v ? v.currentTime : -2;
      if (!c.dirty && t === c.lastT) return;
      const ok = drawHalftone(src, c.canvas, {
        ink: INK,
        pitch: c.pitch * dpr,
        angle: Math.PI / 4,
        focus: c.focus,
        lo: 0.22,
        hi: 0.88,
      });
      if (ok) {
        c.dirty = false;
        c.lastT = t;
      }
    };

    let raf = 0;
    let running = false;
    const frame = () => {
      raf = 0;
      // Behind the open player: nothing moves, so skip the work.
      if (mediaHeld()) {
        if (running) raf = requestAnimationFrame(frame);
        return;
      }
      // One layout read per frame; cell offsets are cached by measure().
      const r = band.getBoundingClientRect();
      const vh = window.innerHeight;
      for (const c of cells) {
        const top = r.top + c.top;
        let reveal = 1;
        if (!reduce) {
          const t = (vh * 0.92 - (top + c.h / 2)) / (vh * 0.5);
          const p = clamp01(t * (1 + S) - S * c.jitter);
          reveal = direction === "toReal" ? p : 1 - p;
        }
        const q = Math.round(reveal * 100) / 100;
        if (q !== c.reveal) {
          c.reveal = q;
          const state = q <= 0 ? "raster" : q >= 1 ? "real" : "mix";
          if (state !== c.state) {
            c.state = state;
            c.el.dataset.state = state;
            c.dirty = true;
          }
          if (state === "mix") c.el.style.setProperty("--reveal", String(q));
        }
        if (gl && c.state !== "real" && top < vh && top + c.h > 0) draw(c);
      }
      if (running) raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (!raf && running) raf = requestAnimationFrame(frame);
    };

    measure();
    const ro = new ResizeObserver(() => {
      measure();
      start();
    });
    ro.observe(band);
    const io = new IntersectionObserver(
      ([e]) => {
        running = e.isIntersecting;
        start();
      },
      { rootMargin: "64px 0px" },
    );
    io.observe(band);
    frame();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      cleanups.forEach((f) => f());
      cells.forEach((c) => c.video.removeEventListener("loadeddata", onData));
    };
  }, [direction, ids]);

  return (
    <div className={`gal gal-skin-pz gal-quilt ${className}`}>
      <div ref={bandRef} className="gal-quilt-grid" data-direction={direction}>
        {cells.map((cell, i) => {
          if (cell.kind === "index")
            return (
              <div key="index" className="gq-cell gq-text gq-w2">
                <p className="gq-index">{title}</p>
                <p className="pz-small pz-num">
                  {plural(total, "clip")} from {plural(robots, "robot")}. Select
                  any to play it.
                </p>
              </div>
            );
          if (cell.kind === "label")
            return (
              <div key={`l-${cell.group.robot}`} className="gq-cell gq-text">
                <p className="gq-label">{cell.group.robot}</p>
                <p className="pz-small">
                  <span className="block">
                    {cell.group.categories.join(", ")}
                  </span>
                  <span className="block">
                    {g.groups
                      .find((a) => a.robot === cell.group.robot)
                      ?.domains.join(", ")}
                  </span>
                  <span className="pz-num block">
                    {plural(
                      g.groups.find((a) => a.robot === cell.group.robot)?.clips
                        .length ?? cell.group.clips.length,
                      "clip",
                    )}
                  </span>
                </p>
              </div>
            );
          if (cell.kind === "flat")
            return (
              <div
                key={`f-${i}`}
                aria-hidden="true"
                className={`gq-cell ${cell.hide ? hideAt(cell.hide) : ""}`}
                style={{ background: cell.bg }}
              />
            );
          const c = cell.clip;
          const wide = cell.w === 2;
          const focus = focusOf(c);
          return (
            <button
              key={c.id}
              type="button"
              data-gal-clip={c.id}
              data-q-clip=""
              data-state={direction === "toReal" ? "raster" : "real"}
              data-focus={JSON.stringify(focus)}
              data-src={wide ? c.src : smallSrc(c)}
              data-poster={c.poster}
              data-wide={wide ? "1" : undefined}
              aria-label={`${g.num(c)} ${c.title}, ${c.robot}, ${domainWord(c).toLowerCase()}, ${c.speed}`}
              onClick={(e) => g.open(c, e.currentTarget)}
              className={`gq-cell gq-clip ${wide ? "gq-w2" : ""}`}
              style={{ "--ground": cell.ground } as CSSProperties}
            >
              <canvas aria-hidden="true" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="gq-fallback"
                src={c.poster}
                alt=""
                loading="lazy"
                style={{ objectPosition: objectPosition(focus, wide ? 2 : 1) }}
              />
              <video
                muted
                loop
                playsInline
                preload="none"
                aria-hidden="true"
                tabIndex={-1}
                style={{ objectPosition: objectPosition(focus, wide ? 2 : 1) }}
              />
              <span className="gq-chip pz-small">
                <span className="pz-num mr-2">{g.num(c)}</span>
                {c.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
