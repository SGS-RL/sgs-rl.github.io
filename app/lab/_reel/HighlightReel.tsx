"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
import { HIGHLIGHTS } from "../content";
import { Reel, type Skin } from "./engine";
import {
  ReelBar,
  ReelCaption,
  ReelChapters,
  ReelControls,
  ReelPlayer,
  ReelTimeline,
  TYPE,
} from "./parts";
import { mss, type ReelData } from "./reel";

// The highlight reel, composed. Place it inside a page grid (.sw-grid or
// .pz-grid): it spans the full row and lays its parts on the same columns.
//
// layout "list":     chapter list on the left from 1024 px up (3 Swiss /
//                    4 poster columns), video on the right; on phones and
//                    iPad portrait the video comes first and the list sits
//                    under it in two columns.
// layout "timeline": no list; the chapters label a segmented timeline
//                    under the video, with the robots as bands above it.
export default function HighlightReel({
  reel = HIGHLIGHTS,
  skin = "swiss",
  layout = "list",
  heading = "Highlights",
  caption,
  maxHeight = "64svh",
  ink,
  id,
  className = "",
}: {
  reel?: ReelData;
  skin?: Skin;
  layout?: "list" | "timeline";
  // Small heading beside/above the reel; null when the page has its own
  // (e.g. a poster heading band).
  heading?: ReactNode;
  // Replaces the derived caption (clips, sim or hardware, speed).
  caption?: ReactNode;
  // Upper bound for the video's height; its width follows.
  maxHeight?: string;
  // Poster skin: the one ink for type, rules and bar.
  ink?: string;
  id?: string;
  className?: string;
}) {
  const capId = useId();
  const swiss = skin === "swiss";
  const T = TYPE[skin];
  const side = swiss ? "lg:col-span-3" : "lg:col-span-4";
  const main = swiss
    ? "lg:col-span-9 lg:col-start-4"
    : "lg:col-span-8 lg:col-start-5";
  // Phones: two columns of small Swiss type, or one column of the larger
  // poster rows (grouped by robot); one column beside the video from lg.
  const cols = swiss
    ? "columns-2 gap-x-4 md:gap-x-6"
    : "columns-1 gap-x-[var(--g)] md:columns-2";
  const style = {
    "--rl-max-h": maxHeight,
    ...(ink ? { "--rl-ink": ink } : {}),
  } as CSSProperties;

  return (
    <Reel
      reel={reel}
      skin={skin}
      id={id}
      style={style}
      className={`col-span-full grid grid-cols-subgrid gap-y-3 lg:grid-rows-[auto_auto_1fr] ${className}`}
    >
      {heading !== null && (
        <div
          className={`${T.small} col-span-full flex items-baseline justify-between gap-4 lg:col-start-1 lg:row-start-1 ${side}`}
        >
          <h2 className={T.strong}>{heading}</h2>
          <span className={`${T.num} text-[var(--rl-mute)]`}>
            {mss(reel.duration)}
          </span>
        </div>
      )}
      <ReelPlayer
        describedBy={capId}
        className={`col-span-full lg:row-span-3 lg:row-start-1 ${main}`}
      >
        {layout === "timeline" ? (
          <ReelTimeline />
        ) : (
          <ReelBar className="mt-1" />
        )}
        <ReelControls className={layout === "timeline" ? "mt-1" : ""} />
      </ReelPlayer>
      {/* Under the controls on phones; top of the side column on desktop. */}
      <ReelCaption
        as="p"
        id={capId}
        className={`col-span-full lg:col-start-1 lg:row-start-2 ${side}`}
      >
        {caption}
      </ReelCaption>
      {layout === "list" && (
        <ReelChapters
          className={`col-span-full mt-4 lg:col-start-1 lg:row-start-3 lg:mt-6 lg:columns-1 lg:self-end ${cols} ${side}`}
        />
      )}
    </Reel>
  );
}

export { Reel } from "./engine";
export {
  ReelBar,
  ReelCaption,
  ReelChapters,
  ReelControls,
  ReelPlayer,
  ReelTimeline,
} from "./parts";
export type { ReelData } from "./reel";
