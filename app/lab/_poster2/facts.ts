// Candidate rows for the Summary's facts list. DRAFT: the owner will
// hand-curate this list. Every row comes from app/lab/content.ts, the
// redesign notes or the method facts in the round-2 brief; nothing else.
// Rows marked "(check)" are guesses that need confirming.
export const FACTS: [string, string, string][] = [
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
    "Peaks at intermediate success",
    "A Beta-shaped score, then a softmax; a floor keeps every configuration reachable",
  ],
  [
    "Schedule",
    "None",
    "No curriculum, no difficulty labels, no task-specific tuning",
  ],
  [
    "Evaluation",
    "Uniform over the fixed set",
    "Sampling is bypassed when measuring success",
  ],
  ["Parallel environments", "Over one million", "Prior work: about 64K"],
  ["Policy", "Markovian MLP, 4–8 layers", "No transformer, no LSTM"],
  ["Reward", "Sparse success signal", "Plus generic regularizers"],
  ["Demonstrations", "None", "No distillation either"],
];
