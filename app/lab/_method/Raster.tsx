"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { canvasLoop, type Ink } from "./ink";
import { LAYOUTS, STEP_S, type Player } from "./player";

/**
 * The configuration set as a raster. One dot per configuration, its area
 * the tracked success rate p̂ (a speck when p̂ = 0). The ring around a dot
 * thickens with the number of environments running that configuration
 * right now. With `follow`, one environment is drawn heavier: an arc that
 * fills as its episode runs, a disc when it succeeds, and a line to the
 * configuration it is handed next.
 */
export default function Raster({
  player,
  ink,
  sampler = "sgs",
  follow = false,
  responsive = false,
  className = "",
  label,
  children,
}: {
  player: Player;
  ink: Ink;
  sampler?: "sgs" | "uniform";
  follow?: boolean;
  /** Pick the layout from the viewport (the main raster of a group). */
  responsive?: boolean;
  /** Sizing; give the box the simulation's aspect ratio. */
  className?: string;
  label: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!responsive) return;
    const pick = () => {
      const l = LAYOUTS.find((l) => window.innerWidth >= l.min)!;
      player.layout(l.cols, l.rows);
    };
    pick();
    window.addEventListener("resize", pick);
    return () => window.removeEventListener("resize", pick);
  }, [player, responsive]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let version = -1;
    let dot = new Float32Array(0);
    let run = new Float32Array(0);
    return canvasLoop(canvas, (ctx, w, h, dt) => {
      const sim = sampler === "uniform" ? player.uni : player.sgs;
      if (!sim) return;
      const { N, cols, rows } = sim;
      if (version !== player.version) {
        version = player.version;
        dot = Float32Array.from(sim.phat);
        run = Float32Array.from(sim.running);
      }
      const cw = w / cols;
      const ch = h / rows;
      const cell = Math.min(cw, ch);
      const k = Math.min(1, dt * 9);
      const X = (i: number) => (i % cols) * cw + cw / 2;
      const Y = (i: number) => Math.floor(i / cols) * ch + ch / 2;

      ctx.fillStyle = ink.dot;
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        dot[i] += (sim.phat[i] - dot[i]) * k;
        const r = Math.max(cell * 0.045, Math.sqrt(dot[i]) * cell * 0.36);
        const x = X(i);
        const y = Y(i);
        ctx.moveTo(x + r, y);
        ctx.arc(x, y, r, 0, Math.PI * 2);
      }
      ctx.fill();

      // Ring weight grows with the environments on the configuration
      // (square root, full weight at twelve times the average), so uniform
      // sampling still shows as an even, light ring.
      const avg = sim.envs.length / N;
      const cap = Math.max(1.5, cell * 0.09);
      ctx.strokeStyle = ink.ring;
      for (let i = 0; i < N; i++) {
        run[i] += (sim.running[i] - run[i]) * k;
        const lw = cap * Math.min(1, Math.sqrt(run[i] / (12 * avg)));
        if (lw < 0.6) continue;
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.arc(X(i), Y(i), cell * 0.485 - lw / 2, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (!follow || sampler !== "sgs") return;
      const f = player.follow;
      const env = sim.envs[0];
      const R = cell * 0.62;
      const lw = Math.max(2, cell * 0.06);
      ctx.strokeStyle = ink.mark;
      ctx.fillStyle = ink.mark;
      ctx.lineWidth = lw;
      const e = sim.time - f.t0;
      if (f.step === 0) {
        // Rolling out: the arc fills toward the time limit.
        const u = Math.min(
          1,
          Math.max(0, (sim.time - env.start) / sim.horizon),
        );
        ring(ctx, X(env.cfg), Y(env.cfg), R, 1, 1);
        ring(ctx, X(env.cfg), Y(env.cfg), R, u, lw);
        return;
      }
      const a = f.cfg;
      const b = f.next;
      if (f.step <= 2) {
        // Record and rescore: the arc as the episode ended (full on a
        // timeout), a disc for a success.
        ring(ctx, X(a), Y(a), R, 1, 1);
        ring(ctx, X(a), Y(a), R, Math.min(1, f.ran / sim.horizon), lw);
        if (f.win) {
          ctx.beginPath();
          ctx.arc(X(a), Y(a), cell * 0.2, 0, Math.PI * 2);
          ctx.fill();
        }
        if (f.step === 2) {
          const s = 1 + 0.12 * Math.sin(((e - STEP_S) / STEP_S) * Math.PI);
          ring(ctx, X(a), Y(a), R * s, 1, 1);
        }
        return;
      }
      // Sample: a line to the configuration it is handed next.
      ring(ctx, X(a), Y(a), R, 1, 1);
      const u = ease(Math.min(1, (e - 2 * STEP_S) / STEP_S));
      const x = X(a) + (X(b) - X(a)) * u;
      const y = Y(a) + (Y(b) - Y(a)) * u;
      ctx.lineWidth = Math.max(1.25, lw * 0.6);
      ctx.beginPath();
      ctx.moveTo(X(a), Y(a));
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.lineWidth = lw;
      ring(ctx, x, y, R, 1, lw);
    });
  }, [player, ink, sampler, follow]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={ref}
        role="img"
        aria-label={label}
        className="pz-overprint absolute inset-0 h-full w-full"
      />
      {children}
    </div>
  );
}

const ease = (u: number) => u * u * (3 - 2 * u);

function ring(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  u: number,
  lw: number,
) {
  if (u <= 0) return;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * u);
  ctx.stroke();
}
