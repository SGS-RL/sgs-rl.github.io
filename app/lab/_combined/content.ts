// Content that differs on this page from the shared ../content.ts, which
// the studies keep as they were reviewed. Everything else is imported from
// there.

import { FULL_SUBTITLE, TITLE } from "../content";

// The paper's full title, in one line, as it is copied.
export const FULL_TITLE = `${TITLE}: ${FULL_SUBTITLE}`;

// [name, affiliation numbers]; * marks co-first authors. Ignacio Dagnigo
// is at the University of Washington (owner, 2026-10-06).
export const AUTHORS: [string, string][] = [
  ["Octi Zhang", "1*"],
  ["Mateo Guaman Castro", "2*"],
  ["Patrick Yin", "2*"],
  ["Ignacio Dagnigo", "2"],
  ["Abhishek Gupta", "2"],
  ["Rosario Scalise", "2"],
  ["Byron Boots", "2"],
];
export const AFFILIATIONS = ["NVIDIA", "University of Washington"];
