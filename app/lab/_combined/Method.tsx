import { LIVE } from "../_nav/nav";
import BetaExplorer from "./BetaExplorer";
import MethodMaze, { ChanceSwitch } from "./MethodMaze";

// Section 5 of /lab/combined: the Method (owner, 2026-10-07: "B from
// /lab/method-nav/, plus an explanation of the beta weighting ... maybe
// even interactive"). First version B of /lab/method-nav: the live maze
// (the navigation toy example of ../_nav) on the left, its text and the link to
// Rosario Scalise's explainer on the right, as the reel and its chapter
// list. Then the Beta weighting to play with (./BetaExplorer.tsx).
// Owner, 2026-10-07: explain plainly what a task configuration is and tie
// it to the red squares; "toy example", never "toy"; "success rate", no
// p̂; no average-success readout.

const EXPLAINER = "https://rosarioscalise.com/garage-success-guided-sampling";

// The Method's paragraphs, also used by the split versions on
// /lab/method-parts/ (./MethodParts.tsx).
export function ConfigurationText() {
  return (
    <p className="cb-reading-p">
      <strong>A task configuration</strong> is one version of the task: where an
      episode starts, where the goal is, and the terrain or object. SGS draws
      each episode’s task configuration from those the policy{" "}
      <strong>solves only some of the time</strong>, judged from its recent
      outcomes.
    </p>
  );
}

export function ToyExampleText() {
  return (
    <p className="cb-reading-p">
      In this toy example, {LIVE.robots} point robots learn to reach every cell
      of a maze. Every episode starts at S, so{" "}
      <strong>each cell is one task configuration</strong>. Grey shows how often
      each is reached.{" "}
      <strong>
        The chance of picking a task configuration is highest at the edge of the
        grey region
      </strong>{" "}
      (shown in red).{" "}
      <strong>Red squares are the task configurations being tried</strong>,
      drawn at random from those chances.
    </p>
  );
}

export function ExplainerLink() {
  return (
    <p className="cb-reading-p">
      <a href={EXPLAINER} className="st-link">
        Step-by-step explainer by Rosario Scalise ↗
      </a>
    </p>
  );
}

export default function Method({ id = "method" }: { id?: string }) {
  return (
    <section
      id={id}
      aria-label="Method"
      className="cb-method scroll-mt-[var(--bar)] pb-16 md:pb-24"
    >
      <h2 className="pz-head border-y border-black bg-white px-[var(--m)] pb-[0.08em] pt-[0.04em]">
        Method
      </h2>
      <div className="cb-method-body">
        <div className="cb-method-row">
          <div className="cb-maze">
            <MethodMaze />
          </div>
          <div className="cb-reading">
            <ConfigurationText />
            <ToyExampleText />
            <ExplainerLink />
          </div>
        </div>
        <BetaExplorer />
        <ChanceSwitch />
      </div>
    </section>
  );
}
