"use client";

import type { CSSProperties } from "react";
import { LIBRARY } from "../library";
import TileVideo from "../_gallery/TileVideo";
import { useGallery } from "./Gallery";
import { useWide } from "./hooks";
import { INK } from "./inks";
import { plural, secs, smallSrc, speedWord, word } from "./data";

const TERRAINS = LIBRARY.filter(
  (c) => c.category === "Locomotion" && c.robot === "ANYmal D",
);

// The locomotion poster: a blue band, the robot's name large, then every
// terrain clip unaltered in a grid (2 columns on phones, 3 from iPad
// portrait, 4 on ultrawide). A clip opens the player.
export default function Locomotion() {
  const g = useGallery();
  const wide = useWide();
  return (
    <section
      className="pz-poster pb-16 pt-3 md:pb-24"
      style={
        {
          background: INK.loco.ground,
          color: INK.loco.type,
        } as CSSProperties
      }
    >
      <div className="pz-grid gap-y-4">
        <h3 className="pz-big col-span-6 text-[21vw] md:col-span-8 md:text-[min(10.5vw,19svh)]">
          ANYmal D
          <br />
          Terrains
        </h3>
        <div className="pz-small col-span-6 flex flex-col gap-3 md:col-span-3 md:col-start-10 md:pt-3">
          <p>
            Legged locomotion in simulation, one policy across{" "}
            {word(TERRAINS.length)} kinds of terrain. In each clip the robot
            makes for the yellow marker.
          </p>
          <p>
            Footage as recorded, at real time. Select any clip to see it larger.
          </p>
        </div>
      </div>

      <div className="pz-grid mt-8 md:mt-12">
        <div className="col-span-full flex justify-between border-t border-black pt-1">
          <p className="pz-small">ANYmal D, simulation</p>
          <p className="pz-small pz-num">{plural(TERRAINS.length, "clip")}</p>
        </div>
      </div>
      <ul className="p3-loco-grid mt-3 px-[var(--m)]">
        {TERRAINS.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              data-gal-clip={c.id}
              className="p3-tile"
              aria-label={`Play ${c.title}, ${c.robot}, larger`}
              onClick={(e) => g.open(c, e.currentTarget)}
            >
              <TileVideo
                src={wide ? c.src : smallSrc(c)}
                poster={c.poster}
                className="p3-video"
              />
              <span className="p3-cap pz-small pz-num">
                <span className="p3-cap-t min-w-0 truncate">
                  <span className="mr-2">{g.num(c)}</span>
                  {c.title}
                </span>
                <span className="shrink-0 max-sm:hidden">
                  {secs(c.duration)}, {speedWord(c.speed)}
                </span>
                <span className="shrink-0 sm:hidden">{secs(c.duration)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
