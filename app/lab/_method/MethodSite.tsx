"use client";

import { useRef } from "react";
import { RaceChart, ShareBars } from "./Bars";
import { Controls, ToySizes } from "./Controls";
import { POSTER } from "./ink";
import KernelPlot from "./KernelPlot";
import { RASTER_ASPECT, usePlayer } from "./player";
import Raster from "./Raster";
import { SetupPlayful } from "./Setup";
import { FollowNote, StepLabels } from "./Steps";

export const SITE_STEPS: [string, string][] = [
  [
    "A fixed set",
    "Before training, SGS fixes N task configurations, each an initial state, a goal and environment parameters. Every episode starts from one of them. The paper uses N = 32,768.",
  ],
  [
    "Success, tracked",
    "Each configuration keeps its last H outcomes. Its tracked success rate p̂ is their mean; a configuration not yet tried reads 0. The paper uses H = 100.",
  ],
  [
    "A weight from p̂",
    "A Beta-shaped kernel turns p̂ into a weight that peaks at a target rate t. A softmax with temperature turns the weights into sampling probabilities, and a small floor keeps every configuration in play.",
  ],
  [
    "One loop per episode",
    "When any environment finishes an episode, SGS records the outcome, rescores that configuration and draws the environment's next one. No schedule, no difficulty labels.",
  ],
];

/**
 * Variant A: the Method section of /lab/site with a fuller explanation.
 * White heading band, lead, four steps, the live figure on the Method
 * band's mint, then the setup table.
 */
export default function MethodSite({ id = "method" }: { id?: string }) {
  const root = useRef<HTMLElement>(null);
  const player = usePlayer(root, { twin: true });
  const ink = POSTER;
  return (
    <section ref={root} id={id} className="scroll-mt-[var(--bar)]">
      <h2 className="st-head sticky top-[var(--bar)] z-40 border-y border-black bg-white px-[var(--m)] text-black">
        Method
      </h2>
      <div className="pz-grid gap-y-6 pb-8 pt-3">
        <p className="st-lead col-span-6 md:col-span-10">
          SGS picks the task configuration for every episode from the
          policy&apos;s recent success on it, so simulation goes to the
          configurations the policy solves some of the time, and follows them as
          it improves.
        </p>
        <ol className="col-span-6 grid grid-cols-subgrid gap-y-5 md:col-span-12">
          {SITE_STEPS.map(([title, text], i) => (
            <li
              key={title}
              className="col-span-6 border-t border-black pt-1.5 sm:col-span-3"
            >
              <p className="st-entry">
                <span className="pz-num mr-3">{i + 1}</span>
                {title}
              </p>
              <p className="pz-small mt-2 max-w-[40ch]">{text}</p>
            </li>
          ))}
        </ol>
      </div>

      <div
        className="border-t border-black pb-8 pt-3"
        style={{ background: ink.ground, color: ink.line }}
      >
        <div className="pz-grid pz-small gap-y-2 pb-4">
          <p className="col-span-6 md:col-span-3">Toy simulation</p>
          <p className="col-span-6 max-w-[62ch] md:col-span-6">
            Each dot is a task configuration; its area is the tracked success
            rate p̂. The ring around a dot thickens with the number of
            environments running it. The heavy ring is one environment, and the
            four labels follow its loop.
          </p>
        </div>
        <div className="px-[var(--m)]">
          <Raster
            player={player}
            ink={ink}
            follow
            responsive
            className={RASTER_ASPECT}
            label="Task configurations as dots sized by tracked success, with rings for the environments running them"
          >
            <StepLabels player={player} ground={ink.ground} type={ink.line} />
          </Raster>
        </div>
        <div className="pz-grid pz-small gap-y-2 pt-3">
          <p className="col-span-6 md:col-span-3">
            <Controls player={player} />
          </p>
          <p className="pz-num col-span-6 md:col-span-9" aria-live="off">
            <FollowNote player={player} />
          </p>
        </div>

        <div className="pz-grid pz-small mt-8 gap-y-8">
          <figure className="col-span-6 md:col-span-5">
            <KernelPlot
              player={player}
              ink={ink}
              className="h-52 md:h-60"
              label="Sampling weight against tracked success rate, with the configurations as dots"
            />
            <figcaption className="mt-2 max-w-[48ch]">
              Sampling weight over p̂, relative to its peak. The configurations
              above sit on the curve at their p̂; a big cluster is many
              configurations. Most sit at 0 or 1, where the weight is near the
              floor.
            </figcaption>
          </figure>
          <figure className="col-span-6 md:col-span-4">
            <ShareBars player={player} ink={ink} />
            <figcaption className="mt-3 max-w-[44ch]">
              Where the latest episodes went, by the configuration&apos;s true
              success when drawn; one mark per 2%. A uniform sampler runs on the
              same set from the same start. With a sparse reward an episode
              teaches in proportion to p(1 − p), so the middle group is where
              learning happens. SGS still runs some configurations it has just
              mastered, until their windows catch up.
            </figcaption>
          </figure>
          <figure className="col-span-6 md:col-span-3">
            <RaceChart player={player} ink={ink} className="h-32" />
            <figcaption className="mt-2 max-w-[40ch]">
              Mean success over every configuration, measured uniformly as
              evaluation does.
            </figcaption>
          </figure>
          <p className="col-span-6 max-w-[80ch] opacity-75 md:col-span-9">
            Sizes chosen for visibility, not the paper&apos;s:{" "}
            <ToySizes player={player} />. The stand-in policy improves on a
            configuration, and on similar ones nearby, in proportion to |outcome
            − p|.
          </p>
        </div>
      </div>

      <SetupPlayful rule="border-black" mute="text-black/50" />
    </section>
  );
}
