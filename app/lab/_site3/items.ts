// Helpers for the owner's footage (LIBRARY, RUNS in ../library.ts). Plain
// functions only, safe on the server and the client.
import type { Item } from "../library";

export type ItemGroup = {
  robot: string;
  domain: string;
  // Anchor in the clip index: "clips-ur5e-hardware".
  id: string;
  clips: Item[];
  categories: string[];
};

const uniq = <T>(xs: T[]) => [...new Set(xs)];

export const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const domainWord = (c: Item) =>
  c.domain === "Sim" ? "Simulation" : "Hardware";

// One group per robot and domain, in order of first appearance: the UR5e
// on hardware, then in simulation, then Franka and ANYmal D (the
// manifest's own order).
export function groupItems(clips: Item[]): ItemGroup[] {
  const key = (c: Item) => `${c.robot}|${domainWord(c)}`;
  return uniq(clips.map(key)).map((k) => {
    const group = clips.filter((c) => key(c) === k);
    const [robot, domain] = k.split("|");
    return {
      robot,
      domain,
      id: `clips-${slug(robot)}-${slug(domain)}`,
      clips: group,
      categories: uniq(group.map((c) => c.category)),
    };
  });
}

// 0:06, 1:04
export const mss = (s: number) => {
  const t = Math.max(0, Math.round(s));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
};

// A pair is two 640 x 360 runs with an 8 px white gap (1288 x 360). The
// labels under it sit on the same three tracks, so each lines up with its
// half of the frame.
export const PAIR_TRACKS = "640fr 8fr 640fr";

export const byId = (clips: Item[], id: string) => {
  const c = clips.find((k) => k.id === id);
  if (!c) throw new Error(`No clip ${id}`);
  return c;
};

// "Gear mesh" -> "gear mesh" after a comma; acronyms stay ("BNC connector").
export const lower = (s: string) =>
  /^[A-Z][a-z]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s;

// Say the robot where robots are mixed: "UR5e, rod".
export const label = (c: Item, withRobot = false) =>
  withRobot ? `${c.robot}, ${lower(c.title)}` : c.title;
