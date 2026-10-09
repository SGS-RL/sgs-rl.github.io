import HighlightsLayout, {
  type ListFit,
  type ReelLayout,
} from "./HighlightsLayouts";
import { COMBINED_REEL } from "./reelSource";

// Section 2: the highlight reel, layout R1 of /lab/reel-layouts/ (owner,
// 2026-10-07; R5 also liked): the big "Highlights" title, the video on the
// left and the chapter list on the right, grouped by robot and domain. The
// reel is REEL5 (2026-10-08): the two new nut runs first, each hardware
// clip whole.
// `layout` r6: the title beside the video (/lab/fold-2/, -3/); `fit`: how
// its chapter list fits the video's height (/lab/list-1/ to -3/).
export default function Highlights({
  layout = "r1",
  fit,
}: {
  layout?: Extract<ReelLayout, "r1" | "r6">;
  fit?: ListFit;
}) {
  return (
    <HighlightsLayout
      reel={COMBINED_REEL}
      layout={layout}
      fit={fit}
      speedNote
    />
  );
}
