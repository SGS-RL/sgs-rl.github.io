// Content that differs on this page from the shared ../content.ts, which
// the studies keep as they were reviewed. Everything else is imported from
// there.

import { FULL_SUBTITLE, TITLE } from "../content";

// The paper's full title, in one line, as it is copied.
export const FULL_TITLE = `${TITLE}: ${FULL_SUBTITLE}`;

// [name, affiliation numbers]; * marks co-first authors, † equal advising.
// Ignacio Dagnino is at the University of Washington (owner, 2026-10-06);
// Octi Zhang at UW and NVIDIA, with UW numbered first (owner, 2026-10-07).
export const AUTHORS: [string, string][] = [
  ["Octi Zhang", "1,2*"],
  ["Mateo Guaman Castro", "1*"],
  ["Patrick Yin", "1*"],
  ["Ignacio Dagnino", "1"],
  ["Abhishek Gupta", "1"],
  ["Rosario Scalise", "1†"],
  ["Byron Boots", "1†"],
];
export const AFFILIATIONS = ["University of Washington", "NVIDIA"];

// Each author's page, linked from their name in the header (owner,
// 2026-10-08).
export const AUTHOR_PAGES: Record<string, string> = {
  "Octi Zhang": "https://zoctipus.github.io/",
  "Mateo Guaman Castro": "https://www.mateoguaman.com/",
  "Patrick Yin": "https://patrickyin.me/",
  "Ignacio Dagnino": "https://www.linkedin.com/in/iggydagnino",
  "Abhishek Gupta": "https://homes.cs.washington.edu/~abhgupta/",
  "Rosario Scalise": "https://rosarioscalise.com/",
  "Byron Boots": "https://homes.cs.washington.edu/~bboots/",
};

// Paper and Code (owner, 2026-10-08): nothing to link to yet. Set the URLs
// when the paper is on arXiv and the code is out; until then both show as
// plain text, Code with "(coming soon)" (./PaperCode.tsx).
export const PAPER_URL: string | null = null;
export const CODE_URL: string | null = null;
