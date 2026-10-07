import { relative } from "../_method/sgs";
import { LIVE, snapshot, TOY } from "../_nav/nav";
import BetaExplorer from "./BetaExplorer";
import { ExplainerLink } from "./Method";
import MethodMaze from "./MethodMaze";
import { Part } from "./MethodParts";
import { AlgorithmPair, ToCome } from "./MoreSections";
import SamplingFigure from "./SamplingFigure";

// The Method in the owner's order (2026-10-07), as a mock-up on
// /lab/method-flow/, with the band subtitles (M3 of /lab/method-parts/):
// 1 the change to PPO, which names task configurations without explaining
// them; 2 what a task configuration is, (s0, g, e), kept brief; 3 the
// weighting, on the toy example, introduced here; 4 sampling from those
// weights; 5 the same loop during training (the live maze).

// Where the draws go on the toy example's snapshot: the configurations
// reached only some of the time (10–90%), their number and their share of
// the draws under SGS and under uniform sampling.
function shares() {
  const { p } = snapshot();
  const r = relative(TOY);
  const mid = (x: number) => x >= 0.1 && x <= 0.9;
  let all = 0;
  let inMid = 0;
  let n = 0;
  for (const x of p) {
    all += r(x);
    if (mid(x)) {
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

export default function MethodFlow({ id = "method" }: { id?: string }) {
  const s = shares();
  const part = (slug: string) => `${id}-${slug}`;
  return (
    <section
      id={id}
      aria-label="Method"
      data-parts="bands"
      className="cb-method scroll-mt-[var(--bar)] pb-16 md:pb-24"
    >
      <h2 className="pz-head border-y border-black bg-white px-[var(--m)] pb-[0.08em] pt-[0.04em]">
        Method
      </h2>
      <div className="cb-method-body cb-parts-bands">
        <Part id={part("ppo")} n={1} title="The change to PPO" style="bands">
          <div className="cb-part-lead">
            <p className="cb-reading-p">
              SGS is <strong>standard PPO with a small outer loop</strong>. It
              changes only which <strong>task configuration</strong> an
              environment resets to. The policy, the reward and the PPO update
              stay as they are.
            </p>
          </div>
          <AlgorithmPair />
        </Part>

        <Part
          id={part("configurations")}
          n={2}
          title="Task configurations"
          style="bands"
        >
          <div className="cb-part-lead">
            <p className="cb-reading-p">
              A task configuration is a triple{" "}
              <strong>
                (s<sub>0</sub>, g, e)
              </strong>
              : the robot’s start state s<sub>0</sub>, its goal g, and the
              environment e, such as the terrain type or the layout of the
              scene. SGS fixes a large set of them before training: 104,000 for
              locomotion, 32,768 for each assembly task.
            </p>
          </div>
          <ToCome>Clips or an interactive view of task configurations.</ToCome>
        </Part>

        <Part id={part("weighting")} n={3} title="The weighting" style="bands">
          <div className="cb-part-lead">
            <p className="cb-reading-p">
              A <strong>toy example</strong> shows how SGS chooses among them.
              Point robots learn to reach every cell of a maze. Every episode
              starts at S in the same maze, so{" "}
              <strong>each cell is one task configuration</strong>: the same s
              <sub>0</sub> and e, a different goal g.
            </p>
          </div>
          <BetaExplorer presetLabel="As in the toy example" fromToy />
        </Part>

        <Part id={part("sampling")} n={4} title="Sampling" style="bands">
          <div className="cb-method-row">
            <div className="cb-maze">
              <SamplingFigure />
            </div>
            <div className="cb-reading">
              <p className="cb-reading-p">
                Each time a robot finishes an episode, its next task
                configuration is{" "}
                <strong>drawn at random in proportion to these weights</strong>.
                Here, rounds of {LIVE.robots} draws, one per robot.
              </p>
              <p className="cb-reading-p">
                Only {s.n} of the {s.of} task configurations are reached some of
                the time, yet they get{" "}
                <strong>about {s.sgs}% of the draws</strong>. Uniform sampling
                would give them {s.uniform}%. The others still get some, so none
                is ruled out.
              </p>
            </div>
          </div>
        </Part>

        <Part id={part("training")} n={5} title="Training" style="bands">
          <div className="cb-method-row">
            <div className="cb-maze">
              <MethodMaze />
            </div>
            <div className="cb-reading">
              <p className="cb-reading-p">
                During training the loop runs continuously. {LIVE.robots} robots
                train one policy. Whenever one finishes an episode, SGS{" "}
                <strong>records whether it succeeded</strong>, updates that task
                configuration’s success rate and draws its next one.
              </p>
              <p className="cb-reading-p">
                As the robots improve, the grey region grows and{" "}
                <strong>the draws move outward with its edge</strong>.
              </p>
              <ExplainerLink />
            </div>
          </div>
        </Part>
      </div>
    </section>
  );
}
