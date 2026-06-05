"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Slide = {
  eyebrow: string;
  title: string;
  body: ReactNode;
  align: "left" | "right";
};

const SLIDES: Slide[] = [
  {
    eyebrow: "Success-Guided Sampling",
    title: "A Balanced\nData Diet",
    body: "Addressing the bottleneck in mega-scale RL for robot control.",
    align: "left",
  },
  {
    eyebrow: "One policy",
    title: "One policy,\nevery terrain.",
    body: (
      <>
        A <em>single</em> network controls the robot across all terrains.
      </>
    ),
    align: "right",
  },
  {
    eyebrow: "Training",
    title: "No reward\nengineering.",
    body: "A sparse success signal and generic regularizers. No demonstrations, no distillation.",
    align: "left",
  },
  {
    eyebrow: "Goal",
    title: "Only the\ngoal pose.",
    body: "Each terrain gives the policy one target pose at the end.",
    align: "right",
  },
  {
    eyebrow: "Architecture",
    title: "A Markovian\nMLP policy.",
    body: "Four to eight layers, no transformer, no LSTM. Terrain comes in as a heightmap.",
    align: "left",
  },
  {
    eyebrow: "One run",
    title: "Ten terrains,\nback to back.",
    body: "One continuous run, no resets between them.",
    align: "right",
  },
  {
    eyebrow: "Same method",
    title: "The same recipe\ndoes manipulation.",
    body: (
      <>
        Success-Guided Sampling trains contact-rich assembly the{" "}
        <em>same</em> way.
      </>
    ),
    align: "left",
  },
];

const PX_PER_FULL = 1500;
const IDLE_MS = 350;
const EASE = 0.45;
const END_EPS = 0.9992;
const EXIT_PX = 120;
const EXIT_VEL = 70;
const SCRUB_CLAMP = 120;
const START_DELAY_MS = 250;
const END_CUE_AT = 0.97;

export default function VideoNarrative() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const scrubHintRef = useRef<HTMLDivElement>(null);
  const endCueRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const v = videoRef.current;
    const section = sectionRef.current;
    if (!v || !section) return;

    const html = document.documentElement;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const coarse = window.matchMedia(
      "(hover: none), (pointer: coarse)",
    ).matches;
    if (reduce || coarse) {
      v.controls = true;
      v.muted = true;
      overlayRef.current?.style.setProperty("display", "none");
      if (!reduce) {
        v.loop = true;
        v.play().catch(() => {});
      }
      return;
    }

    let mode: "auto" | "scrub" = "auto";
    let shown = 0;
    let target = 0;
    let raf = 0;
    let idle: ReturnType<typeof setTimeout> | undefined;
    let activeBeat = -1;
    let endCueShown = false;
    let completedOnce = false;
    let released = false;
    let overscroll = 0;
    let everScrubbed = false;
    let endHoldTimer: ReturnType<typeof setTimeout> | undefined;

    const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
    const setStatus = (txt: string) => {
      if (statusRef.current) statusRef.current.textContent = txt;
    };

    window.scrollTo(0, 0);
    html.style.overflow = "hidden";
    v.muted = true;
    const startTimer = setTimeout(() => {
      if (mode === "auto" && !released) v.play().catch(() => {});
    }, START_DELAY_MS);
    setStatus("▸ 1×");
    const hintTimer = setTimeout(() => {
      scrubHintRef.current?.classList.add("is-hidden");
    }, 5000);

    const updateUI = (p: number) => {
      if (barRef.current) barRef.current.style.transform = `scaleY(${p})`;
      const idx = Math.min(SLIDES.length - 1, Math.floor(p * SLIDES.length));
      if (idx !== activeBeat) {
        activeBeat = idx;
        slideRefs.current.forEach((el, i) =>
          el?.classList.toggle("is-active", i === idx),
        );
        if (counterRef.current) {
          counterRef.current.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(SLIDES.length).padStart(2, "0")}`;
        }
      }
      const showEnd = p >= END_CUE_AT;
      if (showEnd !== endCueShown) {
        endCueShown = showEnd;
        endCueRef.current?.classList.toggle("is-hidden", !showEnd);
      }
    };

    const release = () => {
      if (released) return;
      released = true;
      html.style.overflow = "";
      setStatus("");
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      if (idle) clearTimeout(idle);
      v.loop = false;
      v.pause();
      if (overlayRef.current) {
        overlayRef.current.style.transition = "opacity 0.4s ease";
        overlayRef.current.style.opacity = "0";
        overlayRef.current.style.pointerEvents = "none";
      }
    };

    const goToNext = () => {
      release();
      document
        .getElementById("manipulation")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const onEnded = () => {
      completedOnce = true;
      mode = "scrub";
      target = 1;
      v.pause();
      setStatus("");
      if (!everScrubbed) {
        if (endHoldTimer) clearTimeout(endHoldTimer);
        endHoldTimer = setTimeout(() => {
          if (!everScrubbed && !released) goToNext();
        }, 1200);
      }
    };

    const frame = () => {
      if (released) return;
      if (v.duration) {
        if (mode === "scrub") {
          shown += (target - shown) * EASE;
          if (Math.abs(target - shown) < 0.0003) shown = target;
          if (!v.seeking) {
            const t = shown * v.duration;
            if (Math.abs(v.currentTime - t) > 0.012) v.currentTime = t;
          }
        } else {
          shown = v.currentTime / v.duration;
          target = shown;
        }
        if (shown >= END_EPS) completedOnce = true;
        updateUI(shown);
      }
      raf = requestAnimationFrame(frame);
    };

    const repin = () => {
      released = false;
      everScrubbed = true;
      window.scrollTo(0, 0);
      html.style.overflow = "hidden";
      mode = "scrub";
      v.loop = false;
      v.pause();
      if (v.duration) {
        shown = v.currentTime / v.duration;
        target = shown;
      }
      overscroll = 0;
      if (overlayRef.current) {
        overlayRef.current.style.opacity = "1";
        overlayRef.current.style.pointerEvents = "";
      }
      setStatus("⇅ scrub");
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const scheduleIdle = () => {
      if (idle) clearTimeout(idle);
      idle = setTimeout(() => {
        if (released) return;
        if (shown >= 0.999) return;
        mode = "auto";
        if (v.duration) v.currentTime = shown * v.duration;
        v.play().catch(() => {});
        setStatus("▸ 1×");
      }, IDLE_MS);
    };

    const onWheel = (e: WheelEvent) => {
      const raw = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      const dy = Math.max(-SCRUB_CLAMP, Math.min(SCRUB_CLAMP, raw));
      if (released) {
        if (dy < 0 && window.scrollY <= 1) repin();
        else return;
      }
      mode = "scrub";
      v.pause();
      if (!everScrubbed) {
        everScrubbed = true;
        if (endHoldTimer) clearTimeout(endHoldTimer);
        scrubHintRef.current?.classList.add("is-hidden");
      }

      if (dy > 0 && completedOnce && target >= 0.999) {
        if (dy <= EXIT_VEL) {
          overscroll += dy;
          if (overscroll >= EXIT_PX) return goToNext();
        } else {
          overscroll = 0;
        }
      } else {
        overscroll = 0;
        target = clamp01(target + dy / PX_PER_FULL);
      }

      setStatus("⇅ scrub");
      scheduleIdle();
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    v.addEventListener("ended", onEnded);
    window.addEventListener("sgs:release", release);
    raf = requestAnimationFrame(frame);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(hintTimer);
      if (raf) cancelAnimationFrame(raf);
      if (idle) clearTimeout(idle);
      if (endHoldTimer) clearTimeout(endHoldTimer);
      window.removeEventListener("wheel", onWheel);
      v.removeEventListener("ended", onEnded);
      window.removeEventListener("sgs:release", release);
      html.style.overflow = "";
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="narrative"
      className="relative h-screen w-full overflow-hidden bg-paper"
    >
      <video
        ref={videoRef}
        src="/locomotion.mp4"
        poster="/poster.jpg"
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-paper/30" />
      <div className="grid-texture pointer-events-none absolute inset-0 opacity-60" />

      <div ref={overlayRef}>
        <div className="absolute left-0 top-0 h-full w-[3px] bg-ink/10">
          <div
            ref={barRef}
            className="h-full w-full origin-top bg-beacon"
            style={{ transform: "scaleY(0)" }}
          />
        </div>

        <div className="absolute left-6 bottom-6 md:left-10 md:bottom-10">
          <span ref={counterRef} className="eyebrow text-ink/70">
            01 / {String(SLIDES.length).padStart(2, "0")}
          </span>
        </div>

        <div className="absolute right-6 top-6 md:right-10 md:top-10">
          <span ref={statusRef} className="eyebrow text-ink/50" />
        </div>

        {SLIDES.map((s, i) => (
          <div
            key={i}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            data-slide
            className={`absolute inset-0 flex items-center px-6 md:px-16 ${
              s.align === "right" ? "justify-end" : "justify-start"
            } ${i === 0 ? "is-active" : ""}`}
          >
            <div className="max-w-xl">
              <div className="eyebrow-box mb-5">
                <span className="eyebrow text-ink">{s.eyebrow}</span>
              </div>
              <h2 className="display whitespace-pre-line text-[12vw] text-ink sm:text-[8vw] md:text-7xl lg:text-[5.5rem]">
                {s.title}
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-muted md:text-lg">
                {s.body}
              </p>
            </div>
          </div>
        ))}

        <div
          ref={scrubHintRef}
          className="cue pointer-events-none absolute inset-x-0 bottom-9 flex flex-col items-center gap-2 text-ink/45"
        >
          <span className="eyebrow">Scroll to scrub</span>
          <svg
            className="cue-arrow"
            width="20"
            height="11"
            viewBox="0 0 20 11"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M1 1l9 9 9-9" />
          </svg>
        </div>

        <div
          ref={endCueRef}
          className="cue is-hidden pointer-events-none absolute inset-x-0 bottom-9 flex flex-col items-center gap-2 text-ink/55"
        >
          <span className="eyebrow">Scroll to continue</span>
          <svg
            className="cue-arrow"
            width="20"
            height="11"
            viewBox="0 0 20 11"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M1 1l9 9 9-9" />
          </svg>
        </div>
      </div>
    </section>
  );
}
