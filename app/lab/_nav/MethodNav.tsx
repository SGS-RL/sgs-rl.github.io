import type { ReactNode } from "react";
import Formula from "../_method/Formula";
import Section from "../_swiss2/Section";
import "../_swiss2/swiss2.css";
import { oddsVsUnsolved } from "../_method/sgs";
import { LIVE, offEdge, TOY, WORLD } from "./nav";
import SnapshotFigure from "./SnapshotFigure";
import TaskFigure from "./TaskFigure";
import TrainFigure from "./TrainFigure";

const EXPLAINER = "https://rosarioscalise.com/garage-success-guided-sampling";
const N = WORLD.goals.length;

// One numbered part: text on three columns, the figure on six; stacked on
// phones.
function Part({
  n,
  title,
  text,
  children,
}: {
  n: number;
  title: string;
  text: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      id={`step-${n}`}
      className="col-span-full grid grid-cols-subgrid gap-y-6 border-t border-sw-hair pt-4 first:border-t-0 first:pt-0"
    >
      <div className="col-span-full md:col-span-3">
        <h3 className="s2-body flex gap-3 font-medium">
          <span className="sw-num text-sw-mute">{n}</span>
          {title}
        </h3>
        <div className="s2-body mt-3 flex max-w-[36ch] flex-col gap-3">
          {text}
        </div>
      </div>
      <div className="col-span-full pb-6 md:col-span-6 md:pb-10">
        {children}
      </div>
    </div>
  );
}

const Note = ({ children }: { children: ReactNode }) => (
  <p className="sw-label text-sw-mute">{children}</p>
);

/**
 * /lab/method-nav: the method as a navigation example, after Rosario
 * Scalise's explainer. A: three parts, one idea and one figure each.
 * B: one live figure and a link to the full explainer.
 */
export default function MethodNav() {
  return (
    <div className="swiss s2 min-h-svh" data-theme="light">
      <header className="sw-grid s2-wrap gap-y-3 pb-16 pt-4 md:pb-24">
        <p className="sw-label col-span-full text-sw-mute md:col-span-3">
          SGS lab: method as navigation
        </p>
        <p className="sw-label col-span-full max-w-[60ch] md:col-span-9">
          Two ways to set the method on the Swiss page. A explains it in three
          steps on a maze; B is one live figure with a link to Rosario
          Scalise&apos;s full explainer. Both are new; the earlier method
          studies are unchanged.
        </p>
      </header>

      <Section id="a" n="A" label="Method, step by step">
        <p className="sw-lead col-span-full max-w-[30ch] pb-8 md:pb-14">
          A toy version of the method: a point robot learns to reach every cell
          of a maze from one start.
        </p>

        <Part
          n={1}
          title="One start, many goals"
          text={
            <>
              <p>
                Every episode starts at the same cell, S. The robot has a few
                seconds to reach its goal, and is rewarded only if it arrives.
              </p>
              <p>
                Each free cell is one goal, so this maze has {N} task
                configurations. The tasks in the paper have 32,768.
              </p>
              <p>
                Goals in the first room are easy. Goals past the doorway are
                harder, and the far room is out of reach for an untrained robot.
              </p>
            </>
          }
        >
          <TaskFigure />
        </Part>

        <Part
          n={2}
          title="How SGS picks the next goal"
          text={
            <>
              <p>
                SGS keeps the last H outcomes of each goal. Its tracked success
                rate p̂ is the share of those that reached the goal; a goal not
                tried yet reads 0.
              </p>
              <p>
                Each goal then gets a weight from its tracked success rate. The
                weight is largest at a target success rate, here one success in
                two, and smaller the closer a goal is to always or never being
                reached. The next goal is drawn at random in proportion to the
                weights:
              </p>
              <Formula className="py-1 text-[0.95rem] md:text-base" />
              <Note>
                t: the target success rate (0.5). κ: how strongly the weight
                prefers goals near the target (10). T: the softmax temperature
                (2). ε: a small floor (10⁻⁶).
              </Note>
              <p>
                The floor keeps every goal in play. A goal that is always or
                never reached is still picked, about{" "}
                {Math.round(oddsVsUnsolved(TOY))} times less often than one at
                the target. There are many such goals, so in the figure they get{" "}
                <span suppressHydrationWarning>{offEdge("sgs")}%</span> of the
                picks; uniform sampling would give them{" "}
                <span suppressHydrationWarning>{offEdge("uniform")}%</span>.
              </p>
              <Note>
                The figure shows a robot partway through training, with p̂ taken
                as the true rate. The paper uses κ = 1 over 32,768
                configurations; on {N} goals that preference is too gentle to
                see.
              </Note>
            </>
          }
        >
          <SnapshotFigure />
        </Part>

        <Part
          n={3}
          title="Training"
          text={
            <>
              <p>
                {LIVE.robots} robots train one policy. Whenever one finishes an
                episode, SGS records the outcome against its goal, rescores that
                goal and draws the next one.
              </p>
              <p>
                Most red goals sit near the edge of the grey region, and the
                edge moves outward through the doorways as the robots improve.
              </p>
              <Note>
                The learner is a stand-in for PPO: an episode raises its
                goal&apos;s success rate in proportion to |outcome − p|, and its
                neighbours&apos; by a share of that. H = {LIVE.H} here; the
                paper uses 100.
              </Note>
            </>
          }
        >
          <TrainFigure />
        </Part>
      </Section>

      <Section id="b" n="B" label="Method, one figure">
        <div className="col-span-full grid grid-cols-subgrid gap-y-6">
          <div className="col-span-full md:col-span-3">
            <div className="s2-body flex max-w-[36ch] flex-col gap-3">
              <p>
                SGS draws each episode&apos;s task configuration from those the
                policy solves only some of the time, estimated from each
                configuration&apos;s recent outcomes.
              </p>
              <p>
                In this toy, {LIVE.robots} point robots learn to reach every
                cell of a maze from one start, and each cell is one
                configuration. Grey shows how often a goal is reached; red marks
                the goals being tried. Most red goals sit near the edge of the
                grey region as it grows.
              </p>
              <p>
                <a href={EXPLAINER} className="sw-link font-medium">
                  Step-by-step explainer by Rosario Scalise ↗
                </a>
              </p>
            </div>
          </div>
          <div className="col-span-full md:col-span-6">
            <TrainFigure seed={2} />
          </div>
        </div>
      </Section>
    </div>
  );
}
