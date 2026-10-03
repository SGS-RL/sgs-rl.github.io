"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { CLIPS, type Clip } from "../content";
import InViewVideo from "./InViewVideo";

// Clip numbers come from the full collection so they stay stable under filters.
const num = (c: Clip) => String(CLIPS.indexOf(c) + 1).padStart(3, "0");
const meta = (c: Clip) => `${c.robot} · ${c.domain} · ${c.speed}`;
const uniq = <T,>(xs: T[]) => [...new Set(xs)];

function Lightbox({
  clips,
  index,
  onClose,
  onMove,
}: {
  clips: Clip[];
  index: number;
  onClose: () => void;
  onMove: (step: number) => void;
}) {
  const c = clips[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onMove(1);
      if (e.key === "ArrowLeft") onMove(-1);
    };
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onMove]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={c.title}
      className="fixed inset-0 z-50 flex flex-col bg-sw-bg"
    >
      <div className="sw-grid sw-label items-baseline py-3 md:py-4">
        <span className="sw-num col-span-1 md:col-span-2">
          {num(c)}
          <span className="text-sw-mute">
            {" "}
            · {index + 1}/{clips.length}
          </span>
        </span>
        <div className="col-span-3 flex justify-end gap-5 md:col-span-10">
          <button type="button" className="sw-link" onClick={() => onMove(-1)}>
            ← Prev
          </button>
          <button type="button" className="sw-link" onClick={() => onMove(1)}>
            Next →
          </button>
          <button type="button" className="sw-link" onClick={onClose} autoFocus>
            Close
          </button>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col md:justify-center">
        <div className="flex min-h-0 justify-center px-4 md:px-10">
          <video
            key={c.id}
            src={c.src}
            poster={c.poster}
            autoPlay
            muted
            loop
            playsInline
            controls
            className="max-h-[calc(100svh-11rem)] w-full bg-sw-panel object-contain"
          />
        </div>
        <div className="sw-grid items-baseline gap-y-1 py-4 md:py-6">
          <p className="col-span-full text-2xl font-semibold tracking-[-0.02em] md:col-span-6 md:text-3xl">
            {c.title}
          </p>
          <p className="sw-label col-span-full text-sw-mute md:col-span-6 md:text-right">
            {meta(c)} · {c.category}
          </p>
        </div>
      </div>
    </div>
  );
}

function useLightbox(list: Clip[]): [(i: number) => void, ReactNode] {
  const [open, setOpen] = useState<number | null>(null);
  const node =
    open === null || !list[open] ? null : (
      <Lightbox
        clips={list}
        index={open}
        onClose={() => setOpen(null)}
        onMove={(d) =>
          setOpen((i) => ((i ?? 0) + d + list.length) % list.length)
        }
      />
    );
  return [setOpen, node];
}

function Tile({ clip, onOpen }: { clip: Clip; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group block w-full text-left"
    >
      <div className="relative aspect-video overflow-hidden bg-sw-panel">
        <InViewVideo
          src={clip.src}
          poster={clip.poster}
          controlsWhenReduced={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <div className="sw-label mt-2 flex gap-3">
        <span className="sw-num text-sw-mute">{num(clip)}</span>
        <span className="min-w-0">
          <span className="block font-medium group-hover:underline">
            {clip.title}
          </span>
          <span className="block text-sw-mute">{meta(clip)}</span>
        </span>
      </div>
    </button>
  );
}

function FilterRow({
  label,
  options,
  value,
  onChange,
  count,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  count: (v: string) => number;
}) {
  return (
    <div className="sw-label flex items-baseline gap-x-4">
      <span className="w-16 shrink-0 text-sw-mute">{label}</span>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {["All", ...options].map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={value === o}
            onClick={() => onChange(o)}
            className={`flex items-baseline gap-1.5 ${value === o ? "text-sw-fg" : "text-sw-mute hover:text-sw-fg"}`}
          >
            <span
              className={`h-2 w-2 self-center ${value === o ? "bg-sw-accent" : "border border-sw-hair"}`}
              aria-hidden="true"
            />
            {o}
            <sup className="sw-num">{count(o)}</sup>
          </button>
        ))}
      </div>
    </div>
  );
}

// A. Equal-weight index, filterable. Tiles span page-grid columns, so the
// parent must be a grid (or subgrid) of 4 / 12 (or 9) columns.
export function ClipGrid({ clips = CLIPS }: { clips?: Clip[] }) {
  const [robot, setRobot] = useState("All");
  const [domain, setDomain] = useState("All");
  const match = (c: Clip, r: string, d: string) =>
    (r === "All" || c.robot === r) && (d === "All" || c.domain === d);
  const list = clips.filter((c) => match(c, robot, domain));
  const [open, lightbox] = useLightbox(list);

  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-8">
      <div className="col-span-full flex flex-col gap-1.5">
        <FilterRow
          label="Robot"
          options={uniq(clips.map((c) => c.robot))}
          value={robot}
          onChange={setRobot}
          count={(o) => clips.filter((c) => match(c, o, domain)).length}
        />
        <FilterRow
          label="Domain"
          options={uniq(clips.map((c) => c.domain))}
          value={domain}
          onChange={setDomain}
          count={(o) => clips.filter((c) => match(c, robot, o)).length}
        />
      </div>
      {list.map((c, i) => (
        <div key={c.id} className="col-span-2 md:col-span-3">
          <Tile clip={c} onOpen={() => open(i)} />
        </div>
      ))}
      {list.length === 0 && (
        <p className="sw-label col-span-full text-sw-mute">No clips match.</p>
      )}
      {lightbox}
    </div>
  );
}

// B. One row per robot, swiped sideways. Full-bleed: place outside the grid.
export function ClipRows() {
  const [open, lightbox] = useLightbox(CLIPS);
  return (
    <div className="flex flex-col gap-14">
      {uniq(CLIPS.map((c) => c.robot)).map((robot) => {
        const group = CLIPS.filter((c) => c.robot === robot);
        return (
          <div key={robot}>
            <div className="sw-grid items-baseline gap-y-1">
              <div className="col-span-full h-px bg-sw-rule" />
              <h3 className="col-span-full pt-3 text-3xl font-semibold tracking-[-0.03em] md:col-span-3 md:text-4xl">
                {robot}
              </h3>
              <p className="sw-label col-span-3 text-sw-mute md:col-span-6 md:pt-3">
                {uniq(group.map((c) => `${c.category}, ${c.domain}`)).join(
                  " / ",
                )}
              </p>
              <p className="sw-label sw-num col-span-1 text-right text-sw-mute md:col-span-3 md:pt-3">
                {group.length} {group.length === 1 ? "clip" : "clips"}
                <span className="md:hidden"> →</span>
              </p>
            </div>
            <div className="sw-noscrollbar mt-5 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 md:scroll-px-10 md:gap-6 md:px-10">
              {group.map((c) => (
                <div
                  key={c.id}
                  className="w-[72%] shrink-0 snap-start sm:w-[44%] md:w-[30%] lg:w-[23%]"
                >
                  <Tile clip={c} onOpen={() => open(CLIPS.indexOf(c))} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {lightbox}
    </div>
  );
}

// C. One large player driven by a numbered list; auto-advances. Only one
// video downloads at a time.
export function ClipPlayer() {
  const [i, setI] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const c = CLIPS[i];

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    v.controls = reduce;
    if (!reduce) v.play().catch(() => {});
    let raf = 0;
    const frame = () => {
      if (barRef.current && v.duration)
        barRef.current.style.transform = `scaleX(${v.currentTime / v.duration})`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [i]);

  return (
    <div className="sw-grid items-start gap-y-6">
      <div className="sticky top-0 z-10 col-span-full bg-sw-bg pb-3 pt-2 md:top-4 md:col-span-8 md:pt-0">
        <div className="relative aspect-video overflow-hidden bg-sw-panel">
          <video
            ref={videoRef}
            src={c.src}
            poster={c.poster}
            muted
            playsInline
            preload="auto"
            onEnded={() => setI((k) => (k + 1) % CLIPS.length)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-4">
          <p className="text-xl font-semibold tracking-[-0.02em] md:text-3xl">
            <span className="sw-num mr-3 text-sw-mute">{num(c)}</span>
            {c.title}
          </p>
          <p className="sw-label shrink-0 text-sw-mute">{meta(c)}</p>
        </div>
      </div>
      <ol className="sw-label col-span-full md:col-span-4">
        {CLIPS.map((clip, k) => (
          <li key={clip.id}>
            <button
              type="button"
              onClick={() => setI(k)}
              aria-current={k === i}
              className={`grid w-full grid-cols-[2.75rem_1fr_auto] gap-y-2 border-t py-2 text-left ${
                k === i
                  ? "border-sw-rule text-sw-fg"
                  : "border-sw-hair text-sw-mute hover:text-sw-fg"
              }`}
            >
              <span className="sw-num">{num(clip)}</span>
              <span className={k === i ? "font-medium" : ""}>{clip.title}</span>
              <span>{clip.robot}</span>
              {k === i && (
                <span className="col-span-full h-[2px] bg-sw-hair">
                  <span
                    ref={barRef}
                    className="block h-full origin-left bg-sw-accent"
                    style={{ transform: "scaleX(0)" }}
                  />
                </span>
              )}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

// D. Everything at once, no captions. Full-bleed.
export function ClipWall() {
  const [open, lightbox] = useLightbox(CLIPS);
  return (
    <div className="grid grid-cols-3 gap-[2px] md:grid-cols-5">
      {CLIPS.map((c, k) => (
        <button
          key={c.id}
          type="button"
          onClick={() => open(k)}
          aria-label={`${c.title}, ${meta(c)}`}
          className="relative aspect-video overflow-hidden bg-sw-panel"
        >
          <InViewVideo
            src={c.src}
            poster={c.poster}
            threshold={0.1}
            controlsWhenReduced={false}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </button>
      ))}
      {lightbox}
    </div>
  );
}
