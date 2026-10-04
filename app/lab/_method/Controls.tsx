"use client";

import { usePlayerState, type Player } from "./player";

/** Pause / play and restart, as plain text buttons. */
export function Controls({
  player,
  className = "",
  buttonClass = "underline decoration-1 underline-offset-[0.18em] hover:decoration-2",
}: {
  player: Player;
  className?: string;
  buttonClass?: string;
}) {
  usePlayerState(player);
  return (
    <span className={`inline-flex gap-4 ${className}`}>
      <button
        type="button"
        className={buttonClass}
        onClick={() => player.toggle()}
      >
        {player.playing ? "Pause" : "Play"}
      </button>
      <button
        type="button"
        className={buttonClass}
        onClick={() => player.restart()}
      >
        Restart
      </button>
    </span>
  );
}

/** The toy's sizes, filled in once the simulation exists. */
export function ToySizes({ player }: { player: Player }) {
  usePlayerState(player);
  const sim = player.sgs;
  if (!sim)
    return (
      <>
        a few hundred configurations, 16 environments per configuration, H = 20,
        κ = 10, T = 2
      </>
    );
  return (
    <>
      {sim.N} configurations, {sim.envs.length.toLocaleString("en")}{" "}
      environments, H = {sim.H}, κ = {sim.kernel.kappa}, t = {sim.kernel.t}, T ={" "}
      {sim.kernel.T}
    </>
  );
}
