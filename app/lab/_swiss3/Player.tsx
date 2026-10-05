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
import { clock, domainWord, type Group } from "./data";

// Copy of _gallery/Player (Swiss skin) for the owner's footage. Changes:
// the frame takes each item's aspect, so pairs (two runs side by side,
// 32:9) are never cropped; pairs carry a label over each half; and on
// phones a pair is shown as its two runs stacked (the right run is drawn
// into a canvas from the same video, so the two stay in step).
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
  groups: Group[];
  index: number;
  num: (c: Item) => string;
  anchor: RefObject<HTMLElement | null>;
  onMove: (i: number) => void;
  onClose: () => void;
}) {
  const c = order[index];
  const pair = c.kind === "pair" && c.sides;
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const listRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [reduce] = useState(prefersReducedMotion);
  // With reduced motion nothing starts on its own.
  const [paused, setPaused] = useState(reduce);
  const latest = useRef({ index, onMove, onClose });
  useEffect(() => {
    latest.current = { index, onMove, onClose };
  });

  // Rendered into <body> to escape stacking contexts; carry the lab font
  // variable along from where the gallery sits.
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
    // Focus the dialog itself, so Space pauses rather than pressing Close.
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

  // Play the clip, drive the progress bar of its row and, for a pair on a
  // phone, draw the right half into the canvas under the video.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (!reduce) v.play().catch(() => {});
    const cv = canvasRef.current;
    const ctx = cv?.getContext("2d") ?? null;
    let still: HTMLImageElement | null = null;
    if (cv && ctx) {
      still = new Image();
      still.src = c.poster;
    }
    const draw = () => {
      if (!cv || !ctx || cv.offsetParent === null) return;
      const w = Math.round(cv.clientWidth * devicePixelRatio);
      const h = Math.round(cv.clientHeight * devicePixelRatio);
      if (cv.width !== w || cv.height !== h) {
        cv.width = w;
        cv.height = h;
      }
      const live = v.readyState >= 2 && v.videoWidth > 0;
      const src = live ? v : still?.complete ? still : null;
      if (!src) return;
      const sw = live ? v.videoWidth : still!.naturalWidth;
      const sh = live ? v.videoHeight : still!.naturalHeight;
      if (!sw || !sh) return;
      // The right run: 640 px wide, after the left run and an 8 px gap.
      ctx.drawImage(
        src,
        (sw * 648) / 1288,
        0,
        (sw * 640) / 1288,
        sh,
        0,
        0,
        w,
        h,
      );
    };
    let raf = 0;
    const frame = () => {
      const bar = barRef.current;
      if (bar)
        bar.style.transform = `scaleX(${v.duration ? v.currentTime / v.duration : 0})`;
      draw();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [index, reduce, c.poster]);

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

  const position = `${index + 1} / ${order.length}`;

  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Clip ${num(c)}, ${c.title}`}
      data-gal-player=""
      tabIndex={-1}
      data-theme="light"
      className="gal-player swiss gal-skin-swiss s3-player"
    >
      <div className="gal-player-bar sw-label">
        <p className="sw-num">
          {num(c)}
          <span className="gal-mute"> · {position}</span>
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
          <div
            className="gal-player-fig"
            data-pair={pair ? "" : undefined}
            style={{ "--a": c.aspect } as CSSProperties}
          >
            {pair && (
              <p className="s3-sides s3-sides-wide sw-label gal-mute">
                <span>{pair[0]}</span>
                <span>{pair[1]}</span>
              </p>
            )}
            {pair && (
              <p className="s3-side-narrow sw-label gal-mute">{pair[0]}</p>
            )}
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
            {pair && (
              <div className="s3-half-right">
                <p className="sw-label gal-mute">{pair[1]}</p>
                <canvas
                  ref={canvasRef}
                  aria-hidden="true"
                  onClick={() => {
                    const v = videoRef.current;
                    if (!v || reduce) return;
                    if (v.paused) v.play().catch(() => {});
                    else v.pause();
                  }}
                />
              </div>
            )}
            <div className="gal-player-cap">
              <p className="text-xl font-semibold leading-tight tracking-[-0.02em] md:text-3xl">
                <span className="sw-num gal-mute mr-[0.4em]">{num(c)}</span>
                {c.title}
              </p>
              <p className="sw-label gal-mute">
                {c.robot} · {c.category} · {domainWord(c.domain)} · {c.speed}
                {" · "}
                <span className="sw-num">{clock(c.duration)}</span>
              </p>
            </div>
          </div>
        </div>

        <nav ref={listRef} aria-label="All clips" className="gal-player-list">
          {groups.map((g) => (
            <div key={g.key} className="gal-list-group">
              <p className="gal-list-head sw-label">
                <span>
                  <span className="font-medium">{g.robot}</span>{" "}
                  <span className="gal-mute">{domainWord(g.domain)}</span>
                </span>
                <span className="sw-num gal-mute">{g.items.length}</span>
              </p>
              <ol>
                {g.items.map((clip) => {
                  const i = order.indexOf(clip);
                  const on = i === index;
                  return (
                    <li key={clip.id}>
                      <button
                        type="button"
                        aria-current={on}
                        onClick={() => onMove(i)}
                        className="gal-list-row sw-label"
                      >
                        {on && (
                          <span
                            className="gal-list-progress"
                            aria-hidden="true"
                          >
                            <span ref={barRef} />
                          </span>
                        )}
                        <span className="sw-num">{num(clip)}</span>
                        <span className={on ? "font-medium" : ""}>
                          {clip.title}
                        </span>
                        <span className="sw-num">
                          {clip.speed} · {clock(clip.duration)}
                        </span>
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
