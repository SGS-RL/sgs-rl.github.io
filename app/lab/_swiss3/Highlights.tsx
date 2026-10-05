"use client";

import { useEffect, useId, useMemo, useRef, type CSSProperties } from "react";
import { REEL3 } from "../library";
import { Reel, useReel } from "../_reel/engine";
import { ReelBar, ReelPlayer } from "../_reel/parts";
import { chapterAt, mss, pad2, type ReelData } from "../_reel/reel";
import { domainWord } from "./data";

// The highlight reel for /lab/swiss-3: the same plain video and engine as
// _reel/HighlightReel ("list" layout), with chapters grouped by robot *and*
// by simulation or hardware, and the speed of every chapter shown (some
// hardware chapters run at 2× or 3×).

const SRC = REEL3.chapters;

// The engine groups chapters by `robot`; key it by robot and domain so the
// bar's wider gaps fall between hardware and simulation too. Display text
// always comes from the original chapters (SRC), by index.
const KEYED: ReelData = {
  ...REEL3,
  chapters: SRC.map((c) => ({
    ...c,
    robot: `${c.robot}, ${domainWord(c.domain ?? "Sim").toLowerCase()}`,
  })),
};

const speedOf = (i: number) => SRC[i].speed ?? "1×";
const domainOf = (i: number) => domainWord(SRC[i].domain ?? "Sim");

const and = (xs: string[]) =>
  xs.length < 2
    ? (xs[0] ?? "")
    : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;

function caption() {
  const ends = SRC.map((c, i) =>
    i < SRC.length - 1 ? SRC[i + 1].start : REEL3.duration,
  );
  const lens = SRC.map((c, i) => ends[i] - c.start);
  const lo = Math.floor(Math.min(...lens));
  const hi = Math.ceil(Math.max(...lens));
  const robots = (d: "Sim" | "Real") => [
    ...new Set(SRC.filter((c) => c.domain === d).map((c) => c.robot)),
  ];
  return (
    `${SRC.length} clips, ${lo}–${hi} s each: the ${and(robots("Real"))} on ` +
    `hardware, then the ${and(robots("Sim"))} in simulation. The speed of ` +
    `each clip is marked. No sound.`
  );
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

// Play/pause, the current chapter (robot, task, domain, speed), time, full
// screen. Phones drop the robot; the list under the video carries it.
function Controls({ className = "" }: { className?: string }) {
  const {
    reel,
    chapters,
    idx,
    playing,
    fullscreen,
    toggle,
    toggleFullscreen,
    subscribe,
  } = useReel();
  const time = useRef<HTMLSpanElement>(null);
  const c = SRC[idx];

  useEffect(
    () =>
      subscribe((t, d) => {
        if (time.current) time.current.textContent = `${mss(t)} / ${mss(d)}`;
      }),
    [subscribe],
  );

  return (
    <div className={`sw-label flex items-center gap-x-4 ${className}`}>
      <button type="button" onClick={toggle} className="rl-btn">
        <Glyph kind={playing ? "pause" : "play"} />
        <span className="w-[2.6em]">{playing ? "Pause" : "Play"}</span>
      </button>
      <span className="min-w-0 flex-1 truncate">
        <span className="sw-num">{pad2(idx + 1)}</span>
        <span className="text-[var(--rl-mute)]">
          {" / "}
          {pad2(chapters.length)}
        </span>{" "}
        <span className="max-md:hidden">{c.robot} · </span>
        {c.title}
        <span className="text-[var(--rl-mute)]">
          {" · "}
          <span className="max-md:hidden">{domainOf(idx)}, </span>
          <span className="sw-num">{speedOf(idx)}</span>
        </span>
      </span>
      <span ref={time} className="sw-num text-[var(--rl-mute)]">
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

// "01 Pit 0:00" list, grouped by robot and domain, with a speed column.
function Chapters({ className = "" }: { className?: string }) {
  const { chapters, groups, idx, goTo, subscribe } = useReel();
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
      {groups.map((g, gi) => (
        <div key={gi} className="rl-group">
          <p id={`${uid}-${gi}`} className="rl-head sw-label">
            <span className="font-medium">{SRC[g.from].robot}</span>
            <span className="text-right text-[var(--rl-mute)]">
              {domainOf(g.from)}
            </span>
          </p>
          <ol aria-labelledby={`${uid}-${gi}`}>
            {chapters.slice(g.from, g.to + 1).map((c) => (
              <li key={c.i}>
                <button
                  type="button"
                  className="rl-row s3-rl-row sw-label"
                  aria-current={c.i === idx ? "true" : undefined}
                  onClick={() => goTo(c.i)}
                >
                  <span
                    ref={(el) => {
                      fills.current[c.i] = el;
                    }}
                    className="rl-rowfill"
                    aria-hidden="true"
                  />
                  <span className="sw-num">{pad2(c.i + 1)}</span>
                  <span>{SRC[c.i].title}</span>
                  <span
                    className="sw-num s3-speed"
                    data-fast={speedOf(c.i) !== "1×" ? "" : undefined}
                  >
                    <span className="sr-only">speed </span>
                    {speedOf(c.i)}
                  </span>
                  <span className="sw-num flex items-center gap-2">
                    {c.i === idx && (
                      <span className="rl-mark" aria-hidden="true" />
                    )}
                    {mss(c.start)}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </nav>
  );
}

// Place inside a .sw-grid: spans the full row. Chapter list on the left
// from 1024 px (3 columns), video on the right; on phones and iPad
// portrait the list sits under the video in two columns.
export default function Highlights({
  maxHeight = "64svh",
  className = "",
}: {
  maxHeight?: string;
  className?: string;
}) {
  const capId = useId();
  const style = useMemo(
    () => ({ "--rl-max-h": maxHeight }) as CSSProperties,
    [maxHeight],
  );
  const side = "lg:col-span-3";
  return (
    <Reel
      reel={KEYED}
      skin="swiss"
      style={style}
      className={`col-span-full grid grid-cols-subgrid gap-y-3 lg:grid-rows-[auto_auto_1fr] ${className}`}
    >
      <div
        className={`sw-label col-span-full flex items-baseline justify-between gap-4 lg:col-start-1 lg:row-start-1 ${side}`}
      >
        <h2 className="font-medium">Highlights</h2>
        <span className="sw-num text-[var(--rl-mute)]">
          {mss(REEL3.duration)}
        </span>
      </div>
      <ReelPlayer
        describedBy={capId}
        className="col-span-full lg:col-span-9 lg:col-start-4 lg:row-span-3 lg:row-start-1"
      >
        <ReelBar className="mt-1" />
        <Controls />
      </ReelPlayer>
      <p
        id={capId}
        className={`sw-label col-span-full max-w-[56ch] text-[var(--rl-mute)] lg:col-start-1 lg:row-start-2 ${side}`}
      >
        {caption()}
      </p>
      <Chapters
        className={`col-span-full mt-4 columns-2 gap-x-4 md:gap-x-6 lg:col-start-1 lg:row-start-3 lg:mt-6 lg:columns-1 lg:self-end ${side}`}
      />
    </Reel>
  );
}
