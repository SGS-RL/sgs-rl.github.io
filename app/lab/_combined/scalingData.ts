// Scaling results from the owner (2026-10-08), as in the paper's Figure 5a
// and 5b: mean of three seeds, the 95% confidence interval half-width (a t
// interval over the seeds, as the paper shades), and each seed's value.
// Locomotion is ANYmal D's overall success rate; manipulation is Franka
// nut-and-bolt's success rate from the hardest spawns (labelled just
// "Success rate" on the page, owner 2026-10-08). The UR5e rod-in-hole
// plot (5c) is left out (owner).

export const ENVS = [4096, 32768, 262144, 1048576] as const;
export const ENV_LABELS = ["4K", "32K", "256K", "1M"] as const;

export type Method = "SGS" | "PLR" | "Uniform" | "Linear";
export type Series = {
  method: Method;
  mean: number[];
  ci: number[];
  runs: number[][];
};
export type Panel = {
  id: string;
  title: string;
  subtitle: string;
  metric: string;
  series: Series[];
};

export const PANELS: Panel[] = [
  {
    id: "locomotion",
    title: "Locomotion",
    subtitle: "ANYmal D, all terrains",
    metric: "Success rate",
    series: [
      {
        method: "SGS",
        mean: [0.456, 0.494, 0.722, 0.727],
        ci: [0.019, 0.113, 0.046, 0.012],
        runs: [
          [0.451, 0.453, 0.465],
          [0.444, 0.533, 0.505],
          [0.743, 0.707, 0.717],
          [0.722, 0.728, 0.732],
        ],
      },
      {
        method: "PLR",
        mean: [0.001, 0.133, 0.551, 0.544],
        ci: [0.001, 0.005, 0.136, 0.125],
        runs: [
          [0.001, 0.002, 0.001],
          [0.131, 0.135, 0.132],
          [0.488, 0.576, 0.589],
          [0.595, 0.495, 0.541],
        ],
      },
      {
        method: "Uniform",
        mean: [0.002, 0.417, 0.003, 0.002],
        ci: [0.001, 0.045, 0.001, 0.001],
        runs: [
          [0.001, 0.002, 0.002],
          [0.434, 0.398, 0.419],
          [0.002, 0.003, 0.002],
          [0.002, 0.002, 0.002],
        ],
      },
      {
        method: "Linear",
        mean: [0.002, 0.315, 0.002, 0.002],
        ci: [0.001, 0.031, 0.0, 0.001],
        runs: [
          [0.001, 0.002, 0.002],
          [0.32, 0.301, 0.325],
          [0.002, 0.002, 0.002],
          [0.002, 0.002, 0.002],
        ],
      },
    ],
  },
  {
    id: "manipulation",
    title: "Manipulation",
    subtitle: "Franka, nut-and-bolt assembly",
    metric: "Success rate",
    series: [
      {
        method: "SGS",
        mean: [0.003, 0.057, 0.105, 0.702],
        ci: [0.007, 0.006, 0.142, 0.186],
        runs: [
          [0.006, 0.002, 0.0],
          [0.055, 0.059, 0.059],
          [0.17, 0.06, 0.086],
          [0.748, 0.742, 0.615],
        ],
      },
      {
        method: "PLR",
        mean: [0.0, 0.0, 0.018, 0.051],
        ci: [0.0, 0.0, 0.04, 0.113],
        runs: [
          [0.0, 0.0, 0.0],
          [0.0, 0.0, 0.0],
          [0.029, 0.0, 0.025],
          [0.0, 0.068, 0.086],
        ],
      },
      {
        method: "Uniform",
        mean: [0.0, 0.0, 0.01, 0.058],
        ci: [0.0, 0.0, 0.042, 0.128],
        runs: [
          [0.0, 0.0, 0.0],
          [0.0, 0.0, 0.0],
          [0.029, 0.0, 0.0],
          [0.098, 0.0, 0.076],
        ],
      },
    ],
  },
];
