import { Fragment } from "react";
import { EXTRA, LIBRARY, type Item } from "../library";
import Gallery from "../_site3/Gallery";
import { Row } from "../_site3/Media";
import { byId } from "../_site3/items";
import type { Band } from "../_site3/Runs";
import "../_site3/site3.css";

// Section 4 of /lab/combined: the Overview (owner, 2026-10-07: "the simplest
// and most concise description of the most important facts about our
// setup", no stats). One colour band per pane, as Site 3's entries, each
// with one sentence, "about 1 sentence per color that the reader will
// actually read" (the owner's wording, with key phrases bold), and real
// clips at 1×. Clip rows and the player come unchanged from ../_site3.
//
// Layouts, switched on the page (./OverviewChosen.tsx):
//   o1  the band's name on the left, the sentence beside it at the same
//       size, clips below
//   o2  the name, then the sentence across the page in the summary's thin
//       stroke with heavier key phrases, clips below
//   o3  the name, then the sentence much larger across the page
//   o4  the clips on the left, the name and the sentence on the right

const LOCO: Band = { ground: "#f6ee1f", type: "#111" };
const MANIP: Band = { ground: "#f5a3b7", type: "#111" };
const REAL: Band = { ground: "#1f61d6", type: "#fff" };
const SCALE: Band = { ground: "#a3e4d7", type: "#111" };

const clip = (id: string) => byId([...LIBRARY, ...EXTRA], id);

// One row per band, captioned with robot and task only (owner, 2026-10-07:
// "a single row of videos for each of these colors ... I don't think we
// need the rest of the text descriptions, other than robot, task").
// Manipulation shows single runs: the interesting rod and BNC runs and the
// nominal gear mesh run.
const as = (id: string, title: string): Item => ({ ...clip(id), title });
const LOCO_ROW = [
  as("anymal-c-terrains", "Several terrains"),
  as("anymal-d-floating-island", "Floating island"),
  as("anymal-d-stepping-stones", "Stepping stones"),
  as("anymal-d-climbing-box", "Climbing box"),
];
const MANIP_ROW = [
  as("ur5e-sim-rod-1", "Rod"),
  as("ur5e-sim-bnc-5", "BNC connector"),
  as("ur5e-sim-gear-mesh-3", "Gear mesh"),
  as("franka-sim-nut-1", "Nut"),
];
const REAL_ROW = [
  as("ur5e-real-nut-1", "Nut"),
  as("ur5e-real-rod-1", "Rod"),
  as("ur5e-real-gear-mesh-4", "Gear mesh"),
];

const CLIPS: Item[] = [...LOCO_ROW, ...MANIP_ROW, ...REAL_ROW];

export type OverviewLayout = "o1" | "o2" | "o3" | "o4";
export const OVERVIEW_LAYOUTS: OverviewLayout[] = ["o1", "o2", "o3", "o4"];

// A sentence as parts: plain, b (bold) or i (italic).
type Part = [string, "" | "b" | "i"];

const PANES: {
  band: Band;
  name: string;
  text: Part[];
  row: Item[];
}[] = [
  {
    band: LOCO,
    name: "Locomotion",
    text: [
      ["A ", ""],
      ["single", "i"],
      [" policy, trained from scratch, takes ", ""],
      ["ANYmal C and D", "b"],
      [" across every terrain, from stepping stones to floating islands.", ""],
    ],
    row: LOCO_ROW,
  },
  {
    band: MANIP,
    name: "Manipulation",
    text: [
      ["UR5e and Franka", "b"],
      [" learn per-task ", ""],
      ["contact-rich assembly", "b"],
      [
        " from the NIST task board, with zero demonstrations and the same reward function.",
        "",
      ],
    ],
    row: MANIP_ROW,
  },
  {
    band: REAL,
    name: "Real world",
    text: [
      [
        "Trained only in simulation, the UR5e assembles parts on the real task board ",
        "",
      ],
      ["from RGB images, zero-shot", "b"],
      [".", ""],
    ],
    row: REAL_ROW,
  },
  {
    band: SCALE,
    name: "Scale",
    text: [
      ["SGS ", ""],
      ["keeps improving", "b"],
      [" as parallel environments grow to ", ""],
      ["a million", "b"],
      [", where uniform sampling and other methods fall behind.", ""],
    ],
    row: [],
  },
];

function Sentence({ parts }: { parts: Part[] }) {
  return parts.map(([t, s], i) =>
    s === "b" ? (
      <strong key={i}>{t}</strong>
    ) : s === "i" ? (
      <em key={i}>{t}</em>
    ) : (
      <Fragment key={i}>{t}</Fragment>
    ),
  );
}

export default function OverviewPanes({
  layout = "o1",
  id = "overview",
}: {
  layout?: OverviewLayout;
  id?: string;
}) {
  return (
    <Gallery clips={CLIPS}>
      <section
        id={id}
        aria-label="Overview"
        className={`s3 cb-ov cb-ov-${layout} scroll-mt-[var(--bar)] pb-16 md:pb-24`}
      >
        <h2 className="pz-head border-y border-black bg-white px-[var(--m)] pb-[0.08em] pt-[0.04em]">
          Overview
        </h2>
        {PANES.map((p) => {
          const clips = p.row.length > 0 && (
            <div className="cb-ov-clips">
              <Row withRobot clips={p.row} />
            </div>
          );
          return (
            <article
              key={p.name}
              className="cb-ov-pane s3-entry border-t border-black"
              style={{ background: p.band.ground, color: p.band.type }}
            >
              <div className="cb-ov-text">
                <h3 className="cb-ov-name st-entry">{p.name}</h3>
                <p className="cb-ov-sentence">
                  <Sentence parts={p.text} />
                </p>
              </div>
              {clips}
            </article>
          );
        })}
      </section>
    </Gallery>
  );
}
