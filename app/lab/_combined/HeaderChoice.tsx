"use client";

import { makeChoice } from "./choice";
import Top, { type TopLayout } from "./Top";

// The owner is weighing two header layouts (S4 and S6 of /lab/header-sizes/)
// while the rest of the page is built (2026-10-07). A small switch flips
// every header on the page; the choice is remembered in this browser and
// can be set in the address (?header=s6).
// S4 is the default, including in the static HTML (owner, 2026-10-07).

const choice = makeChoice<TopLayout>(
  "sgs-lab-header",
  ["s4", "s6"],
  "s4",
  "header",
);

export function useHeaderChoice() {
  return choice.useValue();
}

/** The header in the chosen layout. */
export default function ChosenHeader({ id = "top" }: { id?: string }) {
  return <Top layout={useHeaderChoice()} id={id} />;
}

/** "Header S4 S6", fixed at the bottom left of the screen. */
export function HeaderSwitch() {
  const h = useHeaderChoice();
  return (
    <div className="cb-switch pz-small" role="group" aria-label="Header">
      <span>Header</span>
      {(["s4", "s6"] as const).map((v) => (
        <button
          key={v}
          type="button"
          aria-pressed={h === v}
          onClick={() => choice.choose(v)}
        >
          {v.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
