import { CURVE, TASKS } from "../_combined/learningData";

// The waterproof connector's data for the thread overlays
// (SamplingOverlay.tsx, Telemetry.tsx), from Method part 03.
export const RED = "#e4321b";
export const INK = "#111";
export const MUTE = "#8c8c87";
export const TASK = TASKS.find((t) => t.key === "waterproof")!;
export const SRC = "/media/library/thread/waterproof-1920.mp4";
export const N = TASK.trials;
// Success rates where SGS gives at least 0.9x its peak weight.
const HIGH = CURVE.flatMap((v, k) => (v >= 0.9 ? [k] : []));
export const BAND = [HIGH[0] / N, HIGH[HIGH.length - 1] / N] as const;
export const MAX_IT = Math.max(...TASK.rows.map((r) => r.it));
export const FOOTAGE = new Set(TASK.clips.map((c) => c.it));
export const fmt = (n: number) => n.toLocaleString("en-US");
export { CURVE };

export function clipAt(f: number) {
  const i = TASK.clips.findIndex((c) => f >= c.start && f <= c.end);
  return i < 0 ? 0 : i;
}
