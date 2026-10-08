"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import TileVideo from "../_gallery/TileVideo";
import { holdMedia, prefersReducedMotion } from "../_gallery/media";
import {
  CLIP_GROUPS,
  PLAYABLE,
  indexOf,
  type ClipEntry,
  type Playable,
} from "./clipsData";
import { DOWNLOADS } from "./downloads";
import { DOWNLOAD_BASE, fullscreen, Glyph, type FsVideo } from "./playerKit";
import { SpeedMark, useSpeedNote } from "./speedNote";
import "./clipsViews.css";

// Clips, ways to watch a clip large (owner, 2026-10-08: "it's not actually
// possible to open a video full screen. Can we explore other alternatives
// for Clips?"), each with full screen and a download of the 1080p file
// (scripts/lab/encode_downloads.py; owner: downloadable "at high
// resolution"). The page uses K1 (owner's pick, 2026-10-08); K2 and K3 stay
// in the code:
//   k1  the grid as now; a tile opens a player over the page, previous and
//       next, Esc to close, playing on through the collection
//   k2  one large viewer and the whole collection as a numbered list
//       beside it (under it on phones, the viewer pinned at the top),
//       as the Highlights reel's chapter list
//   k3  the grid as now; a tile opens in place, across the grid's width
// Full screen on iPhone uses the browser's own video player (iOS has no
// full screen for other elements).

export type ClipsView = "k1" | "k2" | "k3";

const total = PLAYABLE.length;
const pad2 = (n: number) => String(n).padStart(2, "0");
const where = (p: Playable) => p.group.setting;

// The clip large, with the Highlights reel's controls (owner, 2026-10-08:
// "controls and a status bar, similar to the highlights section"): a bar
// split into the clips of the current group, the current one filling as it
// plays (drag in it to scrub, click another to jump to it), play/pause and
// full screen at its end; previous and next on the video's edges; under it
// the clip's name, its setting and the download. Loads near the screen and
// plays while on screen; `advance` plays on to the next clip at the end.
function Stage({
  p,
  onMove,
  onClose,
  advance = false,
  className = "",
}: {
  p: Playable;
  onMove: (n: number) => void;
  onClose?: () => void;
  advance?: boolean;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const ref = useRef<FsVideo>(null);
  const near = useRef(false);
  const seen = useRef(false);
  const held = useRef(false);
  const scrubbing = useRef(false);
  const segs = useRef<(HTMLSpanElement | null)[]>([]);
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  const [paused, setPaused] = useState(true);
  const note = useSpeedNote();
  const group = PLAYABLE.filter((q) => q.group === p.group);
  const k = group.findIndex((q) => q.n === p.n);

  const sync = () => {
    const v = ref.current;
    if (!v) return;
    if (near.current && v.getAttribute("src") !== p.item.src) {
      v.src = p.item.src;
      v.load();
    }
    if (
      seen.current &&
      near.current &&
      !held.current &&
      !prefersReducedMotion()
    )
      v.play().catch(() => {});
    else if (!seen.current) v.pause();
  };
  const syncRef = useRef(sync);
  useEffect(() => {
    syncRef.current = sync;
  });

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const a = new IntersectionObserver(
      ([e]) => {
        near.current = e.isIntersecting;
        syncRef.current();
      },
      { rootMargin: "100% 0px" },
    );
    const b = new IntersectionObserver(
      ([e]) => {
        seen.current = e.isIntersecting;
        syncRef.current();
      },
      { threshold: 0.25 },
    );
    a.observe(v);
    b.observe(v);
    return () => {
      a.disconnect();
      b.disconnect();
    };
  }, []);
  // A new clip: swap the source if loaded, keep playing if it was.
  useEffect(() => {
    syncRef.current();
  }, [p.item.src]);

  // The bar: earlier clips of the group full, the current one as far as
  // it has played, later ones empty. Painted every frame while on screen.
  useEffect(() => {
    let raf = 0;
    const paint = () => {
      const v = ref.current;
      if (seen.current && v) {
        const f = v.duration ? Math.min(1, v.currentTime / v.duration) : 0;
        fills.current.forEach((el, j) => {
          if (el) el.style.transform = `scaleX(${j < k ? 1 : j === k ? f : 0})`;
        });
      }
      raf = requestAnimationFrame(paint);
    };
    raf = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(raf);
  }, [k, p.group]);

  const move = (d: number) => onMove((p.n + d + total) % total);
  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      held.current = false;
      if (!v.getAttribute("src")) v.src = p.item.src;
      v.play().catch(() => {});
    } else {
      held.current = true;
      v.pause();
    }
  };
  const full = () => fullscreen(box.current, ref.current);
  const seekTo = (f: number) => {
    const v = ref.current;
    if (v && v.duration)
      v.currentTime = Math.max(0, Math.min(1, f)) * v.duration;
  };
  // The segment under x, and how far along it.
  const at = (x: number) => {
    for (let j = 0; j < group.length; j++) {
      const r = segs.current[j]?.getBoundingClientRect();
      if (!r) continue;
      if (x <= r.right || j === group.length - 1)
        return { j, f: (x - r.left) / r.width };
    }
    return { j: k, f: 0 };
  };
  const dl = DOWNLOADS[p.item.id];

  return (
    <div className={`kv-stage ${className}`}>
      <div ref={box} className="kv-frame" onDoubleClick={full}>
        <video
          ref={ref}
          muted
          playsInline
          loop={!advance}
          preload="none"
          poster={p.item.poster}
          className="kv-video"
          aria-label={`${p.group.robot}, ${p.name}, ${where(p).toLowerCase()}`}
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
          onEnded={() => advance && move(1)}
        />
        <button
          type="button"
          className="kv-edge kv-edge-prev"
          aria-label="Previous clip"
          onClick={() => move(-1)}
        >
          <Glyph k="prev" />
        </button>
        <button
          type="button"
          className="kv-edge kv-edge-next"
          aria-label="Next clip"
          onClick={() => move(1)}
        >
          <Glyph k="next" />
        </button>
      </div>
      <div className="kv-bar">
        <div
          className="kv-track"
          role="slider"
          tabIndex={0}
          aria-label={`${p.group.robot}, ${where(p).toLowerCase()}: clip ${k + 1} of ${group.length}`}
          aria-valuemin={1}
          aria-valuemax={group.length}
          aria-valuenow={k + 1}
          style={{
            gridTemplateColumns: group
              .map((q) => `minmax(0, ${q.item.duration}fr)`)
              .join(" "),
          }}
          onPointerDown={(e) => {
            if (e.pointerType === "mouse" && e.button !== 0) return;
            const { j, f } = at(e.clientX);
            if (j !== k) {
              onMove(group[j].n);
              return;
            }
            e.currentTarget.setPointerCapture(e.pointerId);
            e.currentTarget.dataset.scrub = "";
            scrubbing.current = true;
            seekTo(f);
          }}
          onPointerMove={(e) => {
            if (!scrubbing.current) return;
            const r = segs.current[k]?.getBoundingClientRect();
            if (r) seekTo((e.clientX - r.left) / r.width);
          }}
          onPointerUp={(e) => {
            scrubbing.current = false;
            delete e.currentTarget.dataset.scrub;
          }}
          onPointerCancel={(e) => {
            scrubbing.current = false;
            delete e.currentTarget.dataset.scrub;
          }}
          onKeyDown={(e) => {
            const v = ref.current;
            if (!v) return;
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
              e.preventDefault();
              e.stopPropagation();
              v.currentTime = Math.max(
                0,
                v.currentTime + (e.key === "ArrowRight" ? 1 : -1),
              );
            } else if (e.key === "PageDown" || e.key === "PageUp") {
              e.preventDefault();
              e.stopPropagation();
              move(e.key === "PageDown" ? 1 : -1);
            }
          }}
        >
          {group.map((q, j) => (
            <span
              key={q.item.id}
              ref={(el) => {
                segs.current[j] = el;
              }}
              className="kv-seg"
            >
              <span
                ref={(el) => {
                  fills.current[j] = el;
                }}
                className="kv-fill"
                data-now={j === k ? "" : undefined}
              />
            </span>
          ))}
        </div>
        {note === "s3" && <SpeedMark />}
        <button
          type="button"
          className="kv-icon"
          aria-label={paused ? "Play" : "Pause"}
          onClick={toggle}
        >
          <Glyph k={paused ? "play" : "pause"} />
        </button>
        <button
          type="button"
          className="kv-icon"
          aria-label="Full screen"
          onClick={full}
        >
          <Glyph k="full" />
        </button>
        {onClose && (
          <button
            type="button"
            className="kv-icon"
            aria-label="Close"
            onClick={onClose}
          >
            <Glyph k="close" />
          </button>
        )}
      </div>
      <p className="kv-now pz-small">
        <span>
          {p.group.robot}, {p.name}
        </span>
        <span className="kv-now-right">
          <span className="kv-mute">{where(p)}</span>
          {dl && (
            <a
              className="kv-dl"
              href={`${DOWNLOAD_BASE}/${p.item.id}.mp4`}
              download={`sgs-${p.item.id}.mp4`}
              title={`${dl.w} × ${dl.h}, ${dl.mb} MB`}
            >
              <Glyph k="down" />
              Download
            </a>
          )}
        </span>
      </p>
    </div>
  );
}

// The groups and tiles of ./Clips.tsx; `tile` draws each clip.
function Groups({
  tile,
}: {
  tile: (c: ClipEntry, caption: boolean) => ReactNode;
}) {
  return (
    <>
      {CLIP_GROUPS.map((g) => (
        <div key={g.key} className="cb-clips-group">
          <h3 className="cb-part-band pz-mid">
            <span>{g.robot}</span>
            <span className="ml-auto">{g.setting}</span>
          </h3>
          <div className="cb-part-in-band pb-12 pt-6 md:pb-16">
            {g.tasks.map((t, i) =>
              t.name ? (
                <div key={i} className="cb-rw-task">
                  <h4 className="cb-rw-name">{t.name}</h4>
                  <div className="cb-clips-grid kv-grid">
                    {t.clips.map((c, j) => (
                      <Fragment key={j}>{tile(c, false)}</Fragment>
                    ))}
                  </div>
                </div>
              ) : (
                <div key={i} className="cb-clips-grid kv-grid">
                  {t.clips.map((c, j) => (
                    <Fragment key={j}>{tile(c, true)}</Fragment>
                  ))}
                </div>
              ),
            )}
          </div>
        </div>
      ))}
    </>
  );
}

function Tile({
  c,
  caption,
  onOpen,
}: {
  c: ClipEntry;
  caption: boolean;
  onOpen: (n: number) => void;
}) {
  const name = caption && (
    <figcaption className="cb-clip-name">{c.name}</figcaption>
  );
  if (!c.item)
    return (
      <figure className="cb-clip">
        <div className="cb-rw-frame cb-rw-slot">
          <span className="pz-small">To come</span>
        </div>
        {name}
      </figure>
    );
  const n = indexOf.get(c.item.id)!;
  return (
    <figure className="cb-clip">
      <button
        type="button"
        className="kv-tile"
        aria-label={`Open ${c.name}`}
        onClick={() => onOpen(n)}
      >
        <span className="cb-rw-frame block">
          <TileVideo
            src={c.item.src}
            poster={c.item.poster}
            className="cb-rw-video"
          />
          <span className="kv-tile-icon" aria-hidden="true">
            <Glyph k="full" />
          </span>
        </span>
      </button>
      {name}
    </figure>
  );
}

// k1: the player over the page. Close sits at the top right, black, with
// its name (owner, 2026-10-08: on a phone it was not clear how to close);
// a tap outside the clip and Esc close too.
function Overlay({
  n,
  onMove,
  onClose,
}: {
  n: number;
  onMove: (n: number) => void;
  onClose: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    holdMedia(true);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    root.current?.focus();
    return () => {
      holdMedia(false);
      document.body.style.overflow = overflow;
    };
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onMove((n + 1) % total);
      else if (e.key === "ArrowLeft") onMove((n - 1 + total) % total);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [n, onMove, onClose]);
  const p = PLAYABLE[n];
  return (
    <div
      ref={root}
      className="kv-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${p.group.robot}, ${p.name}`}
      tabIndex={-1}
      data-gal-player=""
      onClick={(e) => {
        // A tap outside the clip and its controls closes.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button type="button" className="kv-close" onClick={onClose}>
        Close
        <Glyph k="close" />
      </button>
      <Stage p={p} onMove={onMove} advance className="kv-stage-big" />
    </div>
  );
}

function K1() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <Groups
        tile={(c, cap) => <Tile c={c} caption={cap} onOpen={setOpen} />}
      />
      {open !== null && (
        <Overlay n={open} onMove={setOpen} onClose={() => setOpen(null)} />
      )}
    </>
  );
}

// k2: the viewer and the list.
function K2() {
  const [n, setN] = useState(0);
  return (
    <div className="cb-part-in-band pb-12 pt-6 md:pb-16">
      <div className="kv-vl">
        <div className="kv-vl-stage">
          <Stage p={PLAYABLE[n]} onMove={setN} advance />
        </div>
        <nav className="kv-list" aria-label="Clips">
          {CLIP_GROUPS.map((g) => {
            const rows = PLAYABLE.filter((p) => p.group === g);
            return (
              <div key={g.key} className="kv-list-group">
                <p className="kv-list-head pz-small">
                  <span>{g.robot}</span>
                  <span>{g.setting}</span>
                </p>
                {rows.map((p) => (
                  <button
                    key={p.item.id}
                    type="button"
                    className="kv-row pz-small"
                    aria-current={p.n === n ? "true" : undefined}
                    onClick={() => setN(p.n)}
                  >
                    <span className="pz-num kv-row-n">{pad2(p.n + 1)}</span>
                    <span className="min-w-0 flex-1 truncate">{p.name}</span>
                    {p.n === n && (
                      <span className="kv-row-dot" aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

// k3: a tile opens in place, across the grid.
function Expanded({
  n,
  onMove,
  onClose,
}: {
  n: number;
  onMove: (n: number) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [n]);
  return (
    <div ref={ref} className="kv-expand">
      <Stage p={PLAYABLE[n]} onMove={onMove} onClose={onClose} />
    </div>
  );
}

function K3() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <Groups
      tile={(c, cap) =>
        c.item && open === indexOf.get(c.item.id) ? (
          <Expanded n={open} onMove={setOpen} onClose={() => setOpen(null)} />
        ) : (
          <Tile c={c} caption={cap} onOpen={setOpen} />
        )
      }
    />
  );
}

export default function ClipsViews({ view }: { view: ClipsView }) {
  return (
    <section
      id="clips"
      aria-label="Clips"
      className="scroll-mt-[var(--bar)] pb-16 md:pb-24"
    >
      <h2 className="pz-head border-y border-black bg-white px-[var(--m)] pb-[0.08em] pt-[0.04em]">
        Clips
      </h2>
      {view === "k1" && <K1 />}
      {view === "k2" && <K2 />}
      {view === "k3" && <K3 />}
    </section>
  );
}
