"use client";

// The full-page pink plots for /lab/poster-3, built from the shared
// scaling parts (_scaling) without ScaleCompare's clip row: the clips per
// method and scale are not recorded yet, and the stand-ins there are cut
// from the old footage, which this page no longer shows. A point on either
// plot can be picked (pointer, keys or the x-axis labels) and is read out
// under it.

import { useState } from "react";
import { P } from "../_poster/palettes";
import {
  LAST,
  caption,
  successAt,
  taskOf,
  type Method,
  type TaskKey,
} from "../_scaling/clips";
import { useViewportHeight, useWidth } from "../_scaling/hooks";
import { DataTable, Legend, PanelHead, useOverprint } from "../_scaling/Parts";
import Plot, { geometry } from "../_scaling/Plot";
import { inksFor } from "../_scaling/skins";

const inks = inksFor("poster", P.scaling);

function Panel({ k }: { k: TaskKey }) {
  const task = taskOf(k);
  const [pick, setPick] = useState<{ scale: number; method: Method }>({
    scale: LAST,
    method: "SGS",
  });
  const [cell, width] = useWidth<HTMLDivElement>();
  const vh = useViewportHeight();
  const maxHeight = vh * 0.42;
  const over = useOverprint(
    task,
    width > 0 ? geometry(width, "poster", maxHeight) : null,
  );
  const v = successAt(task, pick.method, pick.scale);
  return (
    <div className="flex flex-col">
      <PanelHead task={task} skin="poster" inks={inks} titleRef={over.ref} />
      <div ref={cell} className="relative" style={{ marginTop: -over.overlap }}>
        {width > 0 && (
          <Plot
            task={task}
            skin="poster"
            inks={inks}
            width={width}
            maxHeight={maxHeight}
            clearTop={over.clearTop}
            mode="point"
            method={pick.method}
            scale={pick.scale}
            onPick={(scale, method) => setPick({ scale, method })}
            overprint
          />
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <Legend task={task} skin="poster" inks={inks} />
        <p
          className="pz-small pz-num"
          style={{ color: inks.fg }}
          aria-live="polite"
        >
          {caption(pick.method, pick.scale, v)}
        </p>
      </div>
    </div>
  );
}

export default function Scaling() {
  return (
    <div className="flex max-w-[1800px] flex-col gap-16 md:gap-24">
      <Panel k="loco" />
      <Panel k="manip" />
      <DataTable skin="poster" inks={inks} />
    </div>
  );
}
