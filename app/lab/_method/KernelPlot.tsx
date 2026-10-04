"use client";

import { useEffect, useRef } from "react";
import { canvasLoop, type Ink } from "./ink";
import type { Player } from "./player";
import { relative, type Kernel } from "./sgs";

/**
 * "kernel": the sampling curve over tracked success p̂, relative to its
 * peak, with the live configurations on it. p̂ takes the values k / H, so
 * the configurations at each value are drawn as one cluster of dots on
 * the curve: a big cluster is many configurations at that p̂.
 *
 * "signal": the expected learning signal per episode, p(1 − p) scaled to
 * its peak, with every configuration as a dot at its true success p.
 */
export default function KernelPlot({
  player,
  ink,
  kernel,
  mode = "kernel",
  className = "",
  label,
  axis = "tracked success rate p̂",
}: {
  player: Player;
  ink: Ink;
  /** Defaults to the simulation's own kernel. */
  kernel?: Kernel;
  mode?: "kernel" | "signal";
  className?: string;
  label: string;
  axis?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  // The draw loop reads the kernel from here, so a slider does not restart it.
  const kRef = useRef<Kernel | undefined>(kernel);
  useEffect(() => {
    kRef.current = kernel;
  }, [kernel]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const font = getComputedStyle(canvas).fontFamily;
    let k = player.kernel;
    let rel = relative(k);
    const curve = (p: number) => (mode === "kernel" ? rel(p) : 4 * p * (1 - p));
    let version = -1;
    let counts = new Float32Array(0);
    let xs = new Float32Array(0);
    return canvasLoop(canvas, (ctx, w, h, dt) => {
      const sim = player.sgs;
      if (!sim) return;
      const want = kRef.current ?? player.kernel;
      if (want !== k) {
        k = want;
        rel = relative(k);
      }
      const small = w < 480;
      const fs = small ? 11 : 12;
      const padX = small ? 18 : 26;
      const top = 22;
      const bottom = small && mode === "kernel" ? 26 : 42;
      const X = (p: number) => padX + p * (w - 2 * padX);
      const Y = (v: number) => top + (1 - v) * (h - top - bottom);
      const base = Y(0);

      // Axis and ticks.
      ctx.strokeStyle = ink.line;
      ctx.fillStyle = ink.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(X(0) - 6, base + 0.5);
      ctx.lineTo(X(1) + 6, base + 0.5);
      ctx.stroke();
      ctx.font = `${fs}px ${font}`;
      ctx.textBaseline = "top";
      const ticks: [number, string][] = [
        [0, "0"],
        [1, "1"],
      ];
      if (mode === "kernel") ticks.push([k.t, `t = ${k.t}`]);
      else ticks.push([0.5, "0.5"]);
      for (const [p, s] of ticks) {
        ctx.beginPath();
        ctx.moveTo(X(p) + 0.5, base);
        ctx.lineTo(X(p) + 0.5, base + 4);
        ctx.stroke();
        ctx.textAlign = p === 0 ? "left" : p === 1 ? "right" : "center";
        ctx.fillText(s, X(p) + (p === 0 ? -4 : p === 1 ? 4 : 0), base + 7);
      }
      ctx.textAlign = "center";
      if (!small || mode === "signal")
        ctx.fillText(axis, X(0.5), base + 7 + fs * 1.3);

      // Target line.
      if (mode === "kernel") {
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(X(k.t) + 0.5, Y(1) - 8);
        ctx.lineTo(X(k.t) + 0.5, base);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Curve.
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let j = 0; j <= 160; j++) {
        const p = j / 160;
        if (j) ctx.lineTo(X(p), Y(curve(p)));
        else ctx.moveTo(X(p), Y(curve(p)));
      }
      ctx.stroke();

      const s = Math.max(3.2, Math.min(5.5, w / 120));
      const r = s * 0.4;
      ctx.fillStyle = ink.dot;

      if (mode === "signal") {
        if (version !== player.version || xs.length !== sim.N) {
          version = player.version;
          xs = Float32Array.from(sim.p);
        }
        const a = Math.min(1, dt * 8);
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        for (let i = 0; i < sim.N; i++) {
          xs[i] += (sim.p[i] - xs[i]) * a;
          const jit = (((i * 2654435761) >>> 0) / 4294967296 - 0.5) * s * 2.4;
          const x = X(xs[i]);
          const y = Y(curve(xs[i])) + jit;
          ctx.moveTo(x + r, y);
          ctx.arc(x, y, r, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.globalAlpha = 1;
        return;
      }

      // Clusters of configurations at each value of p̂.
      const H = sim.H;
      if (version !== player.version || counts.length !== H + 1) {
        version = player.version;
        counts = new Float32Array(H + 1);
      }
      const now = new Int32Array(H + 1);
      for (let i = 0; i < sim.N; i++) now[sim.wins[i]]++;
      const a = Math.min(1, dt * 6);
      ctx.beginPath();
      for (let b = 0; b <= H; b++) {
        counts[b] += (now[b] - counts[b]) * a;
        const n = Math.round(counts[b]);
        // Big clusters rest on the axis and stay inside the plot.
        const cr = s * 0.56 * Math.sqrt(n) + r;
        const cx = Math.min(w - cr - 1, Math.max(cr + 1, X(b / H)));
        const cy = Math.min(Y(curve(b / H)), base - cr - 1);
        for (let j = 0; j < n; j++) {
          const rr = s * 0.56 * Math.sqrt(j + 0.5);
          const th = j * 2.399963;
          const x = cx + rr * Math.cos(th);
          const y = cy + rr * Math.sin(th);
          ctx.moveTo(x + r, y);
          ctx.arc(x, y, r, 0, Math.PI * 2);
        }
      }
      ctx.fill();

      // The followed environment's configuration.
      const f = player.follow;
      if (f.cfg >= 0 && f.step > 0) {
        const p = f.step === 1 ? f.before : f.after;
        ctx.strokeStyle = ink.mark;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(X(p), Y(curve(p)), s * 1.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }, [player, ink, mode, axis]);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={label}
      className={`pz-overprint block w-full ${className}`}
    />
  );
}
