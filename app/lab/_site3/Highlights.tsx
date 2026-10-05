"use client";

import { useEffect, useId, useMemo, useRef, type CSSProperties } from "react";
import { REEL3 } from "../library";
import { Reel, useReel } from "../_reel/engine";
import { ReelBar, ReelPlayer } from "../_reel/parts";
import { chapterAt, mss, pad2, type Chapter } from "../_reel/reel";
import { lower } from "./items";

// The highlight reel (REEL3, a 28 s mock cut) as a plain video, built from
// the shared reel engine and bar. What is new here: every chapter carries
// its robot, task, simulation or hardware, and speed, both in the list
// (grouped by robot and domain, a speed column on every row) and in a
// line under the video that names the chapter on screen, so the 2× and 3×
// hardware chapters say so while they play, full screen included.

const where = (c: Chapter) => (c.domain === "Real" ? "Hardware" : "Simulation");
const speed = (c: Chapter) => c.speed ?? "1×";

type Group = { key: string; robot: string; domain: string; rows: Chapter[] };

function groupChapters(chapters: readonly Chapter[]): Group[] {
  const out: Group[] = [];
  for (const c of chapters) {
    const key = `${c.robot}|${where(c)}`;
    const last = out[out.length - 1];
    if (last?.key === key) last.rows.push(c);
    else out.push({ key, robot: c.robot, domain: where(c), rows: [c] });
  }
  return out;
}

function Glyph({ kind }: { kind: "play" | "pause" | "full" | "exit" }) {
  const d = {
    play: "M2 0.8 11.2 6 2 11.2Z",
    pause: "M1.5 1h3.2v10H1.5zM7.3 1h3.2v10H7.3z",
    full: "M0.5 0.5h4.5v1.6H2.1v2.9H0.5zM7 0.5h4.5v4.5H9.9V2.1H7zM0.5 7h1.6v2.9H5v1.6H0.5zM9.9 7h1.6v4.5H7V9.9h2.9z",
    exit: "M3.4 0.5H5V5H0.5V3.4h2.9zM7 0.5h1.6v2.9h2.9V5H7zM0.5 7H5v4.5H3.4V8.6H0.5zM7 7h4.5v1.6H8.6v2.9H7z",
  }[kind];
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" className="rl-glyph">
      <path d={d} />
    </svg>
  );
}

// The chapter on screen: number, robot and task on the left; simulation
// or hardware and the speed on the right.
function Now() {
  const { chapters, idx } = useReel();
  const c = chapters[idx];
  return (
    <p className="pz-row flex items-baseline justify-between gap-4 border-t border-[var(--rl-rule)] pt-1.5">
      <span className="min-w-0">
        <span className="pz-num mr-3">{pad2(idx + 1)}</span>
        {c.robot}, {lower(c.title)}
      </span>
      <span className="shrink-0 text-right">
        {where(c)}, <span className="pz-num">{speed(c)}</span>
      </span>
    </p>
  );
}

function Controls() {
  const { reel, playing, fullscreen, toggle, toggleFullscreen, subscribe } =
    useReel();
  const time = useRef<HTMLSpanElement>(null);
  useEffect(
    () =>
      subscribe((t, d) => {
        if (time.current) time.current.textContent = `${mss(t)} / ${mss(d)}`;
      }),
    [subscribe],
  );
  return (
    <div className="pz-small flex items-center gap-x-4">
      <button type="button" onClick={toggle} className="rl-btn">
        <Glyph kind={playing ? "pause" : "play"} />
        <span className="w-[2.6em]">{playing ? "Pause" : "Play"}</span>
      </button>
      <span ref={time} className="pz-num flex-1 text-[var(--rl-mute)]">
        {`0:00 / ${mss(reel.duration)}`}
      </span>
      <button type="button" onClick={toggleFullscreen} className="rl-btn">
        <Glyph kind={fullscreen ? "exit" : "full"} />
        <span className="max-md:sr-only">
          {fullscreen ? "Exit full screen" : "Full screen"}
        </span>
      </button>
    </div>
  );
}

// Chapters grouped by robot and domain: number, task, speed, start time.
// The current one is marked and fills as it plays; a click plays it.
function Chapters({ className = "" }: { className?: string }) {
  const { chapters, idx, goTo, subscribe } = useReel();
  const groups = useMemo(() => groupChapters(chapters), [chapters]);
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  const uid = useId();

  useEffect(
    () =>
      subscribe((t) => {
        const i = chapterAt(chapters, t);
        const c = chapters[i];
        const frac = Math.min(1, Math.max(0, (t - c.start) / c.len));
        fills.current.forEach((el, k) => {
          if (el) el.style.transform = `scaleX(${k === i ? frac : 0})`;
        });
      }),
    [subscribe, chapters],
  );

  return (
    <nav aria-label="Chapters" className={`rl-chapters ${className}`}>
      {/* Column heads over one column only: phones and beside the video. */}
      <p className="pz-small s3-chap-cols pb-1 text-[var(--rl-mute)] md:!hidden lg:!grid">
        <span>No.</span>
        <span>Task</span>
        <span className="text-right">Speed</span>
        <span className="text-right">Start</span>
      </p>
      {groups.map((g, gi) => (
        <div key={g.key} className="rl-group">
          <p id={`${uid}-${gi}`} className="rl-head pz-small">
            <span>{g.robot}</span>
            <span className="text-right">{g.domain}</span>
          </p>
          <ol aria-labelledby={`${uid}-${gi}`}>
            {g.rows.map((c) => (
              <li key={c.i}>
                <button
                  type="button"
                  className="rl-row pz-row s3-chap-cols"
                  aria-current={c.i === idx ? "true" : undefined}
                  aria-label={`${pad2(c.i + 1)}, ${c.robot}, ${c.title}, ${where(c)}, ${speed(c)}, from ${mss(c.start)}`}
                  onClick={() => goTo(c.i)}
                >
                  <span
                    ref={(el) => {
                      fills.current[c.i] = el;
                    }}
                    className="rl-rowfill"
                    aria-hidden="true"
                  />
                  <span className="pz-num">{pad2(c.i + 1)}</span>
                  <span>{c.title}</span>
                  <span className="pz-num text-right">{speed(c)}</span>
                  <span className="pz-num text-right">{mss(c.start)}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </nav>
  );
}

// "the nut at 3× and the gear mesh at 2×"
function sped() {
  const fast = REEL3.chapters.filter((c) => (c.speed ?? "1×") !== "1×");
  const parts = fast.map((c) => `the ${lower(c.title)} at ${c.speed}`);
  return parts.length < 2
    ? (parts[0] ?? "")
    : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

export default function Highlights() {
  const capId = useId();
  const n = REEL3.chapters.length;
  const fast = sped();
  return (
    <Reel
      reel={REEL3}
      skin="pz"
      style={
        {
          "--rl-ink": "#111",
          "--rl-max-h": "min(66svh, 54rem)",
        } as CSSProperties
      }
      className="s3-reel col-span-full grid grid-cols-subgrid gap-y-3 lg:grid-rows-[auto_1fr]"
    >
      <ReelPlayer
        describedBy={capId}
        className="col-span-full flex flex-col gap-1 lg:col-span-8 lg:col-start-5 lg:row-span-2 lg:row-start-1"
      >
        <ReelBar />
        <Now />
        <Controls />
      </ReelPlayer>
      <p
        id={capId}
        className="pz-small col-span-full max-w-[52ch] lg:col-span-4 lg:col-start-1 lg:row-start-1"
      >
        {n} clips, 2–5 s each, in one {Math.round(REEL3.duration)} s video: the
        UR5e on hardware first, then the UR5e and Franka in simulation, then
        ANYmal D in simulation. All play at 1× except {fast || "none"}, on
        hardware. No sound.
      </p>
      <Chapters className="col-span-full mt-3 md:columns-2 md:gap-x-[var(--g)] lg:col-span-4 lg:col-start-1 lg:row-start-2 lg:mt-0 lg:columns-1 lg:self-end" />
    </Reel>
  );
}
