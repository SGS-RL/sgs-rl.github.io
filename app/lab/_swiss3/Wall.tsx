"use client";

import type { CSSProperties } from "react";
import type { Item } from "../library";
import TileVideo from "../_gallery/TileVideo";
import { hideAt, STEPS } from "../_gallery/data";
import { useGallery } from "./Gallery";
import { interleave, smallSrc, units } from "./data";

// Columns and rows of the band at each container step (as _gallery's wall:
// < 600, < 1000, < 1800, < 2400 px, wider).
const COLS = [3, 5, 8, 10, 12];
const ROWS = [3, 2, 2, 2, 2];

// Fill `rows` rows of `cols` cells from the sequence, in order, with pairs
// taking two cells; a pair that does not fit the end of a row waits for the
// next one, so no row has a hole. Two clips of one robot and domain are not
// placed side by side when another clip fits.
function pack(seq: Item[], cols: number, rows: number) {
  const queue = [...seq];
  const out: Item[] = [];
  const key = (it?: Item) => it && `${it.robot}|${it.domain}`;
  for (let r = 0; r < rows; r++) {
    let left = cols;
    let prev: Item | undefined;
    while (left > 0) {
      const fits = (it: Item) => units(it) <= left;
      let i = queue.findIndex((it) => fits(it) && key(it) !== key(prev));
      if (i < 0) i = queue.findIndex(fits);
      if (i < 0) break;
      const [it] = queue.splice(i, 1);
      out.push(it);
      left -= units(it);
      prev = it;
    }
  }
  return out;
}

// A short full-bleed band of clips, edge to edge with no captions: the
// transition from the results into the collection. A copy of _gallery's
// ClipWall in which pairs (32:9) take two cells instead of being cropped
// to 16:9. One packed band per container step; only the current one shows
// (and only its videos load).
export default function Wall({ className = "" }: { className?: string }) {
  const g = useGallery();
  const seq = interleave(g.groups);
  return (
    <div className={`gal gal-wall gal-skin-swiss ${className}`}>
      {STEPS.map((step) => {
        const cols = COLS[step];
        const shown = pack(seq, cols, ROWS[step]);
        return (
          <ul
            key={step}
            className={`gal-wall-grid s3-wall ${hideAt(STEPS.filter((s) => s !== step))}`}
            style={{ "--cols": cols } as CSSProperties}
          >
            {shown.map((c) => (
              <li key={c.id} data-pair={c.kind === "pair" ? "" : undefined}>
                <button
                  type="button"
                  data-gal-clip={c.id}
                  aria-label={`${g.num(c)} ${c.title}, ${c.robot}`}
                  onClick={(e) => g.open(c, e.currentTarget)}
                  className="gal-wall-tile s3-wall-tile"
                >
                  <TileVideo
                    src={smallSrc(c)}
                    poster={c.poster}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
        );
      })}
    </div>
  );
}
