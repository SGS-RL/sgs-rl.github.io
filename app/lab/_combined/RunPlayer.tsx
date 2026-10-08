"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../_gallery/media";
import type { Item } from "../library";
import { DOWNLOADS } from "./downloads";
import {
  DOWNLOAD_BASE,
  fullscreen,
  Glyph,
  ViewerShell,
  type FsVideo,
} from "./playerKit";
import "./clipsViews.css";

// A continuous run with the page's own controls (owner, 2026-10-08: the
// browser's controls lay over the video on phones). On the page: the
// video, a bar (drag or click to scrub, arrow keys a second), play/pause
// and full screen, the run's name under it. Full screen, or a tap on the
// video, opens it large in the Clips viewer (owner, 2026-10-09: "the same
// full screen behavior as the ones in Clips"), from the same moment, with
// true full screen and the download there (not on the page); closing it
// carries on from where the viewer was. Loads near the screen, plays while
// on screen unless paused by hand, loops, at 1×.

function Player({
  c,
  title,
  big = false,
  start = 0,
  onTime,
  onOpen,
  onVideo,
}: {
  c: Item;
  title: string;
  // In the viewer: from `start`, true full screen, the download.
  big?: boolean;
  start?: number;
  onTime?: (t: number) => void;
  // On the page: open the viewer, with the time and whether it played.
  onOpen?: (t: number, playing: boolean) => void;
  onVideo?: (v: HTMLVideoElement | null) => void;
}) {
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
    onVideo?.(v);
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
    // Start where the page's player was, once the length is known.
    const onMeta = () => {
      if (start) v.currentTime = start;
    };
    v.addEventListener("loadedmetadata", onMeta, { once: true });
    // The bar every frame while on screen, and the time for the page.
    let raf = 0;
    const paint = () => {
      if (seen.current && fill.current && v.duration)
        fill.current.style.transform = `scaleX(${Math.min(1, v.currentTime / v.duration)})`;
      onTime?.(v.currentTime);
      raf = requestAnimationFrame(paint);
    };
    raf = requestAnimationFrame(paint);
    return () => {
      a.disconnect();
      b.disconnect();
      v.removeEventListener("loadedmetadata", onMeta);
      cancelAnimationFrame(raf);
    };
  }, [c.src, start, onTime, onVideo]);

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
  const full = () => {
    const v = ref.current;
    if (big || !onOpen) fullscreen(box.current, v);
    else if (v) {
      const playing = !v.paused;
      v.pause();
      onOpen(v.currentTime, playing);
    }
  };
  const seekAt = (x: number) => {
    const v = ref.current;
    const r = seg.current?.getBoundingClientRect();
    if (!v || !r || !v.duration) return;
    v.currentTime =
      Math.max(0, Math.min(1, (x - r.left) / r.width)) * v.duration;
  };
  const dl = big ? DOWNLOADS[c.id] : undefined;

  return (
    <div className={`kv-stage ${big ? "kv-stage-big" : ""}`}>
      <div
        ref={box}
        className={`kv-frame ${big ? "" : "kv-frame-open"}`}
        onClick={big ? undefined : full}
        onDoubleClick={big ? full : undefined}
      >
        <video
          ref={ref}
          muted
          loop
          playsInline
          preload="none"
          poster={c.poster}
          className={`kv-video ${big ? "" : "kv-video-cover"}`}
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
            e.stopPropagation();
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
          aria-label={big ? "Full screen" : "Open large"}
          onClick={full}
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

export default function RunPlayer({ c, title }: { c: Item; title: string }) {
  const [open, setOpen] = useState<{ t: number; playing: boolean } | null>(
    null,
  );
  const page = useRef<HTMLVideoElement | null>(null);
  const last = useRef(0);
  const onTime = useCallback((t: number) => {
    last.current = t;
  }, []);
  const onVideo = useCallback((v: HTMLVideoElement | null) => {
    page.current = v;
  }, []);
  const close = useCallback(() => {
    const v = page.current;
    if (v && open) {
      v.currentTime = last.current;
      if (open.playing) v.play().catch(() => {});
    }
    setOpen(null);
  }, [open]);
  return (
    <>
      <Player
        c={c}
        title={title}
        onVideo={onVideo}
        onOpen={(t, playing) => {
          last.current = t;
          setOpen({ t, playing });
        }}
      />
      {open && (
        <ViewerShell label={title} onClose={close}>
          <Player c={c} title={title} big start={open.t} onTime={onTime} />
        </ViewerShell>
      )}
    </>
  );
}
