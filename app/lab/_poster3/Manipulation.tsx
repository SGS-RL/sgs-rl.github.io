"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { LIBRARY, type Item } from "../library";
import TileVideo from "../_gallery/TileVideo";
import { useGallery } from "./Gallery";
import { INK } from "./inks";
import { Sides } from "./Player";
import { plural, secs, smallSrc, speedWord } from "./data";

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

// One block per robot and setting: a rule, the name in the title colour,
// a note in black, then the footage.
function Block({
  id,
  robot,
  setting,
  note,
  count,
  children,
}: {
  id: string;
  robot: string;
  setting: string;
  note: ReactNode;
  count: string;
  children: ReactNode;
}) {
  return (
    <div id={id} className="mt-12 scroll-mt-[var(--bar)] md:mt-20">
      <div className="pz-grid gap-y-2">
        <div className="col-span-full border-t border-black" />
        <h3
          className="pz-mid col-span-6 pt-1 md:col-span-4"
          style={{ color: INK.manip.type }}
        >
          {robot}
          <br />
          {setting}
        </h3>
        <p className="pz-small col-span-4 max-w-[52ch] md:col-span-5 md:pt-1.5">
          {note}
        </p>
        <p className="pz-small pz-num col-span-2 text-right md:col-span-3 md:pt-1.5">
          {count}
        </p>
      </div>
      <div className="mt-5 md:mt-8">{children}</div>
    </div>
  );
}

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

// The loved title in its colours, then the footage unaltered: the UR5e on
// hardware (by task), the UR5e in simulation (two runs side by side per
// task, 32:9, never cropped) and the Franka in simulation.
export default function Manipulation() {
  const g = useGallery();
  return (
    <section
      className="pz-poster pb-16 pt-3 md:pb-24"
      style={
        {
          background: INK.manip.ground,
          color: INK.manip.mark,
          "--p3-mark": INK.manip.type,
        } as CSSProperties
      }
    >
      <div className="pz-grid gap-y-4">
        <h3
          className="pz-big col-span-6 text-[21vw] md:col-span-8 md:text-[min(10.5vw,19svh)]"
          style={{ color: INK.manip.type }}
        >
          NIST
          <br />
          Taskboard
        </h3>
        <div className="pz-small col-span-6 flex flex-col gap-3 md:col-span-3 md:col-start-10 md:pt-3">
          <p>
            Contact-rich assembly on the NIST taskboard, trained with
            reinforcement learning in simulation and no demonstrations. The UR5e
            also runs three of the tasks on hardware.
          </p>
          <p>
            Footage as recorded, without treatment. Select any clip to see it
            larger.
          </p>
          <ul className="pz-num">
            <li>
              <a href="#ur5e-hardware" className="pz-u">
                UR5e, hardware
              </a>
            </li>
            <li>
              <a href="#ur5e-simulation" className="pz-u">
                UR5e, simulation
              </a>
            </li>
            <li>
              <a href="#franka-simulation" className="pz-u">
                Franka, simulation
              </a>
            </li>
          </ul>
        </div>
      </div>

      <Block
        id="ur5e-hardware"
        robot="UR5e"
        setting="Hardware"
        note={`${and(TASKS.map((t) => t.task.toLowerCase()))}, every run as recorded. Pick a run to show it large; select the large view to open the player.`.replace(
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
      </Block>

      <Block
        id="ur5e-simulation"
        robot="UR5e"
        setting="Simulation"
        note="Two runs per task side by side, from a fixed close-up camera: on the left the run with the most going on, on the right a nominal one."
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
      </Block>

      <Block
        id="franka-simulation"
        robot="Franka"
        setting="Simulation"
        note="The nut task: three excerpts from one 30 s run, which is shown whole under Runs. Two from a wide camera, one close up."
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
      </Block>
    </section>
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
