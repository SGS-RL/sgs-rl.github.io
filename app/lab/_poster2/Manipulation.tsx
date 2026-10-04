"use client";

import { CLIPS, type Clip } from "../content";
import { TileVideo, smallSrc, useClipGallery } from "../_gallery";
import { P } from "../_poster/palettes";

const SIM = CLIPS.filter(
  (c) => c.category === "Manipulation" && c.domain === "Sim",
);
const REAL = CLIPS.filter(
  (c) => c.category === "Manipulation" && c.domain === "Real",
);

// Small clips under each long video. A tile opens the clip player.
function Tiles({ clips, span }: { clips: Clip[]; span: string }) {
  const g = useClipGallery();
  return (
    <ul className="col-span-6 grid grid-cols-6 gap-x-[var(--g)] gap-y-3">
      {clips.map((c) => (
        <li key={c.id} className={span}>
          <button
            type="button"
            className="p2-tile"
            aria-label={`Play clip ${g.num(c)}, ${c.title}, ${c.robot}`}
            onClick={(e) => g.open(c, { trigger: e.currentTarget })}
          >
            <TileVideo
              src={smallSrc(c)}
              poster={c.poster}
              className="p2-video"
            />
            <span className="pz-small pz-num mt-1 block">
              <span className="mr-2">{g.num(c)}</span>
              <span className="p2-tile-cap">{c.title}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

// The loved title in its colours, then the footage itself, unaltered:
// the long simulation and hardware videos side by side, and the cut clips
// under each.
export default function Manipulation() {
  return (
    <section
      className="pz-poster pb-12 pt-3 md:pb-16"
      style={{ background: P.manip.ground, color: P.manip.type }}
    >
      <div className="pz-grid gap-y-4">
        <h3 className="pz-big col-span-6 text-[21vw] md:col-span-8 md:text-[min(10.5vw,19svh)]">
          NIST
          <br />
          Taskboard
        </h3>
        <p className="pz-small col-span-6 text-black md:col-span-3 md:col-start-10 md:pt-3">
          Contact-rich assembly, trained with reinforcement learning and no
          demonstrations, then transferred to hardware. Footage as recorded,
          without treatment.
        </p>
      </div>

      <div className="pz-grid mt-6 gap-y-8 text-black md:mt-10">
        <div className="col-span-6 grid grid-cols-subgrid gap-y-3 content-start">
          <figure className="col-span-6">
            <TileVideo
              src="/lab/media/manipulation-960.mp4"
              poster="/manipulation-poster.jpg"
              className="p2-video"
            />
            <figcaption className="pz-small mt-1 flex justify-between gap-4">
              <span>Simulation</span>
              <span>Franka (check)</span>
            </figcaption>
          </figure>
          <Tiles clips={SIM} span="col-span-2" />
        </div>
        <div className="col-span-6 grid grid-cols-subgrid gap-y-3 content-start">
          <figure className="col-span-6">
            <TileVideo
              src="/lab/media/real-world-960.mp4"
              poster="/real-world-poster.jpg"
              className="p2-video"
            />
            <figcaption className="pz-small mt-1 flex justify-between gap-4">
              <span>Hardware, 3× speed</span>
              <span>UR arm (check)</span>
            </figcaption>
          </figure>
          <Tiles clips={REAL} span="col-span-2" />
        </div>
      </div>
    </section>
  );
}
