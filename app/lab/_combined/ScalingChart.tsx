"use client";

import { useEffect, useRef, useState } from "react";
import {
  ENV_LABELS,
  ENVS,
  PANELS,
  type Method,
  type Panel,
} from "./scalingData";

// The scaling results, kept minimal (owner, 2026-10-08): one small chart
// per domain, as in the paper's Figure 5. The mean of three seeds as a line,
// each seed as a dot, the 95% confidence interval as a band. SGS in the
// page's red; the baselines in gray, told apart by marker shape (as in the
// paper) and named at the line ends and in the legend. Hovering (or
// focusing) a scale shows every method's mean and interval. No clips yet.

const INK: Record<Method, string> = {
  SGS: "#e4321b",
  PLR: "#5c5c57",
  Uniform: "#8c8c87",
  Linear: "#8c8c87",
};
const ORDER: Method[] = ["SGS", "PLR", "Uniform", "Linear"];

function Shape({
  m,
  x,
  y,
  r = 4.5,
  ring = true,
}: {
  m: Method;
  x: number;
  y: number;
  r?: number;
  ring?: boolean;
}) {
  const common = {
    fill: INK[m],
    stroke: ring ? "#fff" : "none",
    strokeWidth: ring ? 2 : 0,
    paintOrder: "stroke" as const,
  };
  if (m === "SGS") return <circle cx={x} cy={y} r={r} {...common} />;
  if (m === "Uniform")
    return (
      <rect
        x={x - r * 0.85}
        y={y - r * 0.85}
        width={r * 1.7}
        height={r * 1.7}
        {...common}
      />
    );
  if (m === "Linear")
    return (
      <polygon
        points={`${x},${y - r * 1.1} ${x + r * 1.05},${y + r * 0.8} ${x - r * 1.05},${y + r * 0.8}`}
        {...common}
      />
    );
  return (
    <polygon
      points={`${x},${y - r * 1.2} ${x + r * 1.05},${y} ${x},${y + r * 1.2} ${x - r * 1.05},${y}`}
      {...common}
    />
  );
}

// A legend key: a short line with the method's marker on it.
export function Key({ m }: { m: Method }) {
  return (
    <svg
      viewBox="0 0 26 12"
      className="mr-1.5 inline-block h-3 w-[26px] align-[-1px]"
      aria-hidden="true"
    >
      <line x1="1" x2="25" y1="6" y2="6" stroke={INK[m]} strokeWidth="2" />
      <Shape m={m} x={13} y={6} r={3.6} />
    </svg>
  );
}

const fmt = (v: number) => v.toFixed(2);

// "Uniform, Linear 0.00" when the rounded values match, else "Uniform 0.06,
// PLR 0.05"; values only on phones.
function endLabel(g: { ms: Method[]; v: number[] }, small: boolean) {
  const vs = g.v.map(fmt);
  const same = vs.every((v) => v === vs[0]);
  if (small) return same ? vs[0] : vs.join(", ");
  return same
    ? `${g.ms.join(", ")} ${vs[0]}`
    : g.ms.map((m, k) => `${m} ${vs[k]}`).join(", ");
}

function Chart({ panel }: { panel: Panel }) {
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(560);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setW(Math.round(e.contentRect.width)),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const small = w < 480;
  const h = Math.round(Math.min(Math.max(w * 0.62, 240), 420));
  const L = 34;
  const R = small ? 92 : 170;
  const T = 14;
  const B = 46;
  const pw = w - L - R;
  const ph = h - T - B;
  const lo = Math.log2(ENVS[0]);
  const hi = Math.log2(ENVS[ENVS.length - 1]);
  const X = (i: number) => L + ((Math.log2(ENVS[i]) - lo) / (hi - lo)) * pw;
  const Y = (v: number) => T + (1 - v) * ph;
  const series = [...panel.series].sort(
    (a, b) => ORDER.indexOf(b.method) - ORDER.indexOf(a.method),
  );
  const last = ENVS.length - 1;

  // End labels: methods whose last means sit close together share a label.
  const ends = [...panel.series]
    .map((s) => ({ m: s.method, v: s.mean[last] }))
    .sort((a, b) => b.v - a.v);
  const groups: { ms: Method[]; v: number[] }[] = [];
  for (const e of ends) {
    const g = groups[groups.length - 1];
    if (g && Y(e.v) - Y(g.v[g.v.length - 1]) < 15) {
      g.ms.push(e.m);
      g.v.push(e.v);
    } else groups.push({ ms: [e.m], v: [e.v] });
  }

  const tipLeft = hover === null ? 0 : X(hover);
  return (
    <figure className="cb-scale">
      <figcaption className="cb-scale-cap">
        <span className="cb-scale-title">{panel.title}</span>
        <span className="cb-scale-sub">{panel.subtitle}</span>
      </figcaption>
      <div ref={box} className="relative" onMouseLeave={() => setHover(null)}>
        <svg
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          role="img"
          aria-label={`${panel.title}: ${panel.metric.toLowerCase()} against parallel environments. ${panel.series
            .map((s) => `${s.method} ${s.mean.map(fmt).join(", ")}`)
            .join(". ")}.`}
          className="block"
        >
          {/* Grid and axes: hairlines, recessive. */}
          {[0, 0.5, 1].map((v) => (
            <g key={v}>
              <line
                x1={L}
                x2={L + pw}
                y1={Y(v)}
                y2={Y(v)}
                stroke={v === 0 ? "#111" : "#e2e2de"}
                strokeWidth="1"
              />
              <text
                x={L - 8}
                y={Y(v)}
                dy="0.32em"
                textAnchor="end"
                className="cb-scale-tick"
              >
                {v === 0.5 ? "0.5" : v}
              </text>
            </g>
          ))}
          {ENV_LABELS.map((l, i) => (
            <text
              key={l}
              x={X(i)}
              y={T + ph + 18}
              textAnchor="middle"
              className="cb-scale-tick"
            >
              {l}
            </text>
          ))}
          <text
            x={L + pw / 2}
            y={h - 6}
            textAnchor="middle"
            className="cb-scale-axis"
          >
            Parallel environments
          </text>
          {hover !== null && (
            <line
              x1={X(hover)}
              x2={X(hover)}
              y1={T}
              y2={T + ph}
              stroke="#111"
              strokeOpacity="0.25"
              strokeWidth="1"
            />
          )}

          {/* Bands: the 95% confidence interval, as a wash. */}
          {series.map((s) => {
            const up = s.mean.map(
              (m, i) => `${X(i)},${Y(Math.min(1, m + s.ci[i]))}`,
            );
            const dn = s.mean
              .map((m, i) => `${X(i)},${Y(Math.max(0, m - s.ci[i]))}`)
              .reverse();
            return (
              <polygon
                key={`b-${s.method}`}
                points={[...up, ...dn].join(" ")}
                fill={INK[s.method]}
                opacity={s.method === "SGS" ? 0.12 : 0.1}
              />
            );
          })}
          {/* Seeds: one dot per run. */}
          {series.map((s) =>
            s.runs.map((runs, i) =>
              runs.map((v, k) => (
                <circle
                  key={`d-${s.method}-${i}-${k}`}
                  cx={X(i)}
                  cy={Y(v)}
                  r="2.2"
                  fill={INK[s.method]}
                  opacity="0.45"
                />
              )),
            ),
          )}
          {/* Means: a 2 px line with a marker at each scale. */}
          {series.map((s) => (
            <g key={`m-${s.method}`}>
              <polyline
                points={s.mean.map((m, i) => `${X(i)},${Y(m)}`).join(" ")}
                fill="none"
                stroke={INK[s.method]}
                strokeWidth={s.method === "SGS" ? 2.5 : 2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {s.mean.map((m, i) => (
                <Shape key={i} m={s.method} x={X(i)} y={Y(m)} />
              ))}
            </g>
          ))}
          {/* End labels, in ink, keyed by marker. */}
          {groups.map((g) => {
            const y = Y(g.v[0]);
            // One method: the label sits by its line's end marker. Several:
            // their markers come first, so the label names each.
            const keys = g.ms.length > 1 ? g.ms : [];
            const x0 = L + pw + 12;
            return (
              <g key={g.ms.join()}>
                {keys.map((m, k) => (
                  <Shape
                    key={m}
                    m={m}
                    x={x0 + 4 + k * 11}
                    y={y}
                    r={3.4}
                    ring={false}
                  />
                ))}
                <text
                  x={x0 + (keys.length ? keys.length * 11 + 2 : 0)}
                  y={y}
                  dy="0.32em"
                  className="cb-scale-end"
                >
                  {endLabel(g, small)}
                </text>
              </g>
            );
          })}
          {/* Hover targets: one column per scale. */}
          {ENVS.map((_, i) => {
            const x0 = i === 0 ? L - 12 : (X(i - 1) + X(i)) / 2;
            const x1 = i === last ? L + pw + 12 : (X(i) + X(i + 1)) / 2;
            return (
              <rect
                key={`h-${i}`}
                x={x0}
                y={T}
                width={x1 - x0}
                height={ph}
                fill="transparent"
                tabIndex={0}
                aria-label={`${ENV_LABELS[i]} parallel environments: ${panel.series
                  .map(
                    (s) =>
                      `${s.method} ${fmt(s.mean[i])} plus or minus ${fmt(s.ci[i])}`,
                  )
                  .join(", ")}`}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
              />
            );
          })}
        </svg>
        {hover !== null && (
          <div
            className="cb-scale-tip pz-small"
            style={{
              left: Math.min(Math.max(tipLeft, 70), w - 70),
              top: T,
            }}
          >
            <p className="cb-scale-tip-h">{ENV_LABELS[hover]} environments</p>
            {[...panel.series]
              .sort((a, b) => b.mean[hover] - a.mean[hover])
              .map((s) => (
                <p key={s.method} className="cb-scale-tip-row">
                  <Key m={s.method} />
                  <span>{s.method}</span>
                  <span className="pz-num">
                    {fmt(s.mean[hover])} ± {fmt(s.ci[hover])}
                  </span>
                </p>
              ))}
          </div>
        )}
      </div>
      <p className="cb-scale-metric">{panel.metric}</p>
      {/* The values as a table, for screen readers. The wrapper is the
          sr-only box: a table given sr-only grows to fit its cells and
          widens the page on phones. */}
      <div className="sr-only">
        <table>
          <caption>
            {panel.title}, {panel.metric.toLowerCase()}, mean of three seeds
            with 95% confidence interval
          </caption>
          <thead>
            <tr>
              <th scope="col">Method</th>
              {ENV_LABELS.map((l) => (
                <th key={l} scope="col">
                  {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {panel.series.map((s) => (
              <tr key={s.method}>
                <th scope="row">{s.method}</th>
                {s.mean.map((m, i) => (
                  <td key={i}>
                    {fmt(m)} ± {fmt(s.ci[i])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

export default function ScalingCharts() {
  return (
    <div className="cb-scale-wrap">
      <p className="cb-scale-legend pz-small">
        {ORDER.map((m) => (
          <span key={m} className="whitespace-nowrap">
            <Key m={m} />
            {m === "Linear" ? "Linear curriculum" : m}
          </span>
        ))}
      </p>
      <div className="cb-scale-pair">
        {PANELS.map((p) => (
          <Chart key={p.id} panel={p} />
        ))}
      </div>
    </div>
  );
}
