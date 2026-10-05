"use client";

import type { CSSProperties } from "react";
import type { Item } from "../library";
import TileVideo from "../_gallery/TileVideo";
import { useGallery } from "./Gallery";
import { label } from "./items";
import Sides from "./Sides";

// One clip in an Overview entry, as recorded: no raster, no recolouring,
// never cropped. The frame has the clip's own aspect (16:9, or 32:9 for a
// UR5e pair), plays muted while on screen and opens the player on a click.
export function Tile({
  clip,
  withRobot = false,
  lead = false,
}: {
  clip: Item;
  // Name the robot in the caption (entries that mix robots).
  withRobot?: boolean;
  // Phones: take the whole measure (the first clip of a row of three).
  lead?: boolean;
}) {
  const { open } = useGallery();
  const pair = clip.kind === "pair";
  return (
    <div
      className="s3-tile"
      data-kind={clip.kind}
      data-lead={lead ? "" : undefined}
      style={{ "--a": String(clip.aspect) } as CSSProperties}
    >
      <button
        type="button"
        data-gal-clip={clip.id}
        className="s3-clip"
        aria-label={`Play ${clip.robot}, ${clip.title}${
          clip.sides ? `: left, ${clip.sides[0]}; right, ${clip.sides[1]}` : ""
        }`}
        onClick={(e) => open(clip, { trigger: e.currentTarget })}
      >
        <span className="s3-frame">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={clip.poster} alt="" />
          <TileVideo src={clip.src} poster={clip.poster} />
        </span>
        <span className="s3-cap pz-small mt-1.5 block">
          {label(clip, withRobot)}
          {clip.domain === "Real" && clip.speed !== "1×" && `, ${clip.speed}`}
        </span>
      </button>
      {pair && clip.sides && <Sides sides={clip.sides} className="s3-mute" />}
    </div>
  );
}

// A row of clips that share one height: each takes width in proportion to
// its aspect, so a pair and two 16:9 clips line up top and bottom without
// cropping. Phones and iPad portrait wrap: pairs take the measure, 16:9
// clips go two to a line (a lead clip takes the measure).
export function Row({
  clips,
  withRobot,
  lead = false,
}: {
  clips: Item[];
  withRobot?: boolean;
  lead?: boolean;
}) {
  const wide = clips.some((c) => c.kind === "pair");
  return (
    <div className="s3-row" data-wide={wide ? "" : undefined}>
      {clips.map((c, i) => (
        <Tile
          key={c.id}
          clip={c}
          withRobot={withRobot}
          lead={lead && i === 0}
        />
      ))}
    </div>
  );
}
