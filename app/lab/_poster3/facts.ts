// The Summary's facts for /lab/poster-3. DRAFT for the owner to curate.
// Round 2's list (_poster2/facts.ts) was method rows only; this one starts
// with what the footage shows (robots, tasks, hardware) and keeps the
// method and training rows that come from content.ts, the redesign notes
// or the method explainer. Nothing else is claimed.
//
// To check (also listed in the round report):
//   - "Reach a goal across terrain": from round 1's rows ("One target pose
//     per terrain") and the yellow marker in the footage.
//   - Task list: from the footage folder names (rod, nut, gear mesh, BNC,
//     waterproof connector, rectangular peg).
//   - "Run on the real arm" for rod, nut and gear mesh: from the footage;
//     how the policies were transferred is not stated.
//   - 32,768 configurations and the target success rates (0.5; 0.66 for
//     locomotion) come from the explainer and the notes, not the paper text.
//   - "Over one million" and "about 64K": wording still to confirm.
export const FACTS: [string, string, string][] = [
  [
    "Robots",
    "ANYmal C, ANYmal D, Franka, UR5e",
    "Two quadrupeds and two arms; the UR5e also on hardware",
  ],
  [
    "Locomotion",
    "Reach a goal across terrain",
    "ANYmal C and ANYmal D in simulation, twelve kinds of terrain shown",
  ],
  [
    "Manipulation",
    "Assembly on the NIST taskboard",
    "Rod, nut, gear mesh, BNC and waterproof connectors, rectangular peg",
  ],
  [
    "Hardware",
    "UR5e: rod, nut, gear mesh",
    "Policies trained in simulation, run on the real arm",
  ],
  [
    "Task configurations",
    "32,768, fixed before training",
    "Each one an initial state, a goal and environment parameters",
  ],
  [
    "Success estimate",
    "Mean of the last 100 outcomes",
    "Kept per configuration; unvisited configurations read 0",
  ],
  [
    "Sampling",
    "Favours a target success rate",
    "0.5, or 0.66 for locomotion; a floor keeps every configuration in play",
  ],
  ["Schedule", "None", "No curriculum, no difficulty labels"],
  ["Parallel environments", "Over one million", "Prior work: about 64K"],
  ["Policy", "Markovian MLP, 4–8 layers", "No transformer, no LSTM"],
  ["Reward", "Sparse success signal", "Plus generic regularizers"],
  ["Demonstrations", "None", "No distillation either"],
];
