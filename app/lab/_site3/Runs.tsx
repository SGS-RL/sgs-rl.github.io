"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Item } from "../library";
import TileVideo from "../_gallery/TileVideo";
import { domainWord, mss } from "./items";

export type Band = { ground: string; type: string };

// One continuous run, as a listing entry. By default a muted loop of the
// whole run sped up (labelled with its speed) plays while on screen. The
// full-length run plays at 1×, with the browser's own controls, only after
// the reader asks for it; it never starts on its own.
export function Run({ run, band }: { run: Item; band: Band }) {
  const [full, setFull] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);
  const fast = run.fast;
  const length = mss(run.duration);

  // The reader pressed the button, so the full run may start; any other
  // full run on the page pauses.
  useEffect(() => {
    const v = ref.current;
    if (!full || !v) return;
    v.play().catch(() => {});
    const onPlay = () =>
      document
        .querySelectorAll<HTMLVideoElement>("video[data-s3-full]")
        .forEach((o) => o !== v && !o.paused && o.pause());
    v.addEventListener("play", onPlay);
    onPlay();
    return () => v.removeEventListener("play", onPlay);
  }, [full]);

  return (
    <article
      className="border-t border-black"
      style={
        {
          "--ground": band.ground,
          "--type": band.type,
          background: band.ground,
          color: band.type,
        } as CSSProperties
      }
    >
      <div className="pz-grid gap-y-3 pb-[var(--m)] pt-1.5">
        <div className="col-span-6 flex flex-col gap-2 md:col-span-4">
          <h3 className="st-entry">{run.robot}</h3>
          <p className="st-entry">{run.title}</p>
          <p className="pz-small mt-2 max-w-[40ch]">
            {run.category}, {domainWord(run).toLowerCase()}. One continuous
            take, {length}.
          </p>
        </div>
        <figure className="s3-runfig col-span-6 md:col-span-8">
          <div className="s3-runframe">
            {full ? (
              <video
                ref={ref}
                data-s3-full=""
                src={run.src}
                poster={run.poster}
                controls
                muted
                playsInline
                preload="auto"
                aria-label={`${run.robot}, ${run.title}, full run at 1×, ${length}`}
              />
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={run.poster} alt="" />
                {fast && <TileVideo src={fast.src} poster={run.poster} />}
              </>
            )}
          </div>
          <figcaption className="pz-row mt-1.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <span>
              {full ? (
                <>
                  Full run at <span className="pz-num">1×</span>, {length}
                </>
              ) : (
                <>
                  Whole run at <span className="pz-num">{fast?.speed}×</span>,{" "}
                  {Math.round(run.duration / (fast?.speed ?? 1))} s
                </>
              )}
            </span>
            <button
              type="button"
              className="s3-runbtn pz-row"
              aria-pressed={full}
              onClick={() => setFull((f) => !f)}
            >
              {full ? (
                <>Back to the {fast?.speed}× preview</>
              ) : (
                <>
                  <svg viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M2 0.8 11.2 6 2 11.2Z" />
                  </svg>
                  Watch the full run, {length}
                </>
              )}
            </button>
          </figcaption>
        </figure>
      </div>
    </article>
  );
}
