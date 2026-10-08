import { ADDED, EXTRA, LIBRARY, LIMITS, SIM_SEQ, type Item } from "../library";

// The Clips section's contents as data (./ClipsViews.tsx, on the page since
// 2026-10-08): UR5e real world, UR5e simulation, ANYmal C, ANYmal D,
// Franka; nut on bolt first. This is now the list the page uses;
// ./Clips.tsx is the earlier grid, kept for reference.

export type ClipEntry = { item?: Item; name: string }; // no item: to come
export type ClipTask = { name?: string; clips: ClipEntry[] };
export type ClipGroup = {
  key: string;
  robot: string;
  setting: string;
  tasks: ClipTask[];
};

const find = (id: string) =>
  [...LIBRARY, ...EXTRA, ...LIMITS, ...ADDED].find((c) => c.id === id)!;
const one = (id: string, name?: string): ClipEntry => {
  const item = find(id);
  return { item, name: name ?? item.title };
};

// Both ANYmals in one order: the three in the highlights first, then the
// rest by name (as ./Clips.tsx).
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

export const CLIP_GROUPS: ClipGroup[] = [
  {
    key: "ur5e-real",
    robot: "UR5e",
    setting: "Real world",
    tasks: [
      {
        name: "Nut on bolt",
        clips: [4, 5, 3, 1].map((n) =>
          one(`ur5e-real-nut-${n}`, "Nut on bolt"),
        ),
      },
      {
        name: "Rod in hole",
        clips: [5, 4, 1, 2, 3, 6].map((n) =>
          one(`ur5e-real-rod-${n}`, "Rod in hole"),
        ),
      },
      {
        name: "Gear mesh",
        clips: [
          one("ur5e-real-gear-spin", "Gear mesh"),
          ...[1, 2, 3, 4, 5].map((n) =>
            one(`ur5e-real-gear-mesh-${n}`, "Gear mesh"),
          ),
        ],
      },
    ],
  },
  {
    key: "ur5e-sim",
    robot: "UR5e",
    setting: "Simulation",
    tasks: [{ clips: SIM_SEQ.map((item) => ({ item, name: item.title })) }],
  },
  {
    key: "anymal-c",
    robot: "ANYmal C",
    setting: "Simulation",
    tasks: [
      {
        clips: [
          one("anymal-c-terrains", "All terrains"),
          ...TERRAINS.filter((t) => t !== "maze").map((t) =>
            one(`anymal-c-limit-${t}`),
          ),
        ],
      },
    ],
  },
  {
    key: "anymal-d",
    robot: "ANYmal D",
    setting: "Simulation",
    tasks: [
      {
        clips: TERRAINS.map((t) =>
          one(t === "maze" ? "anymal-d-maze" : `anymal-d-limit-${t}`),
        ),
      },
    ],
  },
  {
    key: "franka",
    robot: "Franka",
    setting: "Simulation",
    // The one-minute continuous run, whole, and nothing else: the shorter
    // Franka clips are cut from it (owner, 2026-10-08).
    tasks: [{ name: "Nut on bolt", clips: [one("franka-sim-nut-1m-full")] }],
  },
];

// Every clip with footage, in page order, with its place.
export type Playable = {
  item: Item;
  name: string;
  group: ClipGroup;
  n: number;
};
export const PLAYABLE: Playable[] = CLIP_GROUPS.flatMap((group) =>
  group.tasks.flatMap((t) =>
    t.clips.flatMap((c) =>
      c.item ? [{ item: c.item, name: c.name, group }] : [],
    ),
  ),
).map((p, n) => ({ ...p, n }));

export const indexOf = new Map(PLAYABLE.map((p) => [p.item.id, p.n]));
