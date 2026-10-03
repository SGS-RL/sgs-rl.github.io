"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CLIPS, type Clip } from "../content";
import HalftoneVideo from "./HalftoneVideo";
import { P } from "./palettes";
import { ROBOT_FOCUS } from "./PosterHero";

const num = (c: Clip) => String(CLIPS.indexOf(c) + 1).padStart(3, "0");
const small = (c: Clip) => c.src.replace("/clips/", "/clips-sm/");
const focus = (c: Clip): [number, number] =>
  c.category === "Locomotion"
    ? ROBOT_FOCUS
    : c.domain === "Real"
      ? [0.5, 0.6]
      : [0.5, 0.5];

function Viewer({
  index,
  onClose,
  onMove,
}: {
  index: number;
  onClose: () => void;
  onMove: (d: number) => void;
}) {
  const c = CLIPS[index];
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
      className="fixed inset-0 z-[60] flex flex-col bg-white text-black"
    >
      <div className="pz-grid pz-small h-[var(--bar)] items-center bg-black text-white">
        <span className="pz-num col-span-2">{num(c)}</span>
        <div className="col-span-4 flex justify-end gap-4 md:col-span-10">
          <button type="button" onClick={() => onMove(-1)}>
            ← Prev
          </button>
          <button type="button" onClick={() => onMove(1)}>
            Next →
          </button>
          <button type="button" onClick={onClose} autoFocus>
            Close
          </button>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col md:justify-center">
        <video
          key={c.id}
          src={c.src}
          poster={c.poster}
          autoPlay
          muted
          loop
          playsInline
          controls
          className="max-h-[calc(100svh-12rem)] w-full bg-neutral-100 object-contain"
        />
        <div className="pz-grid items-baseline gap-y-1 pb-4 pt-3">
          <p className="pz-mid col-span-6 md:col-span-6">{c.title}</p>
          <p className="pz-small col-span-6 md:col-span-6 md:text-right">
            {c.robot}, {c.category.toLowerCase()},{" "}
            {c.domain === "Sim" ? "simulation" : "hardware"}, {c.speed}
          </p>
        </div>
      </div>
    </div>
  );
}

// Poster 6, after the 1er août poster: a quilt of flat inks, each clip
// rastered in black like a heraldic figure, with type set in white cells.
export default function ClipQuilt() {
  const [open, setOpen] = useState<number | null>(null);
  const groups = [
    { label: "Locomotion", lines: ["ANYmal", "Simulation", "Ten terrains"] },
    {
      label: "Manipulation",
      lines: ["Franka, UR arm", "Simulation", "and hardware"],
    },
  ];

  const cells: ReactNode[] = [
    <div
      key="title"
      className="col-span-2 flex aspect-[2/1] flex-col justify-between bg-white p-2 text-black md:p-3"
    >
      <p className="pz-head">Index</p>
      <p className="pz-small pz-num">
        {CLIPS.length} clips, placeholders cut from the current videos
      </p>
    </div>,
  ];
  let color = 0;
  CLIPS.forEach((c, i) => {
    const g = groups.find((g) => g.label === c.category);
    if (g && CLIPS.findIndex((x) => x.category === c.category) === i) {
      cells.push(
        <div
          key={g.label}
          className="flex aspect-square flex-col justify-between bg-white p-2 text-black md:p-3"
        >
          <p className="text-[4.6vw] leading-none tracking-[-0.03em] md:text-[2vw]">
            {g.label}
          </p>
          <p className="pz-small">
            {g.lines.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </p>
        </div>,
      );
    }
    const ground = P.quilt[color++ % P.quilt.length];
    cells.push(
      <button
        key={c.id}
        type="button"
        onClick={() => setOpen(i)}
        aria-label={`${c.title}, ${c.robot}`}
        className="pz-poster relative aspect-square text-left text-black"
        style={{ ["--ground" as string]: ground }}
      >
        <HalftoneVideo
          src={small(c)}
          poster={c.poster}
          ink="#111111"
          pitch={4.5}
          angle={45}
          focus={focus(c)}
          lo={0.22}
          hi={0.88}
          className="!absolute inset-0"
        />
        <span className="pz-small absolute bottom-0 left-0 max-w-full bg-[var(--ground)] px-1.5 pb-1 pt-0.5 md:px-2">
          <span className="pz-num mr-2">{num(c)}</span>
          {c.title}
        </span>
      </button>,
    );
  });

  // Flat cells close the last row: 20 slots fill to 21 on 3 columns, 24 on 6.
  const fill = [
    "linear-gradient(135deg, #e2231a 50%, #ffffff 50%)",
    "#1e9ad6",
    "linear-gradient(45deg, #f3d400 50%, #111111 50%)",
    "#c9ab6b",
  ];
  fill.forEach((bg, k) =>
    cells.push(
      <div
        key={`fill-${k}`}
        aria-hidden="true"
        className={`aspect-square ${k ? "hidden md:block" : ""}`}
        style={{ background: bg }}
      />,
    ),
  );

  return (
    <>
      <div className="grid grid-cols-3 gap-[3px] bg-black p-[3px] md:grid-cols-6">
        {cells}
      </div>
      {open !== null && (
        <Viewer
          index={open}
          onClose={() => setOpen(null)}
          onMove={(d) =>
            setOpen((i) => ((i ?? 0) + d + CLIPS.length) % CLIPS.length)
          }
        />
      )}
    </>
  );
}
