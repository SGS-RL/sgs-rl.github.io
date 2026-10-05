"use client";

import { useRef, useState } from "react";
import type { Item } from "../library";
import TileVideo from "../_gallery/TileVideo";
import { clock, domainWord } from "./data";

function PlayGlyph() {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden="true"
      className="mr-2 inline-block h-[0.7em] w-[0.7em] fill-current align-baseline"
    >
      <path d="M2 0.8 11.2 6 2 11.2Z" />
    </svg>
  );
}

// One continuous run. By default the frame loops the whole run sped up
// (muted, only while on screen). "Watch the full run" swaps in the
// full-length video at 1× with the browser's own controls; it never starts
// on its own. Text on the left three columns, the video on the next six,
// as the parts of the method; stacked on phones and iPad portrait.
function Run({ run, n }: { run: Item; n: number }) {
  const [full, setFull] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const fast = run.fast!;
  const length = clock(run.duration);

  const watch = () => {
    setFull(true);
    // Start inside the click, so browsers count it as the reader's choice.
    const v = video.current;
    if (v) {
      v.preload = "auto";
      v.play().catch(() => {});
    }
  };
  const back = () => {
    video.current?.pause();
    setFull(false);
  };

  return (
    <article
      aria-labelledby={`${run.id}-t`}
      className="col-span-full grid grid-cols-subgrid gap-y-4 border-t border-sw-hair pt-3 first:border-t-0 first:pt-0"
    >
      <div className="col-span-full lg:col-span-3">
        <h3 id={`${run.id}-t`} className="flex gap-3">
          <span className="sw-num text-sw-mute">{n}</span>
          <span>
            <span className="font-medium">{run.robot}</span>
            <span className="block">{run.title}</span>
          </span>
        </h3>
        <dl className="sw-label s3-facts mt-3 text-sw-mute">
          <dt>Task</dt>
          <dd>{run.category}</dd>
          <dt>Footage</dt>
          <dd>{domainWord(run.domain)}</dd>
          <dt>Length</dt>
          <dd className="sw-num">{length}, uncut</dd>
        </dl>
      </div>
      <figure className="col-span-full lg:col-span-6">
        <div className="relative aspect-video overflow-hidden bg-sw-panel">
          {!full && (
            <TileVideo
              src={fast.src}
              poster={run.poster}
              className="absolute inset-0 h-full w-full object-contain"
            />
          )}
          <video
            ref={video}
            src={run.src}
            poster={run.poster}
            controls
            playsInline
            preload="none"
            hidden={!full}
            aria-label={`${run.robot}, ${run.title}, full run at 1×`}
            className="absolute inset-0 h-full w-full bg-black object-contain"
          />
        </div>
        <figcaption className="sw-label mt-2 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <span className="text-sw-mute">
            {full ? (
              <>
                <span className="sw-num text-sw-fg">1×</span> Full run,{" "}
                <span className="sw-num">{length}</span>
              </>
            ) : (
              <>
                <span className="sw-num text-sw-fg">{fast.speed}×</span> The
                whole run in{" "}
                <span className="sw-num">
                  {clock(run.duration / fast.speed)}
                </span>
                , muted
              </>
            )}
          </span>
          {full ? (
            <button type="button" className="sw-link -my-2 py-2" onClick={back}>
              Back to the {fast.speed}× preview
            </button>
          ) : (
            <button
              type="button"
              className="sw-link -my-2 py-2 font-medium"
              onClick={watch}
            >
              <PlayGlyph />
              Watch the full run, <span className="sw-num">{length}</span>
            </button>
          )}
        </figcaption>
      </figure>
    </article>
  );
}

export default function Runs({ runs }: { runs: Item[] }) {
  return (
    <>
      {runs.map((r, i) => (
        <Run key={r.id} run={r} n={i + 1} />
      ))}
    </>
  );
}
