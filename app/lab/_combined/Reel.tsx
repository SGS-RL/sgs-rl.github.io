"use client";

import { useMemo, type CSSProperties } from "react";
import { Reel, useReel } from "../_reel/engine";
import { ReelBar, ReelPlayer } from "../_reel/parts";
import { line, tracks, type Chapter, type ReelData } from "../_reel/reel";

// The highlight reel with quiet controls, on the shared reel engine (plain
// video, starts muted when half on screen, loops; the segmented bar is
// scrubbable, one segment per chapter). Nothing beyond the video, the bar,
// two icons and the chapter names: no caption, no times, no numbers.
// Click the video to pause, double-click for full screen.
//
// controls:
//   "now"    the chapter on screen, in one line under the bar
//   "under"  every chapter's title under its own segment (phones: "now")
//   "list"   every chapter's title as one line of text, the current one in
//            full ink

export type Controls = "now" | "under" | "list";

const where = (c: Chapter) => (c.domain === "Real" ? "hardware" : "simulation");
// Speed only where it is not real time.
const fast = (c: Chapter) => (c.speed && c.speed !== "1×" ? c.speed : "");

function Glyph({ kind }: { kind: "play" | "pause" | "full" | "exit" }) {
  const d = {
    play: "M2 0.8 11.2 6 2 11.2Z",
    pause: "M1.5 1h3.2v10H1.5zM7.3 1h3.2v10H7.3z",
    full: "M0.5 0.5h4.5v1.6H2.1v2.9H0.5zM7 0.5h4.5v4.5H9.9V2.1H7zM0.5 7h1.6v2.9H5v1.6H0.5zM9.9 7h1.6v4.5H7V9.9h2.9z",
    exit: "M3.4 0.5H5V5H0.5V3.4h2.9zM7 0.5h1.6v2.9h2.9V5H7zM0.5 7H5v4.5H3.4V8.6H0.5zM7 7h4.5v1.6H8.6v2.9H7z",
  }[kind];
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" className="cb-glyph">
      <path d={d} />
    </svg>
  );
}

// The bar and, at its right end, play/pause and full screen as icons.
export function BarRow() {
  const { playing, fullscreen, toggle, toggleFullscreen } = useReel();
  return (
    <div className="cb-reel-row">
      <ReelBar className="min-w-0 flex-1" />
      <button
        type="button"
        className="cb-icon"
        aria-label={playing ? "Pause" : "Play"}
        onClick={toggle}
      >
        <Glyph kind={playing ? "pause" : "play"} />
      </button>
      <button
        type="button"
        className="cb-icon"
        aria-label={fullscreen ? "Exit full screen" : "Full screen"}
        onClick={toggleFullscreen}
      >
        <Glyph kind={fullscreen ? "exit" : "full"} />
      </button>
    </div>
  );
}

// Chapters grouped by robot and by simulation or hardware ("UR5e,
// hardware", "UR5e, simulation"), for the labels in "under" and "list".
type Run = { key: string; label: string; from: number; to: number };
export function runs(chapters: readonly Chapter[]): Run[] {
  const out: Run[] = [];
  for (const c of chapters) {
    const key = `${c.robot}|${where(c)}`;
    const last = out[out.length - 1];
    if (last?.key === key) last.to = c.i;
    else
      out.push({ key, label: `${c.robot}, ${where(c)}`, from: c.i, to: c.i });
  }
  return out;
}

export const title = (c: Chapter) => c.title + (fast(c) ? `, ${fast(c)}` : "");

// "UR5e, Rod" on the left; "Simulation" or "Hardware, 3×" on the right,
// quieter.
export function Now({ className = "" }: { className?: string }) {
  const { chapters, idx } = useReel();
  const c = chapters[idx];
  const w = where(c);
  return (
    <p className={`cb-reel-now pz-small ${className}`}>
      <span className="min-w-0">
        {c.robot}, {c.title}
      </span>
      <span className="cb-reel-mute shrink-0">
        {w[0].toUpperCase() + w.slice(1)}
        {fast(c) && `, ${fast(c)}`}
      </span>
    </p>
  );
}

// Titles under their segments, on the bar's grid (tracks() and line() put
// every title under its own segment; the grid stops short of the icons,
// as the bar does), and under them each robot and domain across its
// chapters.
export function Under() {
  const { chapters, idx, goTo } = useReel();
  const tpl = useMemo(() => tracks(chapters), [chapters]);
  const groups = useMemo(() => runs(chapters), [chapters]);
  return (
    <>
      <div
        className="cb-reel-under pz-small max-md:!hidden"
        style={{ gridTemplateColumns: tpl }}
      >
        {chapters.map((c) => (
          <button
            key={c.i}
            type="button"
            className="cb-reel-chap"
            style={{ gridColumn: line(c.i), gridRow: 1 }}
            aria-current={c.i === idx ? "true" : undefined}
            onClick={() => goTo(c.i)}
          >
            {title(c)}
          </button>
        ))}
        {groups.map((g) => (
          <p
            key={g.key}
            className="cb-reel-group"
            style={{
              gridColumn: `${line(g.from)} / ${line(g.to) + 1}`,
              gridRow: 2,
            }}
          >
            {g.label}
          </p>
        ))}
      </div>
      <div className="md:hidden">
        <Now />
      </div>
    </>
  );
}

// "UR5e, simulation  Rod  Nut  Gear mesh …  ANYmal D, simulation  Climbing
// box …": one wrapping line; the groups in full ink, the titles quieter,
// the current one in full ink.
function List() {
  const { chapters, idx, goTo } = useReel();
  const groups = useMemo(() => runs(chapters), [chapters]);
  return (
    <p className="cb-reel-list pz-small">
      {groups.map((g) => (
        <span key={g.key} className="cb-reel-run">
          <span className="cb-reel-robot">{g.label}</span>
          {chapters.slice(g.from, g.to + 1).map((c) => (
            <button
              key={c.i}
              type="button"
              className="cb-reel-chap cb-reel-item"
              aria-current={c.i === idx ? "true" : undefined}
              onClick={() => goTo(c.i)}
            >
              {title(c)}
            </button>
          ))}
        </span>
      ))}
    </p>
  );
}

export default function QuietReel({
  reel,
  controls = "now",
  maxH = "70svh",
  className = "",
}: {
  reel: ReelData;
  controls?: Controls;
  // The video never grows taller than this (any CSS length).
  maxH?: string;
  className?: string;
}) {
  return (
    <Reel
      reel={reel}
      skin="pz"
      className={`cb-reel ${className}`}
      style={{ "--rl-max-h": maxH } as CSSProperties}
    >
      <ReelPlayer className="cb-reel-player">
        <BarRow />
        {controls === "now" && <Now />}
        {controls === "under" && <Under />}
        {controls === "list" && <List />}
      </ReelPlayer>
    </Reel>
  );
}
