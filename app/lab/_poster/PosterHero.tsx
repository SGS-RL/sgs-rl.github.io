"use client";

import { useEffect, useRef, useState } from "react";
import { INTRO, LINKS, TERRAINS, terrainAt } from "../content";
import HalftoneVideo from "./HalftoneVideo";
import { P, vars } from "./palettes";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const pad2 = (n: number) => String(n).padStart(2, "0");
const mmss = (s: number) =>
  `${pad2(Math.floor(s / 60))}:${pad2(Math.floor(s % 60))}`;

// The intro opens on a white fade; the scrub starts just after it.
const START = 0.6;

// The camera follows the robot, which stays near this point of the frame.
export const ROBOT_FOCUS: [number, number] = [0.36, 0.7];

// Poster 1. The intro is pinned and scroll drives its time; the page itself
// never locks, so a fast flick goes straight past.
export default function PosterHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [idx, setIdx] = useState(0);
  const [sec, setSec] = useState(0);
  const [moved, setMoved] = useState(false);
  const duration = INTRO.runLength / INTRO.speed;

  useEffect(() => {
    const section = sectionRef.current;
    const v = section?.querySelector("video");
    if (!v || !section) return;

    let target = 0;
    let shown = 0;
    let raf = 0;
    let visible = true;
    let lastIdx = -1;
    let lastSec = -1;

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
        const t = Math.min(START + shown * (d - START), d - 0.05);
        if (
          v.readyState >= 1 &&
          !v.seeking &&
          Math.abs(v.currentTime - t) > 0.02
        )
          v.currentTime = t;
        const i = terrainAt(t * INTRO.speed);
        if (i !== lastIdx) {
          lastIdx = i;
          setIdx(i);
        }
        const s = Math.floor(t);
        if (s !== lastSec) {
          lastSec = s;
          setSec(s);
        }
      }
      raf = requestAnimationFrame(frame);
    };

    // iOS only paints seeked frames once a muted inline video has played;
    // Low Power Mode blocks that on load, so retry on the first touch.
    const prime = () =>
      v
        .play()
        .then(() => v.pause())
        .catch(() => {});
    prime();
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(section);
    window.addEventListener("touchstart", prime, { once: true, passive: true });
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    measure();
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("touchstart", prime);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [duration]);

  const t = TERRAINS[idx];

  return (
    <section ref={sectionRef} id="top" className="relative h-[260svh]">
      <div
        className="pz-poster sticky top-[var(--bar)] h-[calc(100svh-var(--bar))] overflow-hidden md:[--mark-cap:45svh]"
        style={vars(P.hero)}
      >
        <HalftoneVideo
          mode="manual"
          src={INTRO.src}
          poster={INTRO.poster}
          ink={P.hero.raster}
          pitch={6}
          angle={15}
          focus={ROBOT_FOCUS}
          lo={0.12}
          hi={0.95}
          gamma={1.8}
          className="!absolute inset-x-0 top-0 bottom-[30%] md:bottom-0"
        />

        <div className="relative flex h-full flex-col pb-[var(--m)] pt-2">
          <div className="pz-grid pz-small">
            <p className="col-span-3 md:col-span-3">Success-Guided Sampling</p>
            <p className="col-span-3 md:col-span-3">
              Mega-Scale RL
              <br />
              for Robot Control
            </p>
            <p className="hidden md:col-span-3 md:col-start-10 md:block">
              One policy, ten terrains,
              <br />
              one run without resets
            </p>
          </div>

          <h1 className="pz-big pz-overprint px-[var(--m)] pt-3 text-[22.5vw] md:text-[min(12.5vw,19svh)]">
            A<br />
            Balanced
            <br />
            Data
            <br />
            Diet
          </h1>

          <div className="flex-1" />

          <div className="md:absolute md:inset-x-0 md:bottom-[var(--m)] md:flex md:items-end md:justify-between">
            <p className="pz-mid pz-overprint pz-num mb-2 grid grid-cols-6 items-baseline gap-x-[var(--g)] px-[var(--m)] md:mb-0 md:block md:pb-[0.3em]">
              <span className="col-span-2 md:block">
                {pad2(idx + 1)}/{TERRAINS.length}
              </span>
              <span className="col-span-4 md:block">{t.name}</span>
            </p>

            <div className="relative px-[var(--m)] md:w-fit md:shrink-0">
              <span className="pz-mark pz-overprint" aria-label="SGS">
                SGS
              </span>
              <span
                className="pz-slot"
                style={{ marginLeft: "0.05em", marginTop: "0.415em" }}
              >
                <span className="pz-small pz-num">
                  {moved ? mmss(sec) : "Scroll"}
                  <br />
                  {moved ? `of ${mmss(duration)}` : "to play ↓"}
                </span>
              </span>
              <span
                className="pz-slot"
                style={{ marginLeft: "0.71em", marginTop: "0.2em" }}
              >
                <span className="pz-small">
                  <a href={LINKS.paper} className="pz-u">
                    Paper
                  </a>
                  <br />
                  <a href={LINKS.code} className="pz-u">
                    Code
                  </a>
                </span>
              </span>
              <span
                className="pz-slot"
                style={{ marginLeft: "1.42em", marginTop: "0.215em" }}
              >
                <span className="pz-small">
                  ANYmal
                  <br />
                  {INTRO.speed}× speed
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
