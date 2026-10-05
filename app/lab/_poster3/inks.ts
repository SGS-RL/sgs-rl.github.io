// Section inks for /lab/poster-3. Three per section: ground, type, and one
// more (rules, marks, small type). The footage is evidence and carries its
// own colour; it is not counted and never recoloured.
import { P } from "../_poster/palettes";

export const INK = {
  // NOF silver (La Voix humaine): one neutral ink, the footage carries
  // the colour.
  reel: { ground: "#b0b5bb", type: "#111111", mark: "#ffffff" },
  // The loved title colours: white ground, coral type, black small type.
  manip: { ground: P.manip.ground, type: P.manip.type, mark: "#111111" },
  // Blue band, black type, white marks.
  loco: { ground: "#1e9ad6", type: "#111111", mark: "#ffffff" },
  // The robot's red, black type, white marks.
  runs: { ground: "#e2231a", type: "#111111", mark: "#ffffff" },
} as const;
