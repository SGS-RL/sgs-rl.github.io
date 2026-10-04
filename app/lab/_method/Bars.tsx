"use client";

import { useEffect, useRef } from "react";
import { canvasLoop, type Ink } from "./ink";
import type { Player } from "./player";

const BANDS = ["too hard", "in between", "mastered"];

/**
 * Where the latest episodes went, for the uniform twin and for SGS: one
 * mark per 2% of episodes, grouped by the true success of the
 * configuration when it was drawn (too hard p < 0.1, mastered p > 0.9).
 */
export function ShareBars({
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
    const shown = [
      [1, 0, 0],
      [1, 0, 0],
    ];
    return canvasLoop(canvas, (ctx, w, h, dt) => {
      const rows = [player.uni, player.sgs];
      if (!rows[0] || !rows[1]) return;
      const small = w < 420;
      const fs = small ? 11 : 12;
      ctx.font = `${fs}px ${font}`;
      ctx.textBaseline = "middle";
      const labelW = small ? 64 : 84;
      const n = 50;
      const pitch = (w - labelW) / n;
      const r = Math.min(pitch * 0.4, 5);
      const a = Math.min(1, dt * 3);
      const rowH = h / 2;
      rows.forEach((sim, row) => {
        const share = sim!.shares();
        const y = rowH * row + rowH / 2;
        ctx.fillStyle = ink.line;
        ctx.textAlign = "left";
        ctx.fillText(row ? "SGS" : "Uniform", 0, y);
        let acc = 0;
        let j = 0;
        for (let b = 0; b < 3; b++) {
          shown[row][b] += (share[b] - shown[row][b]) * a;
          acc += shown[row][b];
          const end = b === 2 ? n : Math.round(acc * n);
          for (; j < end; j++) {
            const x = labelW + pitch * j + pitch / 2;
            ctx.beginPath();
            ctx.arc(x, y, b === 0 ? r - 0.6 : r, 0, Math.PI * 2);
            if (b === 0) {
              ctx.strokeStyle = ink.line;
              ctx.lineWidth = 1.2;
              ctx.stroke();
            } else {
              ctx.fillStyle = b === 1 ? ink.accent : ink.line;
              ctx.fill();
            }
          }
        }
      });
    });
  }, [player, ink]);
  return (
    <figure className={className}>
      <canvas
        ref={ref}
        role="img"
        aria-label="Share of recent episodes on configurations that are too hard, in between, or mastered, for uniform sampling and for SGS"
        className="block h-16 w-full"
      />
      <figcaption className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {BANDS.map((b, i) => (
          <span key={b} className="inline-flex items-center gap-1.5">
            <svg width="10" height="10" aria-hidden="true">
              {i === 0 ? (
                <circle
                  cx="5"
                  cy="5"
                  r="4"
                  fill="none"
                  stroke={ink.line}
                  strokeWidth="1.2"
                />
              ) : (
                <circle
                  cx="5"
                  cy="5"
                  r="4.5"
                  fill={i === 1 ? ink.accent : ink.line}
                />
              )}
            </svg>
            {b}
            {i === 0 ? " (p < 0.1)" : i === 2 ? " (p > 0.9)" : ""}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

/**
 * Mean true success over every configuration (how evaluation measures it,
 * bypassing SGS) against training time, SGS solid, uniform dashed.
 */
export function RaceChart({
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
    return canvasLoop(canvas, (ctx, w, h) => {
      const sgs = player.sgs;
      const uni = player.uni;
      if (!sgs || !uni) return;
      const fs = w < 420 ? 11 : 12;
      ctx.font = `${fs}px ${font}`;
      const left = 26;
      const right = 64;
      const top = 8;
      const bottom = 22;
      const span = Math.max(sgs.curve.length, 60 / sgs.curveDt);
      const X = (j: number) => left + (j / span) * (w - left - right);
      const Y = (v: number) => top + (1 - v) * (h - top - bottom);
      ctx.strokeStyle = ink.line;
      ctx.fillStyle = ink.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(left, Y(0) + 0.5);
      ctx.lineTo(w - right, Y(0) + 0.5);
      ctx.stroke();
      ctx.textBaseline = "middle";
      ctx.textAlign = "right";
      ctx.fillText("0", left - 6, Y(0));
      ctx.fillText("1", left - 6, Y(1));
      ctx.globalAlpha = 0.35;
      ctx.setLineDash([1, 3]);
      ctx.beginPath();
      ctx.moveTo(left, Y(1) + 0.5);
      ctx.lineTo(w - right, Y(1) + 0.5);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("training time", left, Y(0) + 6);
      ctx.textBaseline = "middle";
      const series: [typeof sgs, string, number[]][] = [
        [uni, "Uniform", [4, 3]],
        [sgs, "SGS", []],
      ];
      const ends: number[] = [];
      for (const [sim, name, dash] of series) {
        const c = sim.curve;
        ctx.setLineDash(dash);
        ctx.lineWidth = name === "SGS" ? 2 : 1.5;
        ctx.beginPath();
        c.forEach((v, j) =>
          j ? ctx.lineTo(X(j), Y(v)) : ctx.moveTo(X(j), Y(v)),
        );
        ctx.stroke();
        ends.push(Y(c[c.length - 1]));
      }
      ctx.setLineDash([]);
      // End labels, nudged apart when the lines are close.
      if (Math.abs(ends[0] - ends[1]) < fs + 2) {
        const mid = (ends[0] + ends[1]) / 2;
        const lo = ends[0] > ends[1];
        ends[0] = mid + ((lo ? 1 : -1) * (fs + 2)) / 2;
        ends[1] = mid + ((lo ? -1 : 1) * (fs + 2)) / 2;
      }
      const xEnd = X(sgs.curve.length - 1) + 6;
      ctx.fillText("Uniform", xEnd, ends[0]);
      ctx.fillText("SGS", xEnd, ends[1]);
    });
  }, [player, ink]);
  return (
    <canvas
      ref={ref}
      role="img"
      aria-label="Mean success over all configurations against training time, for SGS and for uniform sampling"
      className={`block w-full ${className}`}
    />
  );
}
