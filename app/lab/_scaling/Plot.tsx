"use client";

import type { KeyboardEvent, PointerEvent } from "react";
import {
  ENVS,
  LAST,
  METHODS,
  SCALE_LABELS,
  fmt,
  successAt,
  type Method,
  type Task,
} from "./clips";
import type { Inks, Skin } from "./skins";
import { text } from "./skins";
import { SCALING } from "../content";

// One task's success-rate chart, in either look:
//   swiss   markers differ by shape, SGS in the accent colour, a y-axis.
//   web/poster  baselines differ by dash, panel lines only at 0 and 1.
// The x-axis labels are real buttons below the SVG. "point" mode selects
// one data point (method and scale); "scale" mode selects a whole scale.

type Shape = "circle" | "square" | "triangle" | "diamond";
const SHAPE: Record<Method, Shape> = {
  SGS: "circle",
  PLR: "diamond",
  Uniform: "square",
  Linear: "triangle",
};
const DASH: Record<Method, string | undefined> = {
  SGS: undefined,
  PLR: undefined,
  Uniform: "7 5",
  Linear: "0.5 5",
};

export type Geometry = {
  width: number;
  height: number;
  M: { top: number; right: number; bottom: number; left: number };
  x: (scale: number) => number;
  xEnv: (env: number) => number;
  y: (v: number) => number;
  tick: number; // x-axis label size, px
};

export function geometry(
  width: number,
  skin: Skin,
  maxHeight = Infinity,
): Geometry {
  const swiss = skin === "swiss";
  const desktop = width >= 700;
  const M = swiss
    ? { top: 14, right: 50, bottom: 4, left: 32 }
    : { top: 10, right: desktop ? 104 : 90, bottom: 8, left: 2 };
  const natural = swiss
    ? Math.min(300, Math.max(200, width * 0.62))
    : width * (desktop ? 0.34 : skin === "web" ? 0.66 : 0.78);
  const height = Math.round(Math.max(160, Math.min(natural, maxHeight)));
  const pw = width - M.left - M.right;
  const ph = height - M.top - M.bottom;
  const lo = Math.log2(ENVS[0]);
  const hi = Math.log2(ENVS[LAST]);
  const xEnv = (e: number) => M.left + ((Math.log2(e) - lo) / (hi - lo)) * pw;
  return {
    width,
    height,
    M,
    xEnv,
    x: (s) => xEnv(ENVS[s]),
    y: (v) => M.top + (1 - v) * ph,
    tick: swiss ? 13 : desktop ? 30 : skin === "web" ? 17 : 19,
  };
}

function Marker({
  shape,
  x,
  y,
  r,
  fill,
  ring,
}: {
  shape: Shape;
  x: number;
  y: number;
  r: number;
  fill: string;
  ring: string;
}) {
  // A ring in the surface colour keeps markers legible where lines cross.
  const p = { stroke: ring, strokeWidth: 2, fill };
  if (shape === "circle") return <circle cx={x} cy={y} r={r + 0.5} {...p} />;
  if (shape === "square")
    return <rect x={x - r} y={y - r} width={r * 2} height={r * 2} {...p} />;
  if (shape === "triangle")
    return (
      <path
        d={`M${x},${y - r - 1} L${x + r + 1},${y + r} L${x - r - 1},${y + r} Z`}
        {...p}
      />
    );
  return (
    <path
      d={`M${x},${y - r - 1} L${x + r + 1},${y} L${x},${y + r + 1} L${x - r - 1},${y} Z`}
      {...p}
    />
  );
}

// Legend glyph: the series' line and marker, as drawn in the chart.
export function Key({
  method,
  skin,
  inks,
}: {
  method: Method;
  skin: Skin;
  inks: Inks;
}) {
  const sgs = method === "SGS";
  const color = sgs ? inks.sgs : inks.base;
  const swiss = skin === "swiss";
  return (
    <svg
      width="24"
      height="10"
      aria-hidden="true"
      className="mr-1.5 inline-block shrink-0 align-[-0.05em]"
    >
      <line
        x1="1"
        x2="23"
        y1="5"
        y2="5"
        stroke={color}
        strokeWidth={sgs ? (swiss ? 2.5 : 3.5) : swiss ? 1.5 : 2}
        strokeDasharray={swiss ? undefined : DASH[method]}
        strokeLinecap="round"
      />
      {swiss ? (
        <Marker
          shape={SHAPE[method]}
          x={12}
          y={5}
          r={3}
          fill={color}
          ring={inks.surface}
        />
      ) : null}
    </svg>
  );
}

// Methods present at a scale, highest success first (ties in legend order).
export function ranked(task: Task, scale: number) {
  return task.methods
    .filter((m) => successAt(task, m, scale) !== null)
    .sort(
      (a, b) =>
        (successAt(task, b, scale) as number) -
          (successAt(task, a, scale) as number) ||
        METHODS.indexOf(a) - METHODS.indexOf(b),
    );
}

export default function Plot({
  task,
  skin,
  inks,
  width,
  maxHeight,
  mode,
  method,
  scale,
  hot = null,
  onPick,
  onHot,
  overprint = false,
  clearTop = 0,
}: {
  task: Task;
  skin: Skin;
  inks: Inks;
  width: number;
  maxHeight?: number;
  mode: "point" | "scale";
  method: Method | null;
  scale: number;
  // A linked highlight from elsewhere (e.g. a matrix cell under the pointer).
  hot?: { method: Method | null; scale: number } | null;
  onPick: (scale: number, method: Method) => void;
  onHot?: (scale: number | null) => void;
  overprint?: boolean;
  // Poster overprint: px from the top kept clear of everything but the
  // 1.0 rule, because the panel title's glyphs sit there.
  clearTop?: number;
}) {
  const g = geometry(width, skin, maxHeight);
  const { x, y, M, height } = g;
  const swiss = skin === "swiss";
  const t = text(skin);
  const point = mode === "point";

  const nearestScale = (px: number) => {
    let k = 0;
    ENVS.forEach((_, i) => {
      if (Math.abs(x(i) - px) < Math.abs(x(k) - px)) k = i;
    });
    return k;
  };
  const nearestMethod = (s: number, py: number): Method => {
    const live = ranked(task, s);
    if (!live.length) return method ?? "SGS";
    const d = (m: Method) => Math.abs(y(successAt(task, m, s) as number) - py);
    const best = Math.min(...live.map(d));
    const tied = live.filter((m) => d(m) - best < 1);
    // Overlapping points: keep the current method if it is one of them.
    return method && tied.includes(method) ? method : tied[0];
  };
  const fromPointer = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const s = nearestScale(e.clientX - r.left);
    onPick(s, point ? nearestMethod(s, e.clientY - r.top) : (method ?? "SGS"));
  };

  const onKey = (e: KeyboardEvent) => {
    let s = scale;
    let m: Method = method ?? "SGS";
    if (e.key === "ArrowRight") s = Math.min(LAST, s + 1);
    else if (e.key === "ArrowLeft") s = Math.max(0, s - 1);
    else if (e.key === "Home") s = 0;
    else if (e.key === "End") s = LAST;
    else if (point && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      const order = ranked(task, s);
      const i = order.indexOf(m);
      const j =
        i < 0
          ? 0
          : Math.max(
              0,
              Math.min(order.length - 1, i + (e.key === "ArrowUp" ? -1 : 1)),
            );
      m = order[j] ?? m;
    } else return;
    e.preventDefault();
    onPick(s, m);
  };

  // Baselines first so SGS draws on top.
  const series = [...task.methods].sort(
    (a, b) => Number(a === "SGS") - Number(b === "SGS"),
  );
  const color = (m: Method) => (m === "SGS" ? inks.sgs : inks.base);
  const r = (m: Method) => (swiss ? 4 : m === "SGS" ? 4.5 : 3);
  const mark = (m: Method, s: number, grow = 0) => {
    const v = successAt(task, m, s);
    if (v === null) return null;
    return swiss ? (
      <Marker
        key={`${m}${s}`}
        shape={SHAPE[m]}
        x={x(s)}
        y={y(v)}
        r={r(m) + grow}
        fill={color(m)}
        ring={inks.surface}
      />
    ) : (
      <circle
        key={`${m}${s}`}
        cx={x(s)}
        cy={y(v)}
        r={r(m) + grow}
        fill={color(m)}
      />
    );
  };

  // End labels at 1M, nudged apart where values are close.
  const ends = series
    .filter((m) => successAt(task, m, LAST) !== null)
    .map((m) => ({ m, v: successAt(task, m, LAST) as number }))
    .sort((a, b) => b.v - a.v);
  const shown = swiss
    ? ends.filter(
        (e, i) => e.m === "SGS" || i === ends.findIndex((f) => f.m !== "SGS"),
      )
    : ends;
  // Placed from the bottom up, so the lowest label never leaves the SVG.
  const labelY = new Map<Method, number>();
  let floor = height - 3;
  for (const e of [...shown].reverse()) {
    const yy = Math.min(y(e.v) + 4, floor);
    labelY.set(e.m, yy);
    floor = yy - 13;
  }

  const selV = method ? successAt(task, method, scale) : null;
  const band = Math.round(Math.max(26, g.tick * 2));
  const top = Math.max(M.top, clearTop);
  const tickRow = swiss ? 30 : Math.round(g.tick * 1.15 + 10);

  return (
    <div style={{ width }}>
      <svg
        width={width}
        height={height}
        className={`block cursor-pointer touch-pan-y select-none outline-none ${overprint ? "pz-overprint" : ""}`}
        role="img"
        aria-label={`${task.name}: success rate against parallel environments, ${SCALE_LABELS[0]} to ${SCALE_LABELS[LAST]}${point ? ". Arrow keys choose a point." : ""}`}
        tabIndex={point ? 0 : undefined}
        onKeyDown={point ? onKey : undefined}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          fromPointer(e);
        }}
        onPointerMove={(e) => {
          const pressed = e.currentTarget.hasPointerCapture(e.pointerId);
          if (pressed || (point && e.pointerType === "mouse")) fromPointer(e);
          else if (onHot) {
            const r0 = e.currentTarget.getBoundingClientRect();
            onHot(nearestScale(e.clientX - r0.left));
          }
        }}
        onPointerLeave={() => onHot?.(null)}
      >
        {/* Prior work stopped at about 64K environments. */}
        <rect
          x={x(0)}
          y={top}
          width={g.xEnv(SCALING.priorMax) - x(0)}
          height={y(0) - top}
          fill={inks.band}
          opacity={inks.bandOpacity}
        />
        <text
          x={x(0) + (swiss ? 6 : 4)}
          y={swiss ? M.top + 14 : y(0) - 6}
          fontSize={swiss ? 11 : 12}
          fill={swiss ? inks.mute : inks.fg}
        >
          Prior work
        </text>

        {swiss
          ? [0, 0.5, 1].map((v) => (
              <g key={v}>
                <line
                  x1={M.left}
                  x2={width - M.right}
                  y1={y(v)}
                  y2={y(v)}
                  stroke={v === 0 ? inks.fg : inks.hair}
                  strokeWidth={1}
                />
                <text
                  x={M.left - 12}
                  y={y(v) + 4}
                  fontSize={11}
                  textAnchor="end"
                  fill={inks.mute}
                  className="sw-num"
                >
                  {v}
                </text>
              </g>
            ))
          : [0, 1].map((v) => (
              <line
                key={v}
                x1={M.left}
                x2={width - M.right}
                y1={y(v)}
                y2={y(v)}
                stroke={inks.fg}
                strokeWidth={v === 0 ? 1 : 0.5}
              />
            ))}

        {hot && hot.scale !== scale && (
          <line
            x1={x(hot.scale)}
            x2={x(hot.scale)}
            y1={top}
            y2={y(0)}
            stroke={inks.fg}
            strokeWidth={1}
            opacity={0.3}
          />
        )}
        {/* Scale mode: a column in the highlight ink under the chosen
            scale, continuing the band behind its x-axis label. */}
        {!point && !swiss && (
          <rect
            x={Math.max(M.left, x(scale) - band / 2)}
            y={top}
            width={
              Math.min(x(LAST) + 4, x(scale) + band / 2) -
              Math.max(M.left, x(scale) - band / 2)
            }
            height={y(0) - top}
            fill={inks.hi}
            opacity={skin === "web" ? 0.6 : 0.14}
          />
        )}
        <line
          x1={x(scale)}
          x2={x(scale)}
          y1={top}
          y2={y(0)}
          stroke={inks.fg}
          strokeWidth={point ? 1 : swiss ? 1.5 : 2}
          opacity={point ? 0.35 : 1}
        />

        {series.map((m) => {
          const sgs = m === "SGS";
          const pts = ENVS.map((_, i) => {
            const v = successAt(task, m, i);
            return v === null ? null : `${x(i)},${y(v)}`;
          })
            .filter(Boolean)
            .join(" ");
          return (
            <g key={m}>
              <polyline
                points={pts}
                fill="none"
                stroke={color(m)}
                strokeWidth={sgs ? (swiss ? 2.5 : 3.5) : swiss ? 1.5 : 2}
                strokeDasharray={swiss ? undefined : DASH[m]}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {ENVS.map((_, i) => mark(m, i))}
            </g>
          );
        })}

        {/* Scale mode: every point at the chosen scale, enlarged, on top. */}
        {!point && series.map((m) => mark(m, scale, 2))}

        {hot?.method &&
          successAt(task, hot.method, hot.scale) !== null &&
          !(hot.method === method && hot.scale === scale) && (
            <circle
              cx={x(hot.scale)}
              cy={y(successAt(task, hot.method, hot.scale) as number)}
              r={10}
              fill="none"
              stroke={inks.fg}
              strokeWidth={1}
              opacity={0.45}
            />
          )}

        {/* Point mode: the chosen point, redrawn on top and ringed. */}
        {point && method && selV !== null && (
          <g>
            {mark(method, scale, 1)}
            <circle
              cx={x(scale)}
              cy={y(selV)}
              r={11}
              fill="none"
              stroke={inks.fg}
              strokeWidth={1.5}
            />
          </g>
        )}

        {shown.map((e) => (
          <text
            key={e.m}
            x={x(LAST) + 15}
            y={labelY.get(e.m)}
            fontSize={12}
            fontWeight={swiss && e.m === "SGS" ? 600 : 400}
            fill={swiss && e.m !== "SGS" ? inks.mute : inks.fg}
            className={t.num}
          >
            {swiss ? fmt(e.v) : `${e.m} ${fmt(e.v)}`}
          </text>
        ))}
      </svg>

      <Ticks
        g={g}
        skin={skin}
        inks={inks}
        height={tickRow}
        scale={scale}
        radio={!point}
        onPick={(s) => onPick(s, method ?? "SGS")}
        taskName={task.name}
      />
    </div>
  );
}

// x-axis labels as buttons. In scale mode they form a radio group (arrow
// keys move the selection); in point mode they move the selected point.
function Ticks({
  g,
  skin,
  inks,
  height,
  scale,
  radio,
  onPick,
  taskName,
}: {
  g: Geometry;
  skin: Skin;
  inks: Inks;
  height: number;
  scale: number;
  radio: boolean;
  onPick: (s: number) => void;
  taskName: string;
}) {
  const swiss = skin === "swiss";
  const pad = swiss ? 5 : Math.round(g.tick * 0.16);
  const move = (e: KeyboardEvent<HTMLButtonElement>, s: number) => {
    const d =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? -1
          : 0;
    if (!d) return;
    e.preventDefault();
    const n = Math.max(0, Math.min(LAST, s + d));
    onPick(n);
    const sib = e.currentTarget.parentElement?.children[n] as
      HTMLElement | undefined;
    sib?.focus();
  };
  return (
    <div
      className="relative"
      style={{ height, width: g.width }}
      role={radio ? "radiogroup" : "group"}
      aria-label={`${taskName}: parallel environments`}
    >
      {SCALE_LABELS.map((l, i) => {
        const on = i === scale;
        const pos =
          i === 0
            ? { left: g.x(i) - pad }
            : i === LAST
              ? { right: g.width - g.x(i) - pad }
              : { left: g.x(i), transform: "translateX(-50%)" };
        return (
          <button
            key={l}
            type="button"
            role={radio ? "radio" : undefined}
            aria-checked={radio ? on : undefined}
            aria-pressed={radio ? undefined : on}
            aria-label={`${l} environments`}
            tabIndex={radio && !on ? -1 : 0}
            onClick={() => onPick(i)}
            onKeyDown={radio ? (e) => move(e, i) : undefined}
            className={`absolute top-1 whitespace-nowrap ${swiss ? "sw-num font-medium" : "pz-num"}`}
            style={{
              ...pos,
              fontSize: g.tick,
              lineHeight: 1.1,
              letterSpacing: swiss ? 0 : "-0.03em",
              padding: `${swiss ? 3 : 1}px ${pad}px ${swiss ? 3 : 2}px`,
              minHeight: 28,
              background: on ? inks.hi : "transparent",
              color: on ? inks.hiText : swiss ? inks.mute : inks.fg,
            }}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
