import fs from "node:fs";
import path from "node:path";
import { REEL3, STANDIN_REEL } from "../library";
import Header, { Mark, Meta, Title } from "./Header";
import QuietReel, { type Controls } from "./Reel";

// The two openings left from /lab/highlights (owner, 2026-10-06): A, the
// header and then the reel across the measure; B, mark, title and authors
// beside the reel from 1024 px up. Both with the titles under the bar.

// The mock reel (REEL3) when its video was built, else the stand-in.
export const REEL = fs.existsSync(
  path.join(process.cwd(), "public/media/library/reel.mp4"),
)
  ? REEL3
  : STANDIN_REEL;

export function OpeningA({
  id = "top",
  controls = "under",
}: {
  id?: string;
  controls?: Controls;
}) {
  return (
    <>
      <Header id={id} />
      <div className="px-[var(--m)] pb-10">
        <QuietReel
          reel={REEL}
          controls={controls}
          maxH="calc(100svh - var(--bar) - 6rem)"
        />
      </div>
    </>
  );
}

export function OpeningB({
  id = "top",
  controls = "under",
}: {
  id?: string;
  controls?: Controls;
}) {
  return (
    <header id={id} className="cb-b">
      <div className="cb-b-mark">
        <Mark />
      </div>
      <Title className="cb-b-title" />
      <QuietReel
        reel={REEL}
        controls={controls}
        maxH="calc(100svh - var(--bar) - 7rem)"
        className="cb-b-reel"
      />
      <Meta className="cb-b-meta" />
    </header>
  );
}
