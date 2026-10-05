"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { RUNS, type Item } from "../library";
import TileVideo from "../_gallery/TileVideo";
import { INK } from "./inks";
import { domainWord, mss, word } from "./data";

// One continuous run. By default a muted loop of the whole run sped up
// (labelled with its speed), which plays on screen like any tile. The full
// run never starts on its own: "Watch the full run" swaps in the full-length
// file at real time with the browser's own controls, and only then is it
// downloaded.
function Run({ run, n }: { run: Item; n: number }) {
  const [full, setFull] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);
  const fast = run.fast!;
  const speed = `${fast.speed}×`;
  const length = mss(run.duration);

  // Start the full run once it is in place: the reader asked for it.
  useEffect(() => {
    if (!full) return;
    const v = ref.current;
    if (!v) return;
    v.play().catch(() => {});
    v.focus({ preventScroll: true });
  }, [full]);

  return (
    <article
      id={run.id}
      className="pz-grid scroll-mt-[calc(var(--bar)+1rem)] gap-y-3 border-t border-black pt-1"
    >
      <header className="col-span-6 flex flex-col gap-3 md:col-span-12 lg:col-span-4">
        <p className="pz-small pz-num flex justify-between gap-4">
          <span>{String(n).padStart(2, "0")}</span>
          <span>
            {run.category}, {domainWord(run).toLowerCase()}
          </span>
        </p>
        <h3 className="pz-mid">
          {run.robot}
          <br />
          {run.title}
        </h3>
        <dl className="pz-small pz-num grid grid-cols-[7em_1fr] gap-y-0.5">
          <dt>Full run</dt>
          <dd>{length}, real time, one take</dd>
          <dt>Loop</dt>
          <dd>
            The whole run at {speed}, {mss(run.duration / fast.speed)}
          </dd>
        </dl>
      </header>

      <div className="col-span-6 md:col-span-12 lg:col-span-8">
        <div className="p3-run-frame">
          {full ? (
            <video
              ref={ref}
              src={run.src}
              poster={run.poster}
              controls
              playsInline
              muted
              preload="auto"
              aria-label={`${run.robot}, ${run.title}: full run at real time`}
              className="p3-video"
            />
          ) : (
            <>
              <TileVideo
                src={fast.src}
                poster={run.poster}
                className="p3-video"
              />
              <span className="p3-tag pz-small pz-num">{speed} speed</span>
            </>
          )}
          <div className="pz-small pz-num mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            {full ? (
              <>
                <span>Full run at real time, {length}</span>
                <button
                  type="button"
                  className="p3-btn"
                  onClick={() => setFull(false)}
                >
                  Back to the {speed} loop
                </button>
              </>
            ) : (
              <>
                <span>Looping at {speed}</span>
                <button
                  type="button"
                  className="p3-btn"
                  onClick={() => setFull(true)}
                >
                  <svg
                    viewBox="0 0 12 12"
                    aria-hidden="true"
                    className="h-[0.8em] w-[0.8em] fill-current"
                  >
                    <path d="M2 0.8 11.2 6 2 11.2Z" />
                  </svg>
                  Watch the full run, {length}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

// Continuous runs as one poster: red ground, black type. Each run is
// shown in full, but only when the reader asks for it.
export default function Runs() {
  return (
    <section
      className="pz-poster pb-16 pt-3 md:pb-24"
      style={
        {
          background: INK.runs.ground,
          color: INK.runs.type,
          "--p3-btn-hover": INK.runs.mark,
        } as CSSProperties
      }
    >
      <div className="pz-grid gap-y-4 pb-10 md:pb-14">
        <h3 className="pz-big col-span-6 text-[21vw] md:col-span-8 md:text-[min(10.5vw,19svh)]">
          Continuous
          <br />
          runs
        </h3>
        <p className="pz-small col-span-6 md:col-span-3 md:col-start-10 md:pt-3">
          {word(RUNS.length)[0].toUpperCase() + word(RUNS.length).slice(1)}{" "}
          continuous runs, each one take. The loops show a whole run sped up;
          the full run plays at real time when you ask for it, with its own
          controls.
        </p>
      </div>
      <div className="flex flex-col gap-12 md:gap-16">
        {RUNS.map((r, i) => (
          <Run key={r.id} run={r} n={i + 1} />
        ))}
      </div>
    </section>
  );
}
