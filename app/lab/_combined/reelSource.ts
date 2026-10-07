import fs from "node:fs";
import path from "node:path";
import { REEL3, STANDIN_REEL } from "../library";

// The mock reel (REEL3) needs the encoded library, which is not in git; on
// a fresh checkout the stand-in reel plays instead. Server-side only.
export const REEL = fs.existsSync(
  path.join(process.cwd(), "public/lab/media/library/reel.mp4"),
)
  ? REEL3
  : STANDIN_REEL;
