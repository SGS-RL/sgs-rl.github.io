import type { Metadata } from "next";
import CombinedPage from "../_combined/CombinedPage";

// The site with version W2 for wide screens: Clips and Method 03
// (../_combined/wide.css).
export const metadata: Metadata = { title: "Combined, wide W2" };

export default function Page() {
  return <CombinedPage fold="f2" fit="runin" wide="w2" />;
}
