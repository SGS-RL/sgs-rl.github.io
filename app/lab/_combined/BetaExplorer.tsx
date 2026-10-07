"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { score, type Kernel } from "../_method/sgs";
import { drawDot, drawMaze, fit, readTheme } from "../_nav/draw";
import { snapshot, WORLD as w } from "../_nav/nav";

// The Beta weighting, interactive (owner, 2026-10-07: "an explanation of
// the beta weighting ... maybe even interactive and to show how the
// parameters of it affect where the samples get sampled from"). Sliders set
// the target t, the concentration κ, the temperature T and the floor ε
// (log scale): with a large κ the weight's peak itself is tiny, and a floor
// like the paper's 1e-4 then flattens it, so the floor matters. The curve is the chance of picking a goal against its
// tracked success rate, relative to the most likely one; the maze, the
// navigation toy example partway through training, shows each goal's chance as the
// area of its red dot; the bar splits the picks between goals that are
// rarely reached, sometimes reached and almost always reached.

// T stays at the paper's 2: it rescales the log weights, as κ does (owner,
// 2026-10-07: "drop the T, since this has the same effect as modifying
// kappa"). Presets: the maze's own setting (../_nav TOY) and uniform; the
// paper's settings are not offered as presets (owner).
const T = 2;
type Preset = [name: string, t: number, kappa: number, le: number];
const PRESETS: Preset[] = [
  ["As in the maze above", 0.5, 10, -6],
  ["Uniform", 0.5, 0, -4],
];

// P(i) for every goal, from its success rate.
function probs(p: ArrayLike<number>, k: Kernel) {
  const s = Array.from(p, (x) => score(x, k));
  const top = Math.max(...s);
  const e = s.map((x) => Math.exp(x - top));
  const sum = e.reduce((a, b) => a + b, 0);
  return e.map((x) => x / sum);
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  show,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  show: string;
}) {
  return (
    <label className="cb-beta-slider pz-small">
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <output className="pz-num">{show}</output>
    </label>
  );
}

export default function BetaExplorer() {
  const [t, setT] = useState(0.66);
  const [kappa, setKappa] = useState(5);
  const [le, setLe] = useState(-4);
  const k: Kernel = useMemo(
    () => ({ t, kappa, T, eps: 10 ** le }),
    [t, kappa, le],
  );
  const { p } = snapshot();
  const P = useMemo(() => probs(p, k), [p, k]);

  // Curve: the chance of picking a goal at p̂, relative to the most likely.
  const X = (x: number) => 24 + x * 452;
  const Y = (y: number) => 170 - y * 150;
  const curve = useMemo(() => {
    const xs = Array.from({ length: 201 }, (_, j) => j / 200);
    const s = xs.map((x) => score(x, k));
    const top = Math.max(...s);
    return xs
      .map((x, j) => `${X(x).toFixed(1)},${Y(Math.exp(s[j] - top)).toFixed(1)}`)
      .join(" ");
  }, [k]);

  // Shares of the picks: rarely (p < 0.1), sometimes, almost always (> 0.9).
  const share = useMemo(() => {
    const out = [0, 0, 0];
    P.forEach((q, i) => (out[p[i] < 0.1 ? 0 : p[i] > 0.9 ? 2 : 1] += q));
    return out;
  }, [P, p]);

  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const th = readTheme(canvas);
    const top = Math.max(...P);
    const draw = () => {
      const { ctx, cell, dpr } = fit(canvas, w);
      drawMaze(ctx, w, cell, dpr, th, (i) => p[i]);
      for (let i = 0; i < P.length; i++)
        drawDot(ctx, w, cell, th, i, P[i] / top);
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [P, p]);

  const pick = (pr: Preset) => {
    setT(pr[1]);
    setKappa(pr[2]);
    setLe(pr[3]);
  };

  return (
    <div className="cb-method-row cb-beta">
      <figure className="cb-maze">
        <div
          className="relative"
          style={{ aspectRatio: `${w.cols} / ${w.rows}` }}
        >
          <canvas
            ref={ref}
            role="img"
            aria-label="The maze partway through training, shaded by success rate, with a red dot on each goal sized by its chance of being picked next."
            className="absolute inset-0 h-full w-full"
          />
        </div>
        <figcaption className="pz-small mt-2 opacity-70">
          The maze partway through training. Grey: how often each configuration
          is reached. Red dot: its chance of being picked next.
        </figcaption>
      </figure>

      <div className="cb-beta-side">
        <p className="cb-reading-p">
          <strong>How SGS weighs a configuration.</strong> A Beta-shaped weight
          over its success rate <strong>peaks at a target t</strong>;{" "}
          <strong>κ</strong> sets how sharply. A floor <strong>ε</strong> keeps
          a small chance for configurations that always or never succeed.
        </p>

        <svg
          viewBox="0 0 500 200"
          className="cb-beta-curve"
          role="img"
          aria-label="Chance of being picked against success rate for the current settings."
        >
          <line x1={X(0)} x2={X(1)} y1={Y(0)} y2={Y(0)} stroke="#111" />
          <line
            x1={X(t)}
            x2={X(t)}
            y1={Y(0)}
            y2={Y(1)}
            stroke="#111"
            strokeOpacity="0.25"
            strokeDasharray="3 4"
          />
          {/* Every goal of the maze, as a tick at its success rate. */}
          {Array.from(p, (x, i) => (
            <line
              key={i}
              x1={X(x).toFixed(1)}
              x2={X(x).toFixed(1)}
              y1={Y(0) + 4}
              y2={Y(0) + 11}
              stroke="#111"
              strokeOpacity="0.3"
            />
          ))}
          <polyline
            points={curve}
            fill="none"
            stroke="#e4321b"
            strokeWidth="2.25"
          />
          <g fontSize="13" fill="#111">
            <text x={X(0)} y="196" textAnchor="middle">
              0
            </text>
            <text x={X(1)} y="196" textAnchor="middle">
              1
            </text>
            <text x={X(0.5)} y="196" textAnchor="middle" opacity="0.6">
              success rate
            </text>
          </g>
        </svg>

        <div className="flex flex-col gap-1.5">
          <Slider
            label="Target t"
            value={t}
            min={0.05}
            max={0.95}
            step={0.01}
            onChange={setT}
            show={t.toFixed(2)}
          />
          <Slider
            label="Concentration κ"
            value={kappa}
            min={0}
            max={20}
            step={0.5}
            onChange={setKappa}
            show={kappa.toFixed(1)}
          />
          <Slider
            label="Floor ε"
            value={le}
            min={-8}
            max={-2}
            step={0.5}
            onChange={setLe}
            show={`1e${le}`}
          />
        </div>

        <p className="pz-small flex flex-wrap gap-x-3 gap-y-1">
          {PRESETS.map((pr) => {
            const on = pr[1] === t && pr[2] === kappa && pr[3] === le;
            return (
              <button
                key={pr[0]}
                type="button"
                aria-pressed={on}
                className={`st-link ${on ? "" : "opacity-60"}`}
                onClick={() => pick(pr)}
              >
                {pr[0]}
              </button>
            );
          })}
        </p>

        <div>
          <p className="pz-small mb-1.5">Where the picks go</p>
          <div className="cb-beta-bar" aria-hidden="true">
            {share.map((s, i) => (
              <span
                key={i}
                data-band={i}
                style={{ width: `${(s * 100).toFixed(2)}%` }}
              />
            ))}
          </div>
          <p className="pz-small pz-num mt-1.5 flex justify-between gap-2">
            <span>Rarely reached {Math.round(share[0] * 100)}%</span>
            <span>Sometimes {Math.round(share[1] * 100)}%</span>
            <span>Almost always {Math.round(share[2] * 100)}%</span>
          </p>
        </div>
      </div>
    </div>
  );
}
