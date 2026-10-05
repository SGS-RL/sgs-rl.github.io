"use client";

import { useState } from "react";
import { Tile } from "./Collection";
import { byId } from "./data";

// Simulation and hardware, one task at a time. The simulation clip is a
// pair (the most interesting run on the left, a nominal one on the right);
// the two hardware runs sit under its two halves at the same size, so the
// rows line up. Any video opens the player.
const TASKS = [
  {
    name: "Rod",
    sim: "ur5e-sim-rod",
    real: ["ur5e-real-rod-5", "ur5e-real-rod-3"],
  },
  {
    name: "Nut",
    sim: "ur5e-sim-nut",
    real: ["ur5e-real-nut-1", "ur5e-real-nut-3"],
  },
  {
    name: "Gear mesh",
    sim: "ur5e-sim-gear-mesh",
    real: ["ur5e-real-gear-mesh-2", "ur5e-real-gear-mesh-4"],
  },
] as const;

export default function Transfer() {
  const [k, setK] = useState(0);
  const t = TASKS[k];
  const sim = byId(t.sim);
  const real = t.real.map(byId);
  return (
    <div className="gal-skin-swiss col-span-full mt-6 md:mt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h3 className="sw-label font-medium">Transfer to hardware</h3>
        <div
          role="group"
          aria-label="Task"
          className="sw-label flex gap-x-4 md:gap-x-5"
        >
          {TASKS.map((x, i) => (
            <button
              key={x.name}
              type="button"
              aria-pressed={i === k}
              onClick={() => setK(i)}
              className="s3-tab -my-2 py-2"
            >
              {x.name}
            </button>
          ))}
        </div>
      </div>
      <p className="sw-label mt-1 max-w-[60ch] text-sw-mute">
        The UR5e policies, trained in simulation, run on a physical UR5e. Top:
        the task in simulation, the most interesting run on the left and a
        nominal one on the right. Bottom: two runs on hardware. All at 1×,
        unaltered. Select a video to watch it large.
      </p>
      <div className="mt-4 grid gap-y-5">
        <div>
          <p className="sw-label border-t border-sw-hair pt-2.5 pb-2 font-medium">
            Simulation
          </p>
          {sim && <Tile key={sim.id} c={sim} caption={false} />}
        </div>
        <div>
          <p className="sw-label border-t border-sw-hair pt-2.5 pb-2 font-medium">
            Hardware
          </p>
          <div className="s3-hw grid grid-cols-2">
            {real.map(
              (c) =>
                c && (
                  <div key={c.id}>
                    <p className="sw-label pb-1.5 text-sw-mute">
                      {c.title.replace(/^.*, run /, "Run ")}
                    </p>
                    <Tile c={c} caption={false} />
                  </div>
                ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
