// Clips for the interactive scaling results: one short clip of the trained
// policy for every task × method × scale that appears in the figure.
//
// File convention (about 5 s each, 16:9, no audio, H.264):
//
//   public/lab/media/scaling/{task}-{method}-{scale}.mp4      960 px wide
//   public/lab/media/scaling/{task}-{method}-{scale}-sm.mp4   384 px wide
//   public/lab/media/scaling/{task}-{method}-{scale}.jpg      poster, 960 px
//
//   task   loco | manip
//   method sgs | plr | uniform | linear
//   scale  4k | 32k | 256k | 1m
//
//   e.g. /lab/media/scaling/loco-sgs-256k.mp4
//
// From one recording per cell (ffmpeg; same settings as /lab/media/clips):
//
//   ffmpeg -i in.mp4 -t 5 -an -vf scale=960:-2 -c:v libx264 -crf 26 \
//     -preset slow -pix_fmt yuv420p -movflags +faststart loco-sgs-256k.mp4
//   ffmpeg -i in.mp4 -t 5 -an -vf scale=384:-2 -c:v libx264 -crf 28 \
//     -preset slow -pix_fmt yuv420p -movflags +faststart loco-sgs-256k-sm.mp4
//   ffmpeg -i loco-sgs-256k.mp4 -frames:v 1 -q:v 4 loco-sgs-256k.jpg
//
// Cells whose success rate is `null` in SCALING were not run and have no
// clip. When a recorded clip lands, add its id to RECORDED; until then the
// cell plays a placeholder cut from CLIPS and the UI labels it as one.

import { CLIPS, SCALING } from "../content";

export const METHODS = ["SGS", "PLR", "Uniform", "Linear"] as const;
export type Method = (typeof METHODS)[number];
export type TaskKey = "loco" | "manip";

export const SCALE_KEYS = ["4k", "32k", "256k", "1m"] as const;
export const SCALE_LABELS: readonly string[] = SCALING.envLabels;
export const ENVS: readonly number[] = SCALING.envs;
export const LAST = ENVS.length - 1;

export type Task = {
  key: TaskKey;
  name: string;
  // Methods in this task's figure, in METHODS order.
  methods: Method[];
  values: Partial<Record<Method, readonly (number | null)[]>>;
};

export const TASKS: Task[] = SCALING.panels.map((p) => ({
  key: p.name === "Locomotion" ? "loco" : "manip",
  name: p.name,
  methods: METHODS.filter((m) => p.series.some((s) => s.name === m)),
  values: Object.fromEntries(p.series.map((s) => [s.name, s.values])),
}));

export const taskOf = (key: TaskKey) => TASKS.find((t) => t.key === key)!;

// Success rate, or null when the method was not run at that scale.
export const successAt = (t: Task, m: Method, scale: number) =>
  t.values[m]?.[scale] ?? null;

export const fmt = (v: number) => v.toFixed(2);

export const clipId = (t: TaskKey, m: Method, scale: number) =>
  `${t}-${m.toLowerCase()}-${SCALE_KEYS[scale]}`;

export type ScalingClip = {
  id: string;
  src: string; // 960 px, for the large monitor
  srcSm: string; // 384 px, for side-by-side tiles and the matrix
  poster: string;
  placeholder: boolean;
  // Placeholder only: the CLIPS entry standing in for this cell.
  standIn?: string;
};

// Ids of cells whose real clip is in public/lab/media/scaling/.
const RECORDED = new Set<string>([
  // "loco-sgs-1m",
]);

// Placeholder footage: simulation clips only, so locomotion cells show the
// quadruped and manipulation cells show the taskboard arm.
const POOL: Record<TaskKey, string[]> = {
  loco: CLIPS.filter((c) => c.category === "Locomotion").map((c) => c.id),
  manip: CLIPS.filter(
    (c) => c.category === "Manipulation" && c.domain === "Sim",
  ).map((c) => c.id),
};

function build(t: Task, m: Method, scale: number): ScalingClip | null {
  if (successAt(t, m, scale) === null) return null;
  const id = clipId(t.key, m, scale);
  if (RECORDED.has(id)) {
    const base = `/lab/media/scaling/${id}`;
    return {
      id,
      src: `${base}.mp4`,
      srcSm: `${base}-sm.mp4`,
      poster: `${base}.jpg`,
      placeholder: false,
    };
  }
  // Different stand-ins side by side at one scale, so a comparison row
  // never shows the same footage twice.
  const pool = POOL[t.key];
  const step = Math.max(1, Math.floor(pool.length / t.methods.length));
  const standIn = pool[(t.methods.indexOf(m) * step + scale) % pool.length];
  return {
    id,
    src: `/lab/media/clips/${standIn}.mp4`,
    srcSm: `/lab/media/clips-sm/${standIn}.mp4`,
    poster: `/lab/media/clips/${standIn}.jpg`,
    placeholder: true,
    standIn,
  };
}

// (task, method, scale) -> clip, or null when not run at that scale.
export const MANIFEST: Record<string, ScalingClip | null> = Object.fromEntries(
  TASKS.flatMap((t) =>
    t.methods.flatMap((m) =>
      ENVS.map((_, s) => [clipId(t.key, m, s), build(t, m, s)] as const),
    ),
  ),
);

export const clipFor = (t: TaskKey, m: Method, scale: number) =>
  MANIFEST[clipId(t, m, scale)] ?? null;

// Every clip the figure needs, in reading order: what the owner records.
export const TO_RECORD = TASKS.flatMap((t) =>
  t.methods.flatMap((m) =>
    ENVS.flatMap((_, s) =>
      successAt(t, m, s) === null
        ? []
        : [{ id: clipId(t.key, m, s), task: t.name, method: m, scale: s }],
    ),
  ),
);

export const caption = (m: Method, scale: number, v: number | null) =>
  v === null
    ? `${m} · ${SCALE_LABELS[scale]} environments · not run at this scale`
    : `${m} · ${SCALE_LABELS[scale]} environments · success ${fmt(v)}`;
