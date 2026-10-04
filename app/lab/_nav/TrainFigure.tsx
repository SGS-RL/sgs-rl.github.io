"use client";

import { useEffect, useRef, useState } from "react";
import { onFrame } from "../_method/ticker";
import { drawGoal, drawMaze, drawRobot, fit, readTheme } from "./draw";
import Legend from "./Legend";
import { LIVE, robotAt, Training, TOY, WORLD as w } from "./nav";

const SPEEDS = [1, 4, 16];

/**
 * Part 4, and the one-figure version: SGS training live. 48 robots share
 * one policy; each finished episode is recorded, its goal rescored and a
 * new goal drawn. Grey is each goal's tracked success rate p̂, red squares
 * the goals being tried. Starts over once the maze is mostly learned.
 */
export default function TrainFigure({ seed = 1 }: { seed?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const readout = useRef<HTMLParagraphElement>(null);
  const state = useRef({ play: true, speed: 4, restart: false });
  const [play, setPlay] = useState(true);
  const [speed, setSpeed] = useState(4);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const th = readTheme(canvas);
    const make = () =>
      new Training(w, { sampler: "sgs", seed, kernel: TOY, ...LIVE });
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
        readout.current.textContent = `Episode ${sim.episodes.toLocaleString("en-US")}. Average success over all ${w.goals.length} goals: ${mean.toFixed(2)}.`;
      }
    });
    return off;
  }, [seed]);

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
          ["shade", "Tracked success rate p̂"],
          ["goal", "Goal being tried"],
          ["robot", "Robot"],
        ]}
      />
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
        className="sw-label sw-num mt-1 text-sw-mute"
        aria-live="off"
      >
        Episode 0.
      </p>
    </figure>
  );
}
