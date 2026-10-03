"use client";

import { useEffect, useRef, useState } from "react";
import { INTRO, SUBTITLE, TERRAINS, terrainAt } from "../content";
import SwissHeader from "./SwissHeader";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const mmss = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const pad2 = (n: number) => String(n).padStart(2, "0");

function TerrainList({ idx, className }: { idx: number; className: string }) {
  return (
    <ol className={`sw-label ${className}`}>
      {TERRAINS.map((t, k) => (
        <li
          key={k}
          className={`flex items-baseline gap-3 border-t border-sw-hair py-[3px] transition-colors ${
            k === idx ? "text-sw-fg" : "text-sw-mute"
          }`}
        >
          <span className="sw-num w-5">{pad2(k + 1)}</span>
          <span className="flex-1">{t.name}</span>
          <span
            className={`h-2 w-2 self-center ${k === idx ? "bg-sw-accent" : ""}`}
            aria-hidden="true"
          />
        </li>
      ))}
    </ol>
  );
}

// "scrub": the video is pinned and scroll position drives its time; native
//          scrolling is never locked, so a fast flick goes straight past it.
// "loop":  the video simply autoplays on a loop.
export default function Hero({ mode }: { mode: "scrub" | "loop" }) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fillRefs = useRef<(HTMLDivElement | null)[]>([]);
  const idxRef = useRef(0);
  const secRef = useRef(0);
  const [idx, setIdx] = useState(0);
  const [sec, setSec] = useState(0);
  const [moved, setMoved] = useState(false);
  const duration = INTRO.runLength / INTRO.speed;

  useEffect(() => {
    const v = videoRef.current;
    const section = sectionRef.current;
    if (!v || !section) return;

    // Map intro time onto the terrain index without re-rendering per frame.
    const report = (introSec: number) => {
      const run = introSec * INTRO.speed;
      const i = terrainAt(run);
      const start = TERRAINS[i].start;
      const end = TERRAINS[i + 1]?.start ?? INTRO.runLength;
      const frac = clamp01((run - start) / (end - start));
      fillRefs.current.forEach((el, k) => {
        if (el)
          el.style.transform = `scaleX(${k < i ? 1 : k === i ? frac : 0})`;
      });
      if (i !== idxRef.current) {
        idxRef.current = i;
        setIdx(i);
      }
      const s = Math.floor(introSec);
      if (s !== secRef.current) {
        secRef.current = s;
        setSec(s);
      }
    };

    let raf = 0;
    let visible = true;
    const cleanups: (() => void)[] = [];

    if (mode === "loop") {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) v.controls = true;
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible && !reduce) v.play().catch(() => {});
        else v.pause();
      });
      io.observe(section);
      const frame = () => {
        if (visible) report(v.currentTime);
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
      cleanups.push(() => io.disconnect());
    } else {
      let target = 0;
      let shown = 0;
      const measure = () => {
        const r = section.getBoundingClientRect();
        const total = section.offsetHeight - window.innerHeight;
        target = total > 0 ? clamp01(-r.top / total) : 0;
        if (target > 0.01) setMoved(true);
      };
      const frame = () => {
        if (visible) {
          shown += (target - shown) * 0.22;
          if (Math.abs(target - shown) < 0.0005) shown = target;
          const d = v.duration || duration;
          const t = Math.min(shown * d, d - 0.05);
          if (
            v.readyState >= 1 &&
            !v.seeking &&
            Math.abs(v.currentTime - t) > 0.02
          )
            v.currentTime = t;
          report(t);
        }
        raf = requestAnimationFrame(frame);
      };
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
      });
      io.observe(section);
      // iOS only paints seeked frames once a muted inline video has played.
      // Low Power Mode blocks that on load, so retry on the first touch.
      const prime = () =>
        v
          .play()
          .then(() => v.pause())
          .catch(() => {});
      prime();
      window.addEventListener("touchstart", prime, {
        once: true,
        passive: true,
      });
      measure();
      window.addEventListener("scroll", measure, { passive: true });
      window.addEventListener("resize", measure);
      raf = requestAnimationFrame(frame);
      cleanups.push(() => {
        io.disconnect();
        window.removeEventListener("touchstart", prime);
        window.removeEventListener("scroll", measure);
        window.removeEventListener("resize", measure);
      });
    }

    return () => {
      cancelAnimationFrame(raf);
      cleanups.forEach((fn) => fn());
    };
  }, [mode, duration]);

  const frame = (
    <div className="sw-hero flex h-full flex-col">
      <SwissHeader />
      <div className="sw-grid min-h-0 flex-1 grid-rows-[auto_auto_minmax(0,1fr)] gap-y-4 pb-5 md:grid-rows-[auto_minmax(0,1fr)] md:gap-y-6 md:pb-8">
        <h1 className="sw-display sw-hero-title col-span-full border-t border-sw-rule pt-3">
          A Balanced <br className="md:hidden" />
          Data Diet
        </h1>

        <div className="col-span-full flex flex-col md:col-span-3">
          <p className="text-xl font-medium leading-tight tracking-[-0.02em] md:text-2xl">
            {SUBTITLE}
          </p>
          <TerrainList idx={idx} className="mt-auto hidden md:block" />
        </div>

        <figure className="col-span-full flex flex-col md:col-span-9">
          <div className="sw-hero-frame relative aspect-[4/3] w-full overflow-hidden bg-sw-panel md:aspect-video">
            <video
              ref={videoRef}
              src={INTRO.src}
              poster={INTRO.poster}
              muted
              playsInline
              loop={mode === "loop"}
              preload="auto"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div
            className="sw-hero-frame mt-3 grid grid-cols-10 gap-[3px]"
            aria-hidden="true"
          >
            {TERRAINS.map((_, k) => (
              <div key={k} className="h-[3px] overflow-hidden bg-sw-hair">
                <div
                  ref={(el) => {
                    fillRefs.current[k] = el;
                  }}
                  className={`h-full origin-left ${k === idx ? "bg-sw-accent" : "bg-sw-fg"}`}
                  style={{ transform: "scaleX(0)" }}
                />
              </div>
            ))}
          </div>
          <figcaption className="sw-hero-frame sw-label mt-2 flex items-baseline justify-between gap-4">
            <span>
              <span className="sw-num">{pad2(idx + 1)}</span>
              <span className="text-sw-mute"> / 10 </span> {TERRAINS[idx].name}
            </span>
            <span className="sw-num text-sw-mute">
              {mode === "scrub" && !moved
                ? "Scroll to play ↓"
                : `${mmss(sec)} / ${mmss(duration)} · ${INTRO.speed}×`}
            </span>
          </figcaption>
          <TerrainList
            idx={idx}
            className="mt-5 grid grid-flow-col grid-cols-2 grid-rows-5 gap-x-4 md:hidden [@media(max-height:760px)]:hidden"
          />
          <p className="sw-hero-frame sw-label mt-auto max-w-[46ch] pt-4 text-sw-mute">
            One MLP policy on ANYmal crossing ten terrains in a single run,
            without resets. Simulation, shown at {INTRO.speed}× speed.
          </p>
        </figure>
      </div>
    </div>
  );

  if (mode === "scrub") {
    return (
      <section ref={sectionRef} id="top" className="relative h-[280svh]">
        <div className="sticky top-0 h-svh">{frame}</div>
      </section>
    );
  }
  return (
    <section ref={sectionRef} id="top" className="relative">
      {frame}
    </section>
  );
}
