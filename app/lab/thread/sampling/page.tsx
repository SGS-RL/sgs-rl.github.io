import type { Metadata } from "next";
import "../../_poster/poster.css";
import "../../_site/site.css";
import "../../_combined/combined.css";
import LearningProgress from "../../_combined/LearningProgress";
import "../thread.css";

// Not for the site: a frame for the owner's Twitter thread video of
// "Sampling during training" (2026-10-09), the waterproof connector's
// footage beside the success-rate chart and the SGS weight curve, as in
// Method part 03. scripts/lab/thread/sampling_video.py renders it frame
// by frame at 1200 x 675 CSS px, 1.6x, into a 1920 x 1080 video.
export const metadata: Metadata = { title: "Thread, sampling during training" };

const CAPTURE = {
  task: "waterproof",
  src: "/media/library/thread/waterproof-1280.mp4",
};

export default function Page() {
  return (
    <div className="pz st cb th-frame">
      <LearningProgress capture={CAPTURE} />
    </div>
  );
}
