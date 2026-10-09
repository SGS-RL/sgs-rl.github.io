"use client";

import { useEffect, useRef, useState } from "react";
import {
  BAND,
  clipAt,
  CURVE,
  fmt,
  FOOTAGE,
  INK,
  MAX_IT,
  MUTE,
  N,
  RED,
  SRC,
  TASK,
} from "./overlayData";
import Telemetry from "./Telemetry";
import "./overlay.css";

// Not for the site: the owner's Twitter thread video of "Sampling during
// training" with the plots over the footage (2026-10-09: "overlay the plots
// within the frame of the video of the ur5 video ... let's try a few
// versions"). The waterproof connector's whole render (1920 x 1080, not
// cropped as on the site), and over it the success rate across training
// and the SGS weight across success rate, drawn here for the overlay
// (thicker, larger type) from the data of Method part 03
// (../_combined/learningData.ts). The renderer
// (scripts/lab/thread/sampling_overlay.py) seeks the video frame by frame;
// each seek moves the plots to that frame's checkpoint.
//
//   o1  the two plots in the top corners, over the wall, no panel
//   o2  o1 on translucent white panels
//   o3  both plots down the left third, on one translucent panel
//   o5  o3 without the panel, its greys darker to read on the floor
//   o6  o5 as telemetry (owner: "a bit more like telemetry? even if it
//       means changing the font"): ./Telemetry.tsx
// (o4, o3 without the panel but with a white edge around every line and
// letter, is gone: owner, 2026-10-09, "you shouldn't have this thin white
// edge".) Type in Helvetica (owner: "make sure you use helvetica").

export type OverlayVariant = "o1" | "o2" | "o3" | "o5" | "o6";

// Size in CSS px (the video is rendered at 1.6x). `bare`: no panel, so
// the points lose their white rings and the greys get darker.
type Plot = { w: number; h: number; it: number; bare: boolean };

function SuccessPlot({ w, h, it, bare }: Plot) {
  const L = 46;
  const R = 10;
  const T = 58;
  const B = 50;
  const pw = w - L - R;
  const ph = h - T - B;
  const X = (v: number) => L + (v / MAX_IT) * pw;
  const Y = (v: number) => T + (1 - v) * ph;
  const row = TASK.rows.find((r) => r.it === it)!;
  const step = MAX_IT > 4000 ? 2000 : 1000;
  const ticks: number[] = [];
  for (let v = 0; v <= MAX_IT; v += step) ticks.push(v);
  return (
    <svg width={w} height={h} className="ov-plot" aria-hidden="true">
      <g>
        <text x={0} y={18} className="ov-name">
          Success rate
        </text>
        <text x={0} y={44} className="ov-value">
          {Math.round((row.s / N) * 100)}%
        </text>
        <text x={w - R} y={44} textAnchor="end" className="ov-name">
          Iteration {fmt(it)}
        </text>
        {[0, 0.5, 1].map((v) => (
          <g key={v}>
            <line
              x1={L}
              x2={L + pw}
              y1={Y(v)}
              y2={Y(v)}
              stroke={INK}
              strokeOpacity={v === 0 ? 1 : bare ? 0.35 : 0.18}
              strokeWidth={v === 0 ? 1.5 : 1}
            />
            <text x={L - 8} y={Y(v) + 5} textAnchor="end" className="ov-tick">
              {v * 100}%
            </text>
          </g>
        ))}
        {ticks.map((v) => (
          <text
            key={v}
            x={X(v)}
            y={T + ph + 22}
            textAnchor="middle"
            className="ov-tick"
          >
            {fmt(v)}
          </text>
        ))}
        <text
          x={L + pw / 2}
          y={T + ph + 46}
          textAnchor="middle"
          className="ov-axis"
        >
          Training iteration
        </text>
      </g>
      {/* Where SGS gives this configuration at least 0.9x its peak weight. */}
      <rect
        x={L}
        y={Y(BAND[1])}
        width={pw}
        height={Y(BAND[0]) - Y(BAND[1])}
        fill={RED}
        fillOpacity={bare ? 0.2 : 0.1}
      />
      <g>
        <polyline
          points={TASK.rows.map((r) => `${X(r.it)},${Y(r.s / N)}`).join(" ")}
          fill="none"
          stroke={INK}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {TASK.rows.map((r) => {
          const now = r.it === it;
          return (
            <circle
              key={r.it}
              cx={X(r.it)}
              cy={Y(r.s / N)}
              r={now ? 8 : FOOTAGE.has(r.it) ? 5.5 : 4}
              fill={now ? RED : FOOTAGE.has(r.it) ? INK : bare ? "#555" : MUTE}
              stroke={bare ? "none" : "#fff"}
              strokeWidth="2"
              paintOrder="stroke"
            />
          );
        })}
      </g>
    </svg>
  );
}

function WeightPlot({ w, h, it, bare }: Plot) {
  const L = 46;
  const R = 10;
  const T = 58;
  const B = 50;
  const pw = w - L - R;
  const ph = h - T - B;
  const X = (v: number) => L + v * pw;
  const Y = (v: number) => T + (1 - v) * ph;
  const row = TASK.rows.find((r) => r.it === it)!;
  const s = row.s;
  return (
    <svg width={w} height={h} className="ov-plot" aria-hidden="true">
      <rect
        x={X(BAND[0])}
        y={T}
        width={X(BAND[1]) - X(BAND[0])}
        height={ph}
        fill={RED}
        fillOpacity={bare ? 0.2 : 0.1}
      />
      <g>
        <text x={0} y={18} className="ov-name">
          SGS weight
        </text>
        <text x={0} y={44} className="ov-value">
          {CURVE[s].toFixed(2)}× peak
        </text>
        <line
          x1={L}
          x2={L + pw}
          y1={Y(0)}
          y2={Y(0)}
          stroke={INK}
          strokeWidth="1.5"
        />
        <line
          x1={L}
          x2={L + pw}
          y1={Y(1)}
          y2={Y(1)}
          stroke={INK}
          strokeOpacity={bare ? 0.35 : 0.18}
        />
        <text x={L - 8} y={Y(1) + 5} textAnchor="end" className="ov-tick">
          Peak
        </text>
        <text x={L - 8} y={Y(0) + 5} textAnchor="end" className="ov-tick">
          0
        </text>
        {[0, 0.5, 1].map((v) => (
          <text
            key={v}
            x={X(v)}
            y={T + ph + 22}
            textAnchor="middle"
            className="ov-tick"
          >
            {v * 100}%
          </text>
        ))}
        <text
          x={L + pw / 2}
          y={T + ph + 46}
          textAnchor="middle"
          className="ov-axis"
        >
          Success rate
        </text>
        <polyline
          points={CURVE.map((v, k) => `${X(k / N)},${Y(v)}`).join(" ")}
          fill="none"
          stroke={RED}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <line
          x1={X(s / N)}
          x2={X(s / N)}
          y1={Y(CURVE[s])}
          y2={Y(0)}
          stroke={RED}
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <circle
          cx={X(s / N)}
          cy={Y(CURVE[s])}
          r="8"
          fill={RED}
          stroke={bare ? "none" : "#fff"}
          strokeWidth="2"
          paintOrder="stroke"
        />
      </g>
    </svg>
  );
}

export default function SamplingOverlay({ v }: { v: OverlayVariant }) {
  const video = useRef<HTMLVideoElement>(null);
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const read = () =>
      setFrame(Math.min(TASK.frames - 1, Math.floor(el.currentTime * 30)));
    el.addEventListener("seeked", read);
    el.addEventListener("timeupdate", read);
    return () => {
      el.removeEventListener("seeked", read);
      el.removeEventListener("timeupdate", read);
    };
  }, []);
  const it = TASK.clips[clipAt(frame)].it;
  const bare = v === "o1" || v === "o5";
  const corners = v === "o1" || v === "o2";
  return (
    <div className={`ov ov-${v} ${bare ? "ov-bare" : ""}`}>
      <video
        ref={video}
        src={SRC}
        muted
        playsInline
        preload="auto"
        className="ov-video"
      />
      {v === "o6" ? (
        <Telemetry frame={frame} />
      ) : corners ? (
        <>
          <div className="ov-panel ov-tl">
            <SuccessPlot w={360} h={200} it={it} bare={bare} />
          </div>
          <div className="ov-panel ov-tr">
            {/* Narrow, to stay clear of the arm at early checkpoints. */}
            <WeightPlot w={220} h={200} it={it} bare={bare} />
          </div>
        </>
      ) : (
        <div className="ov-panel ov-left">
          <SuccessPlot w={340} h={250} it={it} bare={bare} />
          <WeightPlot w={340} h={250} it={it} bare={bare} />
        </div>
      )}
    </div>
  );
}
