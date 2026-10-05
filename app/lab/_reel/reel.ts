// Data helpers for the highlight reel. The reel is one ordinary video with
// chapters; everything here is derived from `HIGHLIGHTS` in content.ts (or
// any object of the same shape), so the real reel can drop in unchanged.
import { CLIPS } from "../content";

export type ReelChapter = {
  start: number;
  robot: string;
  title: string;
  clip?: string;
  // Override the clip manifest (for reels cut from other footage).
  domain?: "Sim" | "Real";
  speed?: string;
};

export type ReelData = {
  src: string;
  poster?: string;
  duration: number;
  chapters: readonly ReelChapter[];
  // Width / height of the video. Defaults to 16:9.
  aspect?: number;
};

export type Chapter = ReelChapter & {
  i: number;
  end: number;
  len: number;
  group: number;
  // First chapter of its robot group.
  first: boolean;
};

export type Group = {
  robot: string;
  from: number;
  to: number;
  start: number;
  end: number;
  // "Simulation", "Hardware, 3×", ... from the clip manifest; "" if unknown.
  label: string;
  domains: ("Sim" | "Real")[];
  speeds: string[];
};

export const pad2 = (n: number) => String(n).padStart(2, "0");

// 0:04, 1:12
export const mss = (s: number) => {
  const t = Math.max(0, Math.floor(s));
  return `${Math.floor(t / 60)}:${pad2(t % 60)}`;
};

const uniq = <T>(xs: T[]) => [...new Set(xs)];

export function layout(reel: ReelData) {
  const n = reel.chapters.length;
  const groups: Group[] = [];
  const chapters: Chapter[] = reel.chapters.map((c, i) => {
    const end = i < n - 1 ? reel.chapters[i + 1].start : reel.duration;
    const prev = groups[groups.length - 1];
    const first = !prev || prev.robot !== c.robot;
    if (first)
      groups.push({
        robot: c.robot,
        from: i,
        to: i,
        start: c.start,
        end,
        label: "",
        domains: [],
        speeds: [],
      });
    const g = groups[groups.length - 1];
    g.to = i;
    g.end = end;
    const meta = c.domain
      ? { domain: c.domain, speed: c.speed ?? "1×" }
      : CLIPS.find((k) => k.id === c.clip);
    if (meta) {
      g.domains = uniq([...g.domains, meta.domain]);
      if (meta.domain === "Real") g.speeds = uniq([...g.speeds, meta.speed]);
    }
    return {
      ...c,
      i,
      end,
      len: Math.max(0.001, end - c.start),
      group: groups.length - 1,
      first,
    };
  });
  for (const g of groups) {
    const speed = g.speeds.length === 1 ? g.speeds[0] : "";
    g.label =
      g.domains.length === 2
        ? "Simulation and hardware"
        : g.domains[0] === "Sim"
          ? "Simulation"
          : g.domains[0] === "Real"
            ? speed && speed !== "1×"
              ? `Hardware, ${speed}`
              : "Hardware"
            : "";
  }
  return { chapters, groups };
}

export function chapterAt(chapters: readonly Chapter[], t: number) {
  let i = 0;
  while (i < chapters.length - 1 && t >= chapters[i + 1].start) i++;
  return i;
}

// Grid columns shared by the bar, the bands and the chapter ticks: one
// track per chapter, sized by its length, with gap tracks between them
// (wider between robot groups) so every row lines up exactly.
export function tracks(chapters: readonly Chapter[]) {
  return chapters
    .map(
      (c, k) =>
        (k === 0 ? "" : c.first ? "var(--rl-group-gap) " : "var(--rl-gap) ") +
        `minmax(0, ${c.len.toFixed(3)}fr)`,
    )
    .join(" ");
}
// 1-based grid line where chapter i starts.
export const line = (i: number) => 2 * i + 1;

const and = (xs: string[]) =>
  xs.length < 2
    ? (xs[0] ?? "")
    : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;

// Plain caption: what is shown, simulation or hardware, speed for hardware.
export function defaultCaption(reel: ReelData) {
  const { chapters, groups } = layout(reel);
  const lens = chapters.map((c) => c.len);
  const lo = Math.floor(Math.min(...lens));
  const hi = Math.ceil(Math.max(...lens));
  const sim = groups.filter((g) => g.domains.includes("Sim"));
  const real = groups.filter((g) => g.domains.includes("Real"));
  const speeds = uniq(real.flatMap((g) => g.speeds)).filter((s) => s !== "1×");
  const parts: string[] = [];
  if (sim.length) parts.push(`${and(sim.map((g) => g.robot))} in simulation`);
  if (real.length)
    parts.push(
      `${and(real.map((g) => g.robot))} on hardware${
        speeds.length === 1 ? `, shown at ${speeds[0]} speed` : ""
      }`,
    );
  const clips = `${chapters.length} clips, ${lo === hi ? lo : `${lo}–${hi}`} s each.`;
  return `${clips} ${parts.join("; ")}. No sound.`;
}
