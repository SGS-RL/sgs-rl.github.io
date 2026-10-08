"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { prefersReducedMotion } from "../_gallery/media";
import { CURVE, TASKS, type LearningTask } from "./learningData";
import "./learning.css";

// Method part 03, Sampling during training (owner, 2026-10-08), from
// Patrick's learning-progress bundle (scripts/lab/encode_learning.py): one
// task configuration of each UR5e task, followed through training. Three
// linked views on one current frame:
//   the video, the policy at each checkpoint with footage, 1×, with a bar
//     split by checkpoint (drag to scrub, click to jump, arrow keys step);
//   success over training, every measured checkpoint with its 95% Wilson
//     interval (64 trials each), the current checkpoint in red, those with
//     footage clickable;
//   the SGS rule's weight (relative to its peak) for the current success
//     rate, shown one of five ways (DuringView below). It illustrates the
//     rule, it is not a measured sampling frequency.
// Nut's early zero-success rows come from a separate evaluation batch and
// are drawn hollow.

const RED = "#e4321b";
const INK = "#111";
const MUTE = "#8c8c87";
const HAIR = "#e2e2de";

// How the SGS weight is shown. The combined page uses bandcurve (owner,
// 2026-10-08: of the views, "I like the band and the curve"; the sideways
// rail did not convince); the others stay:
//   time   a second panel under the chart, on the same iteration axis:
//          the weight of this task configuration at each checkpoint
//   curve  the weight curve upright, as its own chart: success rate
//          across, weight up, the current checkpoint marked
//   band   a red wash on the chart where the weight is at least 0.9× peak
//          (Patrick's band), the current weight in the header
//   rail   the weight curve sideways beside the chart, on the same success
//          axis (the first version)
//   both   the rail and the band
//   bandcurve  the band, and the curve beside the chart (under it on
//          phones) with the same band across its success axis
export type DuringView =
  "bandcurve" | "time" | "curve" | "band" | "rail" | "both";
export const DURING_VIEWS: readonly DuringView[] = [
  "bandcurve",
  "time",
  "curve",
  "band",
  "rail",
  "both",
];

const fmt = (n: number) => n.toLocaleString("en-US");
const pct = (v: number) => `${Math.round(v * 100)}%`;
const weight = (s: number) => CURVE[s];

// Success counts where the weight is at least 0.9× peak.
const HIGH = CURVE.flatMap((v, k) => (v >= 0.9 ? [k] : []));
const BAND = [HIGH[0], HIGH[HIGH.length - 1]] as const;

function clipAt(t: LearningTask, f: number) {
  const i = t.clips.findIndex((c) => f >= c.start && f <= c.end);
  return i < 0 ? 0 : i;
}

// "Nice" x ticks: about four, at round iteration counts.
function ticks(max: number) {
  const step =
    [200, 500, 1000, 2000, 2500, 5000].find((s) => max / s <= 4) ?? 5000;
  const out: number[] = [];
  for (let v = 0; v <= max; v += step) out.push(v);
  return out;
}

function Chart({
  task,
  clip,
  onSeek,
  view,
  ci = false,
}: {
  task: LearningTask;
  clip: number;
  onSeek: (clip: number) => void;
  view: DuringView;
  // The 95% intervals as bars on the chart (owner, 2026-10-08: not sure
  // they are needed; off on the combined page, still in the hover details
  // and the table).
  ci?: boolean;
}) {
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

  const small = w < 520;
  const rail = view === "rail" || view === "both";
  const band = view === "band" || view === "both" || view === "bandcurve";
  const time = view === "time";
  const curve = view === "curve" || view === "bandcurve";
  const beside = curve && !small;
  const clamp = (v: number, lo: number, hi: number) =>
    Math.round(Math.min(Math.max(v, lo), hi));

  // Margins: L for the y ticks; T (and HEAD for a panel stacked below)
  // for a panel's name and value; B for the x ticks and axis name.
  const L = 40;
  const T = 54;
  const HEAD = 58;
  const B = 44;
  const railW = rail ? (small ? 70 : 128) : 0;
  const railGap = rail ? (small ? 18 : 28) : 0;
  const curveW = beside ? Math.round((w - L) * 0.34) : 0;
  const curveGap = beside ? 64 : 0;
  const pw = w - L - 8 - railGap - railW - curveGap - curveW;
  const ph = time
    ? small
      ? Math.round(w * 0.5)
      : clamp(w * 0.34, 170, 280)
    : curve && small
      ? Math.round(w * 0.55)
      : clamp(w * (small ? 0.78 : 0.6), 250, 480) - T - B;
  // The second panel: the weight over training (time), or the curve
  // under the chart on phones.
  const th = small ? Math.round(w * 0.3) : clamp(w * 0.17, 90, 150);
  const ch = beside ? ph : Math.round(w * 0.42);
  const h = time
    ? T + ph + HEAD + th + B
    : curve && small
      ? T + ph + B + HEAD + ch + B
      : T + ph + B;

  const rx = L + pw + railGap;
  const ty = T + ph + HEAD;
  const cx0 = beside ? L + pw + curveGap : L;
  const cy0 = beside ? T : T + ph + B + HEAD;
  const cw0 = beside ? curveW : pw;
  const maxIt = Math.max(...task.rows.map((r) => r.it));
  const X = (it: number) => L + (it / maxIt) * pw;
  const Y = (v: number) => T + (1 - v) * ph;
  const RX = (wt: number) => rx + wt * railW;
  const TY = (wt: number) => ty + (1 - wt) * th;
  const CX = (v: number) => cx0 + v * cw0;
  const CY = (wt: number) => cy0 + (1 - wt) * ch;
  const n = task.trials;
  const footage = new Map(task.clips.map((c, i) => [c.it, i]));
  const cur = task.rows.find((r) => r.it === task.clips[clip].it)!;
  const cy = Y(cur.s / n);
  const cw = weight(cur.s);
  const tip = hover === null ? null : task.rows[hover];
  const right = rail ? rx + railW : L + pw;
  const xAxis = time ? ty + th : T + ph;

  // Where the weight's name and value go.
  const wHead = rail
    ? { x: rx, y: T, anchor: "start" as const }
    : time
      ? { x: L, y: ty, anchor: "start" as const }
      : curve
        ? { x: cx0, y: cy0, anchor: "start" as const }
        : { x: L + pw, y: T, anchor: "end" as const };

  // A weight panel's y ticks and hairlines (time and curve).
  const weightAxis = (x0: number, x1: number, Yw: (v: number) => number) => (
    <g>
      {[0, 1].map((v) => (
        <g key={v}>
          <line
            x1={x0}
            x2={x1}
            y1={Yw(v)}
            y2={Yw(v)}
            stroke={v === 0 ? INK : HAIR}
            strokeWidth="1"
          />
          <text
            x={x0 - 8}
            y={Yw(v)}
            dy="0.32em"
            textAnchor="end"
            className="lp-tick"
          >
            {v === 0 ? "0" : "Peak"}
          </text>
        </g>
      ))}
    </g>
  );

  return (
    <figure className="lp-chart">
      <div ref={box} className="relative" onMouseLeave={() => setHover(null)}>
        <svg
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          role="img"
          aria-label={`${task.title}: success rate of one task configuration over training, ${task.rows
            .map((r) => `iteration ${fmt(r.it)} ${r.s} of ${n}`)
            .join(", ")}, and the SGS weight for each success rate.`}
          className="block"
        >
          {/* Where the SGS weight is highest (band, both). */}
          {band && (
            <g>
              <rect
                x={L}
                width={right - L}
                y={Y(BAND[1] / n)}
                height={Y(BAND[0] / n) - Y(BAND[1] / n)}
                fill={RED}
                opacity="0.08"
              />
              <text x={L + 8} y={Y(BAND[1] / n) + 16} className="lp-band">
                SGS weight above 0.9× peak
              </text>
            </g>
          )}
          {/* Success panel: hairlines at 0, 50% and 100%. */}
          {[0, 0.5, 1].map((v) => (
            <g key={v}>
              <line
                x1={L}
                x2={right}
                y1={Y(v)}
                y2={Y(v)}
                stroke={v === 0 ? INK : HAIR}
                strokeWidth="1"
              />
              <text
                x={L - 8}
                y={Y(v)}
                dy="0.32em"
                textAnchor="end"
                className="lp-tick"
              >
                {pct(v)}
              </text>
            </g>
          ))}
          <text x={L} y={T - 32} className="lp-axis">
            Success rate
          </text>
          <text x={L} y={T - 14} className="lp-val">
            {pct(cur.s / n)}
          </text>
          {ticks(maxIt).map((it) => (
            <text
              key={it}
              x={X(it)}
              y={xAxis + 18}
              textAnchor="middle"
              className="lp-tick"
            >
              {fmt(it)}
            </text>
          ))}
          <text
            x={L + pw / 2}
            y={xAxis + 38}
            textAnchor="middle"
            className="lp-axis"
          >
            Training iteration
          </text>

          {/* Guides from the current checkpoint: across to the rail, or
              down to the weight panel. */}
          {rail && (
            <line
              x1={X(cur.it)}
              x2={RX(cw)}
              y1={cy}
              y2={cy}
              stroke={RED}
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )}
          {time && (
            <line
              x1={X(cur.it)}
              x2={X(cur.it)}
              y1={T}
              y2={ty + th}
              stroke={INK}
              strokeOpacity="0.35"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )}

          {/* Success over training: 95% intervals, the line, the points. */}
          {ci &&
            task.rows.map((r) => (
              <line
                key={`ci-${r.it}`}
                x1={X(r.it)}
                x2={X(r.it)}
                y1={Y(r.lo)}
                y2={Y(r.hi)}
                stroke={INK}
                strokeOpacity="0.3"
                strokeWidth="1.5"
              />
            ))}
          <polyline
            points={task.rows.map((r) => `${X(r.it)},${Y(r.s / n)}`).join(" ")}
            fill="none"
            stroke={INK}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {task.rows.map((r) => {
            const f = footage.get(r.it);
            const now = r.it === cur.it;
            return (
              <circle
                key={`p-${r.it}`}
                cx={X(r.it)}
                cy={Y(r.s / n)}
                r={now ? 6.5 : f !== undefined ? 4.75 : 3.5}
                fill={
                  now ? RED : r.separate ? "#fff" : f !== undefined ? INK : MUTE
                }
                stroke={now ? "#fff" : r.separate ? INK : "#fff"}
                strokeWidth={r.separate && !now ? 1.5 : 2}
                paintOrder="stroke"
              />
            );
          })}

          {/* rail: the weight curve sideways, on the success axis. */}
          {rail && (
            <g>
              <line
                x1={rx}
                x2={rx}
                y1={T}
                y2={T + ph}
                stroke={INK}
                strokeWidth="1"
              />
              <polyline
                points={CURVE.map((v, k) => `${RX(v)},${Y(k / n)}`).join(" ")}
                fill="none"
                stroke={RED}
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <circle
                cx={RX(cw)}
                cy={cy}
                r="6.5"
                fill={RED}
                stroke="#fff"
                strokeWidth="2"
                paintOrder="stroke"
              />
              <text x={rx} y={T + ph + 18} className="lp-tick">
                0
              </text>
              <text
                x={rx + railW}
                y={T + ph + 18}
                textAnchor="end"
                className="lp-tick"
              >
                Peak
              </text>
            </g>
          )}

          {/* time: this task configuration's weight at each checkpoint. */}
          {time && (
            <g>
              {weightAxis(L, L + pw, TY)}
              <polyline
                points={task.rows
                  .map((r) => `${X(r.it)},${TY(weight(r.s))}`)
                  .join(" ")}
                fill="none"
                stroke={RED}
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {task.rows.map((r) => {
                const f = footage.get(r.it);
                const now = r.it === cur.it;
                return (
                  <circle
                    key={`t-${r.it}`}
                    cx={X(r.it)}
                    cy={TY(weight(r.s))}
                    r={now ? 6.5 : f !== undefined ? 4.75 : 3.5}
                    fill={r.separate && !now ? "#fff" : RED}
                    fillOpacity={now || f !== undefined || r.separate ? 1 : 0.5}
                    stroke={r.separate && !now ? RED : "#fff"}
                    strokeWidth={r.separate && !now ? 1.5 : 2}
                    paintOrder="stroke"
                  />
                );
              })}
            </g>
          )}

          {/* curve: the weight for each success rate, upright. */}
          {curve && (
            <g>
              {band && (
                <rect
                  x={CX(BAND[0] / n)}
                  width={CX(BAND[1] / n) - CX(BAND[0] / n)}
                  y={CY(1)}
                  height={CY(0) - CY(1)}
                  fill={RED}
                  opacity="0.08"
                />
              )}
              {weightAxis(cx0, cx0 + cw0, CY)}
              <polyline
                points={CURVE.map((v, k) => `${CX(k / n)},${CY(v)}`).join(" ")}
                fill="none"
                stroke={RED}
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <line
                x1={CX(cur.s / n)}
                x2={CX(cur.s / n)}
                y1={CY(0)}
                y2={CY(cw)}
                stroke={RED}
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle
                cx={CX(cur.s / n)}
                cy={CY(cw)}
                r="6.5"
                fill={RED}
                stroke="#fff"
                strokeWidth="2"
                paintOrder="stroke"
              />
              {[0, 0.5, 1].map((v) => (
                <text
                  key={v}
                  x={CX(v)}
                  y={cy0 + ch + 18}
                  textAnchor={v === 0 ? "start" : v === 1 ? "end" : "middle"}
                  className="lp-tick"
                >
                  {pct(v)}
                </text>
              ))}
              <text
                x={cx0 + cw0 / 2}
                y={cy0 + ch + 38}
                textAnchor="middle"
                className="lp-axis"
              >
                Success rate
              </text>
            </g>
          )}

          {/* The weight's name and its value now. */}
          <text
            x={wHead.x}
            y={wHead.y - 32}
            textAnchor={wHead.anchor}
            className="lp-axis"
          >
            SGS weight
          </text>
          <text
            x={wHead.x}
            y={wHead.y - 14}
            textAnchor={wHead.anchor}
            className="lp-val"
          >
            {cw.toFixed(2)}× peak
          </text>

          {/* Hit targets: every checkpoint; those with footage seek. */}
          {task.rows.map((r, i) => {
            const f = footage.get(r.it);
            return (
              <circle
                key={`h-${r.it}`}
                cx={X(r.it)}
                cy={Y(r.s / n)}
                r="14"
                fill="transparent"
                className={f !== undefined ? "cursor-pointer" : undefined}
                tabIndex={f !== undefined ? 0 : -1}
                role={f !== undefined ? "button" : undefined}
                aria-label={
                  f !== undefined
                    ? `Play iteration ${fmt(r.it)}, ${r.s} of ${n} successes`
                    : undefined
                }
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                onClick={() => {
                  if (f !== undefined) onSeek(f);
                  else setHover(i);
                }}
                onKeyDown={(e) => {
                  if (f !== undefined && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onSeek(f);
                  }
                }}
              />
            );
          })}
        </svg>
        {tip && (
          <div
            className="lp-tip pz-small"
            style={{
              left: Math.min(Math.max(X(tip.it), 90), w - 90),
              top: Math.max(Y(tip.s / n) - 12, 0),
            }}
          >
            <p className="lp-tip-h">Iteration {fmt(tip.it)}</p>
            <p>
              {tip.s} of {n} successes ({pct(tip.s / n)}, 95% CI {pct(tip.lo)}–
              {pct(tip.hi)})
            </p>
            <p>SGS weight {weight(tip.s).toFixed(2)}× peak</p>
            {tip.separate && <p>From a separate evaluation batch</p>}
          </div>
        )}
      </div>
      <div className="sr-only">
        <table>
          <caption>
            {task.title}: one task configuration, {n} trials per checkpoint,
            with the 95% Wilson interval and the SGS weight relative to its peak
          </caption>
          <thead>
            <tr>
              <th scope="col">Iteration</th>
              <th scope="col">Successes</th>
              <th scope="col">95% interval</th>
              <th scope="col">SGS weight</th>
            </tr>
          </thead>
          <tbody>
            {task.rows.map((r) => (
              <tr key={r.it}>
                <th scope="row">{fmt(r.it)}</th>
                <td>
                  {r.s} of {n}
                </td>
                <td>
                  {pct(r.lo)}–{pct(r.hi)}
                </td>
                <td>{weight(r.s).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

function Glyph({ kind }: { kind: "play" | "pause" }) {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" className="lp-glyph">
      <path
        d={
          kind === "play"
            ? "M2 0.8 11.2 6 2 11.2Z"
            : "M1.5 1h3.2v10H1.5zM7.3 1h3.2v10H7.3z"
        }
      />
    </svg>
  );
}

export default function LearningProgress({
  view = "bandcurve",
}: {
  view?: DuringView;
}) {
  const [ti, setTi] = useState(0);
  const task = TASKS[ti];
  const [clip, setClip] = useState(0);
  const [playing, setPlaying] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  const track = useRef<HTMLDivElement>(null);
  const userPaused = useRef(false);
  const visible = useRef(false);
  const frameRef = useRef(0);

  const fps = task.fps;
  const lens = useMemo(
    () => task.clips.map((c) => c.end - c.start + 1),
    [task],
  );

  // Paint the bar for a frame and note its checkpoint.
  const show = useCallback(
    (f: number) => {
      frameRef.current = f;
      task.clips.forEach((c, i) => {
        const el = fills.current[i];
        if (!el) return;
        const p = f > c.end ? 1 : f < c.start ? 0 : (f - c.start + 1) / lens[i];
        el.style.transform = `scaleX(${p})`;
      });
      setClip(clipAt(task, f));
    },
    [task, lens],
  );

  // Follow the video: every presented frame while playing.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    let raf = 0;
    let vfc = 0;
    const read = () =>
      show(Math.min(task.frames - 1, Math.floor(v.currentTime * fps + 1e-3)));
    const loop = () => {
      read();
      if ("requestVideoFrameCallback" in v)
        vfc = v.requestVideoFrameCallback(loop);
      else raf = requestAnimationFrame(loop);
    };
    const onPlay = () => {
      setPlaying(true);
      loop();
    };
    const onPause = () => {
      setPlaying(false);
      cancelAnimationFrame(raf);
      if (vfc && "cancelVideoFrameCallback" in v)
        v.cancelVideoFrameCallback(vfc);
      read();
    };
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("seeked", read);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("seeked", read);
      cancelAnimationFrame(raf);
      if (vfc && "cancelVideoFrameCallback" in v)
        v.cancelVideoFrameCallback(vfc);
    };
  }, [task, fps, show]);

  // Load near the screen, play while on screen (unless paused by hand).
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const near = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && v.getAttribute("src") !== task.src) {
          v.src = task.src;
          v.load();
        }
      },
      { rootMargin: "100% 0px" },
    );
    const seen = new IntersectionObserver(
      ([e]) => {
        visible.current = e.isIntersecting;
        if (e.isIntersecting && !userPaused.current && !prefersReducedMotion())
          v.play().catch(() => {});
        else if (!e.isIntersecting) v.pause();
      },
      { threshold: 0.25 },
    );
    near.observe(v);
    seen.observe(v);
    return () => {
      near.disconnect();
      seen.disconnect();
    };
  }, [task.src]);

  const seekFrame = (f: number) => {
    const v = video.current;
    const g = Math.max(0, Math.min(task.frames - 1, f));
    show(g);
    if (v && v.getAttribute("src")) v.currentTime = (g + 0.5) / fps;
  };
  const seekClip = (i: number) => {
    seekFrame(task.clips[i].start);
    const v = video.current;
    if (v && !userPaused.current && v.paused) v.play().catch(() => {});
  };
  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      if (!v.getAttribute("src")) v.src = task.src;
      v.play().catch(() => {});
    } else {
      userPaused.current = true;
      v.pause();
    }
  };
  const choose = (i: number) => {
    if (i === ti) return;
    const v = video.current;
    setTi(i);
    setClip(0);
    frameRef.current = 0;
    if (v) {
      v.src = TASKS[i].src;
      v.poster = TASKS[i].poster;
      v.load();
      if (visible.current && !userPaused.current && !prefersReducedMotion())
        v.play().catch(() => {});
    }
  };
  // The bar: drag to scrub, click to jump.
  const scrub = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    // Segments are laid out by length, with small gaps; map x to a frame.
    seekFrame(Math.floor(Math.max(0, Math.min(1, x)) * task.frames));
  };

  const cur = task.clips[clip];
  const row = task.rows.find((r) => r.it === cur.it)!;

  return (
    <div className="lp">
      <div className="cb-flow-text cb-flow-w1">
        <p>
          We follow <strong>one fixed task configuration</strong> of each UR5e
          task through the course of training. SGS gives it{" "}
          <strong>small weight while the policy never solves it</strong>,{" "}
          <strong>large weight when it’s getting better but not perfect</strong>
          , and{" "}
          <strong>small weight again once the policy has mastered it</strong>.
        </p>
      </div>
      <div className="lp-tasks" role="group" aria-label="Task">
        {TASKS.map((t, i) => (
          <button
            key={t.key}
            type="button"
            aria-pressed={i === ti}
            className="lp-task"
            onClick={() => choose(i)}
          >
            {t.title}
          </button>
        ))}
      </div>
      <div className="lp-main">
        <div className="lp-left">
          <div className="lp-frame">
            <video
              ref={video}
              muted
              loop
              playsInline
              preload="none"
              poster={task.poster}
              className="lp-video"
              aria-label={`${task.title}: the policy at each checkpoint with footage, one task configuration`}
            />
          </div>
          <div className="lp-row">
            <div
              ref={track}
              className="lp-track"
              role="slider"
              tabIndex={0}
              aria-label="Checkpoint"
              aria-valuemin={0}
              aria-valuemax={task.clips.length - 1}
              aria-valuenow={clip}
              aria-valuetext={`Iteration ${fmt(cur.it)}`}
              style={{
                gridTemplateColumns: lens
                  .map((l) => `minmax(0, ${l}fr)`)
                  .join(" "),
              }}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                e.currentTarget.setAttribute("data-scrub", "");
                scrub(e);
              }}
              onPointerMove={(e) => {
                if (e.currentTarget.hasAttribute("data-scrub")) scrub(e);
              }}
              onPointerUp={(e) => e.currentTarget.removeAttribute("data-scrub")}
              onPointerCancel={(e) =>
                e.currentTarget.removeAttribute("data-scrub")
              }
              onKeyDown={(e) => {
                const f = frameRef.current;
                const step: Record<string, number> = {
                  ArrowRight: 1,
                  ArrowLeft: -1,
                };
                if (e.key in step) {
                  e.preventDefault();
                  video.current?.pause();
                  userPaused.current = true;
                  seekFrame(f + step[e.key]);
                } else if (e.key === "PageDown" || e.key === "PageUp") {
                  e.preventDefault();
                  const i = clipAt(task, f) + (e.key === "PageDown" ? 1 : -1);
                  if (i >= 0 && i < task.clips.length) seekClip(i);
                }
              }}
            >
              {task.clips.map((c, i) => (
                <span key={`${task.key}-${c.it}`} className="lp-seg">
                  <span
                    ref={(el) => {
                      fills.current[i] = el;
                    }}
                    className="lp-fill"
                    data-now={i === clip ? "" : undefined}
                  />
                </span>
              ))}
            </div>
            <button
              type="button"
              className="lp-icon"
              aria-label={playing ? "Pause" : "Play"}
              onClick={toggle}
            >
              <Glyph kind={playing ? "pause" : "play"} />
            </button>
          </div>
          <p className="lp-now pz-small">
            <span>Iteration {fmt(cur.it)}</span>
            <span>
              {row.s} of {task.trials} successes
            </span>
          </p>
        </div>
        <Chart task={task} clip={clip} onSeek={seekClip} view={view} />
      </div>
    </div>
  );
}
