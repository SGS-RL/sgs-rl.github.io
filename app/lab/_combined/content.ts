// Content that differs on this page from the shared ../content.ts, which
// the studies keep as they were reviewed. Everything else is imported from
// there.

import { FULL_SUBTITLE, TITLE } from "../content";

// The paper's full title, in one line, as it is copied.
export const FULL_TITLE = `${TITLE}: ${FULL_SUBTITLE}`;

// [name, affiliation numbers]; * marks co-first authors, † equal advising.
// Ignacio Dagnigo is at the University of Washington (owner, 2026-10-06);
// Octi Zhang at UW and NVIDIA, with UW numbered first (owner, 2026-10-07).
export const AUTHORS: [string, string][] = [
  ["Octi Zhang", "1,2*"],
  ["Mateo Guaman Castro", "1*"],
  ["Patrick Yin", "1*"],
  ["Ignacio Dagnigo", "1"],
  ["Abhishek Gupta", "1"],
  ["Rosario Scalise", "1†"],
  ["Byron Boots", "1†"],
];
export const AFFILIATIONS = ["University of Washington", "NVIDIA"];
