"use client";

import { Fragment, useState, type CSSProperties } from "react";
import type { Item } from "../library";
import TileVideo from "../_gallery/TileVideo";
import { useGallery } from "./Gallery";
import { domainWord, lower, mss } from "./items";
import Sides from "./Sides";

// The clip beside the list, as recorded: no raster, no recolouring, not
// cropped. The frame takes the clip's aspect (a UR5e pair is 32:9, with
// its two sides labelled under it). The frame itself opens the player.
function Preview({ clip }: { clip: Item }) {
  const { open, num } = useGallery();
  return (
    <figure>
      <button
        type="button"
        aria-label={`Open ${clip.robot}, ${clip.title} in the player`}
        onClick={(e) => open(clip, { trigger: e.currentTarget })}
        className="s3-frame s3-frame-quiet"
        style={{ "--a": String(clip.aspect) } as CSSProperties}
      >
        {/* The poster shows at once; the video replaces it when loaded. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={clip.poster} alt="" />
        <TileVideo key={clip.id} src={clip.src} poster={clip.poster} />
      </button>
      {clip.sides && <Sides sides={clip.sides} className="mt-1.5" />}
      <figcaption className="pz-small mt-1.5 flex justify-between gap-4 border-t border-black pt-1.5">
        <span>
          <span className="pz-num mr-2">{num(clip)}</span>
          {clip.robot}, {lower(clip.title)}
        </span>
        <span className="text-right">
          {domainWord(clip)}, {clip.speed}, {mss(clip.duration)}
        </span>
      </figcaption>
      <p className="pz-small mt-3 text-black/60">
        Click a row or the clip to open it in the player.
      </p>
    </figure>
  );
}

const COLS =
  "grid-cols-[3rem_1fr_5.5rem] md:grid-cols-[4rem_1fr_7rem_6.5rem_3rem]";

// The collection as a typographic index, grouped by robot. On screens with
// a pointer (from 1024 px) the hovered row's clip plays beside the list; a
// click on a row opens it in the full-screen player. On phones and iPad
// portrait the list takes the measure and a tap opens the player.
export default function ClipIndex() {
  const { groups, order, num, open } = useGallery();
  const [hover, setHover] = useState<Item>(order[0]);

  return (
    <div className="pz-grid items-start">
      <div className="col-span-6 md:col-span-12 lg:col-span-7">
        <div className={`pz-small grid border-b border-black pb-1 ${COLS}`}>
          <span>No.</span>
          <span>Clip</span>
          <span>Robot</span>
          <span className="hidden md:block">Domain</span>
          <span className="hidden text-right md:block">Speed</span>
        </div>
        {groups.map((g) => (
          <Fragment key={g.id}>
            <p
              id={g.id}
              className="pz-small flex scroll-mt-[calc(var(--bar)+var(--head)+0.5rem)] justify-between gap-4 border-b border-black pb-1 pt-5"
            >
              <span>{g.robot}</span>
              <span className="text-right">
                {g.categories.join(", ")}, {g.domain.toLowerCase()} ·{" "}
                <span className="pz-num">{g.clips.length}</span>
              </span>
            </p>
            {g.clips.map((c) => (
              <div key={c.id} className="border-b border-black/25">
                <button
                  type="button"
                  data-gal-clip={c.id}
                  data-gal-primary
                  aria-label={`${num(c)} ${c.title}, ${c.robot}, ${domainWord(c)}, ${c.speed}. Open in the player`}
                  onMouseEnter={() => setHover(c)}
                  onFocus={() => setHover(c)}
                  onClick={(e) => open(c, { trigger: e.currentTarget })}
                  className={`pz-row grid w-full py-1.5 text-left lg:hover:bg-[var(--hover)] ${COLS} ${
                    hover === c ? "lg:bg-[var(--hover)]" : ""
                  }`}
                >
                  <span className="pz-num">{num(c)}</span>
                  <span>
                    {c.title}
                    {/* Pairs: two runs in one clip. */}
                    {c.kind === "pair" && ", two runs"}
                    {/* Phones drop the domain and speed columns (the
                        group says the domain); a sped-up clip says so. */}
                    {c.speed !== "1×" && (
                      <span className="md:hidden">, {c.speed}</span>
                    )}
                  </span>
                  <span>{c.robot}</span>
                  <span className="hidden md:block">{domainWord(c)}</span>
                  <span className="pz-num hidden text-right md:block">
                    {c.speed}
                  </span>
                </button>
              </div>
            ))}
          </Fragment>
        ))}
        <p className="pz-small mt-3 max-w-[56ch] text-black/60">
          Two runs: one clip with two runs of the same task side by side, the
          most interesting on the left and a nominal one on the right.
        </p>
      </div>
      <div className="sticky top-[calc(var(--bar)+var(--head)+1rem)] col-span-5 col-start-8 hidden lg:block">
        <Preview clip={hover} />
      </div>
    </div>
  );
}
