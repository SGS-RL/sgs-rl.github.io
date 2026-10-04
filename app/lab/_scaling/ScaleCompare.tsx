"use client";

import { useState } from "react";
import {
  LAST,
  SCALE_LABELS,
  clipFor,
  fmt,
  successAt,
  taskOf,
  type Task,
  type TaskKey,
} from "./clips";
import { useSettled, useViewportHeight, useWidth } from "./hooks";
import { DataTable, Legend, PanelHead, useOverprint } from "./Parts";
import Plot, { Key, geometry } from "./Plot";
import { inksFor, text, type Inks, type PosterInks, type Skin } from "./skins";
import { EmptyFrame, PlaceholderTag, useSyncGroup } from "./Video";

// V2, "Pick a scale, compare methods": choose a scale (x-axis labels, the
// arrows above the clips, or a drag across the chart) and every method's
// clip at that scale plays below the chart, side by side and in step.
export default function ScaleCompare({
  skin,
  tasks = ["loco", "manip"],
  poster,
  table = true,
  initialScale = LAST,
}: {
  skin: Skin;
  tasks?: TaskKey[];
  poster?: PosterInks;
  table?: boolean;
  initialScale?: number;
}) {
  const inks = inksFor(skin, poster);
  return (
    <div
      className={`flex max-w-[1800px] flex-col ${skin === "poster" ? "gap-16 md:gap-24" : "gap-14 md:gap-20"}`}
    >
      {tasks.map((k) => (
        <Panel
          key={k}
          task={taskOf(k)}
          skin={skin}
          inks={inks}
          initial={initialScale}
        />
      ))}
      {table && <DataTable skin={skin} inks={inks} />}
    </div>
  );
}

function Panel({
  task,
  skin,
  inks,
  initial,
}: {
  task: Task;
  skin: Skin;
  inks: Inks;
  initial: number;
}) {
  const [scale, setScale] = useState(initial);
  const [hot, setHot] = useState<number | null>(null);
  const [cell, width] = useWidth<HTMLDivElement>();
  const [row, rowWidth] = useWidth<HTMLDivElement>();
  const vh = useViewportHeight();
  const t = text(skin);
  const swiss = skin === "swiss";
  const poster = skin === "poster";
  const maxHeight = swiss ? undefined : vh * 0.32;
  const over = useOverprint(
    task,
    poster && width > 0 ? geometry(width, skin, maxHeight) : null,
  );

  // Clips follow once a drag comes to rest; the chart follows at once.
  const shown = useSettled(scale, 180);
  const n = task.methods.length;
  const cols = rowWidth >= 640 ? n : 2;
  const gap = swiss ? (rowWidth >= 640 ? 24 : 16) : rowWidth >= 640 ? 16 : 10;
  const tileW = rowWidth ? (rowWidth - gap * (cols - 1)) / cols : 0;
  const large = tileW > 480;
  const clips = task.methods.map((m) => clipFor(task.key, m, shown));
  const stand = clips.some((c) => c?.placeholder);
  const { box, bar, register, running, toggle, restart } = useSyncGroup(
    `${task.key}-${shown}-${large ? "l" : "s"}`,
    stand ? 5 : Infinity,
  );

  const button = "inline-flex min-h-8 items-center disabled:opacity-30";
  return (
    <div className="flex flex-col">
      <div className={poster ? "" : "mb-3 flex flex-col gap-2"}>
        <PanelHead task={task} skin={skin} inks={inks} titleRef={over.ref} />
        {!poster && <Legend task={task} skin={skin} inks={inks} />}
      </div>
      <div
        ref={cell}
        className={poster ? "relative" : ""}
        style={{ marginTop: -over.overlap }}
      >
        {width > 0 && (
          <Plot
            task={task}
            skin={skin}
            inks={inks}
            width={width}
            maxHeight={maxHeight}
            clearTop={over.clearTop}
            mode="scale"
            method={null}
            scale={scale}
            hot={hot === null ? null : { method: null, scale: hot }}
            onPick={(s) => setScale(s)}
            onHot={setHot}
            overprint={poster}
          />
        )}
      </div>
      {poster && (
        <div className="mt-2">
          <Legend task={task} skin={skin} inks={inks} />
        </div>
      )}

      {/* The rule above the readout doubles as the clips' shared clock. */}
      <div className="relative mt-4 h-px" style={{ background: inks.fg }}>
        <div
          ref={bar}
          aria-hidden="true"
          className="absolute inset-x-0 -top-px h-[3px] origin-left"
          style={{ background: inks.fg, transform: "scaleX(0)" }}
        />
      </div>
      <div
        className={`${t.small} flex flex-wrap items-center justify-between gap-x-6 pt-1`}
        style={{ color: inks.fg }}
      >
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={`${button} pr-2`}
            aria-label="Fewer environments"
            disabled={scale === 0}
            onClick={() => setScale((s) => Math.max(0, s - 1))}
          >
            ←
          </button>
          <span className={`${t.num} ${t.strong}`} aria-live="polite">
            {SCALE_LABELS[scale]} parallel environments
          </span>
          <button
            type="button"
            className={`${button} pl-2`}
            aria-label="More environments"
            disabled={scale === LAST}
            onClick={() => setScale((s) => Math.min(LAST, s + 1))}
          >
            →
          </button>
        </div>
        <div className="flex gap-4">
          <button type="button" className={button} onClick={toggle}>
            {running ? "Pause" : "Play"}
          </button>
          <button type="button" className={button} onClick={restart}>
            Restart
          </button>
        </div>
      </div>

      <div ref={box} className="mt-2">
        <div
          ref={row}
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            columnGap: gap,
            rowGap: 16,
          }}
        >
          {task.methods.map((m, i) => {
            const v = successAt(task, m, shown);
            const clip = clips[i];
            return (
              <figure key={m} className="min-w-0">
                <figcaption
                  className={`${t.small} ${t.num} flex items-center justify-between pb-1.5`}
                  style={{ color: inks.fg }}
                >
                  <span className="inline-flex items-center">
                    <Key method={m} skin={skin} inks={inks} />
                    <span className={m === "SGS" ? t.strong : ""}>{m}</span>
                  </span>
                  <span>{v === null ? "not run" : fmt(v)}</span>
                </figcaption>
                <div
                  className="relative aspect-video overflow-hidden"
                  style={{ background: inks.frame }}
                >
                  {clip ? (
                    <>
                      <video
                        ref={register(m)}
                        src={large ? clip.src : clip.srcSm}
                        poster={clip.poster}
                        muted
                        playsInline
                        preload="none"
                        aria-label={`${m}, ${SCALE_LABELS[shown]} environments`}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      {clip.placeholder && <PlaceholderTag inks={inks} />}
                    </>
                  ) : (
                    <EmptyFrame
                      inks={inks}
                      label={`Not run at ${SCALE_LABELS[shown]}`}
                    />
                  )}
                </div>
              </figure>
            );
          })}
        </div>
      </div>
    </div>
  );
}
