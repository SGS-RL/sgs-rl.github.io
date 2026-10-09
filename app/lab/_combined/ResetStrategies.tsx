"use client";

import { useState, type KeyboardEvent } from "react";
import TileVideo from "../_gallery/TileVideo";
import "./resets.css";

// Method part 02: the three reset strategies the assembly task
// configurations come from (owner, 2026-10-08), on the Franka nut on bolt.
// Each video holds 20 task configurations of one strategy for a second
// each (scripts/lab/encode_resets.py). Names from the paper (appendix
// A.2), in its order, hardest first. Layouts (R1 the owner's pick,
// 2026-10-08, the switch is gone):
//   r1  the strategies as a list beside the video, like the Highlights
//       chapter list; the chosen one's description opens under its name
//   r2  the strategies as tabs above a wide video, the description under it
//   r3  all three at once, side by side, each with its description

const BASE = "/media/library/resets";

type Strategy = { id: string; name: string; text: [string, string, string] };

// [before, key phrase (bold), after]
const STRATEGIES: Strategy[] = [
  {
    id: "reaching",
    name: "Reaching",
    text: [
      "The nut starts ",
      "anywhere in the workspace",
      ", next to the gripper but not always in it, so the robot may have to fetch it first.",
    ],
  },
  {
    id: "stable-grasp",
    name: "Stable Grasp",
    text: [
      "The nut starts ",
      "held in the air above the bolt",
      ", so the robot has to lower it onto the bolt and thread it.",
    ],
  },
  {
    id: "near-goal",
    name: "Near-Goal",
    text: [
      "The nut starts ",
      "on the bolt, partway along its assembly path",
      ", with the gripper around it, so the robot has to finish threading it.",
    ],
  },
];

// R1 is the owner's pick (2026-10-08); R2 and R3 stay in the code.
export type ResetsLayout = "r1" | "r2" | "r3";

const pad2 = (n: number) => String(n).padStart(2, "0");

function Text({ s }: { s: Strategy }) {
  return (
    <p className="rs-text">
      {s.text[0]}
      <strong>{s.text[1]}</strong>
      {s.text[2]}
    </p>
  );
}

function Video({ s }: { s: Strategy }) {
  return (
    <div className="rs-frame">
      <TileVideo
        key={s.id}
        src={`${BASE}/${s.id}.mp4`}
        poster={`${BASE}/${s.id}.jpg`}
        className="rs-video"
      />
    </div>
  );
}

const Lead = () => (
  <div className="cb-flow-text cb-flow-w1">
    <p>
      For assembly, the task configurations come in equal parts from{" "}
      <strong>three reset strategies</strong>.
    </p>
  </div>
);

// Arrow keys move between the strategies, as in a tab list.
function useArrows(cur: number, set: (i: number) => void) {
  return (e: KeyboardEvent) => {
    const step =
      e.key === "ArrowDown" || e.key === "ArrowRight"
        ? 1
        : e.key === "ArrowUp" || e.key === "ArrowLeft"
          ? -1
          : 0;
    if (!step) return;
    e.preventDefault();
    const n = (cur + step + STRATEGIES.length) % STRATEGIES.length;
    set(n);
    const tabs = (e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>(
      "[role=tab]",
    );
    tabs[n]?.focus();
  };
}

function Listed({ cur, set }: { cur: number; set: (i: number) => void }) {
  const keys = useArrows(cur, set);
  return (
    <div className="rs-row">
      <Video s={STRATEGIES[cur]} />
      <div className="rs-list">
        <p className="rs-head">
          <span>Franka, nut on bolt</span>
          <span>Simulation</span>
        </p>
        <div role="tablist" aria-label="Reset strategy" onKeyDown={keys}>
          {STRATEGIES.map((s, i) => (
            <div key={s.id} className="rs-item">
              <button
                type="button"
                role="tab"
                aria-selected={i === cur}
                tabIndex={i === cur ? 0 : -1}
                className="rs-row-btn"
                onClick={() => set(i)}
              >
                <span className="pz-num">{pad2(i + 1)}</span>
                <span>{s.name}</span>
                <span className="rs-mark" aria-hidden="true" />
              </button>
              {i === cur && <Text s={s} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Tabbed({ cur, set }: { cur: number; set: (i: number) => void }) {
  const keys = useArrows(cur, set);
  return (
    <div className="rs-stack">
      <div
        role="tablist"
        aria-label="Reset strategy"
        className="rs-tabs"
        onKeyDown={keys}
      >
        {STRATEGIES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === cur}
            tabIndex={i === cur ? 0 : -1}
            className="rs-tab"
            onClick={() => set(i)}
          >
            <span className="pz-num">{pad2(i + 1)}</span>
            <span>{s.name}</span>
          </button>
        ))}
      </div>
      <Video s={STRATEGIES[cur]} />
      <div className="rs-wide-text">
        <Text s={STRATEGIES[cur]} />
      </div>
    </div>
  );
}

function AllThree() {
  return (
    <div className="rs-three">
      {STRATEGIES.map((s, i) => (
        <figure key={s.id} className="rs-cell">
          <Video s={s} />
          <figcaption className="rs-cell-cap">
            <h4 className="rs-cell-name">
              <span className="pz-num">{pad2(i + 1)}</span>
              <span>{s.name}</span>
            </h4>
            <Text s={s} />
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export default function ResetStrategies({
  layout = "r1",
}: {
  layout?: ResetsLayout;
}) {
  const [cur, setCur] = useState(0);
  return (
    <div className={`rs rs-${layout}`}>
      <Lead />
      {layout === "r1" && <Listed cur={cur} set={setCur} />}
      {layout === "r2" && <Tabbed cur={cur} set={setCur} />}
      {layout === "r3" && <AllThree />}
    </div>
  );
}
