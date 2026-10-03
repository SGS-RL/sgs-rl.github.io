"use client";

import { useEffect, useRef, useState } from "react";
import { SCALING } from "../content";

const fmt = (v: number) => v.toFixed(2);
const last = SCALING.envs.length - 1;
// Baselines share one ink, so they differ by dash pattern instead.
const DASH: Record<string, string | undefined> = {
  PLR: undefined,
  Uniform: "7 5",
  Linear: "0.5 5",
};

function Key({
  name,
  type,
  raster,
}: {
  name: string;
  type: string;
  raster: string;
}) {
  const sgs = name === "SGS";
  return (
    <svg
      width="26"
      height="8"
      aria-hidden="true"
      className="mr-1.5 inline-block align-middle"
    >
      <line
        x1="1"
        x2="25"
        y1="4"
        y2="4"
        stroke={sgs ? type : raster}
        strokeWidth={sgs ? 3.5 : 2}
        strokeDasharray={DASH[name]}
        strokeLinecap="round"
      />
    </svg>
  );
}

// Scaling results set as a poster: the panel name is the headline, the
// lines run over it, and a single readout line replaces tooltips.
function Panel({
  panel,
  width,
  type,
  raster,
  web,
}: {
  panel: (typeof SCALING.panels)[number];
  width: number;
  type: string;
  raster: string;
  web: boolean;
}) {
  const [at, setAt] = useState(last);
  const [active, setActive] = useState(false);
  const desktop = width >= 700;
  const height = Math.round(width * (desktop ? 0.36 : web ? 0.66 : 0.78));
  const M = {
    top: 10,
    right: desktop ? 96 : 76,
    bottom: desktop ? 46 : 34,
    left: 2,
  };
  const pw = width - M.left - M.right;
  const ph = height - M.top - M.bottom;
  const lo = Math.log2(SCALING.envs[0]);
  const hi = Math.log2(SCALING.envs[last]);
  const x = (e: number) => M.left + ((Math.log2(e) - lo) / (hi - lo)) * pw;
  const y = (v: number) => M.top + (1 - v) * ph;
  const tick = desktop ? 30 : web ? 16 : 19;

  const series = [...panel.series].sort(
    (a, b) => Number(a.name === "SGS") - Number(b.name === "SGS"),
  );
  // End labels for the series that reach 1M, nudged apart if close.
  const ends = series
    .filter((s) => s.values[last] !== null)
    .map((s) => ({ name: s.name, k: last, v: s.values[last] as number }))
    .sort((a, b) => b.v - a.v);
  const placed: number[] = [];
  const labelY = ends.map((e) => {
    let yy = y(e.v) + 4;
    for (const p of placed) if (Math.abs(p - yy) < 13) yy = p + 13;
    placed.push(yy);
    return yy;
  });

  const pick = (clientX: number, rect: DOMRect) => {
    const px = clientX - rect.left;
    let k = 0;
    SCALING.envs.forEach((e, i) => {
      if (Math.abs(x(e) - px) < Math.abs(x(SCALING.envs[k]) - px)) k = i;
    });
    setAt(k);
    setActive(true);
  };

  return (
    <figure className="relative">
      <h3
        className={
          web
            ? "st-entry mb-3 border-t pt-1.5"
            : "pz-big pz-overprint text-[18.5vw] md:text-[11.5vw]"
        }
        style={{ color: type, borderColor: type }}
      >
        {panel.name}
      </h3>
      <svg
        width={width}
        height={height}
        className={`pz-overprint relative block touch-pan-y ${web ? "" : "-mt-[6vw] md:-mt-[5vw]"}`}
        role="img"
        aria-label={`${panel.name}: success rate against parallel environments`}
        onPointerDown={(e) =>
          pick(e.clientX, e.currentTarget.getBoundingClientRect())
        }
        onPointerMove={(e) =>
          pick(e.clientX, e.currentTarget.getBoundingClientRect())
        }
        onPointerLeave={() => {
          setAt(last);
          setActive(false);
        }}
      >
        <rect
          x={x(SCALING.envs[0])}
          y={M.top}
          width={x(SCALING.priorMax) - x(SCALING.envs[0])}
          height={ph}
          fill={type}
          opacity={0.07}
        />
        <text x={x(SCALING.envs[0]) + 4} y={y(0) - 6} fontSize={12} fill={type}>
          Prior work
        </text>
        <line
          x1={M.left}
          x2={M.left + pw}
          y1={y(0)}
          y2={y(0)}
          stroke={type}
          strokeWidth={1}
        />
        <line
          x1={M.left}
          x2={M.left + pw}
          y1={y(1)}
          y2={y(1)}
          stroke={type}
          strokeWidth={0.5}
        />
        {active && (
          <line
            x1={x(SCALING.envs[at])}
            x2={x(SCALING.envs[at])}
            y1={M.top}
            y2={y(0)}
            stroke={type}
            strokeWidth={0.75}
          />
        )}
        {SCALING.envs.map((e, i) => (
          <text
            key={e}
            x={x(e)}
            y={height - 4}
            fontSize={tick}
            letterSpacing="-0.03em"
            textAnchor={i === 0 ? "start" : i === last ? "end" : "middle"}
            fill={type}
            fontWeight={i === at ? 600 : 400}
          >
            {SCALING.envLabels[i]}
          </text>
        ))}
        {series.map((s) => {
          const sgs = s.name === "SGS";
          const color = sgs ? type : raster;
          const pts = s.values
            .map((v, i) =>
              v === null ? null : `${x(SCALING.envs[i])},${y(v)}`,
            )
            .filter(Boolean)
            .join(" ");
          return (
            <g key={s.name}>
              <polyline
                points={pts}
                fill="none"
                stroke={color}
                strokeWidth={sgs ? 3.5 : 2}
                strokeDasharray={sgs ? undefined : DASH[s.name]}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {s.values.map((v, i) =>
                v === null || (!sgs && DASH[s.name]) ? null : (
                  <circle
                    key={i}
                    cx={x(SCALING.envs[i])}
                    cy={y(v)}
                    r={sgs ? 4.5 : 3}
                    fill={color}
                  />
                ),
              )}
            </g>
          );
        })}
        {ends.map((e, k) => (
          <text
            key={e.name}
            x={x(SCALING.envs[e.k]) + 8}
            y={labelY[k]}
            fontSize={12}
            fill={type}
            className="pz-num"
          >
            {e.name} {fmt(e.v)}
          </text>
        ))}
      </svg>
      <figcaption className="pz-small pz-num mt-2" style={{ color: type }}>
        {SCALING.envLabels[at]} environments:{" "}
        {panel.series
          .filter((s) => s.values[at] !== null)
          .map((s) => `${s.name} ${fmt(s.values[at] as number)}`)
          .join(", ")}
      </figcaption>
    </figure>
  );
}

// "poster": panel names as headlines with the lines running over them.
// "web": a quieter version, two panels side by side on wide screens.
export default function PosterChart({
  type,
  raster,
  variant = "poster",
}: {
  type: string;
  raster: string;
  variant?: "poster" | "web";
}) {
  const web = variant === "web";
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setWidth(Math.floor(e.contentRect.width)),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`flex flex-col ${web ? "gap-8" : "gap-14 md:gap-20"}`}
    >
      <p
        className="pz-small flex flex-wrap gap-x-4 gap-y-1"
        style={{ color: type }}
      >
        {["SGS", "PLR", "Uniform", "Linear"].map((n) => (
          <span key={n}>
            <Key name={n} type={type} raster={raster} />
            {n}
          </span>
        ))}
      </p>
      <div
        className={
          web && width >= 900
            ? "grid grid-cols-2 gap-x-[var(--g)]"
            : "flex flex-col gap-14 md:gap-20"
        }
      >
        {width > 0 &&
          SCALING.panels.map((p) => (
            <Panel
              key={p.name}
              panel={p}
              width={web && width >= 900 ? Math.floor((width - 16) / 2) : width}
              type={type}
              raster={raster}
              web={web}
            />
          ))}
      </div>
      <details className="pz-small" style={{ color: type }}>
        <summary className="cursor-pointer">Data table</summary>
        {SCALING.panels.map((p) => (
          <table
            key={p.name}
            className="pz-num mt-3 w-full max-w-xl border-collapse text-left"
          >
            <caption className="pb-1 text-left">{p.name}</caption>
            <thead>
              <tr style={{ borderBottom: `1px solid ${type}` }}>
                <th className="py-1 pr-3 font-normal">Method</th>
                {SCALING.envLabels.map((l) => (
                  <th key={l} className="py-1 pr-3 text-right font-normal">
                    {l}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {p.series.map((s) => (
                <tr key={s.name}>
                  <td className="py-0.5 pr-3">{s.name}</td>
                  {s.values.map((v, i) => (
                    <td key={i} className="py-0.5 pr-3 text-right">
                      {v === null ? "–" : fmt(v)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </details>
    </div>
  );
}
