"use client";

import { useEffect, useRef, useState } from "react";
import { rng } from "../_method/sgs";
import { onFrame } from "../_method/ticker";
import { drawGoal, drawMaze, drawRobot, fit, goalAt, readTheme } from "./draw";
import Legend from "./Legend";
import { Policy, robotAt, WORLD as w, type Robot } from "./nav";

const SPEED = 6;
// Goals the figure walks through until someone picks one: the start room,
// just past the doorway, the second room, the pocket in the last room.
const TOUR = [
  [3, 6],
  [8, 4],
  [10, 9],
  [16, 9],
].map(([c, r]) => w.goalOf[r * w.cols + c]);

type Info = { goal: number; tries: number; wins: number; last: string };

/**
 * Part 1: one robot, untrained, sent to one goal at a time. The figure
 * tours four goals; tapping a cell sends the robot there instead, again
 * and again, so the tally shows that goal's success rate.
 */
export default function TaskFigure() {
  const ref = useRef<HTMLCanvasElement>(null);
  const pick = useRef<(goal: number) => void>(() => {});
  const [info, setInfo] = useState<Info | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const th = readTheme(canvas);
    const policy = new Policy(w);
    const rand = rng(7);
    const at = { x: 0, y: 0 };
    let robot: Robot;
    let tour = 0;
    let chosen = false;
    let tally = { tries: 0, wins: 0 };
    // Seconds the current episode runs: until arrival or a stall, plus a beat.
    let length = 0;

    const begin = (goal: number) => {
      const reach = policy.rollout(goal, rand);
      const win = reach === w.path[goal].length;
      robot = { goal, t: 0, reach, win, wobble: rand() * 1000 };
      length = win ? reach / SPEED + 0.9 : reach / (SPEED * 0.8) + 1.6;
    };
    const report = (last: string) =>
      setInfo({ goal: robot.goal, ...tally, last });

    begin(TOUR[0]);
    report("");
    pick.current = (goal) => {
      chosen = true;
      tally = { tries: 0, wins: 0 };
      begin(goal);
      report("");
    };

    let pause = 0;
    const off = onFrame(canvas, (dt) => {
      const { ctx, cell, dpr } = fit(canvas, w);
      if (pause > 0) {
        pause -= dt;
        if (pause <= 0) {
          begin(chosen ? robot.goal : TOUR[(tour = (tour + 1) % TOUR.length)]);
          if (!chosen) tally = { tries: 0, wins: 0 };
          report("");
        }
      } else {
        robot.t += dt;
        if (robot.t >= length) {
          tally.tries++;
          if (robot.win) tally.wins++;
          report(robot.win ? "reached" : "stopped");
          pause = 0.6;
        }
      }

      drawMaze(ctx, w, cell, dpr, th);
      // The shortest path, faint, so the route reads before the robot moves.
      ctx.strokeStyle = th.fg;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      for (const [n, k] of [w.start, ...w.path[robot.goal]].entries()) {
        const c = k % w.cols;
        const x = (c + 0.5) * cell;
        const y = ((k - c) / w.cols + 0.5) * cell;
        if (n) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      drawGoal(ctx, w, cell, th, robot.goal);
      robotAt(w, robot, Math.min(robot.t, length), SPEED, at);
      drawRobot(ctx, cell, th, at.x, at.y, pause > 0 ? 0.35 : 1);
    });
    return off;
  }, []);

  const goal = info?.goal ?? TOUR[0];
  const steps = w.path[goal].length;
  const p = Math.round(new Policy(w).p[goal] * 100);
  return (
    <figure>
      <div
        className="relative"
        style={{ aspectRatio: `${w.cols} / ${w.rows}` }}
      >
        <canvas
          ref={ref}
          role="img"
          aria-label="A maze of three rooms. The robot starts at S; one cell is its goal."
          className="absolute inset-0 h-full w-full cursor-pointer touch-manipulation"
          onPointerDown={(e) => {
            const g = goalAt(e.currentTarget, w, e.clientX, e.clientY);
            if (g >= 0) pick.current(g);
          }}
        />
      </div>
      <Legend
        className="mt-3"
        items={[
          ["start", "Start"],
          ["goal", "Goal"],
          ["robot", "Robot"],
          ["wall", "Wall"],
        ]}
      />
      <p className="sw-num mt-4 border-t border-sw-hair pt-2 text-sw-fg">
        Goal {steps} cells from the start. The untrained robot reaches it in{" "}
        {p < 1 ? "under 1" : p}% of episodes.
      </p>
      <p className="sw-label sw-num mt-1 min-h-[1.35em] text-sw-mute">
        {info && info.tries > 0
          ? `This try: ${info.last === "reached" ? "reached" : "stopped short, out of time"}. ${info.wins} of ${info.tries} reached so far.`
          : "Tap any cell to make it the goal."}
      </p>
    </figure>
  );
}
