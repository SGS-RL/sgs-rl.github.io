"use client";

import { useEffect, useRef, useState } from "react";
import { SCALING } from "../content";

type Shape = "circle" | "square" | "triangle" | "diamond";
const SHAPE: Record<string, Shape> = {
  SGS: "circle",
  Uniform: "square",
  Linear: "triangle",
  PLR: "diamond",
};
const LEGEND = ["SGS", "Uniform", "Linear", "PLR"];

const M = { top: 14, right: 40, bottom: 26, left: 30 };
const log2 = Math.log2;
const fmt = (v: number) => v.toFixed(2);

function Marker({
  shape,
  x,
  y,
  r = 4,
  fill,
}: {
  shape: Shape;
  x: number;
  y: number;
  r?: number;
  fill: string;
}) {
  // 2px ring in the surface colour keeps markers legible where lines cross.
  const ring = { stroke: "var(--sw-bg)", strokeWidth: 2, fill };
  if (shape === "circle") return <circle cx={x} cy={y} r={r + 0.5} {...ring} />;
  if (shape === "square")
    return <rect x={x - r} y={y - r} width={r * 2} height={r * 2} {...ring} />;
  if (shape === "triangle")
    return (
      <path
        d={`M${x},${y - r - 1} L${x + r + 1},${y + r} L${x - r - 1},${y + r} Z`}
        {...ring}
      />
    );
  return (
    <path
      d={`M${x},${y - r - 1} L${x + r + 1},${y} L${x},${y + r + 1} L${x - r - 1},${y} Z`}
      {...ring}
    />
  );
}

function LegendKey({ name }: { name: string }) {
  const sgs = name === "SGS";
  const color = sgs ? "var(--sw-accent)" : "var(--sw-baseline)";
  return (
    <svg width="22" height="10" aria-hidden="true" className="shrink-0">
      <line
        x1="0"
        x2="22"
        y1="5"
        y2="5"
        stroke={color}
        strokeWidth={sgs ? 2.5 : 1.5}
      />
      <Marker shape={SHAPE[name]} x={11} y={5} r={3} fill={color} />
    </svg>
  );
}

function Panel({
  panel,
  width,
}: {
  panel: (typeof SCALING.panels)[number];
  width: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const height = Math.round(Math.min(300, Math.max(200, width * 0.62)));
  const pw = width - M.left - M.right;
  const ph = height - M.top - M.bottom;
  const lo = log2(SCALING.envs[0]);
  const hi = log2(SCALING.envs[SCALING.envs.length - 1]);
  const x = (env: number) => M.left + ((log2(env) - lo) / (hi - lo)) * pw;
  const y = (v: number) => M.top + (1 - v) * ph;

  // Baselines first so SGS draws on top.
  const series = [...panel.series].sort(
    (a, b) => Number(a.name === "SGS") - Number(b.name === "SGS"),
  );
  const last = SCALING.envs.length - 1;
  const best = panel.series
    .filter((s) => s.name !== "SGS")
    .reduce((a, b) =>
      (b.values[last] ?? -1) > (a.values[last] ?? -1) ? b : a,
    );

  const nearest = (clientX: number, rect: DOMRect) => {
    const px = clientX - rect.left;
    let k = 0;
    SCALING.envs.forEach((e, i) => {
      if (Math.abs(x(e) - px) < Math.abs(x(SCALING.envs[k]) - px)) k = i;
    });
    return k;
  };

  const tipRows =
    hover === null
      ? []
      : panel.series
          .filter((s) => s.values[hover] !== null)
          .map((s) => ({ name: s.name, v: s.values[hover] as number }))
          .sort((a, b) => b.v - a.v);

  return (
    <figure className="relative">
      <figcaption className="sw-label mb-2 font-medium">
        {panel.name}
      </figcaption>
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={`${panel.name}: success rate against parallel environments`}
        tabIndex={0}
        className="block touch-pan-y outline-none"
        onPointerDown={(e) =>
          setHover(nearest(e.clientX, e.currentTarget.getBoundingClientRect()))
        }
        onPointerMove={(e) =>
          setHover(nearest(e.clientX, e.currentTarget.getBoundingClientRect()))
        }
        onPointerLeave={() => setHover(null)}
        onBlur={() => setHover(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight")
            setHover((h) => Math.min(last, h === null ? 0 : h + 1));
          if (e.key === "ArrowLeft")
            setHover((h) => Math.max(0, h === null ? last : h - 1));
        }}
      >
        {/* Prior work stopped at ~64K environments. */}
        <rect
          x={x(SCALING.envs[0])}
          y={M.top}
          width={x(SCALING.priorMax) - x(SCALING.envs[0])}
          height={ph}
          fill="var(--sw-panel)"
        />
        <text
          x={x(SCALING.envs[0]) + 6}
          y={M.top + 14}
          fontSize={11}
          fill="var(--sw-mute)"
        >
          Prior work
        </text>

        {[0, 0.5, 1].map((v) => (
          <g key={v}>
            <line
              x1={M.left}
              x2={M.left + pw}
              y1={y(v)}
              y2={y(v)}
              stroke={v === 0 ? "var(--sw-fg)" : "var(--sw-hair)"}
              strokeWidth={1}
            />
            <text
              x={M.left - 8}
              y={y(v) + 4}
              fontSize={11}
              textAnchor="end"
              fill="var(--sw-mute)"
              className="sw-num"
            >
              {v}
            </text>
          </g>
        ))}
        {SCALING.envs.map((e, i) => (
          <text
            key={e}
            x={x(e)}
            y={height - 6}
            fontSize={11}
            textAnchor={i === 0 ? "start" : i === last ? "end" : "middle"}
            fill="var(--sw-mute)"
          >
            {SCALING.envLabels[i]}
          </text>
        ))}

        {hover !== null && (
          <line
            x1={x(SCALING.envs[hover])}
            x2={x(SCALING.envs[hover])}
            y1={M.top}
            y2={M.top + ph}
            stroke="var(--sw-fg)"
            strokeWidth={1}
          />
        )}

        {series.map((s) => {
          const sgs = s.name === "SGS";
          const color = sgs ? "var(--sw-accent)" : "var(--sw-baseline)";
          const pts = s.values
            .map((v, i) =>
              v === null ? null : ([x(SCALING.envs[i]), y(v)] as const),
            )
            .filter((p): p is readonly [number, number] => p !== null);
          return (
            <g key={s.name}>
              <polyline
                points={pts.map((p) => p.join(",")).join(" ")}
                fill="none"
                stroke={color}
                strokeWidth={sgs ? 2.5 : 1.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {pts.map(([px, py], i) => (
                <Marker
                  key={i}
                  shape={SHAPE[s.name]}
                  x={px}
                  y={py}
                  fill={color}
                />
              ))}
            </g>
          );
        })}

        {/* Direct labels: SGS and the best baseline at 1M only. */}
        {[panel.series.find((s) => s.name === "SGS")!, best].map((s) => (
          <text
            key={s.name}
            x={x(SCALING.envs[last]) + 9}
            y={y(s.values[last] as number) + 4}
            fontSize={12}
            fontWeight={s.name === "SGS" ? 600 : 400}
            fill={s.name === "SGS" ? "var(--sw-fg)" : "var(--sw-mute)"}
            className="sw-num"
          >
            {fmt(s.values[last] as number)}
          </text>
        ))}
      </svg>

      {hover !== null && (
        <div
          className="sw-label pointer-events-none absolute z-10 min-w-32 border border-sw-rule bg-sw-bg px-2.5 py-2"
          style={{
            top: 28,
            left: Math.min(x(SCALING.envs[hover]) + 10, width - 140),
          }}
        >
          <div className="mb-1 font-medium">
            {SCALING.envLabels[hover]} environments
          </div>
          {tipRows.map((r) => (
            <div key={r.name} className="flex items-center gap-2">
              <LegendKey name={r.name} />
              <span className="flex-1">{r.name}</span>
              <span className="sw-num">{fmt(r.v)}</span>
            </div>
          ))}
        </div>
      )}
    </figure>
  );
}

export default function ScalingChart() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cols = width >= 640 ? 2 : 1;
  const panelWidth = cols === 2 ? (width - 24) / 2 : width;

  return (
    <div ref={ref} className="col-span-full">
      <div className="sw-label mb-5 flex flex-wrap items-center gap-x-5 gap-y-1">
        <span className="text-sw-mute">
          Success rate by parallel environments
        </span>
        {LEGEND.map((n) => (
          <span key={n} className="flex items-center gap-1.5">
            <LegendKey name={n} />
            {n}
          </span>
        ))}
      </div>
      <div
        className={`grid gap-x-6 gap-y-8 ${cols === 2 ? "grid-cols-2" : ""}`}
      >
        {width > 0 &&
          SCALING.panels.map((p) => (
            <Panel key={p.name} panel={p} width={Math.floor(panelWidth)} />
          ))}
      </div>
      <details className="sw-label mt-6">
        <summary className="cursor-pointer text-sw-mute">Data table</summary>
        <div className="mt-3 overflow-x-auto">
          {SCALING.panels.map((p) => (
            <table
              key={p.name}
              className="sw-num mb-4 w-full border-collapse text-left"
            >
              <caption className="pb-1 text-left font-medium">{p.name}</caption>
              <thead>
                <tr className="border-b border-sw-rule">
                  <th className="py-1 pr-4 font-normal text-sw-mute">Method</th>
                  {SCALING.envLabels.map((l) => (
                    <th
                      key={l}
                      className="py-1 pr-4 text-right font-normal text-sw-mute"
                    >
                      {l}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {p.series.map((s) => (
                  <tr key={s.name} className="border-b border-sw-hair">
                    <td className="py-1 pr-4">{s.name}</td>
                    {s.values.map((v, i) => (
                      <td key={i} className="py-1 pr-4 text-right">
                        {v === null ? "–" : fmt(v)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>
      </details>
    </div>
  );
}
