import type { ReactNode } from "react";
import "../_poster/poster.css";
import "../_site/site.css";
import Gallery from "../_site3/Gallery";
import { OpeningA, OpeningB, REEL } from "./Opening";
import Overview, { OVERVIEW_CLIPS } from "./Overview";
import Summary from "./Summary";
import { STANDIN_REEL } from "../library";
import "./combined.css";

// /lab/opening: the two openings left from /lab/highlights (A, B; titles
// under the bar) each followed by the two candidates for the next
// section: Site 3's colourful Overview and the serious page's Summary.

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

function Combo({
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
        <span className="col-span-2 md:col-span-1">{id.toUpperCase()}</span>
        <span className="col-span-4 md:col-span-11">
          {name} <span className="text-black/50">· {note}</span>
        </span>
      </p>
      <div data-variant={id} className="bg-white">
        <Bar />
        {children}
      </div>
    </section>
  );
}

export default function OpeningStudy() {
  return (
    <div className="pz st cb">
      <Gallery clips={OVERVIEW_CLIPS}>
        <p className="pz-grid pz-small bg-white py-3">
          <span className="col-span-6 md:col-span-8">
            Openings A and B from /lab/highlights, each followed by the Overview
            or the Summary.
            {REEL === STANDIN_REEL &&
              " The reel is the stand-in (UR5e simulation and ANYmal D only); in the Overview, single runs stand in for the UR5e pairs and the hardware clips are missing."}
          </span>
        </p>
        <Combo
          id="a1"
          name="A + Overview"
          note="Header, the reel, then Site 3's colourful Overview."
        >
          <OpeningA id="a1-top" />
          <Overview id="a1-overview" stick="top-0" />
        </Combo>
        <Combo
          id="a2"
          name="A + Summary"
          note="Header, the reel, then the serious page's summary paragraph."
        >
          <OpeningA id="a2-top" />
          <Summary id="a2-summary" />
        </Combo>
        <Combo
          id="b1"
          name="B + Overview"
          note="Mark, title and authors beside the reel, then the Overview."
        >
          <OpeningB id="b1-top" />
          <Overview id="b1-overview" stick="top-0" />
        </Combo>
        <Combo
          id="b2"
          name="B + Summary"
          note="Mark, title and authors beside the reel, then the summary paragraph."
        >
          <OpeningB id="b2-top" />
          <Summary id="b2-summary" />
        </Combo>
      </Gallery>
    </div>
  );
}
