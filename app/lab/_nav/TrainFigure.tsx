"use client";

import { useEffect, useRef, useState } from "react";
import { onFrame } from "../_method/ticker";
import { drawDot, drawGoal, drawMaze, drawRobot, fit, readTheme } from "./draw";
import Legend from "./Legend";
import type { Kernel } from "../_method/sgs";
import { LIVE, robotAt, Training, TOY, WORLD as w } from "./nav";

export type ChanceMode = "dots" | "heat" | "trail" | "bar";

const SPEEDS = [1, 4, 16];

/**
 * Part 4, and the one-figure version: SGS training live. 48 robots share
 * one policy; each finished episode is recorded, its goal rescored and a
 * new goal drawn. Grey is each goal's tracked success rate p̂, red squares
 * the goals being tried. Starts over once the maze is mostly learned.
 */
export default function TrainFigure({
  seed = 1,
  labels = ["Tracked success rate p̂", "Goal being tried", "Robot"],
  average = true,
  counter = true,
  chance,
  kernel = TOY,
}: {
  seed?: number;
  // Legend: shading, red square, dot.
  labels?: [string, string, string];
  // The readout's average success over all goals (the combined page
  // leaves it out).
  average?: boolean;
  // The episode counter under the controls (the combined page leaves it
  // out: "I don't care for the numbers").
  counter?: boolean;
  // Also show each goal's current chance of being picked (the red squares
  // are draws from these chances), labelled in the legend. Off by default.
  //   dots   a faint red dot per goal, its area the chance
  //   heat   the goal's cell tinted red by its chance
  //   trail  every new pick lights its cell red, fading over a few
  //          seconds, so often-picked goals stay red
  //   bar    dots, and under the maze a live bar of where the picks go
  chance?: { mode: ChanceMode; label: string };
  // The sampler's kernel (default: the toy example's, ../_nav TOY).
  kernel?: Kernel;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const readout = useRef<HTMLParagraphElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const state = useRef({ play: true, speed: 4, restart: false });
  const [play, setPlay] = useState(true);
  const [speed, setSpeed] = useState(4);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const th = readTheme(canvas);
    const make = () =>
      new Training(w, { sampler: "sgs", seed, kernel, ...LIVE });
    const n = w.goals.length;
    // Trail: how recently each goal was picked (1 just now, fading to 0),
    // and the robot each slot held last frame, to spot new picks.
    const heat = new Float64Array(n);
    let seen: unknown[] = [];
    let sim = make();
    let done = 0;
    let shown = -1;
    const at = { x: 0, y: 0 };

    const off = onFrame(canvas, (dt) => {
      const s = state.current;
      if (s.restart) {
        sim = make();
        done = 0;
        s.restart = false;
      }
      const mean =
        sim.policy.p.reduce((a, b) => a + b, 0) / sim.policy.p.length;
      if (s.play) {
        if (mean >= 0.95) done += dt;
        if (done > 4) {
          sim = make();
          done = 0;
        } else if (!done) sim.step(dt * s.speed);
      }

      const { ctx, cell, dpr } = fit(canvas, w);
      drawMaze(ctx, w, cell, dpr, th, (i) => sim.tracker.phat(i));
      const mode = chance?.mode;
      if (mode === "dots" || mode === "bar" || mode === "heat") {
        let top = 0;
        for (let i = 0; i < n; i++) top = Math.max(top, sim.tracker.prob(i));
        for (let i = 0; i < n; i++) {
          const v = sim.tracker.prob(i) / top;
          if (mode === "heat") {
            const k = w.goals[i];
            const c = k % w.cols;
            ctx.globalAlpha = 0.65 * Math.sqrt(v);
            ctx.fillStyle = th.accent;
            ctx.fillRect(c * cell, ((k - c) / w.cols) * cell, cell, cell);
          } else {
            ctx.globalAlpha = 0.45;
            drawDot(ctx, w, cell, th, i, v);
          }
        }
        ctx.globalAlpha = 1;
      }
      if (mode === "trail") {
        const robots = sim.robots as unknown[];
        robots.forEach((r, k) => {
          if (seen[k] !== r) heat[sim.robots[k].goal] = 1;
        });
        seen = robots.slice();
        const fade = Math.exp(-(dt * state.current.speed) / 2.5);
        for (let i = 0; i < n; i++) {
          if (heat[i] < 0.02) continue;
          const k = w.goals[i];
          const c = k % w.cols;
          ctx.globalAlpha = 0.6 * heat[i];
          ctx.fillStyle = th.accent;
          ctx.fillRect(c * cell, ((k - c) / w.cols) * cell, cell, cell);
          if (state.current.play) heat[i] *= fade;
        }
        ctx.globalAlpha = 1;
      }
      if (mode === "bar" && barRef.current) {
        const share = [0, 0, 0];
        for (let i = 0; i < n; i++) {
          const p = sim.tracker.phat(i);
          share[p < 0.1 ? 0 : p > 0.9 ? 2 : 1] += sim.tracker.prob(i);
        }
        const el = barRef.current;
        el.querySelectorAll<HTMLElement>('[data-share="bar"]').forEach(
          (b, k) => (b.style.width = `${share[k] * 100}%`),
        );
        el.querySelectorAll<HTMLElement>('[data-share="n"]').forEach(
          (b, k) => (b.textContent = String(Math.round(share[k] * 100))),
        );
      }
      const { episode } = LIVE;
      for (const r of sim.robots) {
        const fade = Math.min(1, r.t / 0.15, (episode - r.t) / 0.25);
        drawGoal(ctx, w, cell, th, r.goal, fade);
      }
      for (const r of sim.robots) {
        const fade = Math.min(1, r.t / 0.15, (episode - r.t) / 0.25);
        robotAt(w, r, r.t, LIVE.speed, at);
        drawRobot(ctx, cell, th, at.x, at.y, fade);
      }

      if (readout.current && sim.episodes !== shown) {
        shown = sim.episodes;
        readout.current.textContent =
          `Episode ${sim.episodes.toLocaleString("en-US")}.` +
          (average
            ? ` Average success over all ${w.goals.length} goals: ${mean.toFixed(2)}.`
            : "");
      }
    });
    return off;
  }, [seed, average, chance?.mode, kernel]);

  const btn = "sw-link sw-label cursor-pointer";
  return (
    <figure>
      <div
        className="relative"
        style={{ aspectRatio: `${w.cols} / ${w.rows}` }}
      >
        <canvas
          ref={ref}
          role="img"
          aria-label="Robots leave the start for goals picked by SGS. The shaded region of reliably reached goals grows outward through the doorways."
          className="absolute inset-0 h-full w-full"
        />
      </div>
      <Legend
        className="mt-3"
        items={[
          ["shade", labels[0]],
          ["goal", labels[1]],
          ["robot", labels[2]],
          ...(chance
            ? [
                [
                  chance.mode === "dots" || chance.mode === "bar"
                    ? "dot"
                    : "fill",
                  chance.label,
                ] as ["dot" | "fill", string],
              ]
            : []),
        ]}
      />
      {chance?.mode === "bar" && (
        <div ref={barRef} className="mt-3">
          <p className="sw-label mb-1">Where the picks go now</p>
          <div className="flex h-2.5 bg-sw-hair">
            {["rgb(0 0 0 / 0.14)", "var(--sw-accent)", "rgb(0 0 0 / 0.5)"].map(
              (bg) => (
                <span
                  key={bg}
                  data-share="bar"
                  style={{ background: bg, width: 0 }}
                />
              ),
            )}
          </div>
          <p className="sw-label sw-num mt-1 flex justify-between gap-2">
            <span>
              Rarely reached <span data-share="n">0</span>%
            </span>
            <span>
              Sometimes <span data-share="n">0</span>%
            </span>
            <span>
              Almost always <span data-share="n">0</span>%
            </span>
          </p>
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-2 border-t border-sw-hair pt-2">
        <button
          type="button"
          className={btn}
          onClick={() => {
            state.current.play = !play;
            setPlay(!play);
          }}
        >
          {play ? "Pause" : "Play"}
        </button>
        <span className="sw-label flex gap-3">
          {SPEEDS.map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={speed === v}
              className={`${btn} ${speed === v ? "text-sw-fg" : "text-sw-mute"}`}
              onClick={() => {
                state.current.speed = v;
                setSpeed(v);
              }}
            >
              {v}×
            </button>
          ))}
        </span>
        <button
          type="button"
          className={btn}
          onClick={() => {
            state.current.restart = true;
          }}
        >
          Start over
        </button>
      </div>
      <p
        ref={readout}
        hidden={!counter}
        className="sw-label sw-num mt-1 text-sw-mute"
        aria-live="off"
      >
        Episode 0.
      </p>
    </figure>
  );
}
