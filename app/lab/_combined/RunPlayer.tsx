"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../_gallery/media";
import type { Item } from "../library";
import { DOWNLOADS } from "./downloads";
import { DOWNLOAD_BASE, fullscreen, Glyph, type FsVideo } from "./playerKit";
import "./clipsViews.css";

// A continuous run with the page's own controls, as the Clips player
// (owner, 2026-10-08: the browser's controls lay over the video on phones
// at first glance): the video, a bar (drag or click to scrub, arrow keys a
// second), play/pause and full screen at its end, and under it the run's
// name and its download. Loads near the screen, plays while on screen
// unless paused by hand, loops, at 1×.

export default function RunPlayer({ c, title }: { c: Item; title: string }) {
  const box = useRef<HTMLDivElement>(null);
  const ref = useRef<FsVideo>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const seg = useRef<HTMLSpanElement>(null);
  const near = useRef(false);
  const seen = useRef(false);
  const held = useRef(false);
  const scrubbing = useRef(false);
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const sync = () => {
      if (near.current && !v.getAttribute("src")) {
        v.src = c.src;
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
    const a = new IntersectionObserver(
      ([e]) => {
        near.current = e.isIntersecting;
        sync();
      },
      { rootMargin: "100% 0px" },
    );
    const b = new IntersectionObserver(
      ([e]) => {
        seen.current = e.isIntersecting;
        sync();
      },
      { threshold: 0.25 },
    );
    a.observe(v);
    b.observe(v);
    // The bar, every frame while on screen.
    let raf = 0;
    const paint = () => {
      if (seen.current && fill.current && v.duration)
        fill.current.style.transform = `scaleX(${Math.min(1, v.currentTime / v.duration)})`;
      raf = requestAnimationFrame(paint);
    };
    raf = requestAnimationFrame(paint);
    return () => {
      a.disconnect();
      b.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [c.src]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      held.current = false;
      if (!v.getAttribute("src")) v.src = c.src;
      v.play().catch(() => {});
    } else {
      held.current = true;
      v.pause();
    }
  };
  const seekAt = (x: number) => {
    const v = ref.current;
    const r = seg.current?.getBoundingClientRect();
    if (!v || !r || !v.duration) return;
    v.currentTime =
      Math.max(0, Math.min(1, (x - r.left) / r.width)) * v.duration;
  };
  const dl = DOWNLOADS[c.id];

  return (
    <div className="kv-stage">
      <div
        ref={box}
        className="kv-frame"
        onDoubleClick={() => fullscreen(box.current, ref.current)}
      >
        <video
          ref={ref}
          muted
          loop
          playsInline
          preload="none"
          poster={c.poster}
          className="kv-video kv-video-cover"
          aria-label={`${title}, one take`}
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
        />
      </div>
      <div className="kv-bar">
        <div
          className="kv-track"
          role="slider"
          tabIndex={0}
          aria-label={`${title}: position`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
          style={{ gridTemplateColumns: "minmax(0, 1fr)" }}
          onPointerDown={(e) => {
            if (e.pointerType === "mouse" && e.button !== 0) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            e.currentTarget.dataset.scrub = "";
            scrubbing.current = true;
            seekAt(e.clientX);
          }}
          onPointerMove={(e) => {
            if (scrubbing.current) seekAt(e.clientX);
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
            if (!v || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
            e.preventDefault();
            v.currentTime = Math.max(
              0,
              v.currentTime + (e.key === "ArrowRight" ? 1 : -1),
            );
          }}
        >
          <span ref={seg} className="kv-seg">
            <span ref={fill} className="kv-fill" data-now="" />
          </span>
        </div>
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
          onClick={() => fullscreen(box.current, ref.current)}
        >
          <Glyph k="full" />
        </button>
      </div>
      <div className="kv-run-cap">
        <h4 className="cb-rw-name">{title}</h4>
        {dl && (
          <a
            className="kv-dl pz-small"
            href={`${DOWNLOAD_BASE}/${c.id}.mp4`}
            download={`sgs-${c.id}.mp4`}
            title={`${dl.w} × ${dl.h}, ${dl.mb} MB`}
          >
            <Glyph k="down" />
            Download
          </a>
        )}
      </div>
    </div>
  );
}
