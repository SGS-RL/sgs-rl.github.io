// Canvas drawing for the maze figures. Colours come from the Swiss tokens,
// so the figures follow the page's light or dark theme.

import type { World } from "./nav";

export type Theme = {
  fg: string;
  hair: string;
  accent: string;
  font: string;
};

export function readTheme(el: Element): Theme {
  const s = getComputedStyle(el);
  const v = (name: string, d: string) => s.getPropertyValue(name).trim() || d;
  return {
    fg: v("--sw-fg", "#111110"),
    hair: v("--sw-hair", "#d9d9d3"),
    accent: v("--sw-accent", "#e4321b"),
    font: s.fontFamily,
  };
}

/** Size the canvas backing store to its box. Returns the cell size in CSS px. */
export function fit(canvas: HTMLCanvasElement, w: World) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cell = canvas.clientWidth / w.cols;
  const W = Math.round(cell * w.cols * dpr);
  const H = Math.round(cell * w.rows * dpr);
  if (canvas.width !== W || canvas.height !== H) {
    canvas.width = W;
    canvas.height = H;
  }
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cell * w.cols, cell * w.rows);
  return { ctx, cell, dpr };
}

const xy = (w: World, k: number) => {
  const c = k % w.cols;
  return [c, (k - c) / w.cols];
};

/**
 * The maze: optional grey shading per goal (0 to 1, success rate), cell
 * hairlines, walls, the outer edge and the start.
 */
export function drawMaze(
  ctx: CanvasRenderingContext2D,
  w: World,
  cell: number,
  dpr: number,
  th: Theme,
  shade?: (i: number) => number,
) {
  const W = w.cols * cell;
  const H = w.rows * cell;
  if (shade) {
    ctx.fillStyle = th.fg;
    for (let i = 0; i < w.goals.length; i++) {
      const a = shade(i);
      if (a < 0.02) continue;
      const [c, r] = xy(w, w.goals[i]);
      ctx.globalAlpha = 0.3 * Math.min(1, a);
      ctx.fillRect(c * cell, r * cell, cell, cell);
    }
    ctx.globalAlpha = 1;
  }
  ctx.strokeStyle = th.hair;
  ctx.lineWidth = 1 / dpr;
  ctx.beginPath();
  for (let c = 1; c < w.cols; c++) {
    ctx.moveTo(c * cell, 0);
    ctx.lineTo(c * cell, H);
  }
  for (let r = 1; r < w.rows; r++) {
    ctx.moveTo(0, r * cell);
    ctx.lineTo(W, r * cell);
  }
  ctx.stroke();

  ctx.fillStyle = th.fg;
  for (let k = 0; k < w.wall.length; k++) {
    if (!w.wall[k]) continue;
    const [c, r] = xy(w, k);
    // A hair of overlap, so neighbouring wall cells show no seam.
    ctx.fillRect(c * cell - 0.25, r * cell - 0.25, cell + 0.5, cell + 0.5);
  }
  ctx.strokeStyle = th.fg;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0.75, 0.75, W - 1.5, H - 1.5);

  const [c, r] = xy(w, w.start);
  const inset = Math.max(1.5, cell * 0.1);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(
    c * cell + inset,
    r * cell + inset,
    cell - 2 * inset,
    cell - 2 * inset,
  );
  ctx.fillStyle = th.fg;
  ctx.font = `600 ${Math.round(cell * 0.46)}px ${th.font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("S", (c + 0.5) * cell, (r + 0.53) * cell);
}

/** A red square around a goal being tried. */
export function drawGoal(
  ctx: CanvasRenderingContext2D,
  w: World,
  cell: number,
  th: Theme,
  i: number,
  alpha = 1,
) {
  const [c, r] = xy(w, w.goals[i]);
  const lw = Math.max(1.5, cell * 0.07);
  const inset = cell * 0.12 + lw / 2;
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = th.accent;
  ctx.lineWidth = lw;
  ctx.strokeRect(
    c * cell + inset,
    r * cell + inset,
    cell - 2 * inset,
    cell - 2 * inset,
  );
  ctx.globalAlpha = 1;
}

/** A robot at grid coordinates (x, y). */
export function drawRobot(
  ctx: CanvasRenderingContext2D,
  cell: number,
  th: Theme,
  x: number,
  y: number,
  alpha = 1,
) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = th.fg;
  ctx.beginPath();
  ctx.arc(x * cell, y * cell, Math.max(2.5, cell * 0.17), 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

/** A red dot in goal i's cell; v from 0 to 1 sets its area. */
export function drawDot(
  ctx: CanvasRenderingContext2D,
  w: World,
  cell: number,
  th: Theme,
  i: number,
  v: number,
) {
  if (v < 0.005) return;
  const [c, r] = xy(w, w.goals[i]);
  ctx.fillStyle = th.accent;
  ctx.beginPath();
  ctx.arc(
    (c + 0.5) * cell,
    (r + 0.5) * cell,
    Math.sqrt(v) * cell * 0.42,
    0,
    Math.PI * 2,
  );
  ctx.fill();
}

/** Goal under a pointer event, or −1. */
export function goalAt(
  canvas: HTMLCanvasElement,
  w: World,
  clientX: number,
  clientY: number,
) {
  const b = canvas.getBoundingClientRect();
  const c = Math.floor(((clientX - b.left) / b.width) * w.cols);
  const r = Math.floor(((clientY - b.top) / b.height) * w.rows);
  if (c < 0 || r < 0 || c >= w.cols || r >= w.rows) return -1;
  return w.goalOf[r * w.cols + c];
}
