import "../_poster/poster.css";
import "../_site/site.css";
import Highlights from "./Highlights";
import type { ListFit } from "./HighlightsLayouts";
import Nav from "./Nav";
import { EXTRA, LIBRARY, STANDIN_CLIPS } from "../library";
import ClipsViews from "./ClipsViews";
import { Bibtex, EndMark } from "./Closing";
import { OverTrainingBody } from "./MoreSections";
import { ContinuousRuns, RealWorld } from "./ResultsFootage";
import ResultsScaling from "./ResultsScaling";
import LearningProgress from "./LearningProgress";
import MethodFlow2 from "./MethodFlow2";
import OverviewChosen from "./OverviewChosen";
import QuiltDivider from "./QuiltDivider";
import ResetStrategies from "./ResetStrategies";
import { SECTIONS } from "./sections";
import SummaryPlain, { type SummaryVariant } from "./SummaryPlain";
import SummarySized, { SummarySizeSwitch } from "./SummarySized";
import Top from "./Top";
import "./combined.css";
import "./fold.css";
import "./reels.css";

// /lab/combined: the site the owner is assembling from the studies, one
// section at a time, each approved before the next. Parts are copied into
// this folder rather than imported from the study they came from, so the
// studies stay as reviewed; shared, unchanged pieces (content.ts, the
// Wordmark, poster.css and site.css) are imported.
//
// Sections so far:
// 1. Header, from /lab/site-2 and /lab/site-3, with the full title; in
//    colour scheme H4, layout S4 (./Top.tsx; owner, 2026-10-08: the S4/S6
//    switch is gone from this page).
// 2. Highlights, layout R1 of /lab/reel-layouts/ (./Highlights.tsx). The
//    site (app/page.tsx) and this page pass fold="f2" fit="runin" (owner,
//    2026-10-09): a smaller header, "Highlights" beside the video (r6) and
//    the run-in chapter list, so the video is on the first screen
//    (./fold.css).
// 3. Summary: F with size F1, full width, thin stroke with the key phrases
//    heavier (owner, 2026-10-07). The comparison pages pass `summary` (one
//    of /lab/summaries/ C, D or F: /lab/combined-c/, -d/, -f/) or `sizes`
//    (switches for size, width and stroke: /lab/combined-f-sizes/).
// 4. Overview: four panes, one sentence and one row of clips each, layout
//    O1 (owner's pick, 2026-10-07; O2–O4 by link: ?overview=o2).
// 5. Method: the owner's order, second version, text style W2
//    (./MethodFlow2.tsx; /lab/method-flow-2/). The earlier Method
//    (./Method.tsx) is no longer on the page.
// `draft` (/lab/combined-draft/) adds only the parked visual for
//    "Sampling during training" (paper Figure 7).
// 6. Results: the quilt as a "Results" divider, then 01 Scaling, 02 Real
//    world, 03 Continuous runs.
// 7. Clips (owner, 2026-10-08): every clip, grouped UR5e real world, UR5e
//    simulation, ANYmal C, ANYmal D, Franka (./Clips.tsx). It replaces the
//    draft's Footage section and the Poster 3 clip index, which showed the
//    UR5e simulation runs side by side under "Nominal" labels.
// The divider before the results: a few clips, one per task, each robot's
// label before its clips (owner, 2026-10-07: "use less videos, don't use
// multiple per task"; then "just enough that it's a nice cute divider").
// Nine clips, the real nut first, in layout Q1 (owner's pick, 2026-10-08:
// labels staggered, see ./QuiltDivider.tsx).
export type Fold = "f1" | "f2" | "f3";

const one = (id: string, title?: string) => {
  const c = [...LIBRARY, ...EXTRA, ...STANDIN_CLIPS].find((k) => k.id === id)!;
  return title ? { ...c, title } : c;
};
const QUILT = [
  // The nut first (owner, 2026-10-08).
  one("ur5e-real-nut-3", "Nut"),
  one("ur5e-real-rod-5", "Rod"),
  one("ur5e-real-gear-mesh-1", "Gear mesh"),
  one("ur5e-sim-bnc-5", "BNC connector"),
  one("standin-ur5e-sim-waterproof", "Waterproof connector"),
  one("franka-sim-nut-2", "Nut"),
  one("anymal-c-terrains"),
  one("anymal-d-climbing-box"),
  one("anymal-d-stepping-stones"),
];

export default function CombinedPage({
  summary,
  sizes = false,
  draft = false,
  fold,
  fit,
}: {
  summary?: SummaryVariant;
  sizes?: boolean;
  // Add the parked "Sampling during training" visual (/lab/combined-draft/).
  draft?: boolean;
  // A smaller header, so the Highlights video is on the first screen
  // (/lab/fold-1/ to -3/, 2026-10-09; ./fold.css).
  fold?: Fold;
  // With F2 or F3: the chapter list no taller than the video (/lab/list-1/
  // to -3/, 2026-10-09).
  fit?: ListFit;
}) {
  return (
    <div className={`pz st cb ${fold ? `cb-fold cb-fold-${fold}` : ""}`}>
      <Nav sections={SECTIONS} speedNote />
      <Top layout="s4" links />
      <Highlights
        layout={fold === "f2" || fold === "f3" ? "r6" : "r1"}
        fit={fit}
      />
      {sizes ? (
        <SummarySized v={summary ?? "f"} />
      ) : summary ? (
        <SummaryPlain v={summary} />
      ) : (
        <SummaryPlain v="f" size="f1" width="full" stroke="thin-key" copy={2} />
      )}
      {!summary && !sizes && (
        <>
          <OverviewChosen />
          {/* The Method in the owner's order, second version
              (/lab/method-flow-2/), text style W1 (owner's pick), parts
              01 and 02; 03 and 04 are parked at /lab/method-toy/. */}
          <MethodFlow2
            style="w1"
            algo="c"
            parts={["ppo", "configurations", "during"]}
            configurations={<ResetStrategies />}
            during={
              draft ? (
                <OverTrainingBody />
              ) : (
                <LearningProgress view="bandcurve" />
              )
            }
          />
          {/* Results: the quilt of /lab/poster-3 as a small "Results" band,
              for looking at, not for using (owner, 2026-10-08). */}
          <section
            id="results"
            aria-label="Results"
            className="scroll-mt-[var(--bar)]"
          >
            <div aria-hidden="true" className="pointer-events-none select-none">
              <QuiltDivider clips={QUILT} direction="toReal" variant="q1" />
            </div>
          </section>
          <ResultsScaling />
          <RealWorld />
          <ContinuousRuns />
          {/* Every clip, grouped by robot and setting (owner, 2026-10-08). */}
          <ClipsViews view="k1" />
          {/* The citation, then the mark on black to close (2026-10-08). */}
          <Bibtex />
          <EndMark />
        </>
      )}
      {sizes && <SummarySizeSwitch />}
    </div>
  );
}
