// The sections the nav bar links to (./Nav.tsx). SECTIONS is what
// /lab/combined/ shows: the approved sections only. It grows as sections
// are approved. DRAFT_SECTIONS adds the sections set up on 2026-10-07 but
// not yet reviewed, parked at /lab/combined-draft/ (owner, 2026-10-07).
// Kept apart from Nav.tsx, a client module, so server components can read
// it.
export const SECTIONS: [string, string][] = [
  ["highlights", "Highlights"],
  ["summary", "Summary"],
  ["overview", "Overview"],
  ["method", "Method"],
];

export const DRAFT_SECTIONS: [string, string][] = [
  ...SECTIONS,
  ["configurations", "Configurations"],
  ["algorithm", "Algorithm"],
  ["over-training", "Over training"],
  ["results", "Results"],
  ["footage", "Footage"],
  ["clips", "Clips"],
];
