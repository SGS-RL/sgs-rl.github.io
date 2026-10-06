// The owner's footage (drive folder "SGS", 2026-10-05), encoded by
// scripts/lab/encode_library.py into public/lab/media/library/. The round 3
// pages use this; the earlier studies keep the placeholder CLIPS and
// HIGHLIGHTS in content.ts, so they look as they did when reviewed.
//
// Still to come from the owner: ANYmal-D "random jump box", ANYmal-C per-
// terrain clips. Task and terrain names follow the folder names (check).
// Hardware clips are assumed to be real time (check).

import type { Clip } from "./content";
import type { ReelData } from "./_reel/reel";

const BASE = "/lab/media/library";

export type Item = Clip & {
  /** "clip": one run. "pair": two runs side by side (32:9).
   *  "run": a continuous run, shown in full only on request. */
  kind: "clip" | "pair" | "run";
  /** Width / height. */
  aspect: number;
  /** Seconds. */
  duration: number;
  /** Pairs: what each side shows, left then right. */
  sides?: [string, string];
  /** Runs: the whole run sped up to about 10 s, for previews. */
  fast?: { src: string; speed: number };
};

const media = (id: string) => ({
  src: `${BASE}/clips/${id}.mp4`,
  poster: `${BASE}/clips/${id}.jpg`,
});

const ANYMAL_D: [string, string, number][] = [
  ["balancing-beam", "Balancing beam", 7.1],
  ["climbing-box", "Climbing box", 11.8],
  ["contour", "Contour", 7.6],
  ["floating-island", "Floating island", 7.1],
  ["gap", "Gap", 4.7],
  ["inverted-slope", "Inverted slope", 4.1],
  ["maze", "Maze", 11.3],
  ["pit", "Pit", 6.5],
  ["radiating-beam", "Radiating beam", 4.9],
  ["random-parallel-box", "Parallel boxes", 7.6],
  ["stairs", "Stairs", 5.5],
  ["stepping-stones", "Stepping stones", 6.2],
];

const REAL: [string, string, number, number][] = [
  ["rod", "Rod", 1, 6.2],
  ["rod", "Rod", 2, 3.1],
  ["rod", "Rod", 3, 7.3],
  ["rod", "Rod", 4, 14.4],
  ["rod", "Rod", 5, 6.0],
  ["rod", "Rod", 6, 16.2],
  ["nut", "Nut", 1, 22.1],
  ["nut", "Nut", 3, 19.8],
  ["gear-mesh", "Gear mesh", 1, 11.6],
  ["gear-mesh", "Gear mesh", 2, 8.9],
  ["gear-mesh", "Gear mesh", 3, 16.3],
  ["gear-mesh", "Gear mesh", 4, 8.6],
  ["gear-mesh", "Gear mesh", 5, 9.3],
];

// Most interesting run on the left, a nominal one on the right (from the
// owner's clip selector). Rectangular peg has only nominal runs.
const PAIRS: [string, string, number, [string, string]][] = [
  ["rod", "Rod", 4.3, ["Pushes the rod to flip it", "Nominal"]],
  ["bnc", "BNC connector", 4.1, ["Re-orients twice", "Nominal"]],
  ["gear-mesh", "Gear mesh", 3.7, ["Re-orients the gear", "Nominal"]],
  ["nut", "Nut", 5.4, ["Nut starts standing", "Nominal"]],
  ["waterproof", "Waterproof connector", 5.0, ["Retries", "Nominal"]],
  ["rectangular-peg", "Rectangular peg", 3.5, ["Nominal", "Nominal"]],
];

const run = (
  id: string,
  title: string,
  robot: string,
  category: Clip["category"],
  domain: Clip["domain"],
  duration: number,
  speed: number,
): Item => ({
  id,
  title,
  robot,
  category,
  domain,
  speed: "1×",
  kind: "run",
  aspect: 16 / 9,
  duration,
  src: `${BASE}/runs/${id}.mp4`,
  poster: `${BASE}/runs/${id}.jpg`,
  fast: { src: `${BASE}/runs/${id}-fast.mp4`, speed },
});

export const LIBRARY: Item[] = [
  ...REAL.map(
    ([task, title, n, duration]): Item => ({
      id: `ur5e-real-${task}-${n}`,
      title: `${title}, run ${n}`,
      robot: "UR5e",
      category: "Manipulation",
      domain: "Real",
      speed: "1×",
      kind: "clip",
      aspect: 16 / 9,
      duration,
      ...media(`ur5e-real-${task}-${n}`),
    }),
  ),
  ...PAIRS.map(
    ([task, title, duration, sides]): Item => ({
      id: `ur5e-sim-${task}`,
      title,
      robot: "UR5e",
      category: "Manipulation",
      domain: "Sim",
      speed: "1×",
      kind: "pair",
      aspect: 1288 / 360,
      duration,
      sides,
      ...media(`ur5e-sim-${task}`),
    }),
  ),
  ...(
    [
      [1, "Nut, wide 1", 6],
      [2, "Nut, close", 5.4],
      [3, "Nut, wide 2", 6],
    ] as const
  ).map(
    ([n, title, duration]): Item => ({
      id: `franka-sim-nut-${n}`,
      title,
      robot: "Franka",
      category: "Manipulation",
      domain: "Sim",
      speed: "1×",
      kind: "clip",
      aspect: 16 / 9,
      duration,
      ...media(`franka-sim-nut-${n}`),
    }),
  ),
  ...ANYMAL_D.map(
    ([slug, title, duration]): Item => ({
      id: `anymal-d-${slug}`,
      title,
      robot: "ANYmal D",
      category: "Locomotion",
      domain: "Sim",
      speed: "1×",
      kind: "clip",
      aspect: 16 / 9,
      duration,
      ...media(`anymal-d-${slug}`),
    }),
  ),
];

/** Continuous runs: shown in full, but only when the reader asks. */
export const RUNS: Item[] = [
  run(
    "run-anymal-c",
    "One minute across terrains",
    "ANYmal C",
    "Locomotion",
    "Sim",
    60.2,
    6,
  ),
  run(
    "run-ur5e-real-gear-mesh",
    "Gear mesh, one minute",
    "UR5e",
    "Manipulation",
    "Real",
    64.0,
    6,
  ),
  run(
    "run-franka-sim-nut",
    "Nut, 30 seconds",
    "Franka",
    "Manipulation",
    "Sim",
    30.3,
    3,
  ),
];

/**
 * Mock highlight reel (28 s): hardware first (rod, nut, gear mesh), then
 * UR5e in simulation, Franka, ANYmal D. The owner will polish the cut.
 */
export const REEL3: ReelData = {
  src: `${BASE}/reel.mp4`,
  poster: `${BASE}/reel.jpg`,
  duration: 28.3,
  chapters: [
    {
      start: 0,
      robot: "UR5e",
      title: "Rod",
      clip: "ur5e-real-rod-5",
      domain: "Real",
      speed: "1×",
    },
    {
      start: 4,
      robot: "UR5e",
      title: "Nut",
      clip: "ur5e-real-nut-3",
      domain: "Real",
      speed: "3×",
    },
    {
      start: 8.5,
      robot: "UR5e",
      title: "Gear mesh",
      clip: "ur5e-real-gear-mesh-1",
      domain: "Real",
      speed: "2×",
    },
    {
      start: 12.5,
      robot: "UR5e",
      title: "Rod",
      clip: "ur5e-sim-rod",
      domain: "Sim",
      speed: "1×",
    },
    {
      start: 14.7,
      robot: "UR5e",
      title: "BNC connector",
      clip: "ur5e-sim-bnc",
      domain: "Sim",
      speed: "1×",
    },
    {
      start: 17.8,
      robot: "Franka",
      title: "Nut",
      clip: "franka-sim-nut-2",
      domain: "Sim",
      speed: "1×",
    },
    {
      start: 20.8,
      robot: "ANYmal D",
      title: "Climbing box",
      clip: "anymal-d-climbing-box",
      domain: "Sim",
      speed: "1×",
    },
    {
      start: 23.3,
      robot: "ANYmal D",
      title: "Stepping stones",
      clip: "anymal-d-stepping-stones",
      domain: "Sim",
      speed: "1×",
    },
    {
      start: 25.8,
      robot: "ANYmal D",
      title: "Gap",
      clip: "anymal-d-gap",
      domain: "Sim",
      speed: "1×",
    },
  ],
};

/**
 * Stand-in reel (21.6 s), cut only from footage a cloud session could fetch
 * (STANDIN in scripts/lab/encode_library.py): five UR5e simulation
 * close-ups, then four ANYmal D terrains, all at 1×. Used by
 * /lab/highlights until reel.mp4 can be built again; not a proposed cut.
 * Chapter starts are frame-exact (30 fps).
 */
const sim = (
  start: number,
  robot: string,
  title: string,
): ReelData["chapters"][number] => ({
  start,
  robot,
  title,
  domain: "Sim",
  speed: "1×",
});
export const STANDIN_REEL: ReelData = {
  src: `${BASE}/standin-reel.mp4`,
  poster: `${BASE}/standin-reel.jpg`,
  duration: 21.567,
  chapters: [
    sim(0, "UR5e", "Rod"),
    sim(2.2, "UR5e", "Nut"),
    sim(5.3, "UR5e", "Gear mesh"),
    sim(7.467, "UR5e", "Waterproof connector"),
    sim(9.467, "UR5e", "Rectangular peg"),
    sim(11.567, "ANYmal D", "Climbing box"),
    sim(14.067, "ANYmal D", "Stepping stones"),
    sim(16.567, "ANYmal D", "Gap"),
    sim(19.067, "ANYmal D", "Stairs"),
  ],
};

/**
 * Stand-in clips (single UR5e simulation runs, static close-up), for pages
 * that show the UR5e pairs while the pairs cannot be built in a cloud
 * session (STANDIN_CLIPS in scripts/lab/encode_library.py).
 */
export const STANDIN_CLIPS: Item[] = (
  [
    ["rod", "Rod", 2.2],
    ["nut", "Nut", 3.1],
    ["gear-mesh", "Gear mesh", 2.2],
    ["waterproof", "Waterproof connector", 2.0],
    ["rectangular-peg", "Rectangular peg", 2.1],
  ] as const
).map(([task, title, duration]) => ({
  id: `standin-ur5e-sim-${task}`,
  title,
  robot: "UR5e",
  category: "Manipulation",
  domain: "Sim",
  speed: "1×",
  kind: "clip",
  aspect: 16 / 9,
  duration,
  ...media(`standin-ur5e-sim-${task}`),
}));
