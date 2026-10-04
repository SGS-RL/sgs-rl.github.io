"use client";

import { CLIPS } from "../content";
import { TileVideo, useClipGallery } from "../_gallery";
import HalftoneVideo from "../_poster/HalftoneVideo";

export type Still = {
  id: string; // clip id in CLIPS
  caption: string;
  // Rastered in the entry's ink, or shown as recorded. Hardware footage is
  // shown as recorded: it is the evidence that the policy runs on a robot.
  raw?: boolean;
  focus?: [number, number];
};

// Phone: the first still across the measure at the footage's own 16:9,
// the other two side by side. iPad and laptop: three in a row at 4:3.
// Ultrawide: three in a row at 16:9, so nothing is cropped and the row
// stays under a screen tall.
const SPAN = [
  "col-span-6 md:col-span-4",
  "col-span-3 md:col-span-4",
  "col-span-3 md:col-span-4",
];
const ASPECT = [
  "aspect-video md:aspect-[4/3] min-[1800px]:aspect-video",
  "aspect-[4/3] min-[1800px]:aspect-video",
  "aspect-[4/3] min-[1800px]:aspect-video",
];

// A row of stills under an Overview entry. Each opens its clip, unaltered,
// in the gallery player.
export default function Stills({
  stills,
  ink,
}: {
  stills: Still[];
  ink: string;
}) {
  const { open } = useClipGallery();
  return (
    <div className="pz-grid gap-y-3 pb-[var(--m)]">
      {stills.map((s, i) => {
        const clip = CLIPS.find((c) => c.id === s.id);
        if (!clip) return null;
        const frame = `${ASPECT[i % 3]} w-full`;
        return (
          <div key={s.id} className={SPAN[i % 3]}>
            <button
              type="button"
              className="s2-still"
              aria-label={`Play ${clip.title}, ${clip.robot}`}
              onClick={(e) => open(clip, { trigger: e.currentTarget })}
            >
              {s.raw ? (
                <TileVideo
                  src={clip.src}
                  poster={clip.poster}
                  className={`${frame} block bg-black object-cover`}
                />
              ) : (
                <HalftoneVideo
                  src={clip.src}
                  poster={clip.poster}
                  ink={ink}
                  pitch={4.5}
                  angle={20}
                  focus={s.focus}
                  lo={0.2}
                  hi={0.88}
                  gamma={1.3}
                  className={frame}
                />
              )}
              <span className="s2-cap pz-small mt-1 block">{s.caption}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
