"use client";

import type { CSSProperties } from "react";
import type { Item } from "../library";
import TileVideo from "../_gallery/TileVideo";
import { useGallery } from "./Gallery";
import { clock, domainWord, plural, smallSrc, type Group } from "./data";

// One tile: video, then number, title, speed and length. A pair spans two
// cells at its own 32:9 aspect, with a label over each half. A click opens
// the player at this clip.
export function Tile({
  c,
  primary = false,
  caption = true,
  className = "",
}: {
  c: Item;
  // The tile focus returns to when the player was opened from a link.
  primary?: boolean;
  caption?: boolean;
  className?: string;
}) {
  const g = useGallery();
  const pair = c.kind === "pair" && c.sides;
  return (
    <button
      type="button"
      data-gal-clip={c.id}
      data-gal-primary={primary ? "" : undefined}
      aria-label={
        caption ? undefined : `${g.num(c)} ${c.title}, ${c.robot}, play`
      }
      onClick={(e) => g.open(c, e.currentTarget)}
      className={`gal-tile group ${className}`}
    >
      {pair && (
        <span className="s3-sides sw-label text-sw-mute">
          <span>{pair[0]}</span>
          <span>{pair[1]}</span>
        </span>
      )}
      <span
        className="gal-frame s3-frame"
        style={{ "--a": c.aspect } as CSSProperties}
      >
        <TileVideo
          src={smallSrc(c)}
          poster={c.poster}
          className="absolute inset-0 h-full w-full object-contain"
        />
      </span>
      {caption && (
        <span className="gal-cap sw-label">
          <span className="sw-num gal-mute">{g.num(c)}</span>
          <span className="min-w-0">
            <span className="gal-cap-title block font-medium">{c.title}</span>
            <span className="gal-mute block">
              {c.speed} · <span className="sw-num">{clock(c.duration)}</span>
            </span>
          </span>
        </span>
      )}
    </button>
  );
}

function Block({ group, note }: { group: Group; note?: string }) {
  const g = useGallery();
  const desc = note ?? `${group.category} · ${domainWord(group.domain)}`;
  return (
    <section
      aria-label={`${group.robot}, ${domainWord(group.domain).toLowerCase()}`}
      className="gal-group"
    >
      <header className="s3-head">
        <h3 className="s3-head-name text-2xl font-semibold leading-none tracking-[-0.035em] md:text-4xl">
          {group.robot}{" "}
          <span className="text-sw-mute">{domainWord(group.domain)}</span>
        </h3>
        <p className="s3-head-desc sw-label gal-mute">{desc}</p>
        <p className="s3-head-count sw-label sw-num">
          <span className="gal-mute">{plural(group.items.length, "clip")}</span>
          <button
            type="button"
            className="sw-link ml-3"
            onClick={(e) => g.open(group.items[0], e.currentTarget)}
          >
            Play
          </button>
        </p>
      </header>
      <ul className="gal-tiles s3-tiles">
        {group.items.map((c) => (
          <li key={c.id} data-pair={c.kind === "pair" ? "" : undefined}>
            <Tile c={c} primary />
          </li>
        ))}
      </ul>
    </section>
  );
}

// Every clip, one block per robot and domain. Tiles wrap in 2 columns on
// phones, 4 from iPad portrait, 6 on ultrawide; these line up with the
// page grid. All tiles on screen play, muted.
export default function Collection({
  notes = {},
}: {
  // Line beside a block's name, by group key ("UR5e|Sim").
  notes?: Record<string, string>;
}) {
  const g = useGallery();
  return (
    <div className="gal gal-grid gal-skin-swiss s3-coll">
      {g.groups.map((group) => (
        <Block key={group.key} group={group} note={notes[group.key]} />
      ))}
    </div>
  );
}
