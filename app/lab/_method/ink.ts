import { onFrame } from "./ticker";

// Colours for the method figures. `dot` fills configurations, `ring` marks
// environments, `line` draws curves, axes and type, `mark` picks out the
// followed environment, `accent` the configurations in between.
export type Ink = {
  ground: string;
  dot: string;
  ring: string;
  line: string;
  mark: string;
  accent: string;
};

// The poster's Method inks: mint ground, blue type, pink raster.
export const POSTER: Ink = {
  ground: "#a3e4d7",
  dot: "#ef5a9d",
  ring: "#1d5ccf",
  line: "#1d5ccf",
  mark: "#1d5ccf",
  accent: "#ef5a9d",
};

// Swiss light: near-black on paper, the study's red as the one accent.
export const SWISS: Ink = {
  ground: "#fafaf7",
  dot: "#111110",
  ring: "#e4321b",
  line: "#111110",
  mark: "#e4321b",
  accent: "#e4321b",
};

export type Draw = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  dt: number,
) => void;

/**
 * Keeps a canvas sized to its box at the device pixel ratio (max 2) and
 * calls `draw` on the shared frame loop while the canvas is on screen.
 * Returns a cleanup function; call it from an effect.
 */
export function canvasLoop(canvas: HTMLCanvasElement, draw: Draw) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  let w = 0;
  let h = 0;
  let dpr = 1;
  const ro = new ResizeObserver(([e]) => {
    w = e.contentRect.width;
    h = e.contentRect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  });
  ro.observe(canvas);
  const off = onFrame(canvas, (dt) => {
    if (!w || !h) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    draw(ctx, w, h, dt);
  });
  return () => {
    ro.disconnect();
    off();
  };
}
