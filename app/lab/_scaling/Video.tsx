"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "./hooks";
import type { ScalingClip } from "./clips";
import type { Inks } from "./skins";

// Small corner note on stand-in footage. The footage itself is unaltered.
export function PlaceholderTag({ inks }: { inks: Inks }) {
  return (
    <span
      className="pointer-events-none absolute left-0 top-0 px-1 text-[10px] leading-[1.45] tracking-normal"
      style={{ background: inks.surface, color: inks.fg }}
    >
      Placeholder clip
    </span>
  );
}

// Frame for a cell with no clip: same size as a video, so rows stay aligned.
export function EmptyFrame({ inks, label }: { inks: Inks; label: string }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center p-3 text-center text-[12px] leading-tight"
      style={{ color: inks.mute }}
    >
      {label}
    </div>
  );
}

// One looping clip that plays only while on screen. The element is reused
// when the clip changes, so the new poster shows at once and nothing jumps.
export function Monitor({
  clip,
  inks,
  empty,
  small = false,
}: {
  clip: ScalingClip | null;
  inks: Inks;
  empty: string;
  small?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLVideoElement>(null);
  const inView = useInView(box, { threshold: 0.25 });
  const reduced = useReducedMotion();
  const src = clip ? (small ? clip.srcSm : clip.src) : null;

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (inView && !reduced) v.play().catch(() => {});
    else v.pause();
  }, [inView, reduced, src]);

  return (
    <div
      ref={box}
      className="relative aspect-video overflow-hidden"
      style={{ background: inks.frame }}
    >
      {clip && src ? (
        <>
          <video
            ref={ref}
            src={src}
            poster={clip.poster}
            muted
            loop
            playsInline
            preload="none"
            controls={reduced}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {clip.placeholder && <PlaceholderTag inks={inks} />}
        </>
      ) : (
        <EmptyFrame inks={inks} label={empty} />
      )}
    </div>
  );
}

// Plays a group of clips in step: all start together, and the group
// restarts together once every clip has ended (or once any passes `cap`
// seconds, used to trim long stand-in footage to the ~5 s of a real clip).
// Clips that end early hold their last frame. Pauses off screen; with
// reduced motion nothing plays until the reader presses Play.
export function useSyncGroup(key: string, cap = Infinity) {
  const box = useRef<HTMLDivElement>(null);
  // Optional progress line, scaled from 0 to 1 over a cycle.
  const bar = useRef<HTMLDivElement>(null);
  const vids = useRef(new Map<string, HTMLVideoElement>());
  const inView = useInView(box, { threshold: 0.2 });
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [asked, setAsked] = useState(false);
  const [nonce, setNonce] = useState(0);
  const run = inView && !paused && (!reduced || asked);

  const register = useCallback(
    (id: string) => (el: HTMLVideoElement | null) => {
      if (el) vids.current.set(id, el);
      else vids.current.delete(id);
    },
    [],
  );

  useEffect(() => {
    const vs = [...vids.current.values()];
    if (!run) {
      vs.forEach((v) => v.pause());
      return;
    }
    let synced = false;
    let last = 0;
    const pending = new Set(vs);
    const seek0 = () =>
      vs.forEach((v) => {
        try {
          v.currentTime = 0;
        } catch {}
      });
    const start = () => {
      last = performance.now();
      seek0();
      vs.forEach((v) => v.play().catch(() => {}));
    };
    // Clips begin as their data arrives; once all are playing, line them
    // up again from frame 0 (now buffered, so the seek is instant).
    const onPlaying = (e: Event) => {
      pending.delete(e.currentTarget as HTMLVideoElement);
      if (!synced && pending.size === 0) {
        synced = true;
        seek0();
      }
    };
    vs.forEach((v) => v.addEventListener("playing", onPlaying));
    const giveUp = setTimeout(() => (synced = true), 4000);
    start();
    let raf = 0;
    const tick = () => {
      if (bar.current && vs.length) {
        const ds = vs.map((v) => v.duration).filter((d) => d > 0);
        const cycle = Math.min(cap, ds.length ? Math.max(...ds) : cap);
        const t = Math.max(...vs.map((v) => v.currentTime));
        const p = synced && cycle < Infinity ? Math.min(1, t / cycle) : 0;
        bar.current.style.transform = `scaleX(${p})`;
      }
      if (synced && vs.length && performance.now() - last > 500) {
        const done = vs.every((v) => v.ended);
        const over = vs.some((v) => v.currentTime >= cap);
        if (done || over) start();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(giveUp);
      vs.forEach((v) => v.removeEventListener("playing", onPlaying));
    };
  }, [run, key, cap, nonce]);

  return {
    box,
    bar,
    register,
    running: run,
    // play() is also called inside the tap itself: iOS in low-power mode
    // only starts video from a user gesture.
    toggle: () => {
      if (run) return setPaused(true);
      setAsked(true);
      setPaused(false);
      vids.current.forEach((v) => v.play().catch(() => {}));
    },
    restart: () => {
      setPaused(false);
      setAsked(true);
      setNonce((n) => n + 1);
      vids.current.forEach((v) => v.play().catch(() => {}));
    },
  };
}
