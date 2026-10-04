// The navigation toy for the method figures: a point robot in a maze. Every
// episode starts at the same cell; the task configuration is the goal. No
// DOM; the figures draw from it.
//
// The sampler is the paper's (kernel and scoring from ../_method/sgs). The
// rest is a stand-in:
// - The policy. Each goal has a success rate p = σ(z). It starts high next
//   to the start and falls with path length, more past the doorway, down
//   to a floor, so the far room starts out of reach.
// - The learner. After an episode on goal i with outcome o, z_i moves up by
//   rate · |o − p_i|, and goals one step away in the maze (never through a
//   wall) by a share of that. The expected step is 2 p_i (1 − p_i): a goal
//   that is always or never reached teaches nothing. What is learned spills
//   to neighbours, so the reached region grows outward through the doors.
// - Failure. A robot that will miss its goal stops part of the way there.

import { KERNELS, relative, rng, score, type Kernel } from "../_method/sgs";

// '#' wall, 'S' start, '.' free. Three rooms: a doorway in the first wall,
// a gap at the top of the second, and a shelf that makes a pocket in the
// last room.
export const MAZE = [
  "......#...........",
  "......#...........",
  "......#.....#.....",
  "......#.....#.....",
  ".S..........#.....",
  "......#.....#.....",
  "......#.....#.....",
  "......#.....#.####",
  "......#.....#.....",
  "......#.....#.....",
];

export type World = {
  cols: number;
  rows: number;
  wall: Uint8Array;
  start: number;
  /** Cell index of each goal. */
  goals: number[];
  /** Goal index of each cell, −1 for walls and the start. */
  goalOf: Int32Array;
  /** Cells from the start (excluded) to each goal (included). */
  path: number[][];
  /** Shortest-path length to each goal, in cells. */
  dist: Float64Array;
};

const STEPS: [number, number, number][] = [
  [1, 0, 1],
  [-1, 0, 1],
  [0, 1, 1],
  [0, -1, 1],
  [1, 1, Math.SQRT2],
  [1, -1, Math.SQRT2],
  [-1, 1, Math.SQRT2],
  [-1, -1, Math.SQRT2],
];

export function makeWorld(maze = MAZE): World {
  const rows = maze.length;
  const cols = maze[0].length;
  const wall = new Uint8Array(rows * cols);
  let start = 0;
  const goals: number[] = [];
  const goalOf = new Int32Array(rows * cols).fill(-1);
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const k = r * cols + c;
      const ch = maze[r][c];
      if (ch === "#") wall[k] = 1;
      else if (ch === "S") start = k;
      else {
        goalOf[k] = goals.length;
        goals.push(k);
      }
    }

  // Shortest paths from the start: 8-connected, no cutting past a wall's
  // corner. The grid is small, so a linear scan for the next node will do.
  const open = (c: number, r: number) =>
    c >= 0 && r >= 0 && c < cols && r < rows && !wall[r * cols + c];
  const d = new Float64Array(rows * cols).fill(Infinity);
  const from = new Int32Array(rows * cols).fill(-1);
  const done = new Uint8Array(rows * cols);
  d[start] = 0;
  for (;;) {
    let u = -1;
    for (let k = 0; k < d.length; k++)
      if (!done[k] && d[k] < Infinity && (u < 0 || d[k] < d[u])) u = k;
    if (u < 0) break;
    done[u] = 1;
    const uc = u % cols;
    const ur = (u - uc) / cols;
    for (const [dc, dr, cost] of STEPS) {
      const vc = uc + dc;
      const vr = ur + dr;
      if (!open(vc, vr)) continue;
      if (dc && dr && (!open(uc + dc, ur) || !open(uc, ur + dr))) continue;
      const v = vr * cols + vc;
      if (d[u] + cost < d[v]) {
        d[v] = d[u] + cost;
        from[v] = u;
      }
    }
  }
  const path = goals.map((g) => {
    const out: number[] = [];
    for (let k = g; k !== start; k = from[k]) out.push(k);
    return out.reverse();
  });
  const dist = Float64Array.from(goals, (g) => d[g]);
  return { cols, rows, wall, start, goals, goalOf, path, dist };
}

/** Walls next to a cell, counting its four sides (the map edge is not a wall). */
function wallsBeside(w: World, k: number) {
  const c = k % w.cols;
  const r = (k - c) / w.cols;
  let n = 0;
  if (c > 0 && w.wall[k - 1]) n++;
  if (c < w.cols - 1 && w.wall[k + 1]) n++;
  if (r > 0 && w.wall[k - w.cols]) n++;
  if (r < w.rows - 1 && w.wall[k + w.cols]) n++;
  return n;
}

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
// Success never quite reaches 1, so even a learned goal is sometimes missed.
const Z_MAX = 4.5;

export type LearnOptions = {
  /** Starting logit of a goal next to the start. */
  base: number;
  /** Logit lost per cell of path, and once more for passing the doorway. */
  slope: number;
  door: number;
  /** The lowest starting logit: far goals all start about this hard. */
  floor: number;
  /** Step size of the learner (logit units per unit of |o − p|). */
  rate: number;
  /** Share of a step that neighbouring goals get. */
  spill: number;
};

export const LEARN: LearnOptions = {
  base: 4,
  slope: 0.9,
  door: 1.5,
  floor: -5,
  rate: 0.6,
  spill: 0.45,
};

/** The policy: each goal's success rate, as a logit. */
export class Policy {
  readonly w: World;
  readonly opts: LearnOptions;
  readonly z: Float64Array;
  /** True success rate of each goal. */
  readonly p: Float64Array;
  /** Goals one step apart in the maze (never through a wall). */
  readonly near: number[][];

  constructor(w: World, opts: LearnOptions = LEARN) {
    this.w = w;
    this.opts = opts;
    const N = w.goals.length;
    this.z = Float64Array.from(w.path, (path) => {
      const door = path.some((k) => wallsBeside(w, k) >= 2);
      const z = opts.base - opts.slope * (path.length - 1);
      return Math.max(opts.floor, z - (door ? opts.door : 0));
    });
    this.p = Float64Array.from(this.z, sigmoid);
    this.near = Array.from({ length: N }, () => []);
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++) {
        const a = w.goals[i];
        const b = w.goals[j];
        const dc = Math.abs((a % w.cols) - (b % w.cols));
        const dr = Math.abs(Math.floor(a / w.cols) - Math.floor(b / w.cols));
        // Side by side, or diagonal with both corners open.
        if (i === j || dc > 1 || dr > 1) continue;
        if (dc && dr) {
          const c1 = Math.floor(a / w.cols) * w.cols + (b % w.cols);
          const c2 = Math.floor(b / w.cols) * w.cols + (a % w.cols);
          if (w.wall[c1] || w.wall[c2]) continue;
        }
        this.near[i].push(j);
      }
  }

  /**
   * Roll out goal i. Returns how far along the path the robot got: the
   * path length on success, else a point part of the way there.
   */
  rollout(i: number, rand: () => number) {
    const L = this.w.path[i].length;
    if (rand() < this.p[i]) return L;
    return Math.floor(L * (0.3 + 0.65 * rand()));
  }

  private bump(i: number, by: number) {
    this.z[i] = Math.min(Z_MAX, this.z[i] + by);
    this.p[i] = sigmoid(this.z[i]);
  }

  learn(i: number, win: boolean) {
    const step = this.opts.rate * Math.abs(+win - this.p[i]);
    this.bump(i, step);
    for (const j of this.near[i]) this.bump(j, step * this.opts.spill);
  }
}

export type Sampler = "sgs" | "uniform";

/** SGS bookkeeping: a window of the last H outcomes per goal, and P(i). */
export class Tracker {
  readonly N: number;
  readonly H: number;
  readonly kernel: Kernel;
  readonly sampler: Sampler;
  readonly ring: Uint8Array;
  readonly head: Int32Array;
  readonly wins: Int32Array;
  readonly tries: Int32Array;
  /** exp(ℓ_i / T), unnormalised. */
  readonly mass: Float64Array;
  total = 0;

  constructor(N: number, sampler: Sampler, H = 10, kernel = KERNELS.paper) {
    this.N = N;
    this.H = H;
    this.kernel = kernel;
    this.sampler = sampler;
    this.ring = new Uint8Array(N * H);
    this.head = new Int32Array(N);
    this.wins = new Int32Array(N);
    this.tries = new Int32Array(N);
    this.mass = new Float64Array(N);
    for (let i = 0; i < N; i++) this.rescore(i);
  }

  phat(i: number) {
    return this.wins[i] / this.H;
  }

  private rescore(i: number) {
    const m =
      this.sampler === "sgs" ? Math.exp(score(this.phat(i), this.kernel)) : 1;
    this.total += m - this.mass[i];
    this.mass[i] = m;
  }

  /** P(i), the probability the next draw is goal i. */
  prob(i: number) {
    return this.mass[i] / this.total;
  }

  record(i: number, win: boolean) {
    const at = i * this.H + this.head[i];
    this.wins[i] += +win - this.ring[at];
    this.ring[at] = +win;
    this.head[i] = (this.head[i] + 1) % this.H;
    this.tries[i]++;
    this.rescore(i);
  }

  draw(rand: () => number) {
    let r = rand() * this.total;
    for (let i = 0; i < this.N; i++) {
      r -= this.mass[i];
      if (r <= 0) return i;
    }
    return this.N - 1;
  }
}

/** Goals the policy reaches in at least 90% of episodes. */
export const mastered = (p: ArrayLike<number>) => {
  let n = 0;
  for (let i = 0; i < p.length; i++) if (p[i] >= 0.9) n++;
  return n;
};

export type Robot = {
  goal: number;
  /** Seconds since the episode began. */
  t: number;
  /** Cells along the path the robot gets through before it stops. */
  reach: number;
  win: boolean;
  /** Seed for the wobble of a robot that stalls. */
  wobble: number;
};

export type TrainOptions = {
  sampler: Sampler;
  robots: number;
  /** Episode length in seconds; a robot that arrives waits at its goal. */
  episode: number;
  /** Robot speed in cells per second. */
  speed: number;
  seed: number;
  H?: number;
  kernel?: Kernel;
  learn?: LearnOptions;
};

/** Parallel robots training one policy, each episode's goal from a sampler. */
export class Training {
  readonly w: World;
  readonly policy: Policy;
  readonly tracker: Tracker;
  readonly robots: Robot[];
  readonly opts: TrainOptions;
  readonly rand: () => number;
  episodes = 0;

  constructor(w: World, opts: TrainOptions) {
    this.w = w;
    this.opts = opts;
    this.rand = rng(opts.seed);
    this.policy = new Policy(w, opts.learn);
    this.tracker = new Tracker(
      w.goals.length,
      opts.sampler,
      opts.H,
      opts.kernel,
    );
    // Staggered, so episodes end one at a time rather than all at once.
    this.robots = Array.from({ length: opts.robots }, (_, k) => {
      const r = this.begin();
      r.t = (k / opts.robots) * opts.episode;
      return r;
    });
  }

  private begin(): Robot {
    const goal = this.tracker.draw(this.rand);
    const reach = this.policy.rollout(goal, this.rand);
    return {
      goal,
      t: 0,
      reach,
      win: reach === this.w.path[goal].length,
      wobble: this.rand() * 1000,
    };
  }

  /** Advance by dt seconds. Each finished episode updates the policy and the tracker, then the robot starts over. */
  step(dt: number) {
    const { episode } = this.opts;
    for (let k = 0; k < this.robots.length; k++) {
      const r = this.robots[k];
      r.t += dt;
      while (r.t >= episode) {
        const over = r.t - episode;
        this.tracker.record(r.goal, r.win);
        this.policy.learn(r.goal, r.win);
        this.episodes++;
        const next = this.begin();
        next.t = over;
        this.robots[k] = next;
        if (over < episode) break;
      }
    }
  }
}

/**
 * Where a robot is at time t: along its path at `speed` cells per second
 * until it arrives or stalls; a stalled robot wobbles in place. Returns
 * grid coordinates of the centre (column + 0.5, row + 0.5).
 */
export function robotAt(
  w: World,
  r: Robot,
  t: number,
  speed: number,
  out: { x: number; y: number },
) {
  const path = w.path[r.goal];
  const xy = (k: number) => {
    const c = k % w.cols;
    return [c + 0.5, (k - c) / w.cols + 0.5];
  };
  // A stalled robot crawls the last stretch before the cell it fails in.
  const stop = r.win ? path.length : Math.max(0, r.reach - 0.35);
  const s = Math.min(stop, t * speed * (r.win ? 1 : 0.8));
  const a = Math.floor(s);
  const f = s - a;
  const [x0, y0] = xy(a === 0 ? w.start : path[a - 1]);
  const [x1, y1] = a < path.length ? xy(path[a]) : [x0, y0];
  out.x = x0 + (x1 - x0) * f;
  out.y = y0 + (y1 - y0) * f;
  if (!r.win && s >= stop) {
    const k = r.wobble + t * 2.3;
    out.x += 0.12 * Math.sin(k * 2.1) * Math.cos(k * 0.7);
    out.y += 0.12 * Math.sin(k * 1.7 + 1);
  }
  return out;
}

/** A policy partway through training with uniform sampling, for the still figures. */
export function midTraining(w: World, episodes = 1600, seed = 5) {
  const rand = rng(seed);
  const policy = new Policy(w);
  for (let e = 0; e < episodes; e++) {
    const i = Math.floor(rand() * w.goals.length);
    const win = policy.rollout(i, rand) === w.path[i].length;
    policy.learn(i, win);
  }
  return policy;
}

/** The maze every figure shares. */
export const WORLD = makeWorld();

let still: Policy | null = null;
/** The policy the still figures show, built once. */
export const snapshot = () => (still ??= midTraining(WORLD, 1800, 5));

// The figures use the toy kernel (κ = 10): on 158 goals the paper's κ = 1
// prefers the frontier too gently to see. ε is raised from 1e-8 so the floor
// shows: goals that are always or never reached are still picked now and then.
export const TOY = { ...KERNELS.toy, eps: 1e-6 };

/** The live figure: robots, episode length (s), speed (cells/s), window H. */
export const LIVE = { robots: 48, episode: 2, speed: 13, H: 8 };

/**
 * Share (%) of a sampler's picks that go to goals reached under 10% or over
 * 90% of the time on the snapshot, taking p̂ as the true rate.
 */
export function offEdge(sampler: Sampler) {
  const pick = relative(TOY);
  let all = 0;
  let out = 0;
  for (const x of snapshot().p) {
    const m = sampler === "sgs" ? pick(x) : 1;
    all += m;
    if (x < 0.1 || x > 0.9) out += m;
  }
  return Math.round((out / all) * 100);
}
