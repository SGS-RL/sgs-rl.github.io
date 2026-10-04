// A small simulation of Success-Guided Sampling (SGS) for the method
// figures. No DOM; the figures draw from it.
//
// Follows the paper (as explained in the labmate's write-up):
// - A fixed set of N task configurations. Every episode starts from one.
// - Each configuration keeps a ring buffer of its last H Boolean outcomes.
//   The buffer starts full of zeros, so p̂ = successes / H and a
//   configuration that was never tried reads 0.
// - Beta kernel in mode–concentration form, Beta(1 + κt, 1 + κ(1 − t)):
//     w = (p̂ + ε)^(κt) · (1 − p̂ + ε)^(κ(1 − t)), floored at ε
//     ℓ = log(w + ε),  P(i) = softmax(ℓ / T)
// - Asynchronous loop: whenever any environment finishes an episode, the
//   outcome is recorded against its configuration, that configuration is
//   rescored, and the environment is handed a new draw.
//
// A stand-in, not the paper:
// - The policy. Each configuration has a true success probability
//   p = σ(z). An episode with outcome o moves z by rate · |o − p| on its
//   configuration and a share of that on its grid neighbours (similar
//   configurations). The expected signal per episode is 2p(1 − p): always
//   solved or never solved teaches nothing. Difficulty is a hidden field
//   over the grid; SGS never sees it.
// - Sizes. N, the number of environments, H and the kernel are chosen so
//   the picture reads; the figures say so.

export type Kernel = { t: number; kappa: number; T: number; eps: number };

// t and κ: paper default κ = 1, t = 0.5; locomotion κ = 5, t = 0.66;
// manipulation ε = 1e-4 (from the explainer). T = 2 and ε = 1e-8 are the
// explainer's values; the paper's T is still to be checked.
export const KERNELS = {
  paper: { t: 0.5, kappa: 1, T: 2, eps: 1e-8 },
  loco: { t: 0.66, kappa: 5, T: 2, eps: 1e-8 },
  manip: { t: 0.5, kappa: 1, T: 2, eps: 1e-4 },
  // Sharper, so a small toy shows the effect (the explainer's choice too).
  toy: { t: 0.5, kappa: 10, T: 2, eps: 1e-8 },
} satisfies Record<string, Kernel>;

export function weight(p: number, k: Kernel) {
  const w =
    Math.pow(p + k.eps, k.kappa * k.t) *
    Math.pow(1 - p + k.eps, k.kappa * (1 - k.t));
  return Math.max(w, k.eps);
}

/** ℓ / T: the softmax input for a configuration with tracked rate p. */
export const score = (p: number, k: Kernel) =>
  Math.log(weight(p, k) + k.eps) / k.T;

/** Sampling probability at p relative to the most likely p (peak = 1). */
export function relative(k: Kernel) {
  let top = score(Math.min(1, Math.max(0, k.t)), k);
  for (let j = 0; j <= 200; j++) top = Math.max(top, score(j / 200, k));
  return (p: number) => Math.exp(score(p, k) - top);
}

/** How many times likelier the most likely p̂ is than p̂ = 0. */
export const oddsVsUnsolved = (k: Kernel) => 1 / relative(k)(0);

// splitmix32: small, seedable, and the same stream in every JS engine.
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x9e3779b9) >>> 0;
    let z = s;
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b);
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35);
    z ^= z >>> 16;
    return (z >>> 0) / 4294967296;
  };
}

/** 0: too hard (p < 0.1), 1: in between, 2: mastered (p > 0.9). */
export const band = (p: number) => (p < 0.1 ? 0 : p > 0.9 ? 2 : 1);

export type SimOptions = {
  cols: number;
  rows: number;
  /** Parallel environments. */
  envs: number;
  /** Window length per configuration. */
  H: number;
  kernel: Kernel;
  sampler: "sgs" | "uniform";
  seed: number;
  /** Seconds a failed episode runs before it times out. */
  horizon?: number;
  /** Learning step per unit of signal. */
  rate?: number;
  /** How far learning carries to neighbouring configurations, in cells. */
  reach?: number;
  /** Slope of the untrained policy's success against difficulty. */
  steep?: number;
  /** Difficulty the untrained policy solves half the time. */
  start?: number;
};

export type Env = {
  cfg: number;
  /** The configuration of the previous episode (-1 before the first). */
  prev: number;
  /** When the current episode starts (after any idle gap) and ends. */
  start: number;
  end: number;
  win: boolean;
  /** When `cfg` was drawn, i.e. when the previous episode ended. */
  drawn: number;
};

export type EpisodeEnd = {
  env: number;
  cfg: number;
  /** When the episode started and ended. */
  start: number;
  time: number;
  win: boolean;
  before: number;
  after: number;
  next: number;
};

const RECENT = 2048;
const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

export class Sim {
  readonly N: number;
  readonly cols: number;
  readonly rows: number;
  readonly H: number;
  readonly sampler: "sgs" | "uniform";
  readonly kernel: Kernel;
  /** Hidden difficulty, about 0..1. Only the stand-in policy uses it. */
  readonly difficulty: Float64Array;
  /** True success probability of the current policy. */
  readonly p: Float64Array;
  /** Tracked success rate, the only thing SGS sees. */
  readonly phat: Float64Array;
  readonly wins: Int32Array;
  readonly tries: Int32Array;
  /** Environments currently assigned to each configuration. */
  readonly running: Int32Array;
  readonly envs: Env[];
  /** Idle time after an episode ends, per environment (for figures). */
  readonly gap: Float64Array;
  /** Mean true success over the whole set, sampled every `curveDt` s. */
  readonly curve: number[] = [];
  readonly curveDt = 0.5;
  time = 0;
  episodes = 0;
  onEnd: ((e: EpisodeEnd) => void) | null = null;

  private readonly z: Float64Array;
  private readonly win: Uint8Array;
  private readonly head: Int32Array;
  /** Softmax numerator for a configuration with k wins in its window. */
  private readonly table: Float64Array;
  // Configurations grouped by wins: bucket k is perm[start[k]..start[k+1]).
  private readonly perm: Int32Array;
  private readonly pos: Int32Array;
  private readonly start: Int32Array;
  private readonly nbr: Int32Array[];
  private readonly nbrW: Float64Array[];
  private readonly rand: () => number;
  readonly horizon: number;
  private readonly rate: number;
  private readonly recent = new Uint8Array(RECENT);
  private readonly recentCount = [0, 0, 0];
  private recentN = 0;

  constructor(o: SimOptions) {
    const { cols, rows, H } = o;
    const N = cols * rows;
    this.N = N;
    this.cols = cols;
    this.rows = rows;
    this.H = H;
    this.sampler = o.sampler;
    this.kernel = o.kernel;
    this.horizon = o.horizon ?? 2;
    this.rate = o.rate ?? 0.0013;
    const steep = o.steep ?? 12;
    const easy = o.start ?? 0.12;
    const reach = o.reach ?? 2.8;

    // Hidden difficulty: distance from an easy region of task space, bent
    // by a few smooth bumps so the frontier is not a perfect circle. It
    // depends only on the seed, so twin simulations share it.
    const field = rng(o.seed);
    const ox = 0.28 * (cols - 1);
    const oy = 0.62 * (rows - 1);
    const scale = Math.max(cols, rows);
    const bumps = Array.from({ length: 5 }, (_, j) => ({
      x: field() * (cols - 1),
      y: field() * (rows - 1),
      s: (0.08 + 0.1 * field()) * scale,
      a: (j % 2 ? -0.06 : 0.08) * (0.6 + field()),
    }));
    let far = 0;
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++)
        far = Math.max(far, Math.hypot(x - ox, (y - oy) * 1.1));
    this.difficulty = new Float64Array(N);
    this.z = new Float64Array(N);
    this.p = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      const x = i % cols;
      const y = (i / cols) | 0;
      let d = (0.85 * Math.hypot(x - ox, (y - oy) * 1.1)) / far;
      for (const b of bumps)
        d +=
          b.a * Math.exp(-((x - b.x) ** 2 + (y - b.y) ** 2) / (2 * b.s * b.s));
      d += (field() - 0.5) * 0.05;
      this.difficulty[i] = Math.max(0, d);
      // Untrained policy: only the easiest configurations ever succeed.
      this.z[i] = steep * (easy - this.difficulty[i]);
      this.p[i] = sigmoid(this.z[i]);
    }

    // Grid neighbours stand for similar configurations: what the policy
    // learns on one carries over to those nearby, falling off with distance.
    this.nbr = [];
    this.nbrW = [];
    const R = Math.ceil(reach * 1.8);
    for (let i = 0; i < N; i++) {
      const x = i % cols;
      const y = (i / cols) | 0;
      const n: number[] = [];
      const w: number[] = [];
      for (let dy = -R; dy <= R; dy++)
        for (let dx = -R; dx <= R; dx++) {
          const d2 = dx * dx + dy * dy;
          const nx = x + dx;
          const ny = y + dy;
          if (!d2 || d2 > R * R) continue;
          if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
          n.push(ny * cols + nx);
          w.push(Math.exp(-d2 / (2 * reach * reach)));
        }
      this.nbr.push(Int32Array.from(n));
      this.nbrW.push(Float64Array.from(w));
    }

    this.phat = new Float64Array(N);
    this.wins = new Int32Array(N);
    this.tries = new Int32Array(N);
    this.running = new Int32Array(N);
    this.win = new Uint8Array(N * H);
    this.head = new Int32Array(N);

    // p̂ only takes the values k / H, so every configuration's softmax
    // numerator is one of H + 1 numbers.
    this.table = new Float64Array(H + 1);
    const rel = relative(o.kernel);
    for (let k = 0; k <= H; k++)
      this.table[k] = o.sampler === "uniform" ? 1 : rel(k / H);
    this.perm = new Int32Array(N);
    this.pos = new Int32Array(N);
    for (let i = 0; i < N; i++) this.perm[i] = this.pos[i] = i;
    this.start = new Int32Array(H + 2).fill(N);
    this.start[0] = 0;

    this.rand = rng(o.seed * 7919 + (o.sampler === "uniform" ? 1 : 2));
    this.gap = new Float64Array(o.envs);
    this.envs = [];
    for (let e = 0; e < o.envs; e++) {
      const env: Env = {
        cfg: 0,
        prev: -1,
        start: 0,
        end: 0,
        win: false,
        drawn: 0,
      };
      this.assign(env, this.draw(), 0);
      // Stagger the first episodes so the environments run out of step.
      env.end *= this.rand();
      this.envs.push(env);
    }
    this.curve.push(this.mean());
  }

  /** Relative sampling weight of configuration i (most likely p̂ = 1). */
  rel(i: number) {
    return this.table[this.wins[i]];
  }

  /** Mean true success over the whole set, as evaluation measures it. */
  mean() {
    let s = 0;
    for (let i = 0; i < this.N; i++) s += this.p[i];
    return s / this.N;
  }

  /** Share of the latest episodes started in each band of true success. */
  shares(): [number, number, number] {
    const n = Math.min(this.recentN, RECENT) || 1;
    const c = this.recentCount;
    return [c[0] / n, c[1] / n, c[2] / n];
  }

  /** The window of configuration i, oldest first; -1 is an initial zero. */
  window(i: number, out: number[] = []) {
    out.length = 0;
    const H = this.H;
    const filled = Math.min(this.tries[i], H);
    for (let j = 0; j < H; j++) {
      const slot = (this.head[i] + j) % H;
      out.push(j >= H - filled ? this.win[i * H + slot] : -1);
    }
    return out;
  }

  advance(dt: number) {
    const t1 = this.time + dt;
    for (let e = 0; e < this.envs.length; e++) {
      const env = this.envs[e];
      while (env.end <= t1) this.finish(e, env);
    }
    const before = Math.floor(this.time / this.curveDt);
    this.time = t1;
    if (Math.floor(t1 / this.curveDt) > before) this.curve.push(this.mean());
  }

  /** Run without drawing, in small steps, for `seconds` of sim time. */
  fastForward(seconds: number, step = 1 / 20) {
    for (let t = 0; t < seconds - 1e-9; t += step) this.advance(step);
  }

  private draw() {
    if (this.sampler === "uniform") return Math.floor(this.rand() * this.N);
    const { table, start, perm, H } = this;
    let total = 0;
    for (let k = 0; k <= H; k++) total += (start[k + 1] - start[k]) * table[k];
    let u = this.rand() * total;
    for (let k = 0; k <= H; k++) {
      const m = (start[k + 1] - start[k]) * table[k];
      if (u < m) {
        const n = start[k + 1] - start[k];
        return perm[start[k] + Math.min(n - 1, Math.floor(u / table[k]))];
      }
      u -= m;
    }
    return perm[this.N - 1];
  }

  private assign(env: Env, cfg: number, at: number) {
    env.cfg = cfg;
    env.drawn = at;
    env.start = at;
    env.win = this.rand() < this.p[cfg];
    const h = this.horizon;
    // A success ends the episode early; a failure runs to the time limit.
    env.end =
      at +
      (env.win
        ? h * (0.3 + 0.5 * this.rand())
        : h * (0.92 + 0.08 * this.rand()));
    this.running[cfg]++;
    const slot = this.recentN % RECENT;
    if (this.recentN >= RECENT) this.recentCount[this.recent[slot]]--;
    const b = band(this.p[cfg]);
    this.recent[slot] = b;
    this.recentCount[b]++;
    this.recentN++;
  }

  // Move configuration i from bucket k to the adjacent bucket k ± 1.
  private rebucket(i: number, k: number, up: boolean) {
    const { perm, pos, start } = this;
    const at = up ? start[k + 1] - 1 : start[k];
    const j = perm[at];
    perm[at] = i;
    perm[pos[i]] = j;
    pos[j] = pos[i];
    pos[i] = at;
    if (up) start[k + 1]--;
    else start[k]++;
  }

  private finish(e: number, env: Env) {
    const i = env.cfg;
    const o = env.win ? 1 : 0;
    const before = this.phat[i];

    // Record: the outcome replaces the oldest slot of the window.
    const slot = i * this.H + this.head[i];
    const k0 = this.wins[i];
    const k1 = k0 + o - this.win[slot];
    this.win[slot] = o;
    this.head[i] = (this.head[i] + 1) % this.H;
    this.tries[i]++;
    this.wins[i] = k1;
    this.phat[i] = k1 / this.H;
    // Rescore: only this configuration's weight changed.
    if (k1 !== k0) this.rebucket(i, k0, k1 > k0);

    // Stand-in learner: signal |o − p|, shared with similar configurations.
    const g = this.rate * Math.abs(o - this.p[i]);
    if (g > 1e-6) {
      this.bump(i, g);
      const n = this.nbr[i];
      const w = this.nbrW[i];
      for (let j = 0; j < n.length; j++) this.bump(n[j], g * w[j]);
    }

    this.running[i]--;
    this.episodes++;

    // Sample: draw a new configuration and hand it to this environment.
    const at = env.end;
    const began = env.start;
    env.prev = i;
    this.assign(env, this.draw(), at);
    const gap = this.gap[e];
    if (gap > 0) {
      env.start += gap;
      env.end += gap;
    }
    this.onEnd?.({
      env: e,
      cfg: i,
      start: began,
      time: at,
      win: o === 1,
      before,
      after: this.phat[i],
      next: env.cfg,
    });
  }

  private bump(i: number, dz: number) {
    this.z[i] = Math.min(6, this.z[i] + dz);
    this.p[i] = sigmoid(this.z[i]);
  }
}
