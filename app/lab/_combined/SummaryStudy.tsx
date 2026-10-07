import type { ReactNode } from "react";
import "../_poster/poster.css";
import "../_site/site.css";
import Section from "../_swiss3/Section";
import "../_swiss3/swiss3.css";
import ChosenHeader, { HeaderSwitch } from "./HeaderChoice";
import Highlights from "./Highlights";
import Summary from "./Summary";
import SummaryPlain, {
  SUMMARY_TEXT as TEXT,
  type SummaryVariant,
} from "./SummaryPlain";
import "./combined.css";
import "./reels.css";

// /lab/summaries: summaries after the combined page's header and
// highlights. Round 1 (owner, 2026-10-07: "the summary from serious AND the
// other one"): A, Serious 3's "01 Summary" in the Swiss system (paper
// ground, weight 500, numbered); B, the same paragraph in this page's
// single weight on white, unnumbered (./Summary.tsx). Round 2 ("I like the
// text of B better, but I don't like the sidebar thing"): C–F, B's type
// across the page with no label column. A and B stay at the end.

const PLAIN: [SummaryVariant, string, string][] = [
  ["c", "No label", "B's paragraph across the page; no label, no rule."],
  ["d", "Rule, no label", "A rule above marks the section; no label."],
  [
    "e",
    "Larger",
    "Larger type across the page, as a statement; no label, no rule.",
  ],
  [
    "f",
    "Big title",
    'A big "Summary" title band, as Highlights has, then the paragraph across the page.',
  ],
];

function Label({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p className="pz-grid pz-small border-y-[12px] border-black bg-white py-2">
      <span className="col-span-1">{id}</span>
      <span className="col-span-5 md:col-span-11">{children}</span>
    </p>
  );
}

export default function SummaryStudy() {
  return (
    <div className="pz st cb">
      <div className="pz-grid pz-small h-[var(--bar)] items-center bg-black text-white">
        <span className="col-span-3">SGS</span>
        <span className="col-span-3 justify-self-end md:col-span-9">
          Paper ↗ Code ↗
        </span>
      </div>
      <ChosenHeader />
      <Highlights />

      {PLAIN.map(([v, name, note]) => (
        <div key={v}>
          <Label id={v.toUpperCase()}>
            {name} <span className="text-black/50">· {note}</span>
          </Label>
          <SummaryPlain v={v} id={`summary-${v}`} />
        </div>
      ))}

      <Label id="A">
        Serious{" "}
        <span className="text-black/50">
          · From /lab/swiss-3: the Swiss system, paper ground, numbered.
        </span>
      </Label>
      {/* .swiss makes a page at least a screen tall; this is one section. */}
      <div
        className="swiss s3 pt-14 md:pt-20"
        data-theme="light"
        style={{ minHeight: 0 }}
      >
        <Section id="summary-a" n="01" label="Summary">
          <p className="sw-lead col-span-full">{TEXT}</p>
        </Section>
      </div>

      <Label id="B">
        In this page&apos;s style{" "}
        <span className="text-black/50">
          · From /lab/opening: the same paragraph in the page&apos;s single
          weight, on white, unnumbered.
        </span>
      </Label>
      <div className="pt-14 md:pt-20">
        <Summary id="summary-b" />
      </div>
      <HeaderSwitch />
    </div>
  );
}
