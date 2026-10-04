"use client";

import type { CSSProperties } from "react";
import { STEPS, usePlayerState, type Player } from "./player";

/** What each step does, in one line. */
export const STEP_NOTES = [
  "The environment runs its configuration until success or the time limit.",
  "The outcome goes into that configuration's window; p̂ updates.",
  "Its new p̂ goes through the kernel; its sampling weight changes.",
  "A new configuration is drawn for this environment.",
];

/**
 * The four steps of the loop set over the raster, as on the poster. The
 * step the followed environment is in is set in reverse.
 */
export function StepLabels({
  player,
  ground,
  type,
}: {
  player: Player;
  ground: string;
  type: string;
}) {
  usePlayerState(player);
  const step = player.follow.step;
  return (
    <>
      {STEPS.map((label, k) => {
        const on = k === step;
        const style: CSSProperties = {
          background: on ? type : ground,
          color: on ? ground : type,
          top: `${[3, 28, 53, 78][k]}%`,
          ...(k % 2 ? { right: 0 } : { left: k === 2 ? "18%" : 0 }),
        };
        return (
          <p
            key={label}
            aria-hidden="true"
            className="pz-mid absolute px-1.5 pb-1 pt-0.5"
            style={style}
          >
            <span className="pz-num mr-2">{k + 1}</span>
            {label}
          </p>
        );
      })}
    </>
  );
}

/** A plain-language line about the followed environment's last episode. */
export function FollowNote({ player }: { player: Player }) {
  usePlayerState(player);
  const f = player.follow;
  if (f.cfg < 0)
    return <>The heavy ring is one environment; the steps follow it.</>;
  const step = f.step;
  return (
    <>
      {step === 0 ? (
        <>
          Rolling out configuration {f.next + 1}. Before that: configuration{" "}
          {f.cfg + 1}, {f.win ? "success" : "time limit, failure"}, p̂{" "}
          {f.before.toFixed(2)} → {f.after.toFixed(2)}.
        </>
      ) : step === 1 ? (
        <>
          Configuration {f.cfg + 1}: {f.win ? "success" : "failure"}. p̂{" "}
          {f.before.toFixed(2)} → {f.after.toFixed(2)}.
        </>
      ) : step === 2 ? (
        <>
          Configuration {f.cfg + 1} rescored at p̂ {f.after.toFixed(2)}.
        </>
      ) : (
        <>Drawn next: configuration {f.next + 1}.</>
      )}
    </>
  );
}

/**
 * The loop as a numbered list (for the Swiss page). The step the followed
 * environment is in is marked.
 */
export function LoopList({
  player,
  className = "",
}: {
  player: Player;
  className?: string;
}) {
  usePlayerState(player);
  const step = player.follow.step;
  return (
    <ol className={className}>
      {STEPS.map((s, k) => (
        <li
          key={s}
          className="grid grid-cols-[1.5rem_1fr] gap-x-2 border-t border-sw-hair py-2"
        >
          <span className="sw-num flex items-center gap-1 text-sw-mute">
            <span
              aria-hidden="true"
              className={`inline-block h-2 w-2 ${k === step ? "bg-sw-accent" : ""}`}
            />
          </span>
          <span>
            <span className={k === step ? "text-sw-fg" : "text-sw-fg"}>
              {k + 1}&ensp;{s}
            </span>
            <span className="block text-sw-mute">{STEP_NOTES[k]}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
