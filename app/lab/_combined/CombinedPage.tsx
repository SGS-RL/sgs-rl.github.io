import "../_poster/poster.css";
import "../_site/site.css";
import Highlights from "./Highlights";
import Nav from "./Nav";
import { LIBRARY } from "../library";
import ClipIndex from "../_poster3/ClipIndex";
import P3Gallery from "../_poster3/Gallery";
import Locomotion from "../_poster3/Locomotion";
import Quilt from "../_poster3/Quilt";
import Runs from "../_poster3/Runs";
import "../_poster3/poster3.css";
import { FrankaSim, Hardware, SimPairs } from "./Footage";
import Method from "./Method";
import {
  Algorithm,
  Configurations,
  OverTraining,
  Results,
} from "./MoreSections";
import OverviewChosen from "./OverviewChosen";
import { DRAFT_SECTIONS, SECTIONS } from "./sections";
import SummaryPlain, { type SummaryVariant } from "./SummaryPlain";
import SummarySized, { SummarySizeSwitch } from "./SummarySized";
import ChosenHeader, { HeaderSwitch } from "./HeaderChoice";
import "./combined.css";
import "./reels.css";

// /lab/combined: the site the owner is assembling from the studies, one
// section at a time, each approved before the next. Parts are copied into
// this folder rather than imported from the study they came from, so the
// studies stay as reviewed; shared, unchanged pieces (content.ts, the
// Wordmark, poster.css and site.css) are imported.
//
// Sections so far:
// 1. Header, from /lab/site-2 and /lab/site-3, with the full title; in
//    colour scheme H4, layout S6 or S4 (./Top.tsx), switchable while the
//    owner decides (./HeaderChoice.tsx).
// 2. Highlights, layout R1 of /lab/reel-layouts/ (./Highlights.tsx).
// 3. Summary: F with size F1, full width, thin stroke with the key phrases
//    heavier (owner, 2026-10-07). The comparison pages pass `summary` (one
//    of /lab/summaries/ C, D or F: /lab/combined-c/, -d/, -f/) or `sizes`
//    (switches for size, width and stroke: /lab/combined-f-sizes/).
// 4. Overview: four panes, one sentence and one row of clips each, layout
//    O1 (owner's pick, 2026-10-07; O2–O4 by link: ?overview=o2).
// 5. Method: version B of /lab/method-nav (the live maze, its text and the
//    explainer link) and the Beta weighting to play with (./Method.tsx).
// 6–12 set up on 2026-10-07 from the owner's list, populated where the
//    content existed, placeholders ("To come") elsewhere. Parked, with
//    `draft`, at /lab/combined-draft/ until they are reviewed one at a
//    time (owner, 2026-10-07); /lab/combined/ ends at the Method. Task
//    configurations in training (paper Figure 2), PPO next to PPO with SGS,
//    sampling over training (paper Figure 7), the Index quilt of
//    /lab/poster-3 as a divider, results (the scaling chart with a policy
//    per scale), footage (continuous runs, real world, UR5e simulation,
//    ANYmal D, Franka; ./Footage.tsx and ../_poster3) and the clip index.
// The quilt shows 16:9 clips only: a square cell would crop a 32:9 pair.
const QUILT = LIBRARY.filter((c) => c.kind === "clip");

export default function CombinedPage({
  summary,
  sizes = false,
  draft = false,
}: {
  summary?: SummaryVariant;
  sizes?: boolean;
  // Include sections 6–12, not yet reviewed (/lab/combined-draft/).
  draft?: boolean;
}) {
  return (
    <div className="pz st cb">
      <Nav sections={draft ? DRAFT_SECTIONS : SECTIONS} />
      <ChosenHeader />
      <Highlights />
      {sizes ? (
        <SummarySized v={summary ?? "f"} />
      ) : summary ? (
        <SummaryPlain v={summary} />
      ) : (
        <SummaryPlain v="f" size="f1" width="full" stroke="thin-key" />
      )}
      {!summary && !sizes && (
        <>
          <OverviewChosen />
          <Method />
        </>
      )}
      {!summary && !sizes && draft && (
        <>
          <Configurations />
          <Algorithm />
          <OverTraining />
          <P3Gallery clips={LIBRARY}>
            {/* 9. A divider before the results: the Index quilt of
                /lab/poster-3, for looking at, not for using. */}
            <div aria-hidden="true" className="pointer-events-none select-none">
              <Quilt clips={QUILT} direction="toReal" />
            </div>
            <Results />
            <h2
              id="footage"
              className="pz-head scroll-mt-[var(--bar)] border-y border-black bg-white px-[var(--m)] pb-[0.08em] pt-[0.04em]"
            >
              Footage
            </h2>
            <Runs />
            <Hardware />
            <SimPairs />
            <Locomotion />
            <FrankaSim />
            <h2
              id="clips"
              className="pz-head scroll-mt-[var(--bar)] border-y border-black bg-white px-[var(--m)] pb-[0.08em] pt-[0.04em]"
            >
              Clips
            </h2>
            <section className="bg-white px-[var(--m)] pb-20 pt-6 md:pb-28 md:pt-10">
              <ClipIndex />
            </section>
          </P3Gallery>
        </>
      )}
      {sizes && <SummarySizeSwitch />}
      {/* Room to scroll the last section clear of the switches. */}
      <div className="h-40" aria-hidden="true" />
      <HeaderSwitch />
    </div>
  );
}
