"use client";

import { useRef, type ReactNode } from "react";
import Section from "../_components/Section";
import { RaceChart, ShareBars } from "./Bars";
import { Controls, ToySizes } from "./Controls";
import Formula from "./Formula";
import { SWISS } from "./ink";
import KernelExplorer from "./KernelExplorer";
import KernelPlot from "./KernelPlot";
import { usePlayer } from "./player";
import Raster from "./Raster";
import { SetupSwiss } from "./Setup";
import { FollowNote, LoopList } from "./Steps";
import Windows from "./Windows";

// One numbered part: text on the left three columns, figure on the right
// six; stacked on phones.
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
    <div className="col-span-full grid grid-cols-subgrid gap-y-5 border-t border-sw-hair pt-3 first:border-t-0 first:pt-0">
      <div className="col-span-full md:col-span-3">
        <h3 className="flex gap-3 font-medium">
          <span className="sw-num text-sw-mute">{n}</span>
          {title}
        </h3>
        <div className="mt-3 flex max-w-[38ch] flex-col gap-3 text-sw-fg">
          {text}
        </div>
      </div>
      <div className="col-span-full md:col-span-6">{children}</div>
    </div>
  );
}

function Caption({ children }: { children: ReactNode }) {
  return <p className="sw-label mt-2 text-sw-mute">{children}</p>;
}

/**
 * Variant C: Setup and Method for the Swiss light page. Method in four
 * numbered parts, each a few plain sentences and a small live figure. All
 * figures share one simulation.
 */
export default function MethodSwiss() {
  const root = useRef<HTMLDivElement>(null);
  const player = usePlayer(root, { twin: true, cols: 16, rows: 10, seed: 11 });
  const ink = SWISS;
  return (
    <div className="pt-16 md:pt-28">
      <Section id="setup" n="02" label="Setup">
        <p className="col-span-full max-w-[60ch]">
          Two tasks, one recipe. The policy is trained with reinforcement
          learning on a sparse success signal, and SGS decides which task
          configuration each episode starts from. Values marked (check) are not
          yet confirmed against the paper.
        </p>
        <SetupSwiss />
      </Section>

      <div ref={root}>
        <Section id="method" n="03" label="Method">
          <p className="sw-lead col-span-full">
            SGS draws each episode&apos;s task configuration from the
            policy&apos;s recent success on it, and keeps simulation where the
            policy succeeds some of the time.
          </p>

          <Part
            n={1}
            title="A fixed set of task configurations"
            text={
              <>
                <p>
                  Before training, SGS fixes N task configurations τ<sub>i</sub>
                  , each an initial state, a goal and environment parameters,
                  and draws every episode&apos;s initial condition from that
                  set. The paper uses N = 32,768.
                </p>
                <p>
                  Nothing tells SGS which configurations are hard. It only sees
                  outcomes.
                </p>
              </>
            }
          >
            <Raster
              player={player}
              ink={ink}
              className="aspect-[16/10]"
              label="A toy set of configurations as dots sized by tracked success, with rings for the environments running them"
            />
            <Caption>
              A toy set on a grid; neighbours are similar configurations. Dot
              area: tracked success rate p̂. Red rings: environments running each
              configuration, heavier for more. <Controls player={player} />
            </Caption>
          </Part>

          <Part
            n={2}
            title="Tracking success with a sliding window"
            text={
              <>
                <p>
                  Each configuration keeps its last H outcomes, success or
                  failure, and p̂ is their mean. The window starts as zeros, so a
                  configuration not yet tried reads p̂ = 0.
                </p>
                <p>The paper uses H = 100; the toy uses 20.</p>
              </>
            }
          >
            <Windows player={player} ink={ink} className="h-44 md:h-48" />
            <Caption>
              Three configurations from the set above, oldest outcome on the
              left. Filled: success. Open: failure. Faint: a starting zero. On
              the right, p̂ and how many environments run it compared with
              uniform sampling.
            </Caption>
          </Part>

          <Part
            n={3}
            title="Scoring with the Beta kernel"
            text={
              <>
                <p>
                  p̂ goes through a Beta-shaped kernel, Beta(1 + κt, 1 + κ(1 −
                  t)). The target t is the success rate SGS aims for; κ sets how
                  sharply it prefers it.
                </p>
                <Formula className="my-1 text-[1.0625rem] leading-[1.4]" />
                <p>
                  A softmax with temperature T turns the scores into sampling
                  probabilities. The floor ε keeps every configuration
                  reachable, so an unsolved one still gets tried now and then.
                </p>
              </>
            }
          >
            <KernelExplorer player={player} ink={ink} />
            <Caption>
              Curve: sampling probability relative to the peak. Dots: the live
              configurations from part 1, gathered at their p̂. The simulation
              keeps sampling with κ = 10, T = 2.
            </Caption>
          </Part>

          <Part
            n={4}
            title="The loop, and where learning comes from"
            text={
              <>
                <p>
                  Whenever any environment finishes an episode, SGS records the
                  outcome, rescores that configuration and hands the environment
                  a new draw. There is no schedule and no difficulty label.
                </p>
                <p>
                  With a sparse success reward, an episode teaches in proportion
                  to p(1 − p). Configurations that always or never succeed teach
                  nothing, so SGS keeps simulation where p is in between and
                  follows it outward as the policy improves.
                </p>
                <p>
                  Evaluation bypasses SGS: success is measured over the whole
                  set, uniformly.
                </p>
              </>
            }
          >
            <div className="grid gap-x-6 gap-y-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <LoopList player={player} className="sw-label" />
              <Raster
                player={player}
                ink={ink}
                follow
                className="aspect-[16/10] self-start"
                label="The followed environment's loop on the configuration set"
              />
            </div>
            <Caption>
              <FollowNote player={player} />
            </Caption>
            <div className="mt-10 grid gap-x-6 gap-y-8 md:grid-cols-2">
              <figure>
                <KernelPlot
                  player={player}
                  ink={ink}
                  mode="signal"
                  axis="true success rate p"
                  className="h-44"
                  label="Learning signal per episode, p times one minus p, with the configurations as dots at their true success"
                />
                <Caption>
                  Signal per episode, p(1 − p), scaled to its peak. Dots: every
                  configuration at its true success rate.
                </Caption>
              </figure>
              <figure>
                <ShareBars player={player} ink={ink} className="sw-label" />
                <RaceChart player={player} ink={ink} className="mt-6 h-28" />
                <Caption>
                  Top: where the latest episodes went, by true success when
                  drawn, one mark per 2%. Bottom: mean success over the whole
                  set. A uniform sampler runs on the same set from the same
                  start.
                </Caption>
              </figure>
            </div>
            <Caption>
              Toy simulation, sizes chosen for visibility:{" "}
              <ToySizes player={player} />. The stand-in policy improves on a
              configuration, and on similar ones nearby, in proportion to
              |outcome − p|.
            </Caption>
          </Part>
        </Section>
      </div>
    </div>
  );
}
