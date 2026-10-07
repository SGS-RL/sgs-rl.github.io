"use client";

import { makeChoice } from "./choice";
import OverviewPanes, { OVERVIEW_LAYOUTS } from "./OverviewPanes";

// The Overview in layout O1, the owner's pick (2026-10-07). The others stay
// reachable by link (?overview=o2 … o4); OverviewSwitch is kept for a
// comparison page but no longer shown on the combined page.
const layout = makeChoice(
  "sgs-lab-overview",
  OVERVIEW_LAYOUTS,
  "o1",
  "overview",
);

export default function OverviewChosen() {
  return <OverviewPanes layout={layout.useValue()} />;
}

export function OverviewSwitch() {
  const now = layout.useValue();
  return (
    <div className="cb-switch cb-switch-panel pz-small">
      <div className="cb-switch-row" role="group" aria-label="Overview">
        <span>Overview</span>
        {OVERVIEW_LAYOUTS.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={now === o}
            onClick={() => layout.choose(o)}
          >
            {o.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
