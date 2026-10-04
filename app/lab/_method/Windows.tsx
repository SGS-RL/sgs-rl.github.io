"use client";

import { useEffect, useRef } from "react";
import { canvasLoop, type Ink } from "./ink";
import type { Player } from "./player";
import type { Sim } from "./sgs";

const ROLES = ["Mastered", "In between", "Not yet solved"];

// Three configurations to watch: one the policy solves, one it solves some
// of the time, one it cannot solve yet. The middle one is re-picked when
// it drifts out of the middle.
function pick(sim: Sim, cur: number[]) {
  const out = [...cur];
  let best = -1;
  if (out[0] < 0 || sim.phat[out[0]] < 0.9) {
    for (let i = 0; i < sim.N; i++)
      if (sim.phat[i] >= 0.95 && (best < 0 || sim.tries[i] > sim.tries[best]))
        best = i;
    out[0] = best;
  }
  const mid = out[1] >= 0 ? sim.phat[out[1]] : -1;
  if (mid < 0.2 || mid > 0.8) {
    best = -1;
    for (let i = 0; i < sim.N; i++) {
      const p = sim.phat[i];
      if (p < 0.35 || p > 0.65 || i === out[0]) continue;
      if (best < 0 || sim.running[i] > sim.running[best]) best = i;
    }
    out[1] = best;
  }
  if (out[2] < 0 || sim.phat[out[2]] > 0) {
    best = -1;
    for (let i = 0; i < sim.N; i++)
      if (
        sim.phat[i] === 0 &&
        (best < 0 || sim.difficulty[i] < sim.difficulty[best])
      )
        best = i;
    out[2] = best;
  }
  return out;
}

/**
 * The sliding window of three configurations: their last H outcomes,
 * oldest on the left. Filled: success; open: failure; faint: one of the
 * zeros the window starts with. p̂ is the filled share. On the right, how
 * many environments are on each configuration compared with uniform.
 */
export default function Windows({
  player,
  ink,
  className = "",
}: {
  player: Player;
  ink: Ink;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const font = getComputedStyle(canvas).fontFamily;
    let version = -1;
    let cfgs = [-1, -1, -1];
    const buf: number[] = [];
    const runs = [0, 0, 0];
    return canvasLoop(canvas, (ctx, w, h, dt) => {
      const sim = player.sgs;
      if (!sim) return;
      if (version !== player.version) {
        version = player.version;
        cfgs = [-1, -1, -1];
      }
      cfgs = pick(sim, cfgs);
      const small = w < 480;
      const fs = small ? 11 : 12;
      ctx.font = `${fs}px ${font}`;
      const rowH = h / 3;
      const labelH = fs + 6;
      const right = small ? 64 : 150;
      const pitch = (w - right) / sim.H;
      const r = Math.min(pitch * 0.36, 7);
      const avg = sim.envs.length / sim.N;
      cfgs.forEach((i, row) => {
        const y0 = rowH * row;
        ctx.fillStyle = ink.line;
        ctx.textBaseline = "top";
        ctx.textAlign = "left";
        ctx.fillText(ROLES[row], 0, y0 + 2);
        if (i < 0) return;
        ctx.textAlign = "right";
        if (row === 0) ctx.fillText("oldest → newest", w - right, y0 + 2);
        const y = y0 + labelH + (rowH - labelH) / 2 - 2;
        sim.window(i, buf);
        for (let j = 0; j < buf.length; j++) {
          const x = pitch * j + pitch / 2;
          const v = buf[j];
          ctx.beginPath();
          if (v === 1) {
            ctx.fillStyle = ink.dot;
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.strokeStyle = ink.line;
            ctx.lineWidth = 1;
            ctx.globalAlpha = v < 0 ? 0.3 : 1;
            ctx.setLineDash(v < 0 ? [2, 2] : []);
            ctx.arc(x, y, r - 0.5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.globalAlpha = 1;
          }
        }
        runs[row] += (sim.running[i] / avg - runs[row]) * Math.min(1, dt * 2);
        ctx.fillStyle = ink.line;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        const ph = `p̂ = ${sim.phat[i].toFixed(2)}`;
        ctx.fillText(ph, w - right + 12, y - (small ? fs * 0.6 : 0));
        const env = `${runs[row] < 0.05 ? "0" : runs[row].toFixed(1)}×${small ? "" : " uniform"}`;
        if (small) ctx.fillText(env, w - right + 12, y + fs * 0.6);
        else ctx.fillText(env, w - right + 74, y);
      });
    });
  }, [player, ink]);
  return (
    <canvas
      ref={ref}
      role="img"
      aria-label="The last outcomes of three configurations: one mastered, one in between, one not yet solved"
      className={`block w-full ${className}`}
    />
  );
}
