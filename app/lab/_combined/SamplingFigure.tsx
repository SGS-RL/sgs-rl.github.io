"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { band, relative, rng } from "../_method/sgs";
import { drawDot, drawGoal, drawMaze, fit, readTheme } from "../_nav/draw";
import Legend from "../_nav/Legend";
import { LIVE, snapshot, TOY, WORLD as w } from "../_nav/nav";

// Part 4 of the Method mock-up (/lab/method-flow/): sampling. The toy
// example's maze at one point in training, each configuration's chance of
// being picked as a red dot (the toy example's weighting), and a round of
// draws, one per robot, as red squares. A new round every 1.6 s while on
// screen; with reduced motion, only on request. SGS or uniform, to compare
// where the draws go. Counts per round by how often a configuration is
// reached: under 10%, in between, over 90%.

type Sampler = "sgs" | "uniform";

// The reader's reduced-motion setting (false while rendering on the server).
const REDUCE = "(prefers-reduced-motion: reduce)";
function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(REDUCE);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(REDUCE).matches,
    () => false,
  );
}
const ROUND = LIVE.robots;
const EVERY = 1600;

export default function SamplingFigure() {
  const [sampler, setSampler] = useState<Sampler>("sgs");
  const [round, setRound] = useState(0);
  const { p } = snapshot();

  // Chances of being picked, for each sampler.
  const P = useMemo(() => {
    const r = relative(TOY);
    const raw = Array.from(p, (x) => (sampler === "sgs" ? r(x) : 1));
    const sum = raw.reduce((a, b) => a + b, 0);
    return raw.map((x) => x / sum);
  }, [p, sampler]);

  // One round of draws, with replacement, in proportion to P.
  const draws = useMemo(() => {
    const next = rng(1000 + round * 7919 + (sampler === "sgs" ? 0 : 1));
    const cdf: number[] = [];
    P.reduce((acc, x, i) => (cdf[i] = acc + x), 0);
    return Array.from({ length: ROUND }, () => {
      const u = next() * cdf[cdf.length - 1];
      let i = 0;
      while (i < cdf.length - 1 && cdf[i] < u) i++;
      return i;
    });
  }, [P, round, sampler]);

  const counts = useMemo(() => {
    const c = [0, 0, 0];
    for (const i of draws) c[band(p[i])]++;
    return c;
  }, [draws, p]);

  // Draw the maze, the chances and the round.
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
      for (const i of new Set(draws)) drawGoal(ctx, w, cell, th, i);
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [P, p, draws]);

  // New rounds while on screen, unless the reader prefers less motion.
  const box = useRef<HTMLDivElement>(null);
  const still = useReducedMotion();
  useEffect(() => {
    if (still) return;
    let timer = 0;
    const io = new IntersectionObserver(([e]) => {
      window.clearInterval(timer);
      if (e.isIntersecting)
        timer = window.setInterval(() => setRound((r) => r + 1), EVERY);
    });
    if (box.current) io.observe(box.current);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, [still]);

  return (
    <figure ref={box}>
      <div
        className="relative"
        style={{ aspectRatio: `${w.cols} / ${w.rows}` }}
      >
        <canvas
          ref={ref}
          role="img"
          aria-label={`The maze partway through training. ${ROUND} task configurations drawn ${
            sampler === "sgs" ? "by SGS" : "uniformly"
          }: ${counts[1]} of them on task configurations reached only some of the time.`}
          className="absolute inset-0 h-full w-full"
        />
      </div>
      <Legend
        className="mt-3"
        items={[
          ["shade", "Success rate"],
          ["dot", "Chance of being picked"],
          ["goal", `Drawn this round (${ROUND}, one per robot)`],
        ]}
      />
      <div className="pz-small mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-2 border-t border-[var(--sw-hair)] pt-3">
        <span role="group" aria-label="Sampler" className="flex gap-3">
          {(
            [
              ["sgs", "SGS"],
              ["uniform", "Uniform"],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              type="button"
              aria-pressed={sampler === v}
              className={`st-link ${sampler === v ? "" : "opacity-50"}`}
              onClick={() => setSampler(v)}
            >
              {label}
            </button>
          ))}
        </span>
        {still && (
          <button
            type="button"
            className="st-link"
            onClick={() => setRound((r) => r + 1)}
          >
            Draw again
          </button>
        )}
        <span className="pz-num">
          This round: {counts[0]} rarely reached, {counts[1]} sometimes,{" "}
          {counts[2]} almost always
        </span>
      </div>
    </figure>
  );
}
