"use client";

// The footage of /lab/combined, section by section in the owner's order
// (2026-10-07: real world, then UR5e simulation, then ANYmal, then Franka;
// the continuous runs first). Adapted from ../_poster3/Manipulation.tsx,
// whose one manipulation poster is split here into one band per robot and
// setting, each with a big title. Needs the ../_poster3 Gallery around it.

import { useState, type CSSProperties, type ReactNode } from "react";
import { LIBRARY, type Item } from "../library";
import TileVideo from "../_gallery/TileVideo";
import { useGallery } from "../_poster3/Gallery";
import { INK } from "../_poster3/inks";
import { Sides } from "../_poster3/Player";
import { plural, secs, smallSrc, speedWord } from "../_poster3/data";

const manip = LIBRARY.filter((c) => c.category === "Manipulation");
const HARDWARE = manip.filter((c) => c.robot === "UR5e" && c.domain === "Real");
const PAIRS = manip.filter((c) => c.kind === "pair");
const FRANKA = manip.filter((c) => c.robot === "Franka");

// Hardware runs by task, in collection order: "Rod, run 1" -> "Rod".
const and = (xs: string[]) =>
  xs.length < 2
    ? (xs[0] ?? "")
    : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
const taskOf = (c: Item) => c.title.replace(/, run \d+$/, "");
const runOf = (c: Item) => c.title.replace(/^.*, run /, "Run ");
const TASKS = [...new Set(HARDWARE.map(taskOf))].map((task) => ({
  task,
  runs: HARDWARE.filter((c) => taskOf(c) === task),
}));

// Caption under a clip: title, then length and speed.
function Cap({
  c,
  num,
  title = c.title,
}: {
  c: Item;
  num: string;
  title?: string;
}) {
  return (
    <span className="p3-cap pz-small pz-num">
      <span className="p3-cap-t min-w-0 truncate">
        <span className="mr-2">{num}</span>
        {title}
      </span>
      <span className="shrink-0">
        {secs(c.duration)}, {speedWord(c.speed)}
      </span>
    </span>
  );
}

// A clip that opens the player.
function Tile({
  c,
  title,
  small,
}: {
  c: Item;
  title?: string;
  small?: boolean;
}) {
  const g = useGallery();
  return (
    <button
      type="button"
      data-gal-clip={c.id}
      className="p3-tile"
      aria-label={`Play ${c.title}, ${c.robot}, larger`}
      onClick={(e) => g.open(c, e.currentTarget)}
    >
      <TileVideo
        src={small ? smallSrc(c) : c.src}
        poster={c.poster}
        className="p3-video"
        style={{ "--a": String(c.aspect) } as CSSProperties}
      />
      <Cap c={c} num={g.num(c)} title={title} />
    </button>
  );
}

// One hardware task: the chosen run large, every run small beside it (from
// 1024 px) or under it. A small run picks the large view; the large view
// opens the player.
function Bench({ task, runs }: { task: string; runs: Item[] }) {
  const [sel, setSel] = useState(0);
  const c = runs[sel];
  const two = runs.length <= 2;
  return (
    <div className="pz-grid gap-y-3">
      <p className="pz-small col-span-full">
        {task}
        <span className="pz-num">, {plural(runs.length, "run")}</span>
      </p>
      {two ? (
        runs.map((r) => (
          <div key={r.id} className="col-span-6">
            <Tile c={r} title={runOf(r)} />
          </div>
        ))
      ) : (
        <>
          <div className="p3-bench-main col-span-6 md:col-span-12 lg:col-span-8">
            <Tile key={c.id} c={c} title={runOf(c)} />
          </div>
          <ul
            className="p3-bench-thumbs col-span-6 grid grid-cols-3 content-start gap-x-[var(--g)] gap-y-3 md:col-span-12 md:grid-cols-4 lg:col-span-4 lg:grid-cols-2"
            aria-label={`${task}: runs`}
          >
            {runs.map((r, i) => (
              <li key={r.id}>
                <button
                  type="button"
                  className="p3-tile p3-thumb"
                  aria-pressed={i === sel}
                  aria-label={`Show ${r.title} large`}
                  onClick={() => setSel(i)}
                >
                  <TileVideo
                    src={smallSrc(r)}
                    poster={r.poster}
                    className="p3-video"
                  />
                  <span className="p3-cap pz-small pz-num">
                    <span className="p3-cap-t">{runOf(r)}</span>
                    <span>{secs(r.duration)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

// One band: a big two-line title, a short note, then the footage.
function Band({
  id,
  title,
  note,
  count,
  children,
}: {
  id: string;
  title: [string, string];
  note: ReactNode;
  count: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="pz-poster scroll-mt-[var(--bar)] border-t border-black pb-16 pt-3 md:pb-24"
      style={
        {
          background: INK.manip.ground,
          color: INK.manip.mark,
          "--p3-mark": INK.manip.type,
        } as CSSProperties
      }
    >
      <div className="pz-grid gap-y-4 pb-8 md:pb-12">
        <h3
          className="pz-big col-span-6 text-[21vw] md:col-span-8 md:text-[min(10.5vw,19svh)]"
          style={{ color: INK.manip.type }}
        >
          {title[0]}
          <br />
          {title[1]}
        </h3>
        <div className="pz-small col-span-6 flex flex-col gap-2 md:col-span-3 md:col-start-10 md:pt-3">
          <p>{note}</p>
          <p className="pz-num">{count}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function Hardware() {
  return (
    <Band
      id="real-world"
      title={["Real world", "UR5e"]}
      note={`${and(TASKS.map((t) => t.task.toLowerCase()))} on a real task board, from camera images, zero-shot. Every run as recorded; pick a run to show it large.`.replace(
        /^./,
        (x) => x.toUpperCase(),
      )}
      count={plural(HARDWARE.length, "run")}
    >
      <div className="flex flex-col gap-10 md:gap-14">
        {TASKS.map((t) => (
          <Bench key={t.task} task={t.task} runs={t.runs} />
        ))}
      </div>
    </Band>
  );
}

export function SimPairs() {
  const g = useGallery();
  return (
    <Band
      id="ur5e-simulation"
      title={["Simulation", "UR5e"]}
      note="Six tasks from the NIST Assembly Task Board 1. Two runs per task side by side: on the left the run with the most going on, on the right a nominal one."
      count={plural(PAIRS.length, "task")}
    >
      <ul className="pz-grid gap-y-8 md:gap-y-10">
        {PAIRS.map((c) => (
          <li key={c.id} className="col-span-6 md:col-span-12 lg:col-span-6">
            <p className="pz-small pz-num flex justify-between gap-4 pb-1">
              <span>
                <span className="mr-2">{g.num(c)}</span>
                {c.title}
              </span>
              <span>
                {secs(c.duration)}, {speedWord(c.speed)}
              </span>
            </p>
            <PairTile c={c} />
          </li>
        ))}
      </ul>
    </Band>
  );
}

export function FrankaSim() {
  return (
    <Band
      id="franka-simulation"
      title={["Simulation", "Franka"]}
      note="Nut-and-bolt assembly: three excerpts from one 30 s run, shown whole under the continuous runs."
      count={plural(FRANKA.length, "clip")}
    >
      <ul className="pz-grid gap-y-6">
        {FRANKA.map((c, i) => (
          <li
            key={c.id}
            className={`${i === 0 ? "col-span-6" : "col-span-3"} md:col-span-4`}
          >
            <Tile c={c} small={i > 0} />
          </li>
        ))}
      </ul>
    </Band>
  );
}

// A 32:9 pair, whole: the video, then what each side shows on its own
// half.
function PairTile({ c }: { c: Item }) {
  const g = useGallery();
  return (
    <button
      type="button"
      data-gal-clip={c.id}
      className="p3-tile"
      aria-label={`Play ${c.title}, ${c.robot} in simulation, larger`}
      onClick={(e) => g.open(c, e.currentTarget)}
    >
      <TileVideo
        src={c.src}
        poster={c.poster}
        className="p3-video"
        style={{ "--a": String(c.aspect) } as CSSProperties}
      />
      {c.sides && <Sides sides={c.sides} className="pt-[3px]" />}
    </button>
  );
}
