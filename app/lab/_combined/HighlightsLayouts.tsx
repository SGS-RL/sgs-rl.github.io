"use client";

import { useMemo, type CSSProperties, type ReactNode } from "react";
import { Reel, useReel } from "../_reel/engine";
import { ReelPlayer } from "../_reel/parts";
import { mss, pad2, type Chapter, type ReelData } from "../_reel/reel";
import { BarRow, Now, runs, Under } from "./Reel";
import { SPEED_TEXT, useSpeedNote } from "./speedNote";

// Layouts for the Highlights section, compared on /lab/reel-layouts/
// (owner, 2026-10-07): the video should not sit alone on one side of the
// page, so each layout either balances it with something on the other side
// or centres it, and all but R5 open with a big "Highlights" title. The
// video comes first on phones and on the left from 1024 px.
//
//   r1  Reel A of /lab/reel/ mirrored: the chapter list on the right.
//   r2  r1 on a mint band, as reel C of /lab/reel/.
//   r3  The chapters as an index, in the style of the Clips index of
//       /lab/site/: No., clip, robot, domain, speed; the current row yellow.
//   r4  Centred, with each title under its segment of the bar.
//   r5  No heading band: the video, and beside it the big title over the
//       chapter list.

export type ReelLayout = "r1" | "r2" | "r3" | "r4" | "r5";

const where = (c: Chapter) => (c.domain === "Real" ? "Hardware" : "Simulation");
const fast = (c: Chapter) => (c.speed && c.speed !== "1×" ? c.speed : "");

function Heading({ children, note }: { children: ReactNode; note?: string }) {
  if (!note)
    return (
      <h2 className="pz-head border-y border-black bg-white px-[var(--m)] pb-[0.08em] pt-[0.04em] text-black">
        {children}
      </h2>
    );
  // With the 1× note (s1, ./speedNote.tsx): the title, and the note at the
  // band's right end on its baseline.
  return (
    <div className="cb-hl-band border-y border-black bg-white px-[var(--m)] pb-[0.08em] pt-[0.04em] text-black">
      <h2 className="pz-head">{children}</h2>
      <p className="cb-hl-note pz-mid">{note}</p>
    </div>
  );
}

// The chapters grouped by robot and domain, numbered, with start times. A
// row jumps the reel to its chapter; the current one is in full ink with a
// red mark.
function ChapterList() {
  const { chapters, idx, goTo } = useReel();
  const groups = useMemo(() => runs(chapters), [chapters]);
  return (
    <div className="cb-list">
      {groups.map((g) => {
        const first = chapters[g.from];
        return (
          <div key={g.key}>
            <p className="cb-list-head">
              <span>{first.robot}</span>
              <span>{where(first)}</span>
            </p>
            <ol>
              {chapters.slice(g.from, g.to + 1).map((c) => (
                <li key={c.i}>
                  <button
                    type="button"
                    className="cb-list-row"
                    aria-current={c.i === idx ? "true" : undefined}
                    onClick={() => goTo(c.i)}
                  >
                    <span className="pz-num">{pad2(c.i + 1)}</span>
                    <span className="min-w-0">{c.title}</span>
                    <span className="pz-num">{fast(c)}</span>
                    <span className="cb-list-time pz-num">{mss(c.start)}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        );
      })}
    </div>
  );
}

// The Clips index of /lab/site/ for the reel's chapters.
function Index() {
  const { chapters, idx, goTo } = useReel();
  return (
    <div className="cb-index">
      <p className="cb-index-row cb-index-cols pz-small">
        <span>No.</span>
        <span>Clip</span>
        <span className="cb-index-wide">Robot</span>
        <span className="cb-index-wide">Domain</span>
        <span className="text-right">Speed</span>
      </p>
      <ol>
        {chapters.map((c) => (
          <li key={c.i}>
            <button
              type="button"
              className="cb-index-row"
              aria-current={c.i === idx ? "true" : undefined}
              onClick={() => goTo(c.i)}
            >
              <span className="pz-num">{pad2(c.i + 1)}</span>
              <span className="min-w-0">{c.title}</span>
              <span className="cb-index-wide">{c.robot}</span>
              <span className="cb-index-wide">{where(c)}</span>
              <span className="pz-num text-right">{c.speed ?? "1×"}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Player({
  under = false,
  speed = false,
}: {
  under?: boolean;
  speed?: boolean;
}) {
  return (
    <ReelPlayer className="cb-reel-player cb-hl-player">
      <BarRow speed={speed} />
      {under ? <Under /> : <Now />}
    </ReelPlayer>
  );
}

// Video heights: the section's heading and controls must fit on the screen
// with it.
const MAX: Record<ReelLayout, string> = {
  r1: "calc(100svh - var(--bar) - 11rem)",
  r2: "calc(100svh - var(--bar) - 11rem)",
  r3: "calc(100svh - var(--bar) - 11rem)",
  r4: "calc(100svh - var(--bar) - 14rem)",
  r5: "calc(100svh - var(--bar) - 6rem)",
};

export default function HighlightsLayout({
  reel,
  layout,
  id = "highlights",
  speedNote = false,
}: {
  reel: ReelData;
  layout: ReelLayout;
  id?: string;
  // The combined page: say that every video plays at 1×, where the switch
  // in ./speedNote.tsx puts it (R1 only). The studies leave it off.
  speedNote?: boolean;
}) {
  const note = useSpeedNote();
  const body = {
    r1: (
      <div className="cb-hl-row">
        <Player speed={speedNote && note === "s3"} />
        <ChapterList />
      </div>
    ),
    r2: (
      <div className="cb-hl-row">
        <Player />
        <ChapterList />
      </div>
    ),
    r3: (
      <div className="cb-hl-row cb-hl-index">
        <Player />
        <Index />
      </div>
    ),
    r4: (
      <div className="cb-hl-centre">
        <Player under />
      </div>
    ),
    r5: (
      <div className="cb-hl-row">
        <Player />
        <div className="cb-hl-side">
          <h2 className="pz-head">Highlights</h2>
          <ChapterList />
        </div>
      </div>
    ),
  }[layout];
  return (
    <section
      id={id}
      aria-label="Highlights"
      className={`cb-hl cb-hl-${layout}`}
    >
      {layout !== "r5" && (
        <Heading note={speedNote && note === "s1" ? SPEED_TEXT : undefined}>
          Highlights
        </Heading>
      )}
      <Reel
        reel={reel}
        skin="pz"
        className="cb-reel cb-hl-body"
        style={{ "--rl-max-h": MAX[layout] } as CSSProperties}
      >
        {body}
      </Reel>
    </section>
  );
}
