"use client";

import TrainFigure, { type ChanceMode } from "../_nav/TrainFigure";
import { TOY } from "../_nav/nav";
import { makeChoice } from "./choice";

// The live maze of the Method with each configuration's chance of being
// picked shown, in four styles switched at the bottom left (owner,
// 2026-10-07: the red squares looked uniform; "add a few different
// variations of visualizing this so that I can pick"). A second row sets
// the maze's floor ε: 1e-6, the toy example's setting so far, spreads many
// picks over the unsolved configurations; 1e-8 keeps them at the frontier.
// Both can be set in the address: ?chance=heat&floor=1e-8.
const MODES = ["dots", "heat", "trail", "bar"] as const;
const FLOORS = ["1e-6", "1e-8"] as const;
const mode = makeChoice<ChanceMode>("sgs-lab-chance", MODES, "dots", "chance");
const floor = makeChoice<(typeof FLOORS)[number]>(
  "sgs-lab-floor",
  FLOORS,
  "1e-6",
  "floor",
);

const LABEL: Record<ChanceMode, string> = {
  dots: "Chance of being picked next",
  heat: "Chance of being picked next",
  trail: "Picked in the last few seconds",
  bar: "Chance of being picked next",
};
const NAME: Record<string, string> = {
  dots: "Dots",
  heat: "Tint",
  trail: "Trail",
  bar: "Dots + bar",
  "1e-6": "1e-6",
  "1e-8": "1e-8",
};

export default function MethodMaze() {
  const m = mode.useValue();
  const f = floor.useValue();
  return (
    <TrainFigure
      labels={["Success rate", "Task configuration being tried", "Robot"]}
      average={false}
      chance={{ mode: m, label: LABEL[m] }}
      kernel={{ ...TOY, eps: Number(f) }}
    />
  );
}

function Row<T extends string>({
  label,
  choice,
}: {
  label: string;
  choice: { options: readonly T[]; choose: (v: T) => void; useValue: () => T };
}) {
  const now = choice.useValue();
  return (
    <div className="cb-switch-row" role="group" aria-label={label}>
      <span>{label}</span>
      {choice.options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={now === o}
          onClick={() => choice.choose(o)}
        >
          {NAME[o] ?? o}
        </button>
      ))}
    </div>
  );
}

export function ChanceSwitch() {
  return (
    <div className="cb-switch cb-switch-panel pz-small">
      <Row label="Chance" choice={mode} />
      <Row label="Floor ε" choice={floor} />
    </div>
  );
}
