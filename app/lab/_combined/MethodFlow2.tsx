import type { ReactNode } from "react";
import { relative } from "../_method/sgs";
import { LIVE, snapshot, TOY } from "../_nav/nav";
import BetaExplorer, { WeightingText } from "./BetaExplorer";
import MethodMaze from "./MethodMaze";
import { AlgorithmPair, ToCome } from "./MoreSections";
import SamplingFigure from "./SamplingFigure";

// The Method in the owner's order, second version (owner, 2026-10-07):
// "task configurations" always in full; the parts numbered 01–05 in their
// bands instead of repeating "Method", the numbers as large as the titles; the text across the full width,
// above each figure, with the mazes wider. Two text styles, compared on
// /lab/method-flow-2/:
//   w1  the summary's next size down (F2), regular with bold key phrases
//   w2  the summary's own size and stroke (F1, thin with bold key phrases)

export type FlowText = "w1" | "w2";

const EXPLAINER = "https://rosarioscalise.com/garage-success-guided-sampling";

// Where the draws go on the toy example's snapshot (see MethodFlow.tsx).
function shares() {
  const { p } = snapshot();
  const r = relative(TOY);
  let all = 0;
  let inMid = 0;
  let n = 0;
  for (const x of p) {
    all += r(x);
    if (x >= 0.1 && x <= 0.9) {
      inMid += r(x);
      n++;
    }
  }
  return {
    n,
    of: p.length,
    sgs: Math.round((inMid / all) * 100),
    uniform: Math.round((n / p.length) * 100),
  };
}

// A numbered part: its band (number where "Method" was, then the name),
// the text across the page, then its figure.
function Step({
  id,
  n,
  title,
  text,
  style,
  children,
}: {
  id: string;
  n: number;
  title: string;
  text: ReactNode;
  style: FlowText;
  children?: ReactNode;
}) {
  return (
    <div id={id} className="cb-part scroll-mt-[calc(var(--bar)+6rem)]">
      <h3 className="cb-part-band pz-mid">
        <span className="cb-step-num pz-num">{String(n).padStart(2, "0")}</span>
        <span>{title}</span>
      </h3>
      <div className="cb-part-in-band">
        <div className={`cb-flow-text cb-flow-${style}`}>{text}</div>
        {children}
      </div>
    </div>
  );
}

export default function MethodFlow2({
  id = "method",
  style,
}: {
  id?: string;
  style: FlowText;
}) {
  const s = shares();
  const part = (slug: string) => `${id}-${slug}`;
  return (
    <section
      id={id}
      aria-label="Method"
      className="cb-method scroll-mt-[var(--bar)] pb-16 md:pb-24"
    >
      <h2 className="pz-head border-y border-black bg-white px-[var(--m)] pb-[0.08em] pt-[0.04em]">
        Method
      </h2>
      <div className="cb-method-body cb-parts-bands">
        <Step
          id={part("ppo")}
          n={1}
          title="The change to PPO"
          style={style}
          text={
            <p>
              SGS is <strong>standard PPO with a small outer loop</strong>. It
              changes only which <strong>task configuration</strong> an
              environment resets to; the policy, the reward and the PPO update
              stay as they are.
            </p>
          }
        >
          <AlgorithmPair />
        </Step>

        <Step
          id={part("configurations")}
          n={2}
          title="Task configurations"
          style={style}
          text={
            <p>
              A task configuration is a triple{" "}
              <strong>
                (s<sub>0</sub>, g, e)
              </strong>
              : the robot’s start state s<sub>0</sub>, its goal g, and the
              environment e, such as the terrain type or the layout of the
              scene. SGS fixes a large set of task configurations before
              training: 104,000 for locomotion, 32,768 for each assembly task.
            </p>
          }
        >
          <ToCome>Clips or an interactive view of task configurations.</ToCome>
        </Step>

        <Step
          id={part("weighting")}
          n={3}
          title="The weighting"
          style={style}
          text={
            <>
              <p>
                A <strong>toy example</strong> shows how SGS chooses among task
                configurations. Point robots learn to reach every cell of a
                maze. Every episode starts at S in the same maze, so{" "}
                <strong>each cell is one task configuration</strong>: the same s
                <sub>0</sub> and e, a different goal g.
              </p>
              <p>
                <WeightingText />
              </p>
            </>
          }
        >
          <BetaExplorer
            presetLabel="As in the toy example"
            fromToy
            withText={false}
          />
        </Step>

        <Step
          id={part("sampling")}
          n={4}
          title="Sampling"
          style={style}
          text={
            <p>
              Each time a robot finishes an episode, its next task configuration
              is <strong>drawn at random in proportion to these weights</strong>
              ; here, rounds of {LIVE.robots} draws, one per robot. Only {s.n}{" "}
              of the {s.of} task configurations are reached some of the time,
              yet they get <strong>about {s.sgs}% of the draws</strong>; uniform
              sampling would give them {s.uniform}%. The others still get some,
              so none is ruled out.
            </p>
          }
        >
          <div className="cb-flow-fig">
            <SamplingFigure />
          </div>
        </Step>

        <Step
          id={part("training")}
          n={5}
          title="Training"
          style={style}
          text={
            <>
              <p>
                During training the loop runs continuously. {LIVE.robots} robots
                train one policy; whenever one finishes an episode, SGS{" "}
                <strong>records whether it succeeded</strong>, updates that task
                configuration’s success rate and draws its next one. As the
                robots improve, the grey region grows and{" "}
                <strong>the draws move outward with its edge</strong>.
              </p>
              <p className="cb-flow-link">
                <a href={EXPLAINER} className="st-link">
                  Step-by-step explainer by Rosario Scalise ↗
                </a>
              </p>
            </>
          }
        >
          <div className="cb-flow-fig">
            <MethodMaze />
          </div>
        </Step>
      </div>
    </section>
  );
}
