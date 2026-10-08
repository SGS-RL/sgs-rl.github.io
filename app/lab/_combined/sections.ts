// The sections the nav bar links to (./Nav.tsx). SECTIONS is what
// /lab/combined/ shows: the approved sections only. It grows as sections
// are approved. /lab/combined-draft/ uses the same list (its old Footage
// and Clips sections gave way to Clips, 2026-10-08).
// Kept apart from Nav.tsx, a client module, so server components can read
// it.
export const SECTIONS: [string, string][] = [
  ["highlights", "Highlights"],
  ["summary", "Summary"],
  ["overview", "Overview"],
  ["method", "Method"],
  ["results", "Results"],
  ["clips", "Clips"],
  ["bibtex", "BibTeX"],
];
