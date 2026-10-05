// Helpers for /lab/poster-3 over the owner's footage (LIBRARY items).
// Plain functions only: safe from server and client components.
import type { Item } from "../library";

export type Group = {
  robot: string;
  clips: Item[];
  categories: string[];
  domains: string[];
  speeds: string[];
};

const uniq = <T>(xs: T[]) => [...new Set(xs)];

export const domainWord = (c: Pick<Item, "domain">) =>
  c.domain === "Sim" ? "Simulation" : "Hardware";

// One group per robot, in order of first appearance.
export function groupByRobot(clips: Item[]): Group[] {
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

// One group per robot and domain ("UR5e, hardware" and "UR5e, simulation"
// apart), in order of first appearance.
export function groupBySetting(clips: Item[]) {
  const keys = uniq(clips.map((c) => `${c.robot}|${c.domain}`));
  return keys.map((k) => {
    const [robot, domain] = k.split("|");
    return {
      key: k,
      robot,
      domain: domain as Item["domain"],
      clips: clips.filter((c) => c.robot === robot && c.domain === domain),
    };
  });
}

// 384 px encodes (pairs: 644 px) for tiles; the full file for large views.
export const smallSrc = (c: Item) => c.src.replace("/clips/", "/clips-sm/");

export const pad2 = (n: number) => String(n).padStart(2, "0");

// 0:04, 1:12
export const mss = (s: number) => {
  const t = Math.max(0, Math.round(s));
  return `${Math.floor(t / 60)}:${pad2(t % 60)}`;
};

// "6 s", "14 s"
export const secs = (s: number) => `${Math.round(s)} s`;

export const plural = (n: number, one: string, many = `${one}s`) =>
  `${n} ${n === 1 ? one : many}`;

const WORDS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
];
// Numbers in running text: words up to twelve.
export const word = (n: number) => WORDS[n] ?? String(n);

// "real time" for 1×, otherwise the speed itself.
export const speedWord = (s: string) => (s === "1×" ? "real time" : s);

// Where the subject sits in a 16:9 frame of the owner's footage, for the
// quilt's square crops (decorative only; evidence is never cropped).
export function focusOf(c: Item): [number, number] {
  if (c.category === "Locomotion") return [0.42, 0.72];
  if (c.domain === "Real") return [0.55, 0.45];
  return [0.55, 0.45];
}

// CSS object-position that crops a frame exactly as the halftone shader
// does (focus point centred where the crop allows), so a quilt cell can
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
