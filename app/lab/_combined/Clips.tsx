import type { ReactNode } from "react";
import { ADDED, EXTRA, LIBRARY, LIMITS, SIM_SEQ, type Item } from "../library";
import TileVideo from "../_gallery/TileVideo";

// Clips (owner, 2026-10-08): every clip we have, grouped by robot and
// setting in the owner's order: UR5e real world, UR5e simulation, ANYmal C,
// ANYmal D, Franka. Nut on bolt first wherever it appears. Task names only,
// no run numbers, times or notes. Each video loads near the screen and
// plays only while on screen (../_gallery/media.ts).
//
// UR5e simulation: one clip per task, the more interesting run and then the
// nominal one, back to back (SIM_SEQ), not side by side. Gear mesh (real
// world), ANYmal C's "All terrains" and Franka clips are excerpts of their
// continuous runs.
//
// ANYmal C and D (owner, 2026-10-08): one clip per terrain at the hardest
// setting crossed (LIMITS), radiating beam in its offset (rotated) layout.
// Maze has no such render, so ANYmal D keeps the earlier maze clip.
//
// The highlights reel's new footage (owner, 2026-10-08, ADDED) leads its
// task: the two new nut runs, the gear spin, the 16 s of the one-minute
// Franka run.

const clip = (id: string) =>
  [...LIBRARY, ...EXTRA, ...LIMITS, ...ADDED].find((c) => c.id === id)!;

function Video({ c }: { c: Item }) {
  return (
    <div className="cb-rw-frame">
      <TileVideo src={c.src} poster={c.poster} className="cb-rw-video" />
    </div>
  );
}

function Slot() {
  return (
    <div className="cb-rw-frame cb-rw-slot">
      <span className="pz-small">To come</span>
    </div>
  );
}

// A clip with its task's name underneath (groups with one clip per task).
function Named({ c, name }: { c?: Item; name?: string }) {
  return (
    <figure className="cb-clip">
      {c ? <Video c={c} /> : <Slot />}
      {(name ?? c?.title) && (
        <figcaption className="cb-clip-name">{name ?? c?.title}</figcaption>
      )}
    </figure>
  );
}

// Several clips of one task under the task's name.
function Task({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="cb-rw-task">
      <h4 className="cb-rw-name">{name}</h4>
      <div className="cb-clips-grid">{children}</div>
    </div>
  );
}

function Group({
  robot,
  setting,
  children,
}: {
  robot: string;
  setting: string;
  children: ReactNode;
}) {
  return (
    <div className="cb-clips-group">
      <h3 className="cb-part-band pz-mid">
        <span>{robot}</span>
        <span className="ml-auto">{setting}</span>
      </h3>
      <div className="cb-part-in-band pb-12 pt-6 md:pb-16">{children}</div>
    </div>
  );
}

// Both ANYmals in one order: the three in the highlights first, then the
// rest by name.
const TERRAINS = [
  "climbing-box",
  "stepping-stones",
  "gap",
  "balancing-beam",
  "contour",
  "floating-island",
  "inverted-slope",
  "jump-box",
  "maze",
  "random-parallel-box",
  "pit",
  "radiating-beam-offset",
  "stairs",
];
const ANYMAL_C = TERRAINS.filter((t) => t !== "maze").map((t) =>
  clip(`anymal-c-limit-${t}`),
);
const ANYMAL_D = TERRAINS.map((t) =>
  clip(t === "maze" ? "anymal-d-maze" : `anymal-d-limit-${t}`),
);

export default function Clips() {
  return (
    <section
      id="clips"
      aria-label="Clips"
      className="scroll-mt-[var(--bar)] pb-16 md:pb-24"
    >
      <h2 className="pz-head border-y border-black bg-white px-[var(--m)] pb-[0.08em] pt-[0.04em]">
        Clips
      </h2>
      <Group robot="UR5e" setting="Real world">
        <Task name="Nut on bolt">
          {[4, 5, 3, 1].map((n) => (
            <Video key={n} c={clip(`ur5e-real-nut-${n}`)} />
          ))}
        </Task>
        <Task name="Rod in hole">
          {[5, 4, 1, 2, 3, 6].map((n) => (
            <Video key={n} c={clip(`ur5e-real-rod-${n}`)} />
          ))}
        </Task>
        <Task name="Gear mesh">
          <Video c={clip("ur5e-real-gear-spin")} />
          {[1, 2, 3, 4, 5].map((n) => (
            <Video key={n} c={clip(`ur5e-real-gear-mesh-${n}`)} />
          ))}
        </Task>
      </Group>
      <Group robot="UR5e" setting="Simulation">
        <div className="cb-clips-grid">
          {SIM_SEQ.map((c) => (
            <Named key={c.id} c={c} />
          ))}
        </div>
      </Group>
      <Group robot="ANYmal C" setting="Simulation">
        <div className="cb-clips-grid">
          <Named c={clip("anymal-c-terrains")} name="All terrains" />
          {ANYMAL_C.map((c) => (
            <Named key={c.id} c={c} />
          ))}
        </div>
      </Group>
      <Group robot="ANYmal D" setting="Simulation">
        <div className="cb-clips-grid">
          {ANYMAL_D.map((c) => (
            <Named key={c.id} c={c} />
          ))}
        </div>
      </Group>
      <Group robot="Franka" setting="Simulation">
        <Task name="Nut on bolt">
          <Video c={clip("franka-sim-nut-1m")} />
          {[1, 2, 3].map((n) => (
            <Video key={n} c={clip(`franka-sim-nut-${n}`)} />
          ))}
        </Task>
      </Group>
    </section>
  );
}
