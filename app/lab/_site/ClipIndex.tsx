"use client";

import { Fragment, useState } from "react";
import { CLIPS, type Clip } from "../content";
import HalftoneVideo from "../_poster/HalftoneVideo";
import { ROBOT_FOCUS } from "../_poster/PosterHero";

const num = (c: Clip) => String(CLIPS.indexOf(c) + 1).padStart(3, "0");
const focus = (c: Clip): [number, number] =>
  c.category === "Locomotion" ? ROBOT_FOCUS : [0.5, 0.55];
const groups = [...new Set(CLIPS.map((c) => c.category))];

function Preview({ clip }: { clip: Clip }) {
  return (
    <figure>
      <HalftoneVideo
        key={clip.id}
        src={clip.src}
        poster={clip.poster}
        ink="#111111"
        pitch={5}
        angle={45}
        focus={focus(clip)}
        lo={0.22}
        hi={0.9}
        className="aspect-[4/3] bg-[var(--ground)]"
      />
      <figcaption className="pz-small mt-1.5 flex justify-between gap-4">
        <span>
          <span className="pz-num mr-2">{num(clip)}</span>
          {clip.title}
        </span>
        <span>
          {clip.robot}, {clip.domain === "Sim" ? "simulation" : "hardware"},{" "}
          {clip.speed}
        </span>
      </figcaption>
    </figure>
  );
}

// A typographic index in the manner of a studio's project list: rows of
// plain text, with the clip shown beside the list on desktop and inline,
// on tap, on phones.
export default function ClipIndex() {
  const [hover, setHover] = useState(0);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="pz-grid items-start">
      <div className="col-span-6 md:col-span-7">
        <div className="pz-small grid grid-cols-[3rem_1fr_6rem] border-b border-black pb-1 md:grid-cols-[4rem_1fr_7rem_6rem_3rem]">
          <span>No.</span>
          <span>Clip</span>
          <span>Robot</span>
          <span className="hidden md:block">Domain</span>
          <span className="hidden text-right md:block">Speed</span>
        </div>
        {groups.map((g) => (
          <Fragment key={g}>
            <p className="pz-small border-b border-black pb-1 pt-5">{g}</p>
            {CLIPS.filter((c) => c.category === g).map((c) => {
              const i = CLIPS.indexOf(c);
              const isOpen = open === i;
              return (
                <div key={c.id} className="border-b border-black/25">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onMouseEnter={() => setHover(i)}
                    onFocus={() => setHover(i)}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className={`pz-row grid w-full grid-cols-[3rem_1fr_6rem] py-1.5 text-left md:grid-cols-[4rem_1fr_7rem_6rem_3rem] md:hover:bg-[var(--hover)] ${
                      hover === i ? "md:bg-[var(--hover)]" : ""
                    }`}
                  >
                    <span className="pz-num">{num(c)}</span>
                    <span>{c.title}</span>
                    <span>{c.robot}</span>
                    <span className="hidden md:block">
                      {c.domain === "Sim" ? "Simulation" : "Hardware"}
                    </span>
                    <span className="pz-num hidden text-right md:block">
                      {c.speed}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="pb-3 md:hidden">
                      <Preview clip={c} />
                    </div>
                  )}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
      <div className="sticky top-[calc(var(--bar)+var(--head)+1rem)] col-span-5 col-start-8 hidden md:block">
        <Preview clip={CLIPS[hover]} />
      </div>
    </div>
  );
}
