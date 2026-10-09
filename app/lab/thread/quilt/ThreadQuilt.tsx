"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import "../../_gallery/gallery.css";
import "../../_poster/poster.css";
import { drawHalftone, halftoneAvailable } from "../../_poster/halftone";
import { P } from "../../_poster/palettes";
import { objectPosition } from "../../_poster3/data";
import { plan, shuffled, type Shape, type Slot } from "./plan";
import "./quilt-frame.css";

// The Results quilt with more footage, for the Twitter thread (owner,
// 2026-10-09: "make a few versions, with increasingly more footage"):
// /lab/thread/quilt-b/ to -d/, from ./versions.json. The same parts as the
// site's quilt (../../_combined/QuiltDivider.tsx: the "Results" cell, a
// white label per robot, clips on flat grounds in black halftone or real,
// flat colour cells), on a fixed grid that fills the 16:9 frame, laid out
// by ./plan.ts. As in ./QuiltFrame.tsx, each clip cell turns from halftone
// to video and back once per PERIOD, from its own moment; the time is
// window.__quiltT, set by scripts/lab/thread/render_quilt.mjs, which also
// seeks the videos.

const PERIOD = 12;
const CHANGE = 0.9;
const INK: [number, number, number] = [17 / 255, 17 / 255, 17 / 255];
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

export type QuiltClip = {
  id: string;
  title: string;
  src: string;
  focus: [number, number];
};
export type QuiltGroup = {
  robot: string;
  categories: string[];
  domains: string[];
  clips: QuiltClip[];
};
export type QuiltLook = {
  cols: number;
  rows: number;
  // The "Results" cell's shape, and how many big (2 x 2) clips to aim for.
  index: Shape;
  bigs: number;
  // Halftone dot pitch (CSS px) for one-cell clips; wider ones get 0.5 more.
  pitch: number;
  // Clip names on every clip, or only on wide and big ones.
  chips: "all" | "wide";
};

declare global {
  interface Window {
    __quiltT?: number;
  }
}

const ease = (x: number) => {
  const u = Math.min(1, Math.max(0, x));
  return u * u * (3 - 2 * u);
};

type Cell =
  | { kind: "flat"; bg: string }
  | { kind: "index"; shape: Shape }
  | { kind: "label"; shape: Shape; group: QuiltGroup }
  | {
      kind: "clip";
      shape: Shape;
      clip: QuiltClip;
      ground: string;
      n: number;
    };

export default function ThreadQuilt({
  groups,
  look,
}: {
  groups: QuiltGroup[];
  look: QuiltLook;
}) {
  const { cols, rows } = look;
  const cells = useMemo(() => {
    const slots: Slot[] = [{ kind: "index", options: [look.index] }];
    groups.forEach((g) => {
      slots.push({ kind: "label", options: [[2, 1]] });
      g.clips.forEach((_, i) =>
        slots.push({
          kind: "clip",
          first: i === 0,
          options: [
            [2, 1],
            [1, 1],
            [2, 2],
          ],
        }),
      );
    });
    const p = plan(slots, cols, rows, look.bigs);
    const out: Cell[] = [];
    let f = 0;
    let n = 0;
    let k = 0;
    const flats = (m: number) => {
      for (let j = 0; j < m; j++)
        out.push({ kind: "flat", bg: FLATS[f++ % FLATS.length] });
    };
    flats(p.before[k]);
    out.push({ kind: "index", shape: p.shapes[k++] });
    groups.forEach((g) => {
      flats(p.before[k]);
      out.push({ kind: "label", shape: p.shapes[k++], group: g });
      g.clips.forEach((clip) => {
        flats(p.before[k]);
        out.push({
          kind: "clip",
          shape: p.shapes[k++],
          clip,
          ground: P.quilt[n % P.quilt.length],
          n: n++,
        });
      });
    });
    flats(p.before[k]);
    return out;
  }, [groups, cols, rows, look.index, look.bigs]);
  const count = cells.filter((c) => c.kind === "clip").length;
  const order = useMemo(() => shuffled(count), [count]);
  const band = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = band.current;
    if (!grid) return;
    const gl = halftoneAvailable();
    grid.dataset.gl = gl ? "1" : "0";
    const list = [...grid.querySelectorAll<HTMLElement>("[data-q-clip]")].map(
      (el) => ({
        el,
        n: Number(el.dataset.n),
        video: el.querySelector("video")!,
        canvas: el.querySelector("canvas")!,
        focus: JSON.parse(el.dataset.focus ?? "[0.5,0.5]") as [number, number],
        pitch: Number(el.dataset.pitch),
        state: "",
        reveal: -1,
        lastT: -1,
        dirty: true,
      }),
    );
    list.forEach((c) => {
      c.video.preload = "auto";
      c.video.src = c.el.dataset.src ?? "";
    });
    let dpr = 1;
    const measure = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      list.forEach((c) => {
        const w = Math.max(1, Math.round(c.el.offsetWidth * dpr));
        const h = Math.max(1, Math.round(c.el.offsetHeight * dpr));
        if (c.canvas.width !== w || c.canvas.height !== h) {
          c.canvas.width = w;
          c.canvas.height = h;
        }
        c.dirty = true;
      });
    };
    const reveal = (n: number) => {
      const t = window.__quiltT ?? 0;
      const at = (order.indexOf(n) / count) * PERIOD;
      const u = (((t - at) % PERIOD) + PERIOD) % PERIOD;
      return u < PERIOD / 2
        ? ease(u / CHANGE)
        : 1 - ease((u - PERIOD / 2) / CHANGE);
    };
    let raf = 0;
    const frame = () => {
      for (const c of list) {
        const q = Math.round(reveal(c.n) * 100) / 100;
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
        const v = c.video;
        if (!gl || c.state === "real" || v.readyState < 2) continue;
        if (!c.dirty && v.currentTime === c.lastT) continue;
        if (
          drawHalftone(v, c.canvas, {
            ink: INK,
            pitch: c.pitch * dpr,
            angle: Math.PI / 4,
            focus: c.focus,
            lo: 0.22,
            hi: 0.88,
          })
        ) {
          c.dirty = false;
          c.lastT = v.currentTime;
        }
      }
      raf = requestAnimationFrame(frame);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(grid);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [cells, order, count]);

  // Type sized to the grid's row height (the frame is 576 CSS px tall).
  const rowH = (576 - (rows + 1) * 3) / rows;
  const vars = {
    "--thq-name": `${(rowH * 0.27).toFixed(1)}px`,
    "--thq-sub": `${Math.max(12.5, rowH * 0.15).toFixed(1)}px`,
    "--thq-pad": `${Math.min(12, rowH * 0.1).toFixed(1)}px`,
  } as CSSProperties;

  return (
    <div className="pz thq thq-more" style={vars}>
      <div className="gal gal-skin-pz gal-quilt">
        <div
          ref={band}
          className="gal-quilt-grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            gridAutoFlow: "row",
          }}
        >
          {cells.map((cell, i) => {
            if (cell.kind === "flat")
              return (
                <div
                  key={`f-${i}`}
                  className="gq-cell"
                  style={{ background: cell.bg }}
                />
              );
            const [w, h] = cell.shape;
            const span = {
              gridColumn: `span ${w}`,
              gridRow: `span ${h}`,
            } as CSSProperties;
            if (cell.kind === "index")
              return (
                <div key="index" className="gq-cell gq-text" style={span}>
                  <p className="gq-index">Results</p>
                </div>
              );
            if (cell.kind === "label")
              return (
                <div
                  key={`l-${cell.group.robot}`}
                  className="gq-cell gq-text"
                  style={span}
                >
                  <p className="thq-name">{cell.group.robot}</p>
                  <p className="thq-sub">
                    <span className="block">
                      {cell.group.categories.join(", ")}
                    </span>
                    <span className="block">
                      {cell.group.domains.join(", ")}
                    </span>
                  </p>
                </div>
              );
            const c = cell.clip;
            const wide = w * h > 1;
            // The box's shape: 1024 x 576 CSS px, 3 px gaps.
            const boxW = ((1024 - (cols + 1) * 3) / cols) * w + (w - 1) * 3;
            const boxH = rowH * h + (h - 1) * 3;
            return (
              <div
                key={c.id}
                data-q-clip=""
                data-n={cell.n}
                data-state="raster"
                data-focus={JSON.stringify(c.focus)}
                data-src={c.src}
                data-pitch={look.pitch + (wide ? 0.5 : 0)}
                className="gq-cell gq-clip"
                style={{ ...span, "--ground": cell.ground } as CSSProperties}
              >
                <canvas aria-hidden="true" />
                <video
                  muted
                  playsInline
                  preload="none"
                  aria-hidden="true"
                  tabIndex={-1}
                  style={{
                    objectPosition: objectPosition(c.focus, boxW / boxH),
                  }}
                />
                {(look.chips === "all" || wide) && (
                  <span className="gq-chip thq-chip">{c.title}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
