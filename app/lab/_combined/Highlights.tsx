import HighlightsLayout from "./HighlightsLayouts";
import { COMBINED_REEL } from "./reelSource";

// Section 2: the highlight reel, layout R1 of /lab/reel-layouts/ (owner,
// 2026-10-07; R5 also liked): the big "Highlights" title, the video on the
// left and the chapter list on the right, grouped by robot and domain. The
// reel is REEL5 (2026-10-08): the two new nut runs first, each hardware
// clip whole.
export default function Highlights() {
  return <HighlightsLayout reel={COMBINED_REEL} layout="r1" speedNote />;
}
