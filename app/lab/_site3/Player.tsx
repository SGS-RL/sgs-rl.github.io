"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import type { Item } from "../library";
import { prefersReducedMotion } from "../_gallery/media";
import { domainWord, lower, mss, type ItemGroup } from "./items";
import Sides from "./Sides";

// A copy of _gallery/Player (NOF skin) for the owner's footage: the frame
// takes each clip's own aspect, so a UR5e pair (32:9) is never cropped or
// letterboxed into 16:9, and a pair's two sides are labelled under it.
export default function Player({
  order,
  groups,
  index,
  num,
  anchor,
  onMove,
  onClose,
}: {
  order: Item[];
  groups: ItemGroup[];
  index: number;
  num: (c: Item) => string;
  anchor: RefObject<HTMLElement | null>;
  onMove: (i: number) => void;
  onClose: () => void;
}) {
  const c = order[index];
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const listRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [reduce] = useState(prefersReducedMotion);
  const [paused, setPaused] = useState(reduce);
  const latest = useRef({ index, onMove, onClose });
  useEffect(() => {
    latest.current = { index, onMove, onClose };
  });

  // Rendered into <body>; carry the lab font variable along.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !anchor.current) return;
    const font = getComputedStyle(anchor.current).getPropertyValue(
      "--font-swiss-display",
    );
    if (font) root.style.setProperty("--font-swiss-display", font);
  }, [anchor]);

  // Scroll lock, keys, focus trap.
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    rootRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      const { index: i, onMove: move, onClose: close } = latest.current;
      const target = e.target as HTMLElement | null;
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        move(i + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        move(i - 1);
      } else if (e.key === " " && !target?.closest("button, a, input")) {
        e.preventDefault();
        const v = videoRef.current;
        if (v) {
          if (v.paused) v.play().catch(() => {});
          else v.pause();
        }
      } else if (e.key === "Tab" && rootRef.current) {
        const f = [
          ...rootRef.current.querySelectorAll<HTMLElement>("button, a[href]"),
        ];
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        const inside = rootRef.current.contains(document.activeElement);
        if (e.shiftKey && (document.activeElement === first || !inside)) {
          e.preventDefault();
          last.focus();
        } else if (
          !e.shiftKey &&
          (document.activeElement === last || !inside)
        ) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Play the clip and drive the progress fill of its row.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (!reduce) v.play().catch(() => {});
    let raf = 0;
    const frame = () => {
      const bar = barRef.current;
      if (bar)
        bar.style.transform = `scaleX(${v.duration ? v.currentTime / v.duration : 0})`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [index, reduce]);

  // Keep the current row in view inside the list (never the page).
  const first = useRef(true);
  useEffect(() => {
    const list = listRef.current;
    const row = list?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!list || !row) return;
    const lr = list.getBoundingClientRect();
    const rr = row.getBoundingClientRect();
    if (rr.top < lr.top + 48 || rr.bottom > lr.bottom - 8)
      list.scrollTo({
        top: list.scrollTop + rr.top - lr.top - lr.height / 3,
        behavior: first.current || reduce ? "auto" : "smooth",
      });
    first.current = false;
  }, [index, reduce]);

  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Clip ${num(c)}, ${c.robot}, ${c.title}`}
      data-gal-player=""
      tabIndex={-1}
      data-theme="light"
      className="gal-player pz gal-skin-pz s3-player"
      style={{ "--a": String(c.aspect) } as CSSProperties}
    >
      <div className="gal-player-bar pz-small">
        <p className="pz-num">
          {num(c)}
          <span className="gal-mute">
            {" "}
            · {index + 1} / {order.length}
          </span>
        </p>
        <div className="flex gap-4 md:gap-6">
          <button
            type="button"
            className="gal-btn"
            onClick={() => onMove(index - 1)}
          >
            <span aria-hidden="true">← </span>Prev
          </button>
          <button
            type="button"
            className="gal-btn"
            onClick={() => onMove(index + 1)}
          >
            Next<span aria-hidden="true"> →</span>
          </button>
          <button
            type="button"
            className="gal-btn w-[3.2em] text-left"
            onClick={() => {
              const v = videoRef.current;
              if (!v) return;
              if (v.paused) v.play().catch(() => {});
              else v.pause();
            }}
          >
            {paused ? "Play" : "Pause"}
          </button>
          <button type="button" className="gal-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      <div className="gal-player-body">
        <div className="gal-player-main">
          <div className="gal-player-fig">
            <div className="gal-player-frame">
              <video
                ref={videoRef}
                src={c.src}
                poster={c.poster}
                muted
                playsInline
                preload="auto"
                controls={reduce}
                onPlay={() => setPaused(false)}
                onPause={() => setPaused(true)}
                onEnded={() => !reduce && onMove(index + 1)}
                onClick={(e) => {
                  if (reduce) return;
                  const v = e.currentTarget;
                  if (v.paused) v.play().catch(() => {});
                  else v.pause();
                }}
                className="absolute inset-0 h-full w-full object-contain"
              />
            </div>
            {c.sides && (
              <Sides sides={c.sides} className="s3-player-sides mt-1.5" />
            )}
            <div className="gal-player-cap">
              <p className="pz-mid">
                <span className="pz-num gal-mute mr-[0.4em]">{num(c)}</span>
                {c.robot}, {lower(c.title)}
              </p>
              <p className="pz-small gal-mute">
                {c.category} · {domainWord(c)} · {c.speed} · {mss(c.duration)}
              </p>
            </div>
          </div>
        </div>

        <nav ref={listRef} aria-label="All clips" className="gal-player-list">
          {groups.map((g) => (
            <div key={g.id} className="gal-list-group">
              <p className="gal-list-head pz-small">
                <span>
                  {g.robot}, {g.domain.toLowerCase()}
                </span>
                <span className="pz-num gal-mute">{g.clips.length}</span>
              </p>
              <ol>
                {g.clips.map((clip) => {
                  const i = order.indexOf(clip);
                  const on = i === index;
                  return (
                    <li key={clip.id}>
                      <button
                        type="button"
                        aria-current={on}
                        onClick={() => onMove(i)}
                        className="gal-list-row gal-pz-list"
                      >
                        {on && (
                          <span
                            className="gal-list-progress"
                            aria-hidden="true"
                          >
                            <span ref={barRef} />
                          </span>
                        )}
                        <span className="pz-num">{num(clip)}</span>
                        <span>{clip.title}</span>
                        <span className="pz-num">{clip.speed}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </nav>
      </div>
    </div>,
    document.body,
  );
}
