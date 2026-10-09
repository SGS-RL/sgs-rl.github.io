"use client";

import {
  BAND,
  clipAt,
  CURVE,
  FOOTAGE,
  INK,
  MAX_IT,
  N,
  RED,
  TASK,
} from "./overlayData";

// o6 of ./SamplingOverlay.tsx: o5 (both plots down the left third, no
// panel) styled as telemetry (owner, 2026-10-09: "a bit more like
// telemetry? even if it means changing the font"). The site's mono face
// (JetBrains Mono, as in the BibTeX block), uppercase labels, fixed-width
// readouts, a checkpoint bar, axes with major and minor ticks, crop marks
// for frames, the 0.9x-peak band hatched, square markers and a crosshair
// on the current checkpoint. Sizes in CSS px of the 1200 x 675 frame.

const W = 340;
const H = 210;
const L = 44;
const R = 8;
const T = 10;
const B = 40;
const PW = W - L - R;
const PH = H - T - B;

const pad = (n: number, k: number) => String(n).padStart(k, "0");

// Crop marks at the plot area's corners.
function Corners() {
  const k = 9;
  const x0 = L - 0.5;
  const x1 = L + PW + 0.5;
  const y0 = T - 0.5;
  const y1 = T + PH + 0.5;
  const d = [
    `M${x0},${y0 + k}V${y0}H${x0 + k}`,
    `M${x1 - k},${y0}H${x1}V${y0 + k}`,
    `M${x1},${y1 - k}V${y1}H${x1 - k}`,
    `M${x0 + k},${y1}H${x0}V${y1 - k}`,
  ].join("");
  return <path d={d} fill="none" stroke={INK} strokeWidth="1" />;
}

function Hatch({ id }: { id: string }) {
  return (
    <defs>
      <pattern
        id={id}
        width="5"
        height="5"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line x1="0" y1="0" x2="0" y2="5" stroke={RED} strokeWidth="1.1" />
      </pattern>
    </defs>
  );
}

// Ticks along the bottom (x) or left (y) edge: majors labelled, minors
// short.
function XTicks({
  majors,
  minors,
  X,
  label,
}: {
  majors: [number, string][];
  minors: number[];
  X: (v: number) => number;
  label: string;
}) {
  const y = T + PH;
  return (
    <g>
      <line x1={L} x2={L + PW} y1={y} y2={y} stroke={INK} strokeWidth="1" />
      {minors.map((v) => (
        <line
          key={`m${v}`}
          x1={X(v)}
          x2={X(v)}
          y1={y}
          y2={y + 3}
          stroke={INK}
        />
      ))}
      {majors.map(([v, t]) => (
        <g key={v}>
          <line x1={X(v)} x2={X(v)} y1={y} y2={y + 6} stroke={INK} />
          <text x={X(v)} y={y + 17} textAnchor="middle" className="tm-tick">
            {t}
          </text>
        </g>
      ))}
      <text x={L + PW} y={y + 33} textAnchor="end" className="tm-axis">
        {label}
      </text>
    </g>
  );
}

function YTicks({
  majors,
  minors,
  Y,
}: {
  majors: [number, string][];
  minors: number[];
  Y: (v: number) => number;
}) {
  return (
    <g>
      <line x1={L} x2={L} y1={T} y2={T + PH} stroke={INK} strokeWidth="1" />
      {minors.map((v) => (
        <line
          key={`m${v}`}
          x1={L - 3}
          x2={L}
          y1={Y(v)}
          y2={Y(v)}
          stroke={INK}
        />
      ))}
      {majors.map(([v, t]) => (
        <g key={v}>
          <line x1={L - 6} x2={L} y1={Y(v)} y2={Y(v)} stroke={INK} />
          <text x={L - 9} y={Y(v) + 4} textAnchor="end" className="tm-tick">
            {t}
          </text>
        </g>
      ))}
    </g>
  );
}

// A square marker centred on (x, y).
function Mark({
  x,
  y,
  s,
  fill,
}: {
  x: number;
  y: number;
  s: number;
  fill: string;
}) {
  return <rect x={x - s / 2} y={y - s / 2} width={s} height={s} fill={fill} />;
}

function Crosshair({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={RED} strokeWidth="1" strokeDasharray="3 3">
      <line x1={x} x2={x} y1={y} y2={T + PH} />
      <line x1={L} x2={x} y1={y} y2={y} />
    </g>
  );
}

function Head({
  label,
  value,
  unit,
  right,
}: {
  label: string;
  value: string;
  unit: string;
  right?: string;
}) {
  return (
    <div className="tm-head">
      <p className="tm-label">
        <span>{label}</span>
        {right && <span>{right}</span>}
      </p>
      <p className="tm-value">
        {value}
        <span className="tm-unit">{unit}</span>
      </p>
    </div>
  );
}

export default function Telemetry({ frame }: { frame: number }) {
  const ci = clipAt(frame);
  const clip = TASK.clips[ci];
  const it = clip.it;
  const s = TASK.rows.find((r) => r.it === it)!.s;
  const lens = TASK.clips.map((c) => c.end - c.start + 1);

  // Success across training.
  const SX = (v: number) => L + (v / MAX_IT) * PW;
  const SY = (v: number) => T + (1 - v) * PH;
  const itMajors: [number, string][] = [];
  const itMinors: number[] = [];
  for (let v = 0; v <= MAX_IT; v += 200)
    if (v % 1000 === 0) itMajors.push([v, String(v)]);
    else itMinors.push(v);
  const pctMajors: [number, string][] = [
    [0, "0%"],
    [0.5, "50%"],
    [1, "100%"],
  ];
  const pctMinors = [0.1, 0.2, 0.3, 0.4, 0.6, 0.7, 0.8, 0.9];

  // SGS weight across success rate.
  const WX = (v: number) => L + v * PW;
  const WY = SY;

  return (
    <div className="tm">
      <div className="tm-status">
        <p className="tm-label">
          <span>
            CKPT {ci + 1}/{TASK.clips.length}
          </span>
          <span>ITER {pad(it, 5)}</span>
        </p>
        <div
          className="tm-bar"
          style={{
            gridTemplateColumns: lens.map((l) => `${l}fr`).join(" "),
          }}
        >
          {TASK.clips.map((c, i) => (
            <span key={c.it} className="tm-seg">
              <span
                className="tm-fill"
                style={{
                  background: i === ci ? RED : INK,
                  transform: `scaleX(${
                    i < ci ? 1 : i > ci ? 0 : (frame - c.start + 1) / lens[i]
                  })`,
                }}
              />
            </span>
          ))}
        </div>
      </div>

      <Head
        label="SUCCESS RATE"
        value={`${((s / N) * 100).toFixed(1)}%`}
        unit={` ${pad(s, 2)}/${N}`}
      />
      <svg width={W} height={H} className="tm-plot" aria-hidden="true">
        <Hatch id="tm-hatch-s" />
        <rect
          x={L}
          y={SY(BAND[1])}
          width={PW}
          height={SY(BAND[0]) - SY(BAND[1])}
          fill="url(#tm-hatch-s)"
          opacity="0.5"
        />
        <text x={L + 6} y={SY(BAND[1]) + 12} className="tm-band">
          W ≥ 0.9 PEAK
        </text>
        <Corners />
        <YTicks majors={pctMajors} minors={pctMinors} Y={SY} />
        <XTicks
          majors={itMajors}
          minors={itMinors}
          X={SX}
          label="TRAINING ITERATION"
        />
        <Crosshair x={SX(it)} y={SY(s / N)} />
        <polyline
          points={TASK.rows.map((r) => `${SX(r.it)},${SY(r.s / N)}`).join(" ")}
          fill="none"
          stroke={INK}
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        {TASK.rows.map((r) =>
          r.it === it ? null : (
            <Mark
              key={r.it}
              x={SX(r.it)}
              y={SY(r.s / N)}
              s={FOOTAGE.has(r.it) ? 7 : 5}
              fill={FOOTAGE.has(r.it) ? INK : "#555"}
            />
          ),
        )}
        <Mark x={SX(it)} y={SY(s / N)} s={11} fill={RED} />
      </svg>

      <Head label="SGS WEIGHT" value={CURVE[s].toFixed(2)} unit=" × PEAK" />
      <svg width={W} height={H} className="tm-plot" aria-hidden="true">
        <Hatch id="tm-hatch-w" />
        <rect
          x={WX(BAND[0])}
          y={T}
          width={WX(BAND[1]) - WX(BAND[0])}
          height={PH}
          fill="url(#tm-hatch-w)"
          opacity="0.5"
        />
        <Corners />
        <YTicks
          majors={[
            [0, "0"],
            [1, "PEAK"],
          ]}
          minors={[0.25, 0.5, 0.75]}
          Y={WY}
        />
        <XTicks
          majors={pctMajors}
          minors={pctMinors}
          X={WX}
          label="SUCCESS RATE"
        />
        <Crosshair x={WX(s / N)} y={WY(CURVE[s])} />
        <polyline
          points={CURVE.map((v, k) => `${WX(k / N)},${WY(v)}`).join(" ")}
          fill="none"
          stroke={RED}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <Mark x={WX(s / N)} y={WY(CURVE[s])} s={11} fill={RED} />
      </svg>
    </div>
  );
}
