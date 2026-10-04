"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { chapterAt, layout, type ReelData } from "./reel";
import "./reel.css";

export type Skin = "swiss" | "pz";
type Listener = (t: number, d: number) => void;

type Fs = {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => void;
};
type FsEl = HTMLElement & { webkitRequestFullscreen?: () => void };
type IosVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

export type ReelApi = {
  reel: ReelData;
  skin: Skin;
  chapters: ReturnType<typeof layout>["chapters"];
  groups: ReturnType<typeof layout>["groups"];
  idx: number;
  playing: boolean;
  fullscreen: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
  playerRef: RefObject<HTMLElement | null>;
  toggle: () => void;
  goTo: (i: number) => void;
  seek: (t: number) => void;
  step: (dt: number) => void;
  scrubStart: () => void;
  scrubEnd: () => void;
  toggleFullscreen: () => void;
  // Called on every frame while playing and after every seek, with the
  // current time and duration. Parts write progress straight to the DOM.
  subscribe: (fn: Listener) => () => void;
  now: () => number;
};

const Ctx = createContext<ReelApi | null>(null);

export function useReel() {
  const c = useContext(Ctx);
  if (!c) throw new Error("Reel parts must sit inside <Reel>.");
  return c;
}

// The root of a highlight reel. Holds the playback state for the parts
// inside it (ReelPlayer, ReelBar, ReelControls, ReelChapters, ReelTimeline).
//
// Playback is a plain video: it starts muted when at least half of it is on
// screen, pauses when it is mostly off screen, and loops. Scrolling never
// changes its time. A pause from the reader sticks until they press play or
// pick a chapter. With reduced motion it waits for the reader.
export function Reel({
  reel,
  skin = "swiss",
  className = "",
  style,
  id,
  children,
}: {
  reel: ReelData;
  skin?: Skin;
  className?: string;
  style?: CSSProperties;
  id?: string;
  children: ReactNode;
}) {
  const { chapters, groups } = useMemo(() => layout(reel), [reel]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLElement>(null);
  const listeners = useRef(new Set<Listener>());
  const timeRef = useRef(0);
  const idxRef = useRef(0);
  const pendingRef = useRef<number | null>(null);
  // "auto": play whenever in view. "play"/"pause": the reader chose.
  const wantRef = useRef<"auto" | "play" | "pause">("auto");
  const scrubRef = useRef<{ resume: boolean } | null>(null);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const duration = useCallback(() => {
    const d = videoRef.current?.duration;
    return d && Number.isFinite(d) ? d : reel.duration;
  }, [reel.duration]);

  const now = useCallback(
    () => pendingRef.current ?? videoRef.current?.currentTime ?? 0,
    [],
  );

  const emit = useCallback(
    (t: number) => {
      timeRef.current = t;
      const d = duration();
      listeners.current.forEach((fn) => fn(t, d));
      const i = chapterAt(chapters, t);
      if (i !== idxRef.current) {
        idxRef.current = i;
        setIdx(i);
      }
    },
    [chapters, duration],
  );

  const subscribe = useCallback(
    (fn: Listener) => {
      listeners.current.add(fn);
      fn(timeRef.current, duration());
      return () => {
        listeners.current.delete(fn);
      };
    },
    [duration],
  );

  const play = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.preload = "auto";
    // Rejected under iOS Low Power Mode or without a gesture: stay paused
    // and let the Play button do it.
    v.play().catch(() => {});
  }, []);

  const seek = useCallback(
    (t: number) => {
      const v = videoRef.current;
      if (!v) return;
      const x = Math.min(Math.max(0, t), duration() - 0.05);
      if (v.readyState === 0) {
        // Not loaded yet: remember the time and apply it on metadata.
        pendingRef.current = x;
        v.preload = "auto";
        if (v.networkState !== v.NETWORK_LOADING) v.load();
      } else {
        v.currentTime = x;
      }
      emit(x);
    },
    [duration, emit],
  );

  const toggle = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      wantRef.current = "play";
      play();
    } else {
      wantRef.current = "pause";
      v.pause();
    }
  }, [play]);

  const goTo = useCallback(
    (i: number) => {
      const c = chapters[Math.max(0, Math.min(chapters.length - 1, i))];
      wantRef.current = "play";
      seek(c.start);
      play();
    },
    [chapters, seek, play],
  );

  const step = useCallback((dt: number) => seek(now() + dt), [seek, now]);

  const scrubStart = useCallback(() => {
    const v = videoRef.current;
    if (!v || scrubRef.current) return;
    scrubRef.current = { resume: !v.paused };
    v.pause();
  }, []);

  const scrubEnd = useCallback(() => {
    const s = scrubRef.current;
    scrubRef.current = null;
    if (s?.resume) play();
  }, [play]);

  const toggleFullscreen = useCallback(() => {
    const el = playerRef.current as FsEl | null;
    const v = videoRef.current as IosVideo | null;
    const doc = document as Document & Fs;
    if (!el || !v) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else if (doc.webkitFullscreenElement) doc.webkitExitFullscreen?.();
    else if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    // iPhone: only the video itself can go full screen (native player).
    else v.webkitEnterFullscreen?.();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    const box = playerRef.current;
    if (!v || !box) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      wantRef.current = "pause";

    let raf = 0;
    const frame = () => {
      if (!scrubRef.current) emit(now());
      raf = requestAnimationFrame(frame);
    };
    const onPlay = () => {
      setPlaying(true);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    };
    const onPause = () => {
      setPlaying(false);
      cancelAnimationFrame(raf);
      if (!scrubRef.current) emit(now());
    };
    const onSettle = () => {
      if (v.paused && !scrubRef.current) emit(now());
    };
    const onMeta = () => {
      const p = pendingRef.current;
      pendingRef.current = null;
      if (p !== null) v.currentTime = p;
      emit(now());
    };
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("seeked", onSettle);
    v.addEventListener("loadedmetadata", onMeta);

    // Start when half the video is on screen; stop below a quarter.
    const io = new IntersectionObserver(
      ([e]) => {
        const r = e.isIntersecting ? e.intersectionRatio : 0;
        if (r >= 0.5) {
          if (wantRef.current !== "pause" && v.paused && !scrubRef.current)
            play();
        } else if (r < 0.25) {
          if (!v.paused) v.pause();
        }
      },
      { threshold: [0, 0.25, 0.5] },
    );
    io.observe(v);
    // Fetch only when the reel is within a screen of the viewport.
    const near = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && v.preload === "none") v.preload = "auto";
      },
      { rootMargin: "100% 0px" },
    );
    near.observe(v);

    const onFs = () => {
      const doc = document as Document & Fs;
      const el = document.fullscreenElement ?? doc.webkitFullscreenElement;
      setFullscreen(el === box);
    };
    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("webkitfullscreenchange", onFs);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      near.disconnect();
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("seeked", onSettle);
      v.removeEventListener("loadedmetadata", onMeta);
      document.removeEventListener("fullscreenchange", onFs);
      document.removeEventListener("webkitfullscreenchange", onFs);
    };
  }, [emit, now, play]);

  const api = useMemo<ReelApi>(
    () => ({
      reel,
      skin,
      chapters,
      groups,
      idx,
      playing,
      fullscreen,
      videoRef,
      playerRef,
      toggle,
      goTo,
      seek,
      step,
      scrubStart,
      scrubEnd,
      toggleFullscreen,
      subscribe,
      now,
    }),
    [
      reel,
      skin,
      chapters,
      groups,
      idx,
      playing,
      fullscreen,
      toggle,
      goTo,
      seek,
      step,
      scrubStart,
      scrubEnd,
      toggleFullscreen,
      subscribe,
      now,
    ],
  );

  return (
    <Ctx.Provider value={api}>
      <div
        id={id}
        className={`rl rl-${skin} ${className}`}
        style={
          {
            "--rl-aspect": String(reel.aspect ?? 16 / 9),
            ...style,
          } as CSSProperties
        }
      >
        {children}
      </div>
    </Ctx.Provider>
  );
}
