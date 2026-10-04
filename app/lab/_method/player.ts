"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { KERNELS, Sim, type Kernel } from "./sgs";
import { onFrame } from "./ticker";

// Drives one SGS simulation (and optionally a uniform twin that shares its
// configurations) for a group of figures, and follows one environment
// through the loop so the figures can label each step.

export const STEPS = ["Roll out", "Record", "Rescore", "Sample"] as const;
/** Seconds each of Record, Rescore and Sample is shown for. */
export const STEP_S = 0.5;

// Toy settings, chosen so the picture reads; the figures label them.
export const TOY = {
  H: 20,
  envsPerConfig: 16,
  kernel: KERNELS.toy,
};

// Raster sizes by viewport width. Keep in step with RASTER_ASPECT.
export const LAYOUTS = [
  { min: 1920, cols: 34, rows: 10 },
  { min: 1024, cols: 24, rows: 10 },
  { min: 768, cols: 18, rows: 12 },
  { min: 0, cols: 12, rows: 16 },
];
export const RASTER_ASPECT =
  "aspect-[12/16] md:aspect-[18/12] lg:aspect-[24/10] min-[1920px]:aspect-[34/10]";

export type Follow = {
  /** 0 Roll out, 1 Record, 2 Rescore, 3 Sample. */
  step: number;
  /** Sim time the followed episode ended, and how long it ran. */
  t0: number;
  ran: number;
  cfg: number;
  next: number;
  win: boolean;
  before: number;
  after: number;
  count: number;
};

export type PlayerOptions = {
  cols?: number;
  rows?: number;
  /** Also run a uniform sampler on the same configurations. */
  twin?: boolean;
  seed?: number;
  kernel?: Kernel;
  /** Seconds of training before the first frame. */
  warm?: number;
  /** Seconds of training shown when motion is reduced (a still). */
  still?: number;
  /** Seconds before training restarts on a new set. */
  cycle?: number;
};

export class Player {
  sgs: Sim | null = null;
  uni: Sim | null = null;
  playing = true;
  version = 0;
  follow: Follow = {
    step: 0,
    t0: -1e9,
    ran: 0,
    cfg: -1,
    next: -1,
    win: false,
    before: 0,
    after: 0,
    count: 0,
  };
  private cols: number;
  private rows: number;
  private round = 0;
  private reduced = false;
  private hold = 0;
  private readonly opts: PlayerOptions;
  private readonly subs = new Set<() => void>();
  private snap = "";

  constructor(opts: PlayerOptions = {}) {
    this.opts = opts;
    this.cols = opts.cols ?? 24;
    this.rows = opts.rows ?? 10;
  }

  get kernel() {
    return this.opts.kernel ?? TOY.kernel;
  }

  /** Called by the main raster when the viewport picks another layout. */
  layout(cols: number, rows: number) {
    if (cols === this.cols && rows === this.rows) return;
    this.cols = cols;
    this.rows = rows;
    if (this.sgs) this.build();
  }

  ensure() {
    if (!this.sgs) this.build();
    return this.sgs!;
  }

  setReduced(reduced: boolean) {
    this.reduced = reduced;
    this.playing = !reduced;
    if (this.sgs) this.build();
    this.emit();
  }

  toggle() {
    this.playing = !this.playing;
    this.emit();
  }

  /** Restart training from scratch on the same set. */
  restart() {
    this.build();
    this.emit();
  }

  tick(dt: number) {
    const sgs = this.ensure();
    if (!this.playing) return;
    if (this.hold > 0) {
      this.hold -= dt;
      if (this.hold <= 0) {
        this.round++;
        this.build();
      }
      return;
    }
    sgs.advance(dt);
    this.uni?.advance(dt);
    const f = this.follow;
    const e = sgs.time - f.t0;
    const step = e < STEP_S ? 1 : e < 2 * STEP_S ? 2 : e < 3 * STEP_S ? 3 : 0;
    if (step !== f.step) {
      f.step = step;
      this.emit();
    }
    const cycle = this.opts.cycle ?? 50;
    if (sgs.time > cycle || sgs.mean() > 0.93) this.hold = 2.5;
  }

  subscribe = (fn: () => void) => {
    this.subs.add(fn);
    return () => void this.subs.delete(fn);
  };

  /** A string that changes whenever the labels or controls should. */
  snapshot = () => this.snap;

  private emit() {
    this.snap = `${this.follow.step}|${this.playing ? 1 : 0}|${this.version}|${this.follow.count}`;
    this.subs.forEach((fn) => fn());
  }

  private build() {
    const base = {
      cols: this.cols,
      rows: this.rows,
      envs: this.cols * this.rows * TOY.envsPerConfig,
      H: TOY.H,
      kernel: this.kernel,
      seed: (this.opts.seed ?? 3) + this.round * 101,
    };
    const sgs = new Sim({ ...base, sampler: "sgs" });
    const uni = this.opts.twin
      ? new Sim({ ...base, sampler: "uniform" })
      : null;
    // The followed environment idles while its loop is spelled out.
    sgs.gap[0] = 3 * STEP_S;
    const f = this.follow;
    f.t0 = -1e9;
    f.step = 0;
    sgs.onEnd = (ev) => {
      if (ev.env !== 0) return;
      f.t0 = ev.time;
      f.ran = ev.time - ev.start;
      f.cfg = ev.cfg;
      f.next = ev.next;
      f.win = ev.win;
      f.before = ev.before;
      f.after = ev.after;
      f.count++;
    };
    const warm = this.reduced ? (this.opts.still ?? 14) : (this.opts.warm ?? 3);
    sgs.fastForward(warm);
    uni?.fastForward(warm);
    this.sgs = sgs;
    this.uni = uni;
    this.hold = 0;
    this.version++;
    this.emit();
  }
}

/**
 * One player per group of figures. It advances while `root` is on screen,
 * shows a still when the reader prefers reduced motion, and is shared by
 * passing it to each figure.
 */
export function usePlayer(
  root: React.RefObject<Element | null>,
  opts: PlayerOptions = {},
) {
  const [player] = useState(() => new Player(opts));
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    player.setReduced(mq.matches);
    const onChange = () => player.setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    const off = onFrame(el, (dt) => player.tick(dt), 0);
    return () => {
      off();
      mq.removeEventListener("change", onChange);
    };
  }, [player, root]);
  return player;
}

/** Re-render on step, play state and rebuilds. Server snapshot: "". */
export function usePlayerState(player: Player) {
  return useSyncExternalStore(player.subscribe, player.snapshot, () => "");
}
