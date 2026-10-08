// The owner's footage (drive folder "SGS", 2026-10-05), encoded by
// scripts/lab/encode_library.py into public/lab/media/library/. The round 3
// pages use this; the earlier studies keep the placeholder CLIPS and
// HIGHLIGHTS in content.ts, so they look as they did when reviewed.
//
// ANYmal C and D per terrain arrived 2026-10-08 (LIMITS below; the round 3
// pages keep the earlier ANYmal D clips in LIBRARY). Task and terrain names
// follow the folder names (check).
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
  ...REAL.map(([task, title, n, duration]): Item => ({
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
  })),
  ...PAIRS.map(([task, title, duration, sides]): Item => ({
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
  })),
  ...(
    [
      [1, "Nut, wide 1", 6],
      [2, "Nut, close", 5.4],
      [3, "Nut, wide 2", 6],
    ] as const
  ).map(([n, title, duration]): Item => ({
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
  })),
  ...ANYMAL_D.map(([slug, title, duration]): Item => ({
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
  })),
];

/**
 * Clips cut for the combined page's Overview only (2026-10-07): a 6 s
 * real-time excerpt of the ANYmal C run, and single UR5e simulation runs
 * (static close-up) where the collection shows pairs. Kept out of LIBRARY
 * so the round 3 pages keep the collection they were reviewed with.
 */
export const EXTRA: Item[] = [
  {
    id: "anymal-c-terrains",
    title: "Across terrains",
    robot: "ANYmal C",
    category: "Locomotion",
    domain: "Sim",
    speed: "1×",
    kind: "clip",
    aspect: 16 / 9,
    duration: 6,
    ...media("anymal-c-terrains"),
  },
  ...(
    [
      ["rod", "Rod", 1, 2.2],
      ["bnc", "BNC connector", 5, 4.1],
      ["gear-mesh", "Gear mesh", 3, 2.2],
    ] as const
  ).map(([task, title, n, duration]): Item => ({
    id: `ur5e-sim-${task}-${n}`,
    title,
    robot: "UR5e",
    category: "Manipulation",
    domain: "Sim",
    speed: "1×",
    kind: "clip",
    aspect: 16 / 9,
    duration,
    ...media(`ur5e-sim-${task}-${n}`),
  })),
];

/**
 * ANYmal C and D, one clip per terrain at the hardest setting the policy
 * crosses (the owner's limit renders and picks, 2026-10-08): from the
 * first marker jump to the second, or from the start where the run begins
 * at the bottom (stairs, pit, inverted slope). Radiating beam is the offset
 * (rotated) layout on both robots. Cut by scripts/lab/trim_anymal_limits.py,
 * encoded from its output (LIMITS in scripts/lab/encode_library.py). Kept
 * out of LIBRARY so the round 3 pages keep their ANYmal D clips.
 * [terrain id, title, seconds on C, seconds on D]
 */
const LIMIT_TERRAINS: [string, string, number, number][] = [
  ["balancing-beam", "Balancing beam", 6.1, 5.7],
  ["climbing-box", "Climbing box", 9.2, 9.4],
  ["contour", "Contour", 7.4, 7.4],
  ["floating-island", "Floating island", 6.0, 5.8],
  ["gap", "Gap", 6.0, 4.9],
  ["inverted-slope", "Inverted slope", 3.4, 3.1],
  ["jump-box", "Jump box", 6.0, 4.7],
  ["pit", "Pit", 3.0, 3.9],
  ["radiating-beam-offset", "Radiating beam", 6.6, 6.7],
  ["random-parallel-box", "Parallel boxes", 5.9, 5.4],
  ["stairs", "Stairs", 4.0, 4.1],
  ["stepping-stones", "Stepping stones", 8.5, 5.0],
];

export const LIMITS: Item[] = (["c", "d"] as const).flatMap((r) =>
  LIMIT_TERRAINS.map(([terrain, title, c, d]): Item => ({
    id: `anymal-${r}-limit-${terrain}`,
    title,
    robot: r === "c" ? "ANYmal C" : "ANYmal D",
    category: "Locomotion",
    domain: "Sim",
    speed: "1×",
    kind: "clip",
    aspect: 16 / 9,
    duration: r === "c" ? c : d,
    ...media(`anymal-${r}-limit-${terrain}`),
  })),
);

/**
 * Footage added with REEL5 (owner, 2026-10-08; in the drive folder SGS),
 * as single clips for the combined page's Results and Clips: the two new
 * hardware nut runs (drive clip4 and clip5), the gear spin, and the first
 * 16 s of the one-minute Franka nut run (ADDED in encode_library.py). Kept
 * out of LIBRARY so the round 3 pages stay as reviewed.
 */
const added = (
  id: string,
  title: string,
  robot: string,
  domain: Clip["domain"],
  duration: number,
): Item => ({
  id,
  title,
  robot,
  category: "Manipulation",
  domain,
  speed: "1×",
  kind: "clip",
  aspect: 16 / 9,
  duration,
  ...media(id),
});
export const ADDED: Item[] = [
  added("ur5e-real-nut-4", "Nut, run 4", "UR5e", "Real", 13.8),
  added("ur5e-real-nut-5", "Nut, run 5", "UR5e", "Real", 17.0),
  added("ur5e-real-gear-spin", "Gear spin", "UR5e", "Real", 7.2),
  added("franka-sim-nut-1m", "Nut, one minute run", "Franka", "Sim", 16.0),
  // The whole one-minute run (Clips, owner 2026-10-08).
  added("franka-sim-nut-1m-full", "Nut on bolt", "Franka", "Sim", 58.4),
];

/**
 * UR5e simulation for the Clips section (owner, 2026-10-08): per task, the
 * same two static close-up runs as the pairs, played one after the other
 * as one clip, the more interesting run first and then the nominal one.
 * No labels on either run. Nut on bolt first.
 */
export const SIM_SEQ: Item[] = (
  [
    ["nut", "Nut on bolt", 8.5],
    ["rod", "Rod in hole", 6.5],
    ["gear-mesh", "Gear mesh", 5.8],
    ["bnc", "BNC connector", 7.5],
    ["waterproof", "Waterproof connector", 7.0],
    ["rectangular-peg", "Rectangular peg", 5.6],
  ] as const
).map(([task, title, duration]): Item => ({
  id: `ur5e-sim-${task}-seq`,
  title,
  robot: "UR5e",
  category: "Manipulation",
  domain: "Sim",
  speed: "1×",
  kind: "clip",
  aspect: 16 / 9,
  duration,
  ...media(`ur5e-sim-${task}-seq`),
}));

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
 * Mock highlight reel (28.8 s): hardware first (rod, nut, gear mesh), then
 * UR5e in simulation, Franka, ANYmal D, every chapter at 1× (owner,
 * 2026-10-07). The owner will polish the cut.
 */
export const REEL3: ReelData = {
  src: `${BASE}/reel.mp4`,
  poster: `${BASE}/reel.jpg`,
  duration: 28.8,
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
      speed: "1×",
    },
    {
      start: 8.5,
      robot: "UR5e",
      title: "Gear mesh",
      clip: "ur5e-real-gear-mesh-1",
      domain: "Real",
      speed: "1×",
    },
    {
      start: 13,
      robot: "UR5e",
      title: "Rod",
      clip: "ur5e-sim-rod",
      domain: "Sim",
      speed: "1×",
    },
    {
      start: 15.2,
      robot: "UR5e",
      title: "BNC connector",
      clip: "ur5e-sim-bnc",
      domain: "Sim",
      speed: "1×",
    },
    {
      start: 18.3,
      robot: "Franka",
      title: "Nut",
      clip: "franka-sim-nut-2",
      domain: "Sim",
      speed: "1×",
    },
    {
      start: 21.3,
      robot: "ANYmal D",
      title: "Climbing box",
      clip: "anymal-d-climbing-box",
      domain: "Sim",
      speed: "1×",
    },
    {
      start: 23.8,
      robot: "ANYmal D",
      title: "Stepping stones",
      clip: "anymal-d-stepping-stones",
      domain: "Sim",
      speed: "1×",
    },
    {
      start: 26.3,
      robot: "ANYmal D",
      title: "Gap",
      clip: "anymal-d-gap",
      domain: "Sim",
      speed: "1×",
    },
  ],
};

/**
 * The combined page's reel (53.1 s; owner, 2026-10-08, from labmates'
 * feedback): nut first, then gear mesh, then the rod, each hardware clip
 * whole at 1×, so the nut is picked up on screen. The simulation chapters
 * as in REEL3. Chapter starts from frame counts at 30 fps. REEL3 stays for
 * the pages already reviewed with it.
 */
const REEL4_CHAPTERS: [number, string, string, string, Clip["domain"]][] = [
  [0, "UR5e", "Nut", "ur5e-real-nut-3", "Real"],
  [593 / 30, "UR5e", "Gear mesh", "ur5e-real-gear-mesh-1", "Real"],
  [942 / 30, "UR5e", "Rod", "ur5e-real-rod-5", "Real"],
  [1120 / 30, "UR5e", "Rod", "ur5e-sim-rod", "Sim"],
  [1186 / 30, "UR5e", "BNC connector", "ur5e-sim-bnc", "Sim"],
  [1279 / 30, "Franka", "Nut", "franka-sim-nut-2", "Sim"],
  [1369 / 30, "ANYmal D", "Climbing box", "anymal-d-climbing-box", "Sim"],
  [1444 / 30, "ANYmal D", "Stepping stones", "anymal-d-stepping-stones", "Sim"],
  [1519 / 30, "ANYmal D", "Gap", "anymal-d-gap", "Sim"],
];

export const REEL4: ReelData = {
  src: `${BASE}/reel4.mp4`,
  poster: `${BASE}/reel4.jpg`,
  duration: 1594 / 30,
  chapters: REEL4_CHAPTERS.map(([start, robot, title, clip, domain]) => ({
    start,
    robot,
    title,
    clip,
    domain,
    speed: "1×",
  })),
};

/**
 * The combined page's reel, third cut (124 s; owner, 2026-10-08): two new
 * hardware nut runs, the gear spin, gear mesh 1 and rod 5, each whole; UR5e
 * simulation rod, BNC and waterproof; Franka nut (0–16 s of the one-minute
 * run); ANYmal C (28–50 s of its one-minute run); ANYmal D climbing box,
 * floating island and stepping stones (the LIMITS crossings, whole).
 * Chapter starts are the frame counts encode_library.py prints for REEL5
 * (30 fps). REEL4 stays as it was.
 */
const REEL5_CHAPTERS: [
  number,
  string,
  string,
  string | undefined,
  Clip["domain"],
][] = [
  [0, "UR5e", "Nut", undefined, "Real"],
  [415, "UR5e", "Nut", undefined, "Real"],
  [924, "UR5e", "Gear mesh", undefined, "Real"],
  [1139, "UR5e", "Gear mesh", "ur5e-real-gear-mesh-1", "Real"],
  [1488, "UR5e", "Rod", "ur5e-real-rod-5", "Real"],
  [1666, "UR5e", "Rod", "ur5e-sim-rod", "Sim"],
  [1732, "UR5e", "BNC connector", "ur5e-sim-bnc", "Sim"],
  [1825, "UR5e", "Waterproof connector", "ur5e-sim-waterproof", "Sim"],
  [1975, "Franka", "Nut", undefined, "Sim"],
  [2455, "ANYmal C", "Several terrains", "run-anymal-c", "Sim"],
  [3115, "ANYmal D", "Climbing box", "anymal-d-limit-climbing-box", "Sim"],
  [
    3397,
    "ANYmal D",
    "Floating island",
    "anymal-d-limit-floating-island",
    "Sim",
  ],
  [
    3570,
    "ANYmal D",
    "Stepping stones",
    "anymal-d-limit-stepping-stones",
    "Sim",
  ],
];

export const REEL5: ReelData = {
  src: `${BASE}/reel5.mp4`,
  poster: `${BASE}/reel5.jpg`,
  duration: 3719 / 30,
  chapters: REEL5_CHAPTERS.map(([frame, robot, title, clip, domain]) => ({
    start: frame / 30,
    robot,
    title,
    clip,
    domain,
    speed: "1×",
  })),
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
