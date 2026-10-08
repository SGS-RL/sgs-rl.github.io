"use client";

import type { ReactNode } from "react";
import { ADDED, LIBRARY, RUNS, type Item } from "../library";
import TileVideo from "../_gallery/TileVideo";
import RunPlayer from "./RunPlayer";

// Results, parts 02 and 03 (owner, 2026-10-08): short real-world clips,
// then the long one-take runs. Everything plays at 1×. Nut-and-bolt, the
// most impressive task, always comes first. A first layout for the owner
// to pick clips into.

const clip = (id: string) => [...LIBRARY, ...ADDED].find((c) => c.id === id)!;
const run = (id: string) => [...RUNS, ...ADDED].find((c) => c.id === id)!;

function Band({ n, title, id }: { n: number; title: string; id: string }) {
  return (
    <h3 id={id} className="cb-part-band pz-mid scroll-mt-[var(--bar)]">
      <span className="cb-step-num pz-num">{String(n).padStart(2, "0")}</span>
      <span>{title}</span>
    </h3>
  );
}

// A short clip: a muted loop that plays while on screen. No caption (owner,
// 2026-10-08: no run numbers or times, no small filler text).
function Tile({ c }: { c: Item }) {
  return (
    <div className="cb-rw-frame">
      <TileVideo src={c.src} poster={c.poster} className="cb-rw-video" />
    </div>
  );
}

function Task({
  name,
  cols,
  children,
}: {
  name: string;
  cols: 2 | 3;
  children: ReactNode;
}) {
  return (
    <div className="cb-rw-task">
      <h4 className="cb-rw-name">{name}</h4>
      <div className={`cb-rw-grid cb-rw-${cols}`}>{children}</div>
    </div>
  );
}

export function RealWorld() {
  return (
    <div className="cb-part">
      <Band n={2} title="Real world" id="results-real" />
      <div className="cb-part-in-band pb-16 pt-6 md:pb-24">
        <div className="cb-flow-text cb-flow-w1">
          <p>
            Trained only in simulation, the UR5e runs on the real task board{" "}
            <strong>from RGB images, zero-shot</strong>.
          </p>
        </div>
        {/* The two new runs first, as in the highlights reel, then the
            earlier two (owner, 2026-10-08). */}
        <Task name="Nut on bolt" cols={2}>
          <Tile c={clip("ur5e-real-nut-4")} />
          <Tile c={clip("ur5e-real-nut-5")} />
          <Tile c={clip("ur5e-real-nut-3")} />
          <Tile c={clip("ur5e-real-nut-1")} />
        </Task>
        <Task name="Rod in hole" cols={3}>
          <Tile c={clip("ur5e-real-rod-5")} />
          <Tile c={clip("ur5e-real-rod-4")} />
          <Tile c={clip("ur5e-real-rod-1")} />
        </Task>
      </div>
    </div>
  );
}

// The runs side by side from 1024 px, each name underneath (owner's pick,
// 2026-10-08, of Large, Row and Side). The short gear-mesh clips are cut
// from the one-minute gear-mesh run, so part 02 does not repeat them.
const RUN_LIST: [string, string][] = [
  // The whole one-minute run (owner, 2026-10-08), in place of the 30 s one.
  ["franka-sim-nut-1m-full", "Nut on bolt, Franka, simulation"],
  ["run-anymal-c", "All terrains, ANYmal C, simulation"],
  ["run-ur5e-real-gear-mesh", "Gear mesh, UR5e, real world"],
];

// Each run in the page's own player (./RunPlayer.tsx), its name under it.
function Run({ c, title }: { c: Item; title: string }) {
  return (
    <div className="cb-run-cell">
      <RunPlayer c={c} title={title} />
    </div>
  );
}

export function ContinuousRuns() {
  return (
    <div className="cb-part">
      <Band n={3} title="Continuous runs" id="results-runs" />
      <div className="cb-part-in-band pb-16 pt-6 md:pb-24">
        <div className="cb-run-grid">
          {RUN_LIST.map(([id, title]) => (
            <Run key={id} c={run(id)} title={title} />
          ))}
        </div>
      </div>
    </div>
  );
}
