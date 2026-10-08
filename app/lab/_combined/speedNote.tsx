"use client";

// Where the page says that every video plays at 1× (owner, 2026-10-08:
// "very early on, maybe even before the highlights ... in a very clean
// way"):
//   s1  at the right end of the Highlights title band
//   s2  in the black bar, after "SGS", on every screen
//   s3  as "1×" in each player's controls, where a speed control sits
export type SpeedNote = "s1" | "s2" | "s3";

// S1 is the owner's pick (2026-10-08: "S1 is for sure the way to go"); the
// switch is gone, S2 and S3 stay in the code.
export const SPEED_TEXT = "All videos at 1×";
export const useSpeedNote = (): SpeedNote => "s1";

/** "1×" in a player's controls (s3). */
export function SpeedMark() {
  return (
    <span className="cb-speed pz-small" title="All videos play in real time">
      1×
    </span>
  );
}
