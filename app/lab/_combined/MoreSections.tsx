import type { CSSProperties, ReactNode } from "react";
import { P } from "../_poster/palettes";
import ScaleCompare from "../_scaling/ScaleCompare";

// Sections 6–8 and 10 of /lab/combined, set up from the owner's list of
// 2026-10-07 ("If the content already exists, populate it ... Otherwise ...
// placeholders"). Paper figures are cropped from the CoRL 2026 PDF into
// public/lab/media/paper/.

function Heading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="pz-head scroll-mt-[var(--bar)] border-y border-black bg-white px-[var(--m)] pb-[0.08em] pt-[0.04em]"
    >
      {children}
    </h2>
  );
}

// What is still to come, said plainly.
export function ToCome({ children }: { children: ReactNode }) {
  return (
    <p className="cb-tocome pz-small">
      <span className="font-medium">To come.</span> {children}
    </p>
  );
}

function Lead({ children }: { children: ReactNode }) {
  return <p className="cb-lead">{children}</p>;
}

// 6. Task configurations in real training.
export function Configurations() {
  return (
    <section className="pb-16 md:pb-24">
      <Heading id="configurations">Task configurations</Heading>
      <div className="cb-sec-body">
        <Lead>
          In training, a <strong>task configuration</strong> is a terrain or an
          assembly task, together with <strong>where the robot starts</strong>{" "}
          and <strong>its goal</strong>. SGS fixes a large set of them before
          training: 104,000 for locomotion, 32,768 for each assembly task.
        </Lead>
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/lab/media/paper/fig2-tasks.jpg"
            alt="The six assembly tasks (rectangular peg, rod, BNC, gear mesh, waterproof connector, nut-and-bolt) and twelve of the thirteen terrains (gap, pit, radiating beam, stairs, parallel boxes, balancing beam, stepping stones, jump box, maze, contour, floating islands, climbing box)."
            className="cb-fig"
          />
          <figcaption className="pz-small mt-2">
            The six assembly tasks and twelve of the thirteen terrains. Paper,
            Figure 2.
          </figcaption>
        </figure>
        <ToCome>
          A video of the task configurations sampled in a real training run:
          many robots, each reset to its own start and goal.
        </ToCome>
      </div>
    </section>
  );
}

// 7. PPO with an outer loop: the same algorithm with two lines added and
// one changed.
type Line = [text: string, mark?: "+" | "~"];
const PPO: Line[] = [
  ["initialize policy π"],
  [""],
  ["for each iteration:"],
  ["    for each environment, in parallel:"],
  ["        if its episode ended:"],
  [""],
  ["            reset to a task configuration drawn uniformly"],
  ["        step π, store the transition"],
  ["    update π with PPO"],
];
const SGS: Line[] = [
  ["initialize policy π"],
  ["fix N task configurations, each with an empty history buffer", "+"],
  ["for each iteration:"],
  ["    for each environment, in parallel:"],
  ["        if its episode ended:"],
  [
    "            record its success in that task configuration’s history buffer",
    "+",
  ],
  [
    "            reset to a task configuration drawn weighted by success rate (SGS)",
    "~",
  ],
  ["        step π, store the transition"],
  ["    update π with PPO"],
];

function Code({ title, lines }: { title: string; lines: Line[] }) {
  return (
    <figure className="cb-algo">
      <figcaption className="cb-algo-title">{title}</figcaption>
      <pre className="cb-algo-code">
        {lines.map(([t, m], i) => (
          // Indent by level (four spaces each), so a long line wraps under
          // itself on narrow screens instead of scrolling sideways.
          <span
            key={i}
            className="cb-algo-line"
            data-mark={m}
            style={
              {
                "--i": (t.length - t.trimStart().length) / 4,
              } as CSSProperties
            }
          >
            {t.trim() || " "}
          </span>
        ))}
      </pre>
    </figure>
  );
}

// PPO next to PPO with SGS, and the key; also part 1 of the Method mock-up
// on /lab/method-flow/ (./MethodFlow.tsx).
export function AlgorithmPair() {
  return (
    <>
      <div className="cb-algo-pair">
        <Code title="PPO" lines={PPO} />
        <Code title="PPO with SGS" lines={SGS} />
      </div>
      <p className="pz-small">
        <span className="cb-algo-key" data-mark="+" /> added{" "}
        <span className="cb-algo-key ml-4" data-mark="~" /> changed
      </p>
    </>
  );
}

export function Algorithm() {
  return (
    <section className="pb-16 md:pb-24">
      <Heading id="algorithm">Just PPO</Heading>
      <div className="cb-sec-body">
        <Lead>
          SGS is <strong>standard PPO with a small outer loop</strong>: it only
          changes which task configuration an environment resets to. The policy,
          the reward and the PPO update stay as they are.
        </Lead>
        <AlgorithmPair />
      </div>
    </section>
  );
}

// 8. What SGS samples over a real training run.
export function OverTraining() {
  return (
    <section className="pb-16 md:pb-24">
      <Heading id="over-training">Over training</Heading>
      <div className="cb-sec-body">
        <Lead>
          Early on, SGS samples task configurations{" "}
          <strong>almost uniformly</strong>. Halfway, it concentrates on{" "}
          <strong>jumps between islands</strong> at the same height. Late, on
          task configurations that{" "}
          <strong>reach the high central pillar</strong>.
        </Lead>
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/lab/media/paper/fig7-sampling.jpg"
            alt="Floating islands terrain in three rows, early, mid and late training, each showing the robots at the task configurations SGS sampled."
            className="cb-fig"
          />
          <figcaption className="pz-small mt-2">
            Task configurations sampled on the floating islands, early, mid and
            late in training. Paper, Figure 7.
          </figcaption>
        </figure>
        <ToCome>The same as a video over a whole training run.</ToCome>
      </div>
    </section>
  );
}

// 10. Results: success rate against parallel environments, with the
// policy at each scale (the chart of /lab/scaling, poster skin, pink).
export function Results() {
  return (
    <section className="pb-16 md:pb-24">
      <Heading id="results">Results</Heading>
      <div
        className="pz-poster px-[var(--m)] pb-16 pt-6 md:pb-24"
        style={{ background: P.scaling.ground, color: P.scaling.type }}
      >
        <Lead>
          Success rate against the number of parallel environments, 4K to 1M.
          Pick a scale to see the policy each method trained at it.
        </Lead>
        <div className="mt-8">
          <ScaleCompare skin="poster" poster={P.scaling} />
        </div>
        <ToCome>
          The chart’s values are read off an earlier figure and need the
          paper’s. The clips at each scale are placeholders until they are
          recorded.
        </ToCome>
      </div>
    </section>
  );
}
