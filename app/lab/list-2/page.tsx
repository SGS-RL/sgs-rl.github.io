import type { Metadata } from "next";
import CombinedPage from "../_combined/CombinedPage";

// F2 with the Highlights chapter list fitted to the video's height,
// version L2: scrolling (../_combined/HighlightsLayouts.tsx, ListFit).
export const metadata: Metadata = { title: "Combined, F2, list L2" };

export default function Page() {
  return <CombinedPage fold="f2" fit="scroll" />;
}
