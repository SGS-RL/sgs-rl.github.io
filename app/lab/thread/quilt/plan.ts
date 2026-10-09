// Layouts for the larger thread quilts (./ThreadQuilt.tsx): one fixed grid
// of cols x rows, filled in order (row flow, as the site's quilt), each
// cell's shape picked by a seeded search (hill climbing from random
// starts), so the same layout comes out every time. Flat colour cells fill what the shapes leave; the search
// keeps them few, fills exactly the grid's rows, keeps each robot's label
// out of the column of the label before it, opens each robot with a wide
// or big clip, and spreads a few big squares apart.

export type Shape = readonly [w: number, h: number];
export type Slot = {
  kind: "index" | "label" | "clip";
  // The first clip of a robot's group.
  first?: boolean;
  options: readonly Shape[];
};
export type Plan = { shapes: Shape[]; before: number[] };

type Sim = { before: number[]; row: number[]; col: number[]; rows: number };

// CSS grid row flow ("sparse" auto-placement): each item goes at the first
// place at or after the previous item's start where it fits; the free cells
// it skips get a flat cell each, as do those after the last item.
function simulate(shapes: readonly Shape[], cols: number, rows: number): Sim {
  const occ: boolean[][] = [];
  const free = (r: number, c: number) => !occ[r]?.[c];
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
  shapes.forEach(([w, h], k) => {
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
    for (let y = r; y < r + h; y++) {
      occ[y] ??= [];
      for (let x = c; x < c + w; x++) occ[y][x] = true;
    }
    row[k] = r;
    col[k] = c;
    cr = r;
    cc = c;
  });
  const used = Math.max(occ.length, rows);
  let end = 0;
  for (let r = cr; r < used; r++)
    for (let c = r === cr ? cc : 0; c < cols; c++) if (free(r, c)) end++;
  before[shapes.length] = end;
  return { before, row, col, rows: occ.length };
}

function score(
  slots: readonly Slot[],
  shapes: readonly Shape[],
  s: Sim,
  cols: number,
  rows: number,
  bigs: number,
) {
  const flats = s.before.reduce((a, b) => a + b, 0);
  // Too many rows, and (so that one change at a time can get there) the
  // area beyond the grid's.
  const area = shapes.reduce((a, [w, h]) => a + w * h, 0);
  let x = flats * 2 + Math.abs(s.rows - rows) * 100;
  x += Math.max(0, area - rows * cols) * 10;
  const labels = slots.flatMap((sl, k) => (sl.kind === "label" ? [k] : []));
  labels.forEach((k, i) => {
    if (i > 0 && s.col[k] === s.col[labels[i - 1]]) x += 8;
    // A label alone at a row's end, its clips on the next row.
    if (s.row[k + 1] > s.row[k] && s.col[k + 1] < s.col[k]) x += 3;
  });
  const firstClip = slots.findIndex((sl) => sl.kind === "clip");
  slots.forEach((sl, k) => {
    if (sl.first && shapes[k][0] * shapes[k][1] === 1) x += 1;
  });
  // The UR5e's nut opens the clips in a big square, as on the site.
  if (shapes[firstClip][1] === 2) x -= 2;
  const big = shapes.flatMap(([w, h], k) =>
    slots[k].kind === "clip" && w * h === 4 ? [k] : [],
  );
  x += Math.abs(big.length - bigs) * 1.5;
  big.forEach((k, i) => {
    if (i > 0 && Math.abs(s.row[k] - s.row[big[i - 1]]) < 2) x += 3;
  });
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

export function plan(
  slots: readonly Slot[],
  cols: number,
  rows: number,
  bigs: number,
  starts = 24,
  steps = 2500,
): Plan {
  const rand = rng(4099 + cols * 131 + slots.length);
  const pick = (sl: Slot) => sl.options[Math.floor(rand() * sl.options.length)];
  const judge = (shapes: Shape[]) => {
    const sim = simulate(shapes, cols, rows);
    return { shapes, sim, s: score(slots, shapes, sim, cols, rows, bigs) };
  };
  let best: ReturnType<typeof judge> | null = null;
  for (let r = 0; r < starts; r++) {
    // From random shapes, change one cell at a time; keep a change that
    // scores no worse.
    let cur = judge(slots.map(pick));
    for (let i = 0; i < steps; i++) {
      const k = Math.floor(rand() * slots.length);
      if (slots[k].options.length < 2) continue;
      const shapes = cur.shapes.slice();
      shapes[k] = pick(slots[k]);
      const next = judge(shapes);
      if (next.s <= cur.s) cur = next;
    }
    if (!best || cur.s < best.s) best = cur;
  }
  return { shapes: best!.shapes, before: best!.sim.before };
}

// A permutation of 0..n-1, the same every time: the order in which the
// clip cells change, so cells next to each other change apart.
export function shuffled(n: number, seed = 77) {
  const rand = rng(seed);
  const a = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
