import type { Metadata } from "next";
import ClipStudies from "../_components/ClipStudies";
import SwissHeader from "../_components/SwissHeader";
import { CLIPS } from "../content";

export const metadata: Metadata = { title: "Clip layouts" };

const robots = new Set(CLIPS.map((c) => c.robot)).size;

export default function Page() {
  return (
    <div className="swiss pb-24" data-theme="light">
      <SwissHeader
        nav={[
          ["Lab", "/lab/"],
          ["Swiss", "/lab/swiss/"],
        ]}
        home="/lab/"
      />
      <div className="sw-grid gap-y-3 pb-10 pt-6 md:pb-14 md:pt-10">
        <div className="col-span-full h-px bg-sw-rule" />
        <h1 className="sw-display col-span-full pt-2 text-[17vw] md:col-span-8 md:text-[9vw]">
          Clips
        </h1>
        <p className="sw-label sw-num col-span-full self-end text-sw-mute md:col-span-4 md:text-right">
          {CLIPS.length} clips · {robots} robots · placeholders cut from the
          current videos
        </p>
      </div>
      <ClipStudies />
    </div>
  );
}
