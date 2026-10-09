import type { Metadata } from "next";
import { QUILT } from "../../_combined/CombinedPage";
import QuiltFrame from "./QuiltFrame";

// The Results quilt alone, for a video in the paper's Twitter thread (owner,
// 2026-10-09: "some of the frames with the cartoonish filter type thing,
// and some not ... an overview of our results"). Not for the site:
// scripts/lab/thread/render_quilt.mjs steps it frame by frame.
export const metadata: Metadata = { title: "Thread, Results quilt" };

export default function Page() {
  return <QuiltFrame clips={QUILT} />;
}
