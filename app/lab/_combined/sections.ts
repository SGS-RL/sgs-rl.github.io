// The sections the nav bar links to (./Nav.tsx). It grows as sections are
// approved and added to the page. Kept apart from Nav.tsx, a client
// module, so server components can read it.
export const SECTIONS: [string, string][] = [
  ["highlights", "Highlights"],
  ["summary", "Summary"],
  ["overview", "Overview"],
  ["method", "Method"],
  ["configurations", "Configurations"],
  ["algorithm", "Algorithm"],
  ["over-training", "Over training"],
  ["results", "Results"],
  ["footage", "Footage"],
  ["clips", "Clips"],
];
