"use client";

// The highlight reel for /lab/poster-3: REEL3 (the owner's footage) as a
// plain video, through the shared reel engine and bar (_reel). The chapter
// list, controls and caption are this page's own, because every chapter
// here carries its robot, task, simulation or hardware, and speed, and some
// hardware chapters are sped up (2×, 3×): the speed shows in the list, in
// the line under the video and on the picture itself while it plays.

import { useEffect, useId, useRef, type CSSProperties } from "react";
import { REEL3 } from "../library";
import { Reel, ReelBar, ReelPlayer } from "../_reel/HighlightReel";
import { useReel } from "../_reel/engine";
import { chapterAt, type ReelData } from "../_reel/reel";
import { mss, pad2, word } from "./data";

type Meta = {
  robot: string;
  title: string;
  domain: "Sim" | "Real";
  speed: string;
};

const META: Meta[] = REEL3.chapters.map((c) => ({
  robot: c.robot,
  title: c.title,
  domain: c.domain ?? "Sim",
  speed: c.speed ?? "1×",
}));

const setting = (m: Meta) =>
  `${m.robot}, ${m.domain === "Real" ? "hardware" : "simulation"}`;

// The engine groups chapters by robot (wider gaps in the bar between
// groups). Grouping here is by robot and setting, so UR5e on hardware and
// UR5e in simulation are two groups.
const ENGINE: ReelData = {
  ...REEL3,
  chapters: REEL3.chapters.map((c, i) => ({ ...c, robot: setting(META[i]) })),
};

const GROUPS = META.reduce<{ key: string; from: number; to: number }[]>(
  (gs, m, i) => {
    const k = setting(m);
    const last = gs[gs.length - 1];
    if (last?.key === k) last.to = i;
    else gs.push({ key: k, from: i, to: i });
    return gs;
  },
  [],
);

const domainWord = (d: Meta["domain"]) =>
  d === "Real" ? "Hardware" : "Simulation";

const uniq = <T,>(xs: T[]) => [...new Set(xs)];
const and = (xs: string[]) =>
  xs.length < 2
    ? (xs[0] ?? "")
    : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;

// Plain caption from the chapter list: how many clips, how long, what is
// shown where, and what is sped up.
function caption() {
  const n = REEL3.chapters.length;
  const lens = REEL3.chapters.map(
    (c, i) => (REEL3.chapters[i + 1]?.start ?? REEL3.duration) - c.start,
  );
  const lo = Math.floor(Math.min(...lens));
  const hi = Math.ceil(Math.max(...lens));
  const real = uniq(
    META.filter((m) => m.domain === "Real").map((m) => m.robot),
  );
  const sim = uniq(META.filter((m) => m.domain === "Sim").map((m) => m.robot));
  const fast = META.filter((m) => m.speed !== "1×");
  const where = [
    real.length ? `${and(real)} on hardware` : "",
    sim.length ? `${and(sim)} in simulation` : "",
  ]
    .filter(Boolean)
    .join(", then ");
  const speed = fast.length
    ? `Sped up: ${and(fast.map((m) => `${pad2(META.indexOf(m) + 1)} ${m.title} at ${m.speed}`))}; the rest plays at real time.`
    : "Everything plays at real time.";
  const count = word(n);
  return `${count[0].toUpperCase()}${count.slice(1)} clips, ${lo}–${hi} s each, no sound: ${where}. ${speed}`;
}

function SpeedTag() {
  const { idx } = useReel();
  const m = META[idx];
  if (m.speed === "1×") return null;
  return (
    <span className="p3-speedtag pz-small pz-num" aria-hidden="true">
      {m.speed} speed
    </span>
  );
}

function Controls() {
  const { idx, playing, fullscreen, toggle, toggleFullscreen, subscribe } =
    useReel();
  const time = useRef<HTMLSpanElement>(null);
  const m = META[idx];
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
        <svg viewBox="0 0 12 12" aria-hidden="true" className="rl-glyph">
          <path
            d={
              playing
                ? "M1.5 1h3.2v10H1.5zM7.3 1h3.2v10H7.3z"
                : "M2 0.8 11.2 6 2 11.2Z"
            }
          />
        </svg>
        <span className="w-[2.6em]">{playing ? "Pause" : "Play"}</span>
      </button>
      <span className="min-w-0 flex-1 truncate" aria-live="polite">
        <span className="pz-num">{pad2(idx + 1)}</span>
        <span className="text-[var(--rl-mute)]">
          {" / "}
          {pad2(META.length)}
        </span>{" "}
        <span className="max-md:hidden">{m.robot} · </span>
        {m.title} · {domainWord(m.domain)} · {m.speed}
      </span>
      <span ref={time} className="pz-num text-[var(--rl-mute)] max-sm:hidden">
        {`0:00 / ${mss(REEL3.duration)}`}
      </span>
      <button type="button" onClick={toggleFullscreen} className="rl-btn">
        <svg viewBox="0 0 12 12" aria-hidden="true" className="rl-glyph">
          <path
            d={
              fullscreen
                ? "M3.4 0.5H5V5H0.5V3.4h2.9zM7 0.5h1.6v2.9h2.9V5H7zM0.5 7H5v4.5H3.4V8.6H0.5zM7 7h4.5v1.6H8.6v2.9H7z"
                : "M0.5 0.5h4.5v1.6H2.1v2.9H0.5zM7 0.5h4.5v4.5H9.9V2.1H7zM0.5 7h1.6v2.9H5v1.6H0.5zM9.9 7h1.6v4.5H7V9.9h2.9z"
            }
          />
        </svg>
        <span className="max-md:sr-only">
          {fullscreen ? "Exit full screen" : "Full screen"}
        </span>
      </button>
    </div>
  );
}

// Chapters grouped by robot and setting: number, task, speed, start. The
// current one fills white as it plays; a click plays from its start.
function Chapters({ className = "" }: { className?: string }) {
  const { chapters, idx, goTo, subscribe } = useReel();
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  const uid = useId();
  useEffect(
    () =>
      subscribe((t) => {
        const i = chapterAt(chapters, t);
        const c = chapters[i];
        const f = Math.min(1, Math.max(0, (t - c.start) / c.len));
        fills.current.forEach((el, k) => {
          if (el) el.style.transform = `scaleX(${k === i ? f : 0})`;
        });
      }),
    [subscribe, chapters],
  );
  return (
    <nav aria-label="Chapters" className={`rl-chapters ${className}`}>
      {GROUPS.map((g, gi) => {
        const m = META[g.from];
        return (
          <div key={g.key} className="rl-group">
            <p id={`${uid}-${gi}`} className="rl-head pz-small">
              <span>{m.robot}</span>
              <span>{domainWord(m.domain)}</span>
            </p>
            <ol aria-labelledby={`${uid}-${gi}`}>
              {chapters.slice(g.from, g.to + 1).map((c) => (
                <li key={c.i}>
                  <button
                    type="button"
                    className="rl-row p3-reelrow"
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
                    <span className="pz-num">{pad2(c.i + 1)}</span>
                    <span>{META[c.i].title}</span>
                    <span className="pz-num">{META[c.i].speed}</span>
                    <span className="pz-num">{mss(c.start)}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        );
      })}
    </nav>
  );
}

// Video on the right from 1024 px (8 of 12 columns), the caption and the
// chapter list on the left; on phones and iPad portrait the video first.
export default function Reel3({
  ink = "#111111",
  maxHeight = "min(64svh, 52rem)",
}: {
  ink?: string;
  maxHeight?: string;
}) {
  const capId = useId();
  return (
    <Reel
      reel={ENGINE}
      skin="pz"
      style={{ "--rl-max-h": maxHeight, "--rl-ink": ink } as CSSProperties}
      className="col-span-full grid grid-cols-subgrid gap-y-3 lg:grid-rows-[auto_1fr]"
    >
      <ReelPlayer
        describedBy={capId}
        className="relative col-span-full lg:col-span-8 lg:col-start-5 lg:row-span-2 lg:row-start-1"
      >
        <SpeedTag />
        <ReelBar className="mt-1" />
        <Controls />
      </ReelPlayer>
      <p
        id={capId}
        className="pz-small col-span-full max-w-[52ch] lg:col-span-4 lg:col-start-1 lg:row-start-1"
      >
        {caption()}
      </p>
      <Chapters className="col-span-full mt-3 lg:col-span-4 lg:col-start-1 lg:row-start-2 lg:mt-0 lg:self-end" />
    </Reel>
  );
}
