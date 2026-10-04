"use client";

import { useEffect, useRef, useState } from "react";
import {
  ENVS,
  LAST,
  SCALE_LABELS,
  caption,
  clipFor,
  fmt,
  successAt,
  taskOf,
  type Method,
  type Task,
  type TaskKey,
} from "./clips";
import {
  useInView,
  useReducedMotion,
  useViewportHeight,
  useWidth,
} from "./hooks";
import { DataTable, Legend, PanelHead, useOverprint } from "./Parts";
import Plot, { Key, geometry } from "./Plot";
import { inksFor, text, type Inks, type PosterInks, type Skin } from "./skins";
import { EmptyFrame } from "./Video";

type Cell = { m: Method; s: number };

// V3, small multiples: a methods × scales matrix of stills beside the
// chart. The chosen cell plays; pointing at a cell rings its point on the
// chart, and choosing a point on the chart chooses its cell.
export default function ClipMatrix({
  skin,
  tasks = ["loco", "manip"],
  poster,
  table = false,
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
  const [sel, setSel] = useState<Cell>({ m: "SGS", s: LAST });
  const [hot, setHot] = useState<Cell | null>(null);
  const [cell, width] = useWidth<HTMLDivElement>();
  const vh = useViewportHeight();
  const t = text(skin);
  const swiss = skin === "swiss";
  const poster = skin === "poster";
  const maxHeight = vh * 0.5;
  const over = useOverprint(
    task,
    poster && width > 0 ? geometry(width, skin, maxHeight) : null,
  );
  const v = successAt(task, sel.m, sel.s);
  const clip = clipFor(task.key, sel.m, sel.s);

  return (
    <div
      className={`grid grid-cols-1 gap-y-4 ${swiss ? "lg:grid-cols-9 lg:gap-x-6" : "md:grid-cols-12 md:gap-x-[var(--g)]"}`}
    >
      <div className={swiss ? "lg:col-span-4" : "md:col-span-6"}>
        <div className={poster ? "" : "mb-3 flex flex-col gap-2"}>
          <PanelHead
            task={task}
            skin={skin}
            inks={inks}
            poster="text-[18.5vw] md:text-[min(8vw,8rem)]"
            titleRef={over.ref}
          />
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
              mode="point"
              method={sel.m}
              scale={sel.s}
              hot={hot ? { method: hot.m, scale: hot.s } : null}
              onPick={(s, m) => setSel({ m, s })}
              overprint={poster}
            />
          )}
        </div>
        {poster && (
          <div className="mt-2">
            <Legend task={task} skin={skin} inks={inks} />
          </div>
        )}
      </div>

      <div
        className={`${swiss ? "lg:col-span-5" : "md:col-span-6"} ${poster ? "md:pt-[min(2vw,2rem)]" : swiss ? "lg:pt-[3.25rem]" : "md:pt-[4.5rem]"}`}
      >
        <table
          className={`${t.small} ${t.num} w-full table-fixed border-collapse`}
          style={{ color: inks.fg }}
          onMouseLeave={() => setHot(null)}
        >
          <caption className="sr-only">
            {task.name}: a clip for each method and scale; choose one to play it
          </caption>
          <colgroup>
            <col className="w-[4.6rem] md:w-[5.5rem]" />
            {ENVS.map((_, s) => (
              <col key={s} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th className="pb-1 text-left font-normal" />
              {SCALE_LABELS.map((l, s) => (
                <th
                  key={l}
                  scope="col"
                  className="pb-1 pl-1 text-left font-normal"
                  style={{
                    color: s === sel.s ? inks.fg : swiss ? inks.mute : inks.fg,
                  }}
                >
                  {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {task.methods.map((m) => (
              <tr key={m} style={{ borderTop: `1px solid ${inks.hair}` }}>
                <th
                  scope="row"
                  className="py-1 pr-1 text-left align-top font-normal"
                >
                  <span className="inline-flex items-center whitespace-nowrap">
                    <span className="hidden md:inline">
                      <Key method={m} skin={skin} inks={inks} />
                    </span>
                    {m}
                  </span>
                </th>
                {ENVS.map((_, s) => (
                  <td key={s} className="py-1 pl-1 align-top">
                    <Thumb
                      task={task}
                      m={m}
                      s={s}
                      inks={inks}
                      on={sel.m === m && sel.s === s}
                      onPick={() => setSel({ m, s })}
                      onHot={(h) => setHot(h ? { m, s } : null)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p
          className={`${t.small} ${t.num} mt-2`}
          style={{ color: inks.fg }}
          aria-live="polite"
        >
          {caption(sel.m, sel.s, v)}
          {clip?.placeholder && (
            <span style={{ color: inks.mute }}> · placeholder clip</span>
          )}
        </p>
      </div>
    </div>
  );
}

function Thumb({
  task,
  m,
  s,
  inks,
  on,
  onPick,
  onHot,
}: {
  task: Task;
  m: Method;
  s: number;
  inks: Inks;
  on: boolean;
  onPick: () => void;
  onHot: (h: boolean) => void;
}) {
  const v = successAt(task, m, s);
  const clip = clipFor(task.key, m, s);
  const ref = useRef<HTMLVideoElement>(null);
  const box = useRef<HTMLButtonElement>(null);
  const inView = useInView(box, { threshold: 0.2 });
  const reduced = useReducedMotion();
  const play = on && inView && !reduced;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (play) el.play().catch(() => {});
    else el.pause();
  }, [play]);

  const label = `${m}, ${SCALE_LABELS[s]} environments, ${v === null ? "not run" : `success ${fmt(v)}`}`;
  return (
    <button
      ref={box}
      type="button"
      disabled={!clip}
      aria-pressed={on}
      aria-label={label}
      onClick={onPick}
      onPointerEnter={() => onHot(true)}
      onPointerLeave={() => onHot(false)}
      onFocus={() => onHot(true)}
      onBlur={() => onHot(false)}
      className="block w-full text-left disabled:cursor-default"
    >
      <span
        className="relative block aspect-video overflow-hidden"
        style={{
          background: inks.frame,
          outline: on ? `2px solid ${inks.fg}` : "none",
          outlineOffset: 1,
        }}
      >
        {clip ? (
          on ? (
            <video
              ref={ref}
              src={clip.srcSm}
              poster={clip.poster}
              muted
              loop
              playsInline
              preload="none"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={clip.poster}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )
        ) : (
          <EmptyFrame inks={inks} label="–" />
        )}
      </span>
      <span className="mt-0.5 block">{v === null ? "not run" : fmt(v)}</span>
    </button>
  );
}
