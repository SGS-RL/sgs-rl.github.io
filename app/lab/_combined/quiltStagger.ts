// Staggered layouts for the Results divider (owner, 2026-10-08: "the
// titles in that divider all line up vertically, which kinda makes it lose
// a bit of touch. How can we make them more asymmetric?"). With a label,
// a wide clip and narrow clips per robot, every label fell in the same
// column. Here each cell's shape is chosen per container step, so that no
// label sits in the column of the label before it (nor, where it can be
// helped, of any earlier label), with few filler cells and no label left
// alone at the end of a row. Cells keep their order (row flow), so each
// robot's label still comes right before its clips.
//
// The search is a seeded random one: the same layout on the server and in
// the browser, every time.

export type Shape = readonly [w: number, h: number];
export type Slot = {
  kind: "index" | "label" | "clip";
  // The first clip of a robot's group, best wide.
  first?: boolean;
  options: readonly Shape[];
};

// Columns at each container step (../_gallery/data.ts STEPS).
export const COLS = [3, 4, 6, 8, 10];

type Sim = {
  // Flat cells to insert before each slot, and after the last.
  before: number[];
  row: number[];
  col: number[];
  rows: number;
  flats: number;
};

// CSS grid row flow ("sparse" auto-placement): each item goes at the first
// place at or after the previous item's start where it fits. Free cells it
// skips would be holes, so a flat cell fills each.
function simulate(shapes: readonly Shape[], cols: number): Sim {
  const occ: number[] = [];
  const free = (r: number, c: number) => !((occ[r] ?? 0) & (1 << c));
  const fits = (r: number, c: number, w: number, h: number) => {
    if (c + w > cols) return false;
    for (let y = r; y < r + h; y++)
      for (let x = c; x < c + w; x++) if (!free(y, x)) return false;
    return true;
  };
  const before = new Array(shapes.length + 1).fill(0);
  const row: number[] = [];
  const col: number[] = [];
  let cr = 0;
  let cc = 0;
  shapes.forEach(([w0, h], k) => {
    const w = Math.min(w0, cols);
    let r = cr;
    let c = cc;
    let skipped = 0;
    while (!fits(r, c, w, h)) {
      if (free(r, c)) skipped++;
      c++;
      if (c >= cols) {
        c = 0;
        r++;
      }
    }
    before[k] = skipped;
    for (let y = r; y < r + h; y++)
      for (let x = c; x < c + w; x++) occ[y] = (occ[y] ?? 0) | (1 << x);
    row[k] = r;
    col[k] = c;
    cr = r;
    cc = c;
  });
  let end = 0;
  for (let r = cr; r < occ.length; r++)
    for (let c = r === cr ? cc : 0; c < cols; c++) if (free(r, c)) end++;
  before[shapes.length] = end;
  return {
    before,
    row,
    col,
    rows: occ.length,
    flats: before.reduce((a, b) => a + b, 0),
  };
}

function score(slots: readonly Slot[], shapes: readonly Shape[], s: Sim) {
  let x = s.flats + s.rows * 0.25;
  const labels = slots.flatMap((sl, k) => (sl.kind === "label" ? [k] : []));
  labels.forEach((k, i) => {
    if (i > 0 && s.col[k] === s.col[labels[i - 1]]) x += 8;
    for (let j = 0; j < i - 1; j++) if (s.col[labels[j]] === s.col[k]) x += 2.5;
    // A label alone at a row's end, its clips on the next row.
    if (s.row[k + 1] > s.row[k]) x += 2;
  });
  slots.forEach((sl, k) => {
    if (sl.first && shapes[k][0] * shapes[k][1] === 1) x += 0.8;
    // A big square best opens a robot's clips (the UR5e's: the nut).
    if (sl.first && shapes[k][1] === 2) x -= k === 2 ? 1.5 : 0.8;
  });
  // Where big squares are allowed: one or two of them, not side by side.
  if (slots.some((sl) => sl.options.some(([, h]) => h === 2))) {
    const big = shapes.flatMap(([, h], k) => (h === 2 ? [k] : []));
    x += big.length === 0 ? 2 : big.length > 2 ? (big.length - 2) * 1.5 : 0;
    big.forEach((k, i) => {
      if (i > 0 && Math.abs(s.row[k] - s.row[big[i - 1]]) < 2) x += 3;
    });
  }
  return x;
}

function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Per container step: each slot's shape and the flat cells before it. */
export function stagger(slots: readonly Slot[], tries = 2500) {
  return COLS.map((cols, step) => {
    const rand = rng(1009 + step * 7919);
    let best: { shapes: Shape[]; sim: Sim; s: number } | null = null;
    for (let t = 0; t < tries; t++) {
      const shapes = slots.map((sl) =>
        t === 0
          ? sl.options[0]
          : sl.options[Math.floor(rand() * sl.options.length)],
      );
      const sim = simulate(shapes, cols);
      const s = score(slots, shapes, sim);
      if (!best || s < best.s) best = { shapes, sim, s };
    }
    return {
      shapes: best!.shapes.map(([w, h]) => [Math.min(w, cols), h] as Shape),
      before: best!.sim.before,
    };
  });
}
