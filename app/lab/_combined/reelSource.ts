import fs from "node:fs";
import path from "node:path";
import { REEL3, REEL4, REEL5, STANDIN_REEL } from "../library";

// The mock reel (REEL3) needs the encoded library, which is not in git; on
// a fresh checkout the stand-in reel plays instead. Server-side only.
export const REEL = fs.existsSync(
  path.join(process.cwd(), "public/media/library/reel.mp4"),
)
  ? REEL3
  : STANDIN_REEL;

// The combined page's reel (REEL5, owner, 2026-10-08): the new hardware
// runs first, then UR5e simulation, Franka, ANYmal C and ANYmal D. Before it,
// REEL4 (nut, gear mesh and rod whole). The reel studies keep REEL above.
const built = (file: string) =>
  fs.existsSync(path.join(process.cwd(), "public/media/library", file));
export const COMBINED_REEL = built("reel5.mp4")
  ? REEL5
  : built("reel4.mp4")
    ? REEL4
    : STANDIN_REEL;
