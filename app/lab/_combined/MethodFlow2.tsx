import type { ReactNode } from "react";
import BetaExplorer from "./BetaExplorer";
import MethodMaze from "./MethodMaze";
import { AlgoStyleBlock, type AlgoStyle } from "./AlgoStyles";
import "./algo.css";
import { ToCome } from "./MoreSections";

// The Method in the owner's order, second version (owner, 2026-10-07):
// "task configurations" always in full; the parts numbered 01–05 in their
// bands instead of repeating "Method", the numbers as large as the titles; the text across the full width,
// above each figure, with the mazes wider; no semicolons; the text thin
// with its key phrases bold, the summary's stroke (thin only was tried and
// dropped). Two sizes, compared on
// /lab/method-flow-2/:
//   w1  the summary's next size down (F2)
//   w2  the summary's own size (F1)
//   w3  two sizes down, about the reel's chapter list (F3), a little
//       heavier so the thin stroke stays readable (owner, 2026-10-07: "the
//       text size is too large, can we make it smaller?")

export type FlowText = "w1" | "w2" | "w3";

const EXPLAINER = "https://rosarioscalise.com/garage-success-guided-sampling";

// A numbered part: its band (number where "Method" was, then the name),
// the text across the page, then its figure. beside: the figure (a maze)
// on the left at the shared maze width, the text on its right (owner,
// 2026-10-07: the mazes "too large, and not uniform ... the maze is on
// one side, the explanation is next to it"); phones: text, then maze.
function Step({
  id,
  n,
  title,
  text,
  style,
  beside = false,
  children,
}: {
  id: string;
  n: number;
  title: string;
  text?: ReactNode;
  style: FlowText;
  beside?: boolean;
  children?: ReactNode;
}) {
  return (
    <div id={id} className="cb-part scroll-mt-[calc(var(--bar)+6rem)]">
      <h3 className="cb-part-band pz-mid">
        <span className="cb-step-num pz-num">{String(n).padStart(2, "0")}</span>
        <span>{title}</span>
      </h3>
      <div className="cb-part-in-band">
        {beside ? (
          <div className="cb-step-row">
            <div className="cb-step-fig">{children}</div>
            <div className={`cb-flow-text cb-flow-${style} cb-step-side`}>
              {text}
            </div>
          </div>
        ) : (
          <>
            {text && (
              <div className={`cb-flow-text cb-flow-${style}`}>{text}</div>
            )}
            {children}
          </>
        )}
      </div>
    </div>
  );
}

// algo: how part 01's pseudocode is set (./AlgoStyles.tsx); the combined
// page uses C, JetBrains Mono (owner, 2026-10-07), the study keeps A.
export type MethodPart =
  "ppo" | "configurations" | "weighting" | "sampling" | "during";

// parts: which parts to show (default: the four of the toy-example flow).
// The combined page shows 01, 02 and "during", a third part, Sampling
// during training, held as a placeholder until the owner's visuals from
// real training exist (2026-10-08); `during` fills it (the draft shows the
// paper's Figure 7). 03 and 04, the toy example, are parked at
// /lab/method-toy/.
export default function MethodFlow2({
  id = "method",
  style,
  algo = "a",
  parts,
  heading = "Method",
  configurations,
  during,
}: {
  id?: string;
  style: FlowText;
  algo?: AlgoStyle;
  parts?: MethodPart[];
  heading?: string;
  // Part 02's figure (the combined page: the reset strategies,
  // ./ResetStrategies.tsx); the studies keep the "To come" box.
  configurations?: ReactNode;
  during?: ReactNode;
}) {
  const part = (slug: string) => `${id}-${slug}`;
  const show = (p: MethodPart) => (parts ? parts.includes(p) : p !== "during");
  return (
    <section
      id={id}
      aria-label="Method"
      className="cb-method scroll-mt-[var(--bar)] pb-16 md:pb-24"
    >
      <h2 className="pz-head border-y border-black bg-white px-[var(--m)] pb-[0.08em] pt-[0.04em]">
        {heading}
      </h2>
      <div className="cb-method-body cb-parts-bands">
        {show("ppo") && (
          <Step
            id={part("ppo")}
            n={1}
            title="The change to PPO"
            style={style}
            text={
              <p>
                SGS is <strong>standard PPO with a small outer loop</strong>. It
                changes only which <strong>task configuration</strong> an
                environment resets to.
              </p>
            }
          >
            <AlgoStyleBlock style={algo} />
          </Step>
        )}

        {show("configurations") && (
          <Step
            id={part("configurations")}
            n={2}
            title="Task configurations"
            style={style}
            text={
              <p>
                <strong>A task configuration</strong> is a triple{" "}
                <strong>
                  (s<sub>0</sub>, g, e)
                </strong>
                : the robot’s initial state s<sub>0</sub>, its goal g, and the
                environment e, such as the terrain type or the layout of the
                scene. SGS samples a large, <strong>fixed</strong> set of task
                configurations before training.
              </p>
            }
          >
            {configurations ?? (
              <ToCome>
                Clips or an interactive view of task configurations.
              </ToCome>
            )}
          </Step>
        )}

        {show("weighting") && (
          <Step
            id={part("weighting")}
            n={3}
            title="The weighting"
            style={style}
          >
            <BetaExplorer
              presetLabel="As in the toy example"
              fromToy
              withText={false}
              lead={
                <div className={`cb-flow-text cb-flow-${style}`}>
                  <>
                    <p>
                      This navigation <strong>toy example</strong> shows how SGS
                      chooses among task configurations. Every episode starts at
                      S in the same maze, so{" "}
                      <strong>each cell is one task configuration</strong>: the
                      same s<sub>0</sub> and e, a different {"goal\u00a0g."}
                    </p>
                    <p>
                      <strong>How SGS weighs a task configuration.</strong> A
                      Beta-shaped weight over a task configuration’s success
                      rate <strong>peaks at a target t</strong>, and{" "}
                      <strong>κ</strong> sets how sharply. A floor{" "}
                      <strong>ε</strong> keeps a small chance for task
                      configurations that always or never succeed.
                    </p>
                  </>
                </div>
              }
            />
          </Step>
        )}

        {show("sampling") && (
          <Step
            id={part("sampling")}
            n={4}
            title="Sampling during training"
            style={style}
            beside
            text={
              <>
                <p>
                  Each time a robot finishes an episode, SGS{" "}
                  <strong>records whether it succeeded</strong> and updates that
                  task configuration’s success rate. The robot’s next task
                  configuration is then{" "}
                  <strong>
                    drawn at random in proportion to these weights
                  </strong>
                  . Task configurations at the frontier of the robot’s
                  capabilities are sampled with higher probability. All task
                  configurations have a non-zero sampling weight. As the robots
                  improve, the grey region grows and{" "}
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
            <MethodMaze />
          </Step>
        )}
        {show("during") && (
          <Step
            id={part("during")}
            n={3}
            title="Sampling during training"
            style={style}
          >
            {during ?? (
              <ToCome>
                Visuals of the task configurations SGS samples over a real
                training run.
              </ToCome>
            )}
          </Step>
        )}
      </div>
    </section>
  );
}
