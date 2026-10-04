// Helpers shared by the gallery components. Plain functions only: safe to
// import from server and client components alike.
import type { Clip } from "../content";

export type Skin = "swiss" | "pz";

export type RobotGroup = {
  robot: string;
  clips: Clip[];
  categories: string[];
  domains: string[];
  speeds: string[];
};

const uniq = <T>(xs: T[]) => [...new Set(xs)];

// One group per robot, in order of first appearance in the collection.
export function groupByRobot(clips: Clip[]): RobotGroup[] {
  return uniq(clips.map((c) => c.robot)).map((robot) => {
    const group = clips.filter((c) => c.robot === robot);
    return {
      robot,
      clips: group,
      categories: uniq(group.map((c) => c.category)),
      domains: uniq(group.map((c) => domainWord(c))),
      speeds: uniq(group.map((c) => c.speed)),
    };
  });
}

export const domainWord = (c: Clip) =>
  c.domain === "Sim" ? "Simulation" : "Hardware";

// "Locomotion · Simulation", "Manipulation · Hardware, shown at 3×".
export function describeGroup(g: RobotGroup, sep = " · ") {
  const fast = g.speeds.filter((s) => s !== "1×");
  return [
    g.categories.join(", "),
    g.domains.join(", ") + (fast.length ? `, shown at ${fast.join(", ")}` : ""),
  ].join(sep);
}

export const plural = (n: number, one: string, many = `${one}s`) =>
  `${n} ${n === 1 ? one : many}`;

// 384 px encodes for tiles; the 960 px file is for large views.
export const smallSrc = (c: Clip) => c.src.replace("/clips/", "/clips-sm/");

// Round-robin across robots so a short excerpt shows every robot.
export function interleave(groups: RobotGroup[]): Clip[] {
  const out: Clip[] = [];
  const longest = Math.max(0, ...groups.map((g) => g.clips.length));
  for (let i = 0; i < longest; i++)
    groups.forEach((g) => g.clips[i] && out.push(g.clips[i]));
  return out;
}

// Where the subject sits in the frame. Same point as ROBOT_FOCUS in
// _poster/PosterHero (copied: that module is client-only).
export function clipFocus(c: Clip): [number, number] {
  if (c.category === "Locomotion") return [0.36, 0.7];
  return c.domain === "Real" ? [0.5, 0.6] : [0.5, 0.5];
}

// CSS object-position that crops a 16:9 frame exactly as the halftone
// shader does (focus point centred where the crop allows), so a cell can
// swap between raster and video without the picture jumping.
export function objectPosition(
  focus: [number, number],
  boxAspect: number,
  srcAspect = 16 / 9,
) {
  const sx = srcAspect > boxAspect ? boxAspect / srcAspect : 1;
  const sy = srcAspect > boxAspect ? 1 : srcAspect / boxAspect;
  const pos = (f: number, s: number) => {
    if (s >= 1) return 50;
    const o = Math.min(Math.max(f - s / 2, 0), 1 - s);
    return (o / (1 - s)) * 100;
  };
  return `${pos(focus[0], sx).toFixed(2)}% ${pos(focus[1], sy).toFixed(2)}%`;
}

// Container-width steps used by the wall and the quilt (see gallery.css):
// 0: < 600 px, 1: < 1000, 2: < 1800, 3: < 2400, 4: wider.
export const STEPS = [0, 1, 2, 3, 4] as const;

// Classes that hide an element at the given container steps.
export const hideAt = (steps: number[]) =>
  steps.map((s) => `gal-h${s}`).join(" ");
