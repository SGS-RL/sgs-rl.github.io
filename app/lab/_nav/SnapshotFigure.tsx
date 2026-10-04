"use client";

import { useEffect, useRef } from "react";
import { KERNELS, relative } from "../_method/sgs";
import { drawDot, drawMaze, fit, readTheme } from "./draw";
import Legend from "./Legend";
import { snapshot, TOY, WORLD as w } from "./nav";

const pick = relative(TOY);

function Curve() {
  const { p } = snapshot();
  const X = (x: number) => 8 + x * 224;
  const Y = (y: number) => 112 - y * 96;
  const line = (g: (x: number) => number) =>
    Array.from(
      { length: 101 },
      (_, j) => `${X(j / 100).toFixed(1)},${Y(g(j / 100)).toFixed(1)}`,
    ).join(" ");
  return (
    <svg
      viewBox="0 0 240 140"
      className="w-full max-w-72"
      role="img"
      aria-label="Chance of being picked against tracked success rate: highest at 0.5, low but not zero at 0 and 1"
    >
      <polyline
        points={line(relative(KERNELS.paper))}
        fill="none"
        stroke="var(--sw-mute)"
        strokeWidth="1"
        strokeDasharray="2 3"
      />
      <polyline
        points={line(pick)}
        fill="none"
        stroke="var(--sw-accent)"
        strokeWidth="1.75"
      />
      <line
        x1={X(0)}
        x2={X(1)}
        y1={Y(0)}
        y2={Y(0)}
        stroke="var(--sw-fg)"
        strokeWidth="1"
      />
      {/* Every goal of the map, as a tick at its success rate. */}
      {Array.from(p, (x, i) => (
        <line
          key={i}
          x1={X(x).toFixed(1)}
          x2={X(x).toFixed(1)}
          y1={Y(0) + 3}
          y2={Y(0) + 9}
          stroke="var(--sw-fg)"
          strokeOpacity="0.35"
          strokeWidth="1"
        />
      ))}
      <g className="sw-num" fontSize="10" fill="var(--sw-mute)">
        <text x={X(0)} y="136">
          0
        </text>
        <text x={X(0.5)} y="136" textAnchor="middle">
          0.5
        </text>
        <text x={X(1)} y="136" textAnchor="end">
          1
        </text>
      </g>
      <g fontSize="10" fill="var(--sw-mute)">
        <text
          x={X(0.5)}
          y={Y(1) - 4}
          textAnchor="middle"
          fill="var(--sw-accent)"
        >
          κ = 10, this toy
        </text>
        <text x={X(0.86)} y={Y(0.62)} textAnchor="middle">
          κ = 1, paper
        </text>
      </g>
    </svg>
  );
}

/**
 * Part 2: one robot partway through training, as a still. Grey is each
 * goal's success rate; red dots, sized by area, how likely SGS is to pick
 * it next. The ε floor gives every goal a small dot.
 */
export default function SnapshotFigure() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const th = readTheme(canvas);
    const { p } = snapshot();
    const top = Math.max(...Array.from(p, pick));
    const draw = () => {
      const { ctx, cell, dpr } = fit(canvas, w);
      drawMaze(ctx, w, cell, dpr, th, (i) => p[i]);
      for (let i = 0; i < p.length; i++)
        drawDot(ctx, w, cell, th, i, pick(p[i]) / top);
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  return (
    <figure>
      <div
        className="relative"
        style={{ aspectRatio: `${w.cols} / ${w.rows}` }}
      >
        <canvas
          ref={ref}
          role="img"
          aria-label="The maze shaded by success rate, with red dots sized by how likely SGS is to pick each goal: large on the edge of the shaded region, small everywhere else."
          className="absolute inset-0 h-full w-full"
        />
      </div>
      <Legend
        className="mt-3"
        items={[
          ["shade", "Success rate"],
          ["dot", "Chance SGS picks it next"],
        ]}
      />
      <div className="mt-8 max-w-72">
        <p className="sw-label mb-2 text-sw-fg">
          Chance of being picked, relative
        </p>
        <Curve />
        <p className="sw-label mt-1 text-sw-mute">
          Tracked success rate p̂. Ticks: the goals of this map.
        </p>
      </div>
    </figure>
  );
}
