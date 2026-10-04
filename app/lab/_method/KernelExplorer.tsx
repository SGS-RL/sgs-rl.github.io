"use client";

import { useState } from "react";
import type { Ink } from "./ink";
import KernelPlot from "./KernelPlot";
import type { Player } from "./player";
import { KERNELS, oddsVsUnsolved, type Kernel } from "./sgs";

const PRESETS: { name: string; note: string; k: Kernel }[] = [
  { name: "Paper default", note: "κ = 1, t = 0.5", k: KERNELS.paper },
  { name: "Locomotion", note: "κ = 5, t = 0.66", k: KERNELS.loco },
  { name: "Manipulation", note: "ε = 10⁻⁴", k: KERNELS.manip },
  { name: "This page", note: "κ = 10, for visibility", k: KERNELS.toy },
];

const same = (a: Kernel, b: Kernel) =>
  a.t === b.t && a.kappa === b.kappa && a.T === b.T && a.eps === b.eps;

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format = (v: number) => String(v),
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <label className="grid grid-cols-[2.5rem_1fr_3rem] items-center gap-3">
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--sw-accent)]"
      />
      <span className="sw-num text-right">{format(value)}</span>
    </label>
  );
}

/**
 * The kernel with its knobs: presets from the paper and the explainer,
 * sliders for t, κ and T. The dots are the live configurations of the
 * simulation above, placed by the kernel chosen here; the simulation keeps
 * sampling with its own kernel.
 */
export default function KernelExplorer({
  player,
  ink,
}: {
  player: Player;
  ink: Ink;
}) {
  const [k, setK] = useState<Kernel>(KERNELS.paper);
  const odds = oddsVsUnsolved(k);
  return (
    <div className="grid gap-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Presets">
        {PRESETS.map((p) => {
          const on = same(p.k, k);
          return (
            <button
              key={p.name}
              type="button"
              aria-pressed={on}
              onClick={() => setK(p.k)}
              className={`border px-2.5 py-1 text-left transition-colors ${
                on
                  ? "border-sw-fg bg-sw-fg text-sw-bg"
                  : "border-sw-hair hover:border-sw-fg"
              }`}
            >
              {p.name}
              <span className={`block ${on ? "opacity-70" : "text-sw-mute"}`}>
                {p.note}
              </span>
            </button>
          );
        })}
      </div>
      <KernelPlot
        player={player}
        ink={ink}
        kernel={k}
        className="h-56 md:h-64"
        label={`Sampling weight against tracked success rate for t = ${k.t}, kappa = ${k.kappa}, T = ${k.T}, with the live configurations as dots`}
      />
      <div className="grid gap-y-2 md:grid-cols-3 md:gap-x-6">
        <Slider
          label="t"
          value={k.t}
          min={0}
          max={1}
          step={0.01}
          format={(v) => v.toFixed(2)}
          onChange={(t) => setK({ ...k, t })}
        />
        <Slider
          label="κ"
          value={k.kappa}
          min={0}
          max={20}
          step={0.5}
          onChange={(kappa) => setK({ ...k, kappa })}
        />
        <Slider
          label="T"
          value={k.T}
          min={0.5}
          max={4}
          step={0.1}
          format={(v) => v.toFixed(1)}
          onChange={(T) => setK({ ...k, T })}
        />
      </div>
      <p className="text-sw-mute">
        At these settings a configuration at the peak is drawn about{" "}
        <span className="sw-num text-sw-fg">
          {odds < 10 ? odds.toFixed(1) : Math.round(odds).toLocaleString("en")}
        </span>{" "}
        times as often as one at p̂ = 0. ε = {k.eps === 1e-4 ? "10⁻⁴" : "10⁻⁸"}
        {k.T === 2 ? "; T = 2 is the explainer's value (paper: check)." : "."}
      </p>
    </div>
  );
}
