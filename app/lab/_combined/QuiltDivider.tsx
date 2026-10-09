// The quilt as a divider before the results on /lab/combined (owner,
// 2026-10-07: "only use as a nice divider ... rename from index to results,
// and use fewer ... just enough that it's a nice cute divider"). Copied
// from ../_poster3/Quilt.tsx. Changes: a "Results" cell in place of the
// Index; a few clips, one per task; nothing to click; and the cells keep
// their order (row flow, not dense), with flat cells filling the gap at a
// row's end wherever a wide cell does not fit, so each robot's label stays
// right before its clips at every width.
//
// Variants (owner, 2026-10-08: the labels all lined up in one column; "How
// can we make them more asymmetric?"). The combined page uses q1, the
// owner's pick:
//   now  as reviewed: label, wide clip, narrow clips, for every robot
//   q1   staggered: each cell 1 or 2 wide, chosen per width so no label
//        sits under the one before it (./quiltStagger.ts)
//   q2   staggered, with one or two big square clips (2 × 2)
//   q3   q2, with the clip names and the label text at varying corners

"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import "../_gallery/gallery.css";
import "./quilt.css";
import type { Item } from "../library";
import { drawHalftone, halftoneAvailable } from "../_poster/halftone";
import { P } from "../_poster/palettes";
import { hideAt, STEPS } from "../_gallery/data";
import {
  mediaHeld,
  prefersReducedMotion,
  registerVideo,
} from "../_gallery/media";
import {
  focusOf,
  groupByRobot,
  objectPosition,
  smallSrc,
  type Group,
} from "../_poster3/data";
import { stagger, type Shape, type Slot } from "./quiltStagger";

export type QuiltVariant = "now" | "q1" | "q2" | "q3";
export const QUILT_VARIANTS: readonly QuiltVariant[] = [
  "now",
  "q1",
  "q2",
  "q3",
];

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

// What is drawn: each cell's width and height at every container step.
type Spans = { ws: number[]; hs: number[] };
type Drawn =
  | ({ kind: "index" } & Spans)
  | ({ kind: "label"; group: Group; n: number } & Spans)
  | ({ kind: "clip"; clip: Item; ground: string; n: number } & Spans)
  | { kind: "flat"; bg: string; hide?: number[] };

// Cells in order, with row flow: a wide cell that does not fit at the end
// of a row moves to the next row and leaves a gap. For every container
// step, a flat cell (shown at that step only) fills each such gap, and a
// few more complete the last row.
type Base = Exclude<Cell, { kind: "flat" }>;

function layout(groups: Group[], inks: readonly string[]): Cell[] {
  const base: Base[] = [{ kind: "index", w: 2 }];
  let ink = 0;
  groups.forEach((g) => {
    base.push({ kind: "label", w: 1, group: g });
    g.clips.forEach((clip, ci) => {
      base.push({
        kind: "clip",
        w: ci === 0 ? 2 : 1,
        clip,
        ground: inks[ink++ % inks.length],
      });
    });
  });
  // gaps[s][k]: flat cells needed before base cell k at step s; the last
  // entry is what completes the final row.
  const gaps = COLS.map((cols) => {
    const before = new Array(base.length + 1).fill(0);
    let x = 0;
    base.forEach((cell, k) => {
      const w = Math.min(cell.w, cols);
      if (x + w > cols) {
        before[k] = cols - x;
        x = 0;
      }
      x = (x + w) % cols;
    });
    before[base.length] = x === 0 ? 0 : cols - x;
    return before;
  });
  const cells: Cell[] = [];
  let f = 0;
  for (let k = 0; k <= base.length; k++) {
    const most = Math.max(...gaps.map((g) => g[k]));
    for (let j = 0; j < most; j++)
      cells.push({
        kind: "flat",
        w: 1,
        bg: FLATS[f++ % FLATS.length],
        hide: STEPS.filter((s) => j >= gaps[s][k]),
      });
    if (k < base.length) cells.push(base[k]);
  }
  return cells;
}

// "now": the reviewed layout, as spans.
function asDrawn(cells: Cell[]): Drawn[] {
  let labels = 0;
  let clips = 0;
  return cells.map((c): Drawn => {
    if (c.kind === "flat") return c;
    const sp = {
      ws: COLS.map((n) => Math.min(c.w, n)),
      hs: COLS.map(() => 1),
    };
    if (c.kind === "index") return { kind: "index", ...sp };
    if (c.kind === "label")
      return { kind: "label", group: c.group, n: labels++, ...sp };
    return { kind: "clip", clip: c.clip, ground: c.ground, n: clips++, ...sp };
  });
}

const ONE: Shape = [1, 1];
const WIDE: Shape = [2, 1];
const BIG: Shape = [2, 2];

// q1–q3: shapes chosen per step by ./quiltStagger.ts, then flat cells
// where a step needs them, as in layout().
function staggered(
  groups: Group[],
  inks: readonly string[],
  big: boolean,
): Drawn[] {
  type Base = Exclude<Drawn, { kind: "flat" }>;
  const none = { ws: [], hs: [] };
  const base: Base[] = [{ kind: "index", ...none }];
  const slots: Slot[] = [{ kind: "index", options: [WIDE] }];
  let ink = 0;
  let clips = 0;
  groups.forEach((g, n) => {
    base.push({ kind: "label", group: g, n, ...none });
    slots.push({ kind: "label", options: [ONE, WIDE] });
    g.clips.forEach((clip, ci) => {
      base.push({
        kind: "clip",
        clip,
        ground: inks[ink++ % inks.length],
        n: clips++,
        ...none,
      });
      slots.push({
        kind: "clip",
        first: ci === 0,
        options: big ? [WIDE, ONE, BIG] : [WIDE, ONE],
      });
    });
  });
  const plan = stagger(slots);
  const cells: Drawn[] = [];
  let f = 0;
  for (let k = 0; k <= base.length; k++) {
    const most = Math.max(...plan.map((p) => p.before[k]));
    for (let j = 0; j < most; j++)
      cells.push({
        kind: "flat",
        bg: FLATS[f++ % FLATS.length],
        hide: STEPS.filter((s) => j >= plan[s].before[k]),
      });
    if (k < base.length)
      cells.push({
        ...base[k],
        ws: plan.map((p) => p.shapes[k][0]),
        hs: plan.map((p) => p.shapes[k][1]),
      });
  }
  return cells;
}

const spanStyle = (c: Spans) =>
  Object.fromEntries(
    COLS.flatMap((_, s) => [
      [`--w${s}`, c.ws[s]],
      [`--h${s}`, c.hs[s]],
    ]),
  ) as CSSProperties;

// q3: where each clip's name sits.
const CORNERS = ["bl", "tr", "br", "bl", "tl", "br"];

const rand = (i: number) => {
  const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453;
  return x - Math.floor(x);
};
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

// Rendering the quilt as a video, frame by frame (/lab/thread/quilt/): the
// caller gives each clip cell's reveal (0 raster .. 1 real, cells in page
// order) and seeks the videos itself; the cells neither follow the scroll
// nor play.
export type QuiltDrive = { reveal: (n: number) => number };
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
export default function QuiltDivider({
  clips,
  direction = "toReal",
  title = "Results",
  inks = P.quilt,
  className = "",
  variant = "now",
  drive,
}: {
  clips: Item[];
  direction?: "toReal" | "toRaster";
  title?: string;
  // Ground colours for clip cells, cycled.
  inks?: readonly string[];
  className?: string;
  variant?: QuiltVariant;
  drive?: QuiltDrive;
}) {
  const key = clips.map((c) => c.id).join();
  const cells = useMemo(() => {
    const groups = groupByRobot(clips);
    return variant === "now"
      ? asDrawn(layout(groups, inks))
      : staggered(groups, inks, variant !== "q1");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, inks, variant]);
  const bandRef = useRef<HTMLDivElement>(null);
  const ids =
    variant + cells.map((c) => (c.kind === "clip" ? c.clip.id : "")).join();

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
    const cleanups = cells.map((c) => {
      if (!drive)
        return registerVideo(c.video, c.el.dataset.src ?? "", c.poster);
      c.video.preload = "auto";
      c.video.src = c.el.dataset.src ?? "";
      return () => {};
    });
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
      for (const [n, c] of cells.entries()) {
        const top = r.top + c.top;
        let reveal = 1;
        if (drive) reveal = clamp01(drive.reveal(n));
        else if (!reduce) {
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
  }, [direction, ids, drive]);

  return (
    <div className={`gal gal-skin-pz gal-quilt ${className}`}>
      <div
        ref={bandRef}
        className="gal-quilt-grid"
        data-direction={direction}
        style={{ gridAutoFlow: "row" }}
      >
        {cells.map((cell, i) => {
          if (cell.kind === "flat")
            return (
              <div
                key={`f-${i}`}
                aria-hidden="true"
                className={`gq-cell ${cell.hide ? hideAt(cell.hide) : ""}`}
                style={{ background: cell.bg }}
              />
            );
          const span = spanStyle(cell);
          if (cell.kind === "index")
            return (
              <div key="index" className="gq-cell gq-var gq-text" style={span}>
                <p className="gq-index">{title}</p>
              </div>
            );
          if (cell.kind === "label")
            return (
              <div
                key={`l-${cell.group.robot}`}
                className="gq-cell gq-var gq-text"
                data-flip={variant === "q3" && cell.n % 2 ? "" : undefined}
                style={span}
              >
                <p className="gq-label">{cell.group.robot}</p>
                <p className="pz-small">
                  <span className="block">
                    {cell.group.categories.join(", ")}
                  </span>
                  <span className="block">{cell.group.domains.join(", ")}</span>
                </p>
              </div>
            );
          const c = cell.clip;
          const wide = cell.ws.some((w, s) => w * cell.hs[s] > 1);
          // Framing for the laptop shape (step 2).
          const aspect = cell.ws[2] / cell.hs[2];
          const focus = focusOf(c);
          return (
            <div
              key={c.id}
              data-q-clip=""
              data-state={direction === "toReal" ? "raster" : "real"}
              data-focus={JSON.stringify(focus)}
              data-src={wide ? c.src : smallSrc(c)}
              data-poster={c.poster}
              data-wide={wide ? "1" : undefined}
              className="gq-cell gq-var gq-clip"
              style={{ ...span, "--ground": cell.ground } as CSSProperties}
            >
              <canvas aria-hidden="true" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="gq-fallback"
                src={c.poster}
                alt=""
                loading="lazy"
                style={{ objectPosition: objectPosition(focus, aspect) }}
              />
              <video
                muted
                loop
                playsInline
                preload="none"
                aria-hidden="true"
                tabIndex={-1}
                style={{ objectPosition: objectPosition(focus, aspect) }}
              />
              <span
                className="gq-chip pz-small"
                data-corner={
                  variant === "q3"
                    ? CORNERS[cell.n % CORNERS.length]
                    : undefined
                }
              >
                {c.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
