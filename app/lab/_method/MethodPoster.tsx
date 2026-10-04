"use client";

import { useRef } from "react";
import { RaceChart, ShareBars } from "./Bars";
import { Controls, ToySizes } from "./Controls";
import Formula from "./Formula";
import { POSTER } from "./ink";
import KernelPlot from "./KernelPlot";
import { RASTER_ASPECT, STEPS, usePlayer } from "./player";
import Raster from "./Raster";
import { SetupPlayful } from "./Setup";
import { FollowNote, STEP_NOTES, StepLabels } from "./Steps";

/**
 * Variant B: Method as a full-colour poster in the Method inks (mint
 * ground, blue type, pink raster). The successor of MethodRaster: the loop
 * over a live raster, the kernel drawn large with the formula, where the
 * episodes go, and the setup.
 */
export default function MethodPoster({
  id = "method-poster",
}: {
  id?: string;
}) {
  const root = useRef<HTMLElement>(null);
  const player = usePlayer(root, { twin: true, seed: 7 });
  const ink = POSTER;
  return (
    <section ref={root} id={id} className="scroll-mt-[var(--bar)]">
      <h2 className="pz-head border-y border-black bg-white px-[var(--m)] pb-[0.08em] pt-[0.04em] text-black">
        Method
      </h2>
      <div
        className="pz-poster pb-8 pt-3"
        style={{ background: ink.ground, color: ink.line }}
      >
        <div className="pz-grid pz-small gap-y-3 pb-5">
          <p className="col-span-3 md:col-span-3">Success-Guided Sampling</p>
          <p className="col-span-3 md:col-span-5">
            Every episode starts from one of a fixed set of task configurations.
            SGS draws it by the policy&apos;s recent success on each, favouring
            the ones it solves some of the time. Each dot is a configuration,
            its area the tracked success rate; rings are the environments
            running it.
          </p>
          <p className="col-span-6 md:col-span-4">
            <Controls player={player} />
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
        <div className="pz-grid pz-small pt-3">
          <p className="pz-num col-span-6 md:col-span-8 md:col-start-4">
            <FollowNote player={player} />
          </p>
        </div>

        <ol className="pz-grid mt-10 gap-y-6">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className="col-span-3 border-t border-current pt-1.5 md:col-span-3"
            >
              <p className="pz-mid">
                <span className="pz-num mr-2">{i + 1}</span>
                {s}
              </p>
              <p className="pz-small mt-2 max-w-[30ch]">{STEP_NOTES[i]}</p>
            </li>
          ))}
        </ol>

        <div className="pz-grid mt-12 gap-y-4">
          <div className="col-span-6 md:col-span-5">
            <p className="pz-small mb-3">Sampling weight</p>
            <Formula className="text-[clamp(1.05rem,3.6vw,1.9rem)] leading-[1.35] tracking-[-0.02em]" />
            <p className="pz-small mt-4 max-w-[46ch]">
              A Beta-shaped kernel in p̂, peaked at the target t; κ sets how
              sharply. A softmax with temperature T turns scores into sampling
              probabilities; the floor ε keeps every configuration reachable.
              Paper default κ = 1, t = 0.5; locomotion κ = 5, t = 0.66. This
              poster uses κ = 10 so the peak is easy to see.
            </p>
          </div>
          <figure className="col-span-6 md:col-span-7">
            <KernelPlot
              player={player}
              ink={ink}
              className="h-[62vw] max-h-[460px] md:h-[30vw]"
              label="Sampling weight against tracked success rate, with the configurations as dots"
            />
            <figcaption className="pz-small mt-2">
              The configurations above, gathered at their p̂ on the curve.
            </figcaption>
          </figure>
        </div>

        <div className="pz-grid mt-14 gap-y-3">
          <p className="pz-small col-span-6 md:col-span-3">Uniform and SGS</p>
          <p className="pz-small col-span-6 max-w-[60ch] md:col-span-6">
            The same set from the same start, with the same number of
            environments. Uniform sampling spreads them evenly, over
            configurations already mastered and ones still out of reach. SGS
            puts them where success is in between, the only place a sparse
            reward teaches: an episode teaches in proportion to p(1 − p).
          </p>
          {(["uniform", "sgs"] as const).map((s) => (
            <figure key={s} className="col-span-3 mt-3 md:col-span-6">
              <p className="pz-mid mb-2">{s === "sgs" ? "SGS" : "Uniform"}</p>
              <Raster
                player={player}
                ink={ink}
                sampler={s}
                className={RASTER_ASPECT}
                label={`${s === "sgs" ? "SGS" : "Uniform sampling"}: configurations sized by tracked success, rings for environments`}
              />
            </figure>
          ))}
        </div>

        <div className="pz-grid pz-small mt-8 gap-y-8">
          <figure className="col-span-6 md:col-span-6">
            <p className="mb-3">Where the latest episodes went</p>
            <ShareBars player={player} ink={ink} />
            <figcaption className="mt-3 max-w-[52ch]">
              By the configuration&apos;s true success when drawn; one mark per
              2%. SGS still runs some configurations it has just mastered, until
              their windows catch up.
            </figcaption>
          </figure>
          <figure className="col-span-6 md:col-span-6">
            <p className="mb-3">Mean success, every configuration</p>
            <RaceChart player={player} ink={ink} className="h-36" />
            <figcaption className="mt-2 max-w-[52ch]">
              Measured uniformly over the whole set, as evaluation does.
            </figcaption>
          </figure>
          <p className="col-span-6 max-w-[80ch] opacity-75 md:col-span-9">
            Toy simulation, sizes chosen for visibility:{" "}
            <ToySizes player={player} />. Paper: N = 32,768, H = 100, over 1M
            environments. The stand-in policy improves on a configuration, and
            on similar ones nearby, in proportion to |outcome − p|.
          </p>
        </div>

        <div className="mt-12">
          <SetupPlayful rule="border-current" mute="opacity-60" />
        </div>
      </div>
    </section>
  );
}
