import type { Metadata } from "next";
import CombinedPage from "../_combined/CombinedPage";

// The page with a smaller header, version F1 (../_combined/fold.css).
export const metadata: Metadata = { title: "Combined, first screen F1" };

export default function Page() {
  return <CombinedPage fold="f1" />;
}
