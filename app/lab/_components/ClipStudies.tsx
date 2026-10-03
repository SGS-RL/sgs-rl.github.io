"use client";

import { useEffect, useState } from "react";
import { ClipGrid, ClipPlayer, ClipRows, ClipWall } from "./Clips";

const LAYOUTS = [
  {
    id: "grid",
    name: "Grid",
    note: "Every clip at equal weight, filterable by robot and domain. Holds up to around a hundred clips; only the ones on screen download and play.",
  },
  {
    id: "rows",
    name: "Rows",
    note: "One row per robot, swiped sideways. Natural on a phone, and the grouping shows coverage per robot at a glance.",
  },
  {
    id: "player",
    name: "Player",
    note: "One large player driven by a numbered list, advancing on its own. Lightest on bandwidth, since only one clip loads at a time.",
  },
  {
    id: "wall",
    name: "Wall",
    note: "Everything at once with no captions, to show breadth. Tap a clip for its details.",
  },
] as const;

type LayoutId = (typeof LAYOUTS)[number]["id"];

export default function ClipStudies() {
  const [layout, setLayout] = useState<LayoutId>("grid");

  // Keep the choice in the URL hash so a layout can be linked directly.
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.slice(1);
      if (LAYOUTS.some((l) => l.id === h)) setLayout(h as LayoutId);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const pick = (id: LayoutId) => {
    setLayout(id);
    history.replaceState(null, "", `#${id}`);
  };
  const current = LAYOUTS.find((l) => l.id === layout)!;

  return (
    <>
      <div className="sw-grid gap-y-4 pb-10 md:pb-14">
        <div
          role="tablist"
          aria-label="Layout"
          className="col-span-full flex border-t border-sw-rule md:col-span-6"
        >
          {LAYOUTS.map((l, i) => (
            <button
              key={l.id}
              type="button"
              role="tab"
              aria-selected={l.id === layout}
              onClick={() => pick(l.id)}
              className={`sw-label flex-1 border-t-[3px] pt-2 pb-1 text-left ${
                l.id === layout
                  ? "border-sw-accent text-sw-fg"
                  : "border-transparent text-sw-mute hover:text-sw-fg"
              }`}
            >
              <span className="sw-num mr-1.5">
                {String.fromCharCode(65 + i)}
              </span>
              {l.name}
            </button>
          ))}
        </div>
        <p className="sw-label col-span-full max-w-[60ch] text-sw-mute md:col-span-5 md:col-start-8">
          {current.note}
        </p>
      </div>

      {layout === "grid" && (
        <div className="sw-grid">
          <ClipGrid />
        </div>
      )}
      {layout === "rows" && <ClipRows />}
      {layout === "player" && <ClipPlayer />}
      {layout === "wall" && <ClipWall />}
    </>
  );
}
