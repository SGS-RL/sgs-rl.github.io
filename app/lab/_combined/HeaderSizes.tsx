import "../_poster/poster.css";
import "../_site/site.css";
import { Mark, Meta, Title } from "./Header";
import { HEADER_INKS as inks } from "./inks";
import "./combined.css";
import "./sizes.css";

// /lab/header-sizes: the H4 header with a smaller SGS and the authors moved
// away from it, in six layouts. The owner found the authors too close to
// the mark (2026-10-06). The mark spans a whole number of grid columns
// (--n); on a short screen HEADER_CAP shrinks it further so the header
// still fits the first screen. On phones the mark stays across the page in
// every variant: narrower, the words inside it no longer fit. Layouts are
// in ./sizes.css.
const VARIANTS: [id: string, name: string, note: string][] = [
  [
    "s1",
    "Ten columns, more air",
    "The current layout with the mark on 10 of 12 columns and a line of space above the title and the authors.",
  ],
  [
    "s2",
    "Nine columns, authors beside",
    "The authors move up beside the mark, level with its foot; the title below.",
  ],
  [
    "s3",
    "Eight columns, authors at the top",
    "The authors in the top right corner, level with the top of the mark; the title below, across the page.",
  ],
  [
    "s4",
    "Half, title beside",
    "The mark on half the page, the title beside it on its foot, the authors under the title. Phones: the mark across the page.",
  ],
  [
    "s5",
    "A third, title large",
    "The mark as a masthead on 4 columns, the authors in the top right, the title larger across the page. Phones: the mark across the page.",
  ],
  [
    "s6",
    "Eight columns, on the right",
    "The mark moved to the right; the authors on the left, level with its foot; the title below.",
  ],
];

// A still copy of the page's black bar.
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

export default function HeaderSizes() {
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
          <header
            className={`hs hs-${id} pz-grid`}
            style={{ background: inks.ground, color: inks.type }}
          >
            <div className="hs-mark">
              <Mark measure="var(--hs-measure)" />
            </div>
            <Title className="hs-title st-lead" />
            <Meta className="hs-meta" />
          </header>
        </section>
      ))}
    </div>
  );
}
