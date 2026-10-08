// Shared content for the /lab design studies. Facts are taken from the
// current site and its videos; anything marked "check" is a best guess from
// the footage and should be confirmed before it goes on the main page.

export const TITLE = "A Balanced Data Diet";
// Subtitle as the existing studies set it. The paper's full subtitle is
// FULL_SUBTITLE; /lab/title/ tries ways to set it before any page adopts it.
export const SUBTITLE = "Mega-Scale RL for Robot Control";
export const SUBTITLE_PARTS = {
  pre: "Addressing the",
  focus: "Exploration Bottleneck",
  post: "in Mega-Scale RL for Robot Control",
};
export const FULL_SUBTITLE = `${SUBTITLE_PARTS.pre} ${SUBTITLE_PARTS.focus} ${SUBTITLE_PARTS.post}`;

// [name, affiliation numbers]; * marks co-first authors, † equal advising.
// UW is 1, NVIDIA 2; Octi Zhang is at both (owner, 2026-10-07).
export const AUTHORS: [string, string][] = [
  ["Octi Zhang", "1,2*"],
  ["Mateo Guaman Castro", "1*"],
  ["Patrick Yin", "1*"],
  ["Ignacio Dagnino", "1"],
  ["Abhishek Gupta", "1"],
  ["Rosario Scalise", "1†"],
  ["Byron Boots", "1†"],
];
export const AFFILIATIONS = ["University of Washington", "NVIDIA"];
export const EQUAL = "*Equal contribution";
export const ADVISING = "†Equal advising";
// Co-first authors keep their asterisk, and the equal advisors their
// dagger, wherever names appear.
export const AUTHOR_LINE = AUTHORS.map(
  ([name, aff]) => name + aff.replace(/[^*†]/g, ""),
).join(", ");
// "Mateo Guaman Castro" -> "Guaman Castro, Mateo"; three names per line
// so the BibTeX fits its box.
const bibName = (name: string) => {
  const [first, ...last] = name.split(" ");
  return `${last.join(" ")}, ${first}`;
};
const bibAuthors = AUTHORS.map(([name]) => bibName(name))
  .reduce<string[][]>((rows, n, i) => {
    if (i % 3 === 0) rows.push([]);
    rows[rows.length - 1].push(n);
    return rows;
  }, [])
  .map((row) => row.join(" and "))
  .join(" and\n" + " ".repeat(15));

export const VENUE = "CoRL 2026";

export const LINKS = {
  paper: "#",
  code: "#",
};

// The intro is locomotion.mp4 sped up 3x (60 s -> 20 s).
export const INTRO = {
  src: "/lab/media/intro.mp4",
  poster: "/lab/media/intro-poster.jpg",
  speed: 3,
  runLength: 60.16,
};

// Highlight reel: a plain video (not scroll-driven) with chapters. This is
// a placeholder cut from CLIPS (2–3 s each, grouped by robot) until the
// real 15–30 s reel exists; `start` is seconds into the reel.
export const HIGHLIGHTS = {
  src: "/lab/media/highlights.mp4",
  poster: "/lab/media/highlights-poster.jpg",
  duration: 21.5,
  chapters: [
    { start: 0, robot: "ANYmal", title: "Stairs", clip: "loco-02" },
    { start: 2, robot: "ANYmal", title: "Stepping blocks", clip: "loco-05" },
    { start: 4, robot: "ANYmal", title: "Rubble", clip: "loco-07" },
    { start: 6, robot: "ANYmal", title: "Narrow bridge", clip: "loco-09" },
    { start: 8, robot: "ANYmal", title: "Lattice", clip: "loco-10" },
    {
      start: 10,
      robot: "Franka",
      title: "Taskboard insertion",
      clip: "manip-01",
    },
    { start: 13, robot: "Franka", title: "Taskboard, close", clip: "manip-02" },
    {
      start: 15.5,
      robot: "UR arm",
      title: "Block insertion",
      clip: "real-01",
    },
    {
      start: 18.5,
      robot: "UR arm",
      title: "Block insertion",
      clip: "real-02",
    },
  ],
};

// Start time (seconds, in the original 1x run) of each terrain in the intro.
// Names are descriptive guesses from the footage (check).
export const TERRAINS: { name: string; start: number }[] = [
  { name: "Pit", start: 0 },
  { name: "Stairs", start: 8.3 },
  { name: "Box field", start: 13.8 },
  { name: "Box field", start: 17.5 },
  { name: "Stepping blocks", start: 23.5 },
  { name: "Platforms", start: 29.5 },
  { name: "Rubble", start: 35.5 },
  { name: "Blocks", start: 41.5 },
  { name: "Narrow bridge", start: 48.5 },
  { name: "Lattice", start: 55.5 },
];

export function terrainAt(runSeconds: number) {
  let i = 0;
  while (i < TERRAINS.length - 1 && runSeconds >= TERRAINS[i + 1].start) i++;
  return i;
}

export const SETUP: [string, string][] = [
  ["Policy", "Markovian MLP, 4–8 layers. No transformer, no LSTM."],
  ["Terrain input", "Heightmap"],
  ["Goal", "One target pose per terrain"],
  ["Reward", "Sparse success signal and generic regularizers"],
  ["Demonstrations", "None"],
  ["Distillation", "None"],
  ["Parallel environments", "Over 1M"],
];

export const METHOD_STEPS = [
  "Sample task configurations by sampling weight.",
  "Roll out the policy and collect data.",
  "Update the policy.",
  "Estimate success rates and re-weight.",
];

// Success rate vs. parallel environments, read off the final frame of
// scaling.mp4. The labelled endpoints (0.72, 0.60, 0.62, 0.08, 0.00) are
// exact; intermediate points are read by eye to +/-0.01 (check against the
// paper before shipping). `null` = not run at that scale.
export const SCALING = {
  envs: [4096, 32768, 262144, 1048576],
  envLabels: ["4K", "32K", "256K", "1M"],
  priorMax: 65536,
  panels: [
    {
      name: "Locomotion",
      series: [
        { name: "SGS", values: [0.46, 0.5, 0.72, 0.72] },
        { name: "PLR", values: [0, 0.13, 0.49, 0.6] },
        { name: "Uniform", values: [0, 0.42, 0, 0] },
        { name: "Linear", values: [0, 0.31, 0, null] },
      ],
    },
    {
      name: "Manipulation",
      series: [
        { name: "SGS", values: [0, 0.06, 0.09, 0.62] },
        { name: "Uniform", values: [0, 0, 0, 0.08] },
        { name: "PLR", values: [0, 0, 0, 0] },
      ],
    },
  ],
} as const;

export type Clip = {
  id: string;
  title: string;
  robot: string;
  category: "Locomotion" | "Manipulation";
  domain: "Sim" | "Real";
  speed: string;
  src: string;
  poster: string;
};

const clip = (
  id: string,
  title: string,
  robot: string,
  category: Clip["category"],
  domain: Clip["domain"],
  speed = "1×",
): Clip => ({
  id,
  title,
  robot,
  category,
  domain,
  speed,
  src: `/lab/media/clips/${id}.mp4`,
  poster: `/lab/media/clips/${id}.jpg`,
});

// Placeholder collection cut from the existing videos so the layouts can be
// judged with real footage. Robot names are guesses from the footage (check).
export const CLIPS: Clip[] = [
  ...TERRAINS.map((t, i) =>
    clip(
      `loco-${String(i + 1).padStart(2, "0")}`,
      t.name,
      "ANYmal",
      "Locomotion",
      "Sim",
    ),
  ),
  clip("manip-01", "Taskboard insertion", "Franka", "Manipulation", "Sim"),
  clip(
    "manip-02",
    "Taskboard insertion, close",
    "Franka",
    "Manipulation",
    "Sim",
  ),
  clip("manip-03", "Taskboard insertion", "Franka", "Manipulation", "Sim"),
  clip("real-01", "Block insertion", "UR arm", "Manipulation", "Real", "3×"),
  clip("real-02", "Block insertion", "UR arm", "Manipulation", "Real", "3×"),
];

export const BIBTEX = `@inproceedings{sgs,
  title     = {${TITLE}: ${FULL_SUBTITLE}},
  author    = {${bibAuthors}},
  booktitle = {Conference on Robot Learning (CoRL)},
  year      = {2026}
}`;
