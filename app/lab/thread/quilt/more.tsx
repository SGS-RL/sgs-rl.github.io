import {
  ADDED,
  EXTRA,
  LIBRARY,
  LIMITS,
  RUNS,
  SIM_SEQ,
  type Item,
} from "../../library";
import { focusOf, groupByRobot } from "../../_poster3/data";
import ThreadQuilt, { type QuiltGroup, type QuiltLook } from "./ThreadQuilt";
import versions from "./versions.json";

// The larger thread quilts (/lab/thread/quilt-b/ to -d/): each version's
// clips from ./versions.json, grouped by robot in the order listed (the
// UR5e's hardware nut first), their 12 s cuts from
// scripts/lab/thread/prep_quilt_clips.py, and each grid's look.
const ALL: Item[] = [
  ...LIBRARY,
  ...EXTRA,
  ...LIMITS,
  ...ADDED,
  ...SIM_SEQ,
  ...RUNS,
];
const NAMES: Record<string, string> = { "run-anymal-c": "Across terrains" };
// "Nut, run 4", "Nut on bolt", "Nut, close": "Nut", as on the site's quilt.
const short = (c: Item) =>
  NAMES[c.id] ??
  c.title
    .replace(/, (run \d+|close|wide \d)$/, "")
    .replace(/ (on bolt|in hole)$/, "");

export type Version = keyof typeof versions;

const LOOKS: Record<Version, Omit<QuiltLook, "cols" | "rows">> = {
  b: { index: [2, 2], bigs: 1, pitch: 4, chips: "all" },
  c: { index: [3, 2], bigs: 2, pitch: 3.6, chips: "wide" },
  d: { index: [3, 2], bigs: 3, pitch: 3.2, chips: "wide" },
};

export default function MoreQuilt({ v }: { v: Version }) {
  const { cols, rows, clips } = versions[v];
  const items = clips.map((id) => ALL.find((c) => c.id === id)!);
  const groups: QuiltGroup[] = groupByRobot(items).map((g) => ({
    robot: g.robot,
    categories: g.categories,
    domains: g.domains,
    clips: g.clips.map((c) => ({
      id: c.id,
      title: short(c),
      src: `/media/library/thread/quilt/${c.id}.mp4`,
      focus: focusOf(c),
    })),
  }));
  return <ThreadQuilt groups={groups} look={{ cols, rows, ...LOOKS[v] }} />;
}
