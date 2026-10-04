"use client";

import { useState } from "react";
import {
  LAST,
  SCALE_LABELS,
  caption,
  clipFor,
  successAt,
  taskOf,
  type Method,
  type Task,
  type TaskKey,
} from "./clips";
import { useSettled, useViewportHeight, useWidth } from "./hooks";
import { DataTable, Legend, PanelHead, useOverprint } from "./Parts";
import Plot, { geometry } from "./Plot";
import { inksFor, text, type Inks, type PosterInks, type Skin } from "./skins";
import { Monitor } from "./Video";

type Sel = { m: Method; s: number };

// V1, "Point → clip": choose a data point (hover, tap, drag, or arrow keys
// on the focused chart) and a monitor beside the chart plays that policy.
export default function PointToClip({
  skin,
  tasks = ["loco", "manip"],
  poster,
  table = true,
}: {
  skin: Skin;
  tasks?: TaskKey[];
  poster?: PosterInks;
  table?: boolean;
}) {
  const inks = inksFor(skin, poster);
  return (
    <div
      className={`flex max-w-[1800px] flex-col ${skin === "poster" ? "gap-16 md:gap-24" : "gap-14 md:gap-16"}`}
    >
      {tasks.map((k) => (
        <Panel key={k} task={taskOf(k)} skin={skin} inks={inks} />
      ))}
      {table && <DataTable skin={skin} inks={inks} />}
    </div>
  );
}

function Panel({ task, skin, inks }: { task: Task; skin: Skin; inks: Inks }) {
  const [sel, setSel] = useState<Sel>({ m: "SGS", s: LAST });
  const [cell, width] = useWidth<HTMLDivElement>();
  const vh = useViewportHeight();
  const t = text(skin);
  const maxHeight = skin === "swiss" ? undefined : vh * 0.5;
  const over = useOverprint(
    task,
    skin === "poster" && width > 0 ? geometry(width, skin, maxHeight) : null,
  );

  // The monitor follows once the pointer settles, so a sweep across the
  // chart loads one clip, not every clip it passes.
  const settled = useSettled(`${sel.m}|${sel.s}`, 140);
  const [sm, ss] = settled.split("|");
  const shown = { m: sm as Method, s: Number(ss) };

  const v = successAt(task, sel.m, sel.s);
  const same =
    v === null
      ? []
      : task.methods.filter(
          (m) => m !== sel.m && successAt(task, m, sel.s) === v,
        );

  const pick = (s: number, m: Method) => setSel({ m, s });
  const plot = width > 0 && (
    <Plot
      task={task}
      skin={skin}
      inks={inks}
      width={width}
      maxHeight={maxHeight}
      clearTop={over.clearTop}
      mode="point"
      method={sel.m}
      scale={sel.s}
      onPick={pick}
      overprint={skin === "poster"}
    />
  );
  const legend = (
    <Legend
      task={task}
      skin={skin}
      inks={inks}
      active={sel.m}
      onPick={(m) => pick(sel.s, m)}
    />
  );
  const monitor = (
    <figure>
      <Monitor
        clip={clipFor(task.key, shown.m, shown.s)}
        inks={inks}
        empty={`${shown.m} was not run at ${SCALE_LABELS[shown.s]} environments`}
      />
      <figcaption
        className={`${t.small} ${t.num} mt-2`}
        style={{ color: inks.fg }}
      >
        <span aria-live="polite">{caption(sel.m, sel.s, v)}</span>
        {same.length > 0 && (
          <span className="block" style={{ color: inks.mute }}>
            Same value here:{" "}
            {same.map((m, i) => (
              <span key={m}>
                {i > 0 && ", "}
                <button
                  type="button"
                  className="underline decoration-1 underline-offset-[0.2em]"
                  onClick={() => pick(sel.s, m)}
                >
                  {m}
                </button>
              </span>
            ))}
          </span>
        )}
      </figcaption>
    </figure>
  );

  if (skin === "poster")
    return (
      <div className="grid grid-cols-6 gap-x-[var(--g)] gap-y-6 md:grid-cols-12">
        <div className="col-span-6 md:col-span-7">
          <PanelHead
            task={task}
            skin={skin}
            inks={inks}
            poster="text-[18.5vw] md:text-[min(9.4vw,9rem)]"
            titleRef={over.ref}
          />
          <div
            ref={cell}
            className="relative"
            style={{ marginTop: -over.overlap }}
          >
            {plot}
          </div>
          <div className="mt-3">{legend}</div>
        </div>
        <div className="col-span-6 md:col-span-5 md:pt-[min(1.6vw,1.5rem)]">
          {monitor}
        </div>
      </div>
    );

  // Swiss sits in the 9 content columns of a numbered section; the web
  // skin uses the full 12. Side by side once the chart has room.
  const swiss = skin === "swiss";
  return (
    <div
      className={`grid grid-cols-1 gap-y-4 ${swiss ? "lg:grid-cols-9 lg:gap-x-6" : "md:grid-cols-12 md:gap-x-[var(--g)]"}`}
    >
      <div
        className={`flex flex-col gap-2 ${swiss ? "lg:col-span-9" : "md:col-span-12"}`}
      >
        <PanelHead task={task} skin={skin} inks={inks} />
        {legend}
      </div>
      <div ref={cell} className={swiss ? "lg:col-span-5" : "md:col-span-7"}>
        {plot}
      </div>
      <div className={swiss ? "lg:col-span-4" : "md:col-span-5"}>{monitor}</div>
    </div>
  );
}
