"use client";

import "../../_poster/poster.css";
import QuiltDivider, { type QuiltDrive } from "../../_combined/QuiltDivider";
import type { Item } from "../../library";
import "./quilt-frame.css";

// The homepage's quilt (q1, the same clips, halftone and labels) filling a
// 16:9 frame. Each clip cell turns from halftone to video and back once per
// PERIOD, each from its own moment, so at any time about half are in the
// halftone; a change takes CHANGE seconds, through the site's dot screen.
// The time is window.__quiltT, set by the render script, which also seeks
// the videos. The cycle loops after PERIOD seconds.
const PERIOD = 12;
const CHANGE = 0.9;
// The order in which the nine clip cells (page order) change, so cells
// next to each other change apart.
const ORDER = [0, 5, 2, 7, 4, 1, 8, 3, 6];

declare global {
  interface Window {
    __quiltT?: number;
  }
}

const ease = (x: number) => {
  const u = Math.min(1, Math.max(0, x));
  return u * u * (3 - 2 * u);
};

const drive: QuiltDrive = {
  reveal(n) {
    const t = window.__quiltT ?? 0;
    const at = (ORDER.indexOf(n % ORDER.length) / ORDER.length) * PERIOD;
    const u = (((t - at) % PERIOD) + PERIOD) % PERIOD;
    return u < PERIOD / 2
      ? ease(u / CHANGE)
      : 1 - ease((u - PERIOD / 2) / CHANGE);
  },
};

export default function QuiltFrame({ clips }: { clips: Item[] }) {
  return (
    <div className="pz thq">
      <QuiltDivider
        clips={clips}
        direction="toReal"
        variant="q1"
        drive={drive}
      />
    </div>
  );
}
