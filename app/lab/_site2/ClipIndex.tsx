"use client";

import { Fragment, useState } from "react";
import type { Clip } from "../content";
import { TileVideo, useClipGallery } from "../_gallery";

const domain = (c: Clip) => (c.domain === "Sim" ? "Simulation" : "Hardware");

// The clip beside the list, as recorded: no raster, no recolouring, not
// cropped (the footage is 16:9). The frame itself opens the player.
function Preview({ clip }: { clip: Clip }) {
  const { open, num } = useClipGallery();
  return (
    <figure>
      <button
        type="button"
        aria-label={`Open ${clip.title} in the player`}
        onClick={(e) => open(clip, { trigger: e.currentTarget })}
        className="s2-frame relative block aspect-video w-full overflow-hidden"
      >
        {/* The poster shows at once; the video replaces it when loaded. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={clip.poster}
          alt=""
          className="absolute inset-0 h-full w-full object-contain"
        />
        <TileVideo
          key={clip.id}
          src={clip.src}
          poster={clip.poster}
          className="absolute inset-0 h-full w-full object-contain"
        />
      </button>
      <figcaption className="pz-small mt-1.5 flex justify-between gap-4">
        <span>
          <span className="pz-num mr-2">{num(clip)}</span>
          {clip.title}
        </span>
        <span className="text-right">
          {clip.robot}, {domain(clip).toLowerCase()}, {clip.speed}
        </span>
      </figcaption>
      <p className="pz-small mt-3 text-black/60">
        Click a row or the clip to open it in the player.
      </p>
    </figure>
  );
}

// A typographic index in the manner of a studio's project list. On screens
// with a pointer, the hovered row's clip plays beside the list; a click on
// a row opens it in the full-screen player. On phones the rows open the
// player directly (tap).
export default function ClipIndex() {
  const { clips, num, open } = useClipGallery();
  const [hover, setHover] = useState<Clip>(clips[0]);
  const groups = [...new Set(clips.map((c) => c.category))];

  return (
    <div className="pz-grid items-start">
      <div className="col-span-6 md:col-span-7">
        <div className="pz-small grid grid-cols-[3rem_1fr_5.5rem] border-b border-black pb-1 md:grid-cols-[4rem_1fr_7rem_6rem_3rem]">
          <span>No.</span>
          <span>Clip</span>
          <span>Robot</span>
          <span className="hidden md:block">Domain</span>
          <span className="hidden text-right md:block">Speed</span>
        </div>
        {groups.map((g) => (
          <Fragment key={g}>
            <p className="pz-small border-b border-black pb-1 pt-5">{g}</p>
            {clips
              .filter((c) => c.category === g)
              .map((c) => (
                <div key={c.id} className="border-b border-black/25">
                  <button
                    type="button"
                    data-gal-clip={c.id}
                    data-gal-primary
                    aria-label={`${num(c)} ${c.title}, ${c.robot}, ${domain(c)}, ${c.speed}. Open in the player`}
                    onMouseEnter={() => setHover(c)}
                    onFocus={() => setHover(c)}
                    onClick={(e) => open(c, { trigger: e.currentTarget })}
                    className={`pz-row grid w-full grid-cols-[3rem_1fr_5.5rem] py-1.5 text-left md:grid-cols-[4rem_1fr_7rem_6rem_3rem] md:hover:bg-[var(--hover)] ${
                      hover === c ? "md:bg-[var(--hover)]" : ""
                    }`}
                  >
                    <span className="pz-num">{num(c)}</span>
                    <span>
                      {c.title}
                      {/* Phones drop the domain and speed columns; hardware
                          and sped-up clips still say so. */}
                      {c.domain === "Real" && (
                        <span className="md:hidden">, hardware, {c.speed}</span>
                      )}
                    </span>
                    <span>{c.robot}</span>
                    <span className="hidden md:block">{domain(c)}</span>
                    <span className="pz-num hidden text-right md:block">
                      {c.speed}
                    </span>
                  </button>
                </div>
              ))}
          </Fragment>
        ))}
      </div>
      <div className="sticky top-[calc(var(--bar)+var(--head)+1rem)] col-span-5 col-start-8 hidden md:block">
        <Preview clip={hover} />
      </div>
    </div>
  );
}
