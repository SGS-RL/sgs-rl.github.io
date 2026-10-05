// Helpers for /lab/swiss-3 over the owner's footage (app/lab/library.ts).
// Plain functions only: safe to import from server and client components.
import { LIBRARY, RUNS, type Item } from "../library";

export type Domain = Item["domain"];

// One block of the collection: a robot in simulation or on hardware.
export type Group = {
  key: string;
  robot: string;
  domain: Domain;
  category: Item["category"];
  items: Item[];
};

const uniq = <T>(xs: T[]) => [...new Set(xs)];

export const domainWord = (d: Domain) =>
  d === "Sim" ? "Simulation" : "Hardware";

// Robot and domain, in order of first appearance (the library is already
// ordered: UR5e hardware, UR5e simulation, Franka, ANYmal D).
export function groupItems(items: Item[]): Group[] {
  const out: Group[] = [];
  for (const it of items) {
    const key = `${it.robot}|${it.domain}`;
    let g = out.find((x) => x.key === key);
    if (!g) {
      g = {
        key,
        robot: it.robot,
        domain: it.domain,
        category: it.category,
        items: [],
      };
      out.push(g);
    }
    g.items.push(it);
  }
  return out;
}

// Round-robin across groups, starting one group later on every pass, so a
// short excerpt shows every robot and pairs do not stack in one column.
export function interleave(groups: Group[]): Item[] {
  const out: Item[] = [];
  const longest = Math.max(0, ...groups.map((g) => g.items.length));
  for (let i = 0; i < longest; i++)
    for (let k = 0; k < groups.length; k++) {
      const g = groups[(i + k) % groups.length];
      if (g.items[i]) out.push(g.items[i]);
    }
  return out;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

// 0:06, 1:04 (rounded, so a 60.2 s run reads 1:00).
export const clock = (s: number) => {
  const t = Math.max(0, Math.round(s));
  return `${Math.floor(t / 60)}:${pad2(t % 60)}`;
};

export const plural = (n: number, one: string, many = `${one}s`) =>
  `${n} ${n === 1 ? one : many}`;

// 384 px encodes for tiles (644 px for pairs); 960 px for large views.
export const smallSrc = (it: Item) => it.src.replace("/clips/", "/clips-sm/");

// Grid cells an item takes: pairs are two runs side by side.
export const units = (it: Item) => (it.kind === "pair" ? 2 : 1);

// Counts for the copy, from the manifest.
export const COUNTS = {
  clips: LIBRARY.length,
  pairs: LIBRARY.filter((c) => c.kind === "pair").length,
  robots: uniq(LIBRARY.map((c) => c.robot)).length,
  runs: RUNS.length,
  allRobots: uniq([...LIBRARY, ...RUNS].map((c) => c.robot)).length,
};

export const byId = (id: string) => LIBRARY.find((c) => c.id === id);

// "Three", for counts that open a sentence.
export const word = (n: number) =>
  ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight"][n] ??
  String(n);

const and = (xs: string[]) =>
  xs.length < 2
    ? (xs[0] ?? "")
    : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;

// The tasks in a set of clips, from their titles ("Rod, run 3" -> "rod").
export function taskList(items: Item[]) {
  const names = uniq(
    items.map((c) => c.title.replace(/, (run \d+|wide|close)$/, "")),
  );
  return and(names.map((t) => (/^[A-Z]{2}/.test(t) ? t : t.toLowerCase())));
}

export const inGroup = (robot: string, domain: Domain) =>
  LIBRARY.filter((c) => c.robot === robot && c.domain === domain);
