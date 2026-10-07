import "../_poster/poster.css";
import "../_site/site.css";
import ChosenHeader, { HeaderSwitch } from "./HeaderChoice";
import HighlightsLayout, { type ReelLayout } from "./HighlightsLayouts";
import { REEL } from "./reelSource";
import "./combined.css";
import "./reels.css";

// /lab/reel-layouts: the Highlights section in five layouts, each under the
// header as it will sit on the page. The switch at the bottom left flips
// every header between S4 (the default) and S6 (owner, 2026-10-07).
const VARIANTS: [ReelLayout, string, string][] = [
  [
    "r1",
    "Chapter list on the right",
    "Reel A of /lab/reel mirrored: the video first, the chapters beside it, grouped by robot, numbered, with start times. A row jumps to its chapter.",
  ],
  [
    "r2",
    "Chapter list on the right, mint band",
    "R1 on a coloured band, as reel C of /lab/reel.",
  ],
  [
    "r3",
    "Index on the right",
    "The chapters as a table in the style of the Clips index of /lab/site: No., clip, robot, domain, speed; the current row yellow.",
  ],
  [
    "r4",
    "Centred",
    "The video centred under the title, each chapter's title under its segment of the bar.",
  ],
  [
    "r5",
    "Title and list beside",
    "No heading band: the video, and beside it the big title over the chapter list. Phones: title, video, list.",
  ],
];

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

export default function ReelLayoutsStudy() {
  return (
    <div className="pz st cb">
      {VARIANTS.map(([id, name, note]) => (
        <section key={id} id={id} className="border-b-[24px] border-black">
          <p className="pz-grid pz-small bg-white py-2">
            <span className="col-span-1">{id.toUpperCase()}</span>
            <span className="col-span-5 md:col-span-11">
              {name}
              <span className="text-black/50"> · {note}</span>
            </span>
          </p>
          <Bar />
          <ChosenHeader id={`top-${id}`} />
          <HighlightsLayout reel={REEL} layout={id} id={`hl-${id}`} />
        </section>
      ))}
      <HeaderSwitch />
    </div>
  );
}
