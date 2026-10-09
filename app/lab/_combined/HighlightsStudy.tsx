import fs from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
import "../_poster/poster.css";
import "../_site/site.css";
import { REEL3, STANDIN_REEL } from "../library";
import Header, { Mark, Meta, Title } from "./Header";
import QuietReel, { type Controls } from "./Reel";
import "./combined.css";

// /lab/highlights: where the highlight reel goes relative to the header
// (A–E), and how quiet its controls can be (1–3). Every layout uses the
// combined page's header parts and the quiet reel (./Reel.tsx).
//
// The mock reel (REEL3) is built from footage that a cloud session could
// not fetch; without it the page uses the stand-in reel, cut from UR5e
// simulation and ANYmal D clips only.
const REAL = fs.existsSync(
  path.join(process.cwd(), "public/media/library/reel.mp4"),
);
const REEL = REAL ? REEL3 : STANDIN_REEL;

// A still copy of the black bar that sits above the page.
function Bar() {
  return (
    <div className="pz-grid pz-small h-[var(--bar)] items-center bg-black text-white">
      <span className="col-span-3">SGS</span>
      <span className="col-span-3 justify-self-end md:hidden">Menu</span>
      <span className="hidden justify-self-end md:col-span-9 md:flex md:gap-4">
        <span>Paper ↗</span>
        <span>Code ↗</span>
      </span>
    </div>
  );
}

function Variant({
  id,
  name,
  note,
  children,
}: {
  id: string;
  name: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b-[24px] border-black">
      <p className="pz-grid pz-small bg-white py-2">
        <span className="col-span-1">{id.toUpperCase()}</span>
        <span className="col-span-5 md:col-span-11">
          {name} <span className="text-black/50">· {note}</span>
        </span>
      </p>
      <div id={id} data-variant={id} className="cb-variant bg-white">
        <Bar />
        {children}
      </div>
    </section>
  );
}

const TALL = "calc(100svh - var(--bar) - 5rem)";

export default function HighlightsStudy() {
  return (
    <div className="pz st cb">
      <p className="pz-grid pz-small bg-white py-3">
        <span className="col-span-6 md:col-span-8">
          Placements A–E, then controls 1–3.{" "}
          {REAL
            ? "The mock reel from round 3."
            : "The video is a stand-in cut from UR5e simulation and ANYmal D clips only; the real reel drops in unchanged."}
        </span>
      </p>

      <Variant
        id="a"
        name="After the header"
        note="The header as it is, then the reel across the measure, with no heading or caption. On phones the reel is on the first screen."
      >
        <Header id="a-top" />
        <div className="px-[var(--m)] pb-10">
          <QuietReel reel={REEL} maxH={TALL} />
        </div>
      </Variant>

      <Variant
        id="b"
        name="Side by side"
        note="Laptops and up: mark, title and authors in 5 columns, the reel in 7. Phones: mark, title, reel, authors."
      >
        <div className="cb-b">
          <div className="cb-b-mark">
            <Mark />
          </div>
          <Title className="cb-b-title" />
          <QuietReel
            reel={REEL}
            maxH="calc(100svh - var(--bar) - 6rem)"
            className="cb-b-reel"
          />
          <Meta className="cb-b-meta" />
        </div>
      </Variant>

      <Variant
        id="c"
        name="Smaller mark above"
        note="Laptops and up: the mark at a quarter of the screen height with the authors beside it, then the title beside the reel. Phones: as A."
      >
        <div className="cb-c">
          <div className="cb-c-mark">
            <Mark cap="calc(27svh / 0.7275)" />
          </div>
          <Meta className="cb-c-meta" />
          <Title className="cb-c-title" />
          <QuietReel
            reel={REEL}
            maxH="calc(100svh - var(--bar) - 27svh - 6.5rem)"
            className="cb-c-reel"
          />
        </div>
      </Variant>

      <Variant
        id="d"
        name="Reel first"
        note="The reel fills the first screen; the header follows. Phones: the mark and title come up under the reel."
      >
        <div className="px-[var(--m)] pb-8 pt-[var(--m)]">
          <QuietReel
            reel={REEL}
            maxH="calc(100svh - var(--bar) - var(--m) - 4rem)"
          />
        </div>
        <Header id="d-top" />
      </Variant>

      <Variant
        id="e"
        name="Title, reel, then the mark"
        note="The title and authors, the reel under them, and the big mark after the reel."
      >
        <div className="cb-e">
          <Title className="cb-e-title st-lead" />
          <Meta className="cb-e-meta" />
          <QuietReel
            reel={REEL}
            maxH="calc(100svh - var(--bar) - 16rem)"
            className="cb-e-reel"
          />
          <div className="cb-e-mark">
            <Mark />
          </div>
        </div>
      </Variant>

      {(
        [
          [
            "1",
            "now",
            "The chapter on screen",
            "One line under the bar: robot and task on the left; simulation or hardware on the right, with the speed when it is not 1×.",
          ],
          [
            "2",
            "under",
            "Titles under the bar",
            "Each title under its own segment; under them, the robot and simulation or hardware across their chapters. Phones: as 1.",
          ],
          [
            "3",
            "list",
            "Titles as one line",
            "Every title in one wrapping line, grouped by robot and simulation or hardware; the current one in full ink, a tap plays it.",
          ],
        ] as [string, Controls, string, string][]
      ).map(([id, controls, name, note]) => (
        <section key={id} className="border-b-[24px] border-black">
          <p className="pz-grid pz-small bg-white py-2">
            <span className="col-span-1">{id}</span>
            <span className="col-span-5 md:col-span-11">
              {name} <span className="text-black/50">· {note}</span>
            </span>
          </p>
          <div
            id={`k${id}`}
            data-variant={`k${id}`}
            className="bg-white px-[var(--m)] pb-8 pt-4"
          >
            <QuietReel reel={REEL} controls={controls} maxH="62svh" />
          </div>
        </section>
      ))}
    </div>
  );
}
