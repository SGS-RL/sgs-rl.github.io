import ScalingCharts from "./ScalingChart";

// Results, part 01: scaling (owner, 2026-10-08: "keep this one clean and
// more minimal ... without the videos for each checkpoint"). Set like the
// Method's parts: a numbered band, one sentence in the Method's text style
// (W1), then the two charts.
export default function ResultsScaling() {
  return (
    <div
      id="results-scaling"
      className="cb-part scroll-mt-[calc(var(--bar)+6rem)]"
    >
      <h3 className="cb-part-band pz-mid">
        <span className="cb-step-num pz-num">01</span>
        <span>Scaling</span>
      </h3>
      <div className="cb-part-in-band pb-16 pt-6 md:pb-24">
        <div className="cb-flow-text cb-flow-w1">
          <p>
            With SGS, <strong>success keeps rising</strong> as the number of
            parallel environments grows to a million.{" "}
            <strong>The baselines stall or collapse.</strong>
          </p>
        </div>
        <ScalingCharts />
      </div>
    </div>
  );
}
