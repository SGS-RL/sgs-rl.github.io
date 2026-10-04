// What is known about the training setup, per task. Sources: the current
// site's own text (app/components), the scaling figure, and the labmate's
// SGS explainer. Anything not known is "(check)", never a guess.

export const CHECK = "(check)";

export type SetupRow = {
  label: string;
  /** One value for both tasks, or [locomotion, manipulation]. */
  value: string | [string, string];
};

export const SETUP_TASK: SetupRow[] = [
  {
    label: "Task",
    value: [
      "Reach a target pose on each of ten terrains",
      "Contact-rich assembly on the NIST task board",
    ],
  },
  {
    label: "Robot",
    value: [
      "ANYmal (check)",
      "Franka in simulation, UR arm on hardware (check)",
    ],
  },
  {
    label: "Policy",
    value: ["Markovian MLP, 4–8 layers. No transformer, no LSTM.", CHECK],
  },
  {
    label: "Inputs",
    value: ["Terrain as a heightmap; the rest (check)", CHECK],
  },
  { label: "Goal", value: ["One target pose per terrain", CHECK] },
  {
    label: "Reward",
    value: ["Sparse success signal and generic regularizers", CHECK],
  },
  { label: "Demonstrations", value: "None" },
  { label: "Distillation", value: ["None", CHECK] },
  {
    label: "Parallel environments",
    value: "Up to 1M (1,048,576) in the scaling runs. Prior work: about 64K.",
  },
  {
    label: "Evaluation",
    value:
      "Success over the fixed set of configurations, drawn uniformly; SGS is bypassed",
  },
  {
    label: "Hardware",
    value: [CHECK, "Transferred from simulation to a physical arm"],
  },
];

export const SETUP_SGS: SetupRow[] = [
  { label: "Configurations N", value: "32,768 (per task: check)" },
  { label: "Window H", value: "Last 100 outcomes per configuration" },
  {
    label: "Kernel κ, t",
    value: ["κ = 5, t = 0.66", "κ = 1, t = 0.5, the paper default (check)"],
  },
  { label: "Floor ε", value: ["10⁻⁸ (check)", "10⁻⁴"] },
  { label: "Temperature T", value: CHECK },
];

/** Splits "(check)" off a value so it can be set apart. */
export function splitCheck(v: string): [string, boolean] {
  if (v === CHECK) return ["", true];
  if (v.endsWith(` ${CHECK}`)) return [v.slice(0, -CHECK.length - 1), true];
  return [v, false];
}
