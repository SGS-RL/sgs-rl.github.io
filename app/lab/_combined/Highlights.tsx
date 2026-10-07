import HighlightsLayout from "./HighlightsLayouts";
import { REEL } from "./reelSource";

// Section 2: the highlight reel, layout R1 of /lab/reel-layouts/ (owner,
// 2026-10-07; R5 also liked): the big "Highlights" title, the video on the
// left and the chapter list on the right, grouped by robot and domain.
export default function Highlights() {
  return <HighlightsLayout reel={REEL} layout="r1" />;
}
