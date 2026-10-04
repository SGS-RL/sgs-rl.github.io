"use client";

import type { CSSProperties } from "react";
import type { Clip } from "../content";
import { useClipGallery } from "./ClipGallery";
import {
  groupByRobot,
  hideAt,
  interleave,
  plural,
  smallSrc,
  STEPS,
  type Skin,
} from "./data";
import TileVideo from "./TileVideo";

// Columns and rows of the band at each container step (see data.ts).
const COLS = [3, 5, 8, 10, 12];
const ROWS = [3, 2, 2, 2, 2];

const SK = {
  swiss: { root: "gal-skin-swiss", small: "sw-label", link: "sw-link" },
  pz: {
    root: "gal-skin-pz",
    small: "pz-small",
    link: "underline decoration-1 underline-offset-[0.18em] hover:decoration-2",
  },
} as const;

// A short full-bleed band of clips, edge to edge with no captions: a
// transition into the collection, not the collection. It holds two rows
// (three on phones) and never leaves a gap, so with few clips it uses
// fewer columns, and with many it shows an excerpt that cycles through
// the robots. Every tile opens the player.
export default function ClipWall({
  clips,
  skin,
  allHref,
  caption = true,
  className = "",
}: {
  // Defaults to the gallery's whole collection.
  clips?: Clip[];
  skin?: Skin;
  // Link to the full collection (e.g. "#clips"), shown in the caption.
  allHref?: string;
  // The line under the band. Set false to leave it out.
  caption?: boolean;
  className?: string;
}) {
  const g = useClipGallery();
  const s = skin ?? g.skin;
  const k = SK[s];
  const groups = clips ? groupByRobot(clips) : g.groups;
  const order = interleave(groups);
  const n = order.length;

  // Columns per step: as many as fit, but never more than the clips can
  // fill without a hole in the last row.
  const cols = COLS.map((c, i) =>
    Math.max(1, Math.min(c, Math.floor(n / ROWS[i]) || n)),
  );
  const shown = cols.map((c, i) => Math.min(n, c * ROWS[i]));
  const vars = Object.fromEntries(
    cols.map((c, i) => [`--gal-wc${i}`, c]),
  ) as CSSProperties;

  const domains = [...new Set(order.map((c) => c.domain))];
  const where =
    domains.length > 1
      ? "in simulation and on hardware"
      : domains[0] === "Sim"
        ? "in simulation"
        : "on hardware";

  return (
    <div className={`gal gal-wall ${k.root} ${className}`}>
      <ul className="gal-wall-grid" style={vars}>
        {order.map((c, i) => {
          const hidden = STEPS.filter((st) => i >= shown[st]);
          if (hidden.length === STEPS.length) return null;
          return (
            <li key={c.id} className={hideAt(hidden)}>
              <button
                type="button"
                data-gal-clip={c.id}
                aria-label={`${g.num(c)} ${c.title}, ${c.robot}`}
                onClick={(e) =>
                  g.open(c, { skin: s, trigger: e.currentTarget })
                }
                className="gal-wall-tile"
              >
                <TileVideo
                  src={smallSrc(c)}
                  poster={c.poster}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </button>
            </li>
          );
        })}
      </ul>
      {caption && (
        <p className={`gal-wall-cap ${k.small}`}>
          <span>
            {plural(n, "clip")} from {plural(groups.length, "robot")}, {where}.
            Select any clip to play it.
          </span>
          {allHref && (
            <a href={allHref} className={k.link}>
              All clips ↓
            </a>
          )}
        </p>
      )}
    </div>
  );
}
