"use client";

import { useEffect, useRef, useState, type Ref } from "react";

import {
  ENVS,
  SCALE_LABELS,
  TASKS,
  fmt,
  successAt,
  type Method,
  type Task,
} from "./clips";
import { Key, type Geometry } from "./Plot";
import { text, type Inks, type Skin } from "./skins";

// Panel title per skin: a small label (Swiss), an entry title between
// rules (web), or a giant word the chart overprints (poster).
export function PanelHead({
  task,
  skin,
  inks,
  poster = "text-[18.5vw] md:text-[min(11.5vw,11rem)]",
  titleRef,
}: {
  task: Task;
  skin: Skin;
  inks: Inks;
  // Poster only: size classes for the giant title.
  poster?: string;
  titleRef?: Ref<HTMLHeadingElement>;
}) {
  if (skin === "swiss")
    return <h3 className="sw-label font-medium">{task.name}</h3>;
  if (skin === "web")
    return (
      <h3
        className="st-entry border-t pt-1.5"
        style={{ color: inks.fg, borderColor: inks.fg }}
      >
        {task.name}
      </h3>
    );
  return (
    <h3
      ref={titleRef}
      className={`pz-big pz-overprint ${poster}`}
      style={{ color: inks.fg }}
    >
      {task.name}
    </h3>
  );
}

// Legend for one task. With `onPick` the entries are buttons that choose a
// method; the chosen one is underlined.
export function Legend({
  task,
  skin,
  inks,
  active,
  onPick,
}: {
  task: Task;
  skin: Skin;
  inks: Inks;
  active?: Method | null;
  onPick?: (m: Method) => void;
}) {
  const t = text(skin);
  return (
    <div
      className={`${t.small} flex flex-wrap gap-x-4 gap-y-1`}
      style={{ color: inks.fg }}
      role={onPick ? "group" : undefined}
      aria-label={onPick ? `${task.name}: method` : undefined}
    >
      {task.methods.map((m) =>
        onPick ? (
          <button
            key={m}
            type="button"
            aria-pressed={active === m}
            onClick={() => onPick(m)}
            className="inline-flex min-h-7 items-center whitespace-nowrap"
            style={{
              textDecorationLine: active === m ? "underline" : "none",
              textDecorationThickness: 1.5,
              textUnderlineOffset: "0.25em",
            }}
          >
            <Key method={m} skin={skin} inks={inks} />
            {m}
          </button>
        ) : (
          <span key={m} className="inline-flex items-center whitespace-nowrap">
            <Key method={m} skin={skin} inks={inks} />
            {m}
          </span>
        ),
      )}
    </div>
  );
}

// The same numbers as the charts, as tables, for reading without hovering.
export function DataTable({ skin, inks }: { skin: Skin; inks: Inks }) {
  const t = text(skin);
  const swiss = skin === "swiss";
  return (
    <details className={t.small} style={{ color: inks.fg }}>
      <summary
        className="cursor-pointer"
        style={{ color: swiss ? inks.mute : inks.fg }}
      >
        Data table
      </summary>
      <div className="mt-3 overflow-x-auto">
        {TASKS.map((task) => (
          <table
            key={task.key}
            className={`${t.num} mb-4 w-full max-w-xl border-collapse text-left`}
          >
            <caption className={`pb-1 text-left ${t.strong}`}>
              {task.name}
            </caption>
            <thead>
              <tr style={{ borderBottom: `1px solid ${inks.fg}` }}>
                <th className="py-1 pr-3 font-normal">Method</th>
                {SCALE_LABELS.map((l) => (
                  <th key={l} className="py-1 pr-3 text-right font-normal">
                    {l}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {task.methods.map((m) => (
                <tr key={m} style={{ borderBottom: `1px solid ${inks.hair}` }}>
                  <td className="py-1 pr-3">{m}</td>
                  {ENVS.map((_, s) => {
                    const v = successAt(task, m, s);
                    return (
                      <td key={s} className="py-1 pr-3 text-right">
                        {v === null ? "–" : fmt(v)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ))}
        <p style={{ color: inks.mute }}>– not run at this scale.</p>
      </div>
    </details>
  );
}

// Poster skin: the chart is pulled up under its giant title, as on the NOF
// posters, but only as far as the empty space above the highest value.
// Glyph extents for this face at line-height 0.84: descenders reach about
// 0.17em below the line box, a word without them ends 0.04em above it.
// Returns the negative margin for the chart and the band at the top of the
// chart that must stay clear (everything there except the 1.0 rule).
export function useOverprint(task: Task, g: Geometry | null) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [size, setSize] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() =>
      setSize(parseFloat(getComputedStyle(el).fontSize)),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  if (!g || !size) return { ref, overlap: 0, clearTop: 0 };
  const below = (/[gjpqy]/.test(task.name) ? 0.17 : -0.04) * size;
  const peak = Math.max(
    ...task.methods.flatMap((m) =>
      ENVS.map((_, s) => successAt(task, m, s) ?? 0),
    ),
  );
  // Markers and end labels reach about 6 px above their value; keep 16 px
  // of pink between them and the lowest glyph.
  const room = g.y(peak) - 6 - 16 - below;
  const overlap = Math.round(Math.max(0, Math.min(0.42 * size, room)));
  return { ref, overlap, clearTop: Math.ceil(overlap + below + 8) };
}
