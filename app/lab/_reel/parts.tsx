"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { useReel, type Skin } from "./engine";
import {
  chapterAt,
  defaultCaption,
  line,
  mss,
  pad2,
  tracks,
  type Chapter,
} from "./reel";

// Type roles per skin. Poster (pz) is one weight throughout.
export const TYPE: Record<
  Skin,
  { small: string; row: string; num: string; strong: string }
> = {
  swiss: {
    small: "sw-label",
    row: "sw-label",
    num: "sw-num",
    strong: "font-medium",
  },
  pz: { small: "pz-small", row: "pz-row", num: "pz-num", strong: "" },
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const progress = (chapters: readonly Chapter[], t: number) => {
  const i = chapterAt(chapters, t);
  const c = chapters[i];
  return { i, c, frac: clamp01((t - c.start) / c.len) };
};

function Glyph({ kind }: { kind: "play" | "pause" | "full" | "exit" }) {
  const d = {
    play: "M2 0.8 11.2 6 2 11.2Z",
    pause: "M1.5 1h3.2v10H1.5zM7.3 1h3.2v10H7.3z",
    full: "M0.5 0.5h4.5v1.6H2.1v2.9H0.5zM7 0.5h4.5v4.5H9.9V2.1H7zM0.5 7h1.6v2.9H5v1.6H0.5zM9.9 7h1.6v4.5H7V9.9h2.9z",
    exit: "M3.4 0.5H5V5H0.5V3.4h2.9zM7 0.5h1.6v2.9h2.9V5H7zM0.5 7H5v4.5H3.4V8.6H0.5zM7 7h4.5v1.6H8.6v2.9H7z",
  }[kind];
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" className="rl-glyph">
      <path d={d} />
    </svg>
  );
}

// The video. Children (bar, controls, caption) sit under it inside the
// same <figure>, which is what goes full screen. Keys while focus is inside:
// K play/pause, F full screen.
export function ReelPlayer({
  className = "",
  label = "Highlight reel",
  describedBy,
  children,
}: {
  className?: string;
  label?: string;
  // id of a caption outside the figure
  describedBy?: string;
  children?: ReactNode;
}) {
  const { reel, videoRef, playerRef, toggle, toggleFullscreen } = useReel();
  const onKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const k = e.key.toLowerCase();
    if (k === "k") {
      e.preventDefault();
      toggle();
    } else if (k === "f") {
      e.preventDefault();
      toggleFullscreen();
    }
  };
  return (
    <figure
      ref={playerRef}
      className={`rl-player ${className}`}
      onKeyDown={onKey}
    >
      <div
        className="rl-frame"
        onClick={toggle}
        onDoubleClick={toggleFullscreen}
      >
        <video
          ref={videoRef}
          src={reel.src}
          poster={reel.poster}
          muted
          loop
          playsInline
          preload="none"
          aria-label={label}
          aria-describedby={describedBy}
          className="rl-video"
        />
      </div>
      {children}
    </figure>
  );
}

// The scrubbable bar: one segment per chapter, wider gaps between robots.
// Played chapters fill in the type colour, the current one in the accent.
// Keyboard: arrows ±1 s (Shift ±5 s), Page Up/Down next/previous chapter,
// Home/End, Space play/pause.
export function ReelBar({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  const {
    chapters,
    idx,
    seek,
    step,
    toggle,
    scrubStart,
    scrubEnd,
    subscribe,
    now,
  } = useReel();
  const ref = useRef<HTMLDivElement>(null);
  const segs = useRef<(HTMLDivElement | null)[]>([]);
  const fills = useRef<(HTMLDivElement | null)[]>([]);
  const drag = useRef(false);
  const tpl = useMemo(() => tracks(chapters), [chapters]);
  const last = chapters[chapters.length - 1];

  useEffect(
    () =>
      subscribe((t, d) => {
        const { i, c, frac } = progress(chapters, t);
        fills.current.forEach((el, k) => {
          if (el)
            el.style.transform = `scaleX(${k < i ? 1 : k === i ? frac : 0})`;
        });
        const el = ref.current;
        if (el) {
          el.setAttribute("aria-valuenow", String(Math.floor(t)));
          el.setAttribute("aria-valuemax", String(Math.floor(d)));
          el.setAttribute(
            "aria-valuetext",
            `${mss(t)} of ${mss(d)}, ${pad2(i + 1)}, ${c.robot}, ${c.title}`,
          );
        }
      }),
    [subscribe, chapters],
  );

  // Pointer x to reel time, measured against the segments themselves so
  // the gaps between them are skipped.
  const timeAt = (x: number) => {
    for (let k = 0; k < chapters.length; k++) {
      const r = segs.current[k]?.getBoundingClientRect();
      if (!r) continue;
      if (x < r.left) return chapters[k].start;
      if (x <= r.right)
        return (
          chapters[k].start + clamp01((x - r.left) / r.width) * chapters[k].len
        );
    }
    return last.end;
  };

  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.dataset.scrub = "";
    drag.current = true;
    scrubStart();
    seek(timeAt(e.clientX));
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (drag.current) seek(timeAt(e.clientX));
  };
  const up = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    drag.current = false;
    delete e.currentTarget.dataset.scrub;
    scrubEnd();
  };

  const key = (e: KeyboardEvent<HTMLDivElement>) => {
    const here = chapterAt(chapters, now() + 0.25);
    switch (e.key) {
      case "ArrowLeft":
      case "ArrowDown":
        step(e.shiftKey ? -5 : -1);
        break;
      case "ArrowRight":
      case "ArrowUp":
        step(e.shiftKey ? 5 : 1);
        break;
      case "PageUp":
        seek(chapters[Math.min(chapters.length - 1, here + 1)].start);
        break;
      case "PageDown":
        seek(chapters[Math.max(0, here - 1)].start);
        break;
      case "Home":
        seek(0);
        break;
      case "End":
        seek(last.end);
        break;
      case " ":
        toggle();
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={Math.floor(last.end)}
      aria-valuenow={0}
      aria-valuetext={`0:00 of ${mss(last.end)}`}
      className={`rl-track ${className}`}
      style={{ gridTemplateColumns: tpl, ...style }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onLostPointerCapture={up}
      onKeyDown={key}
    >
      {chapters.map((c) => (
        <div
          key={c.i}
          ref={(el) => {
            segs.current[c.i] = el;
          }}
          className="rl-seg"
          style={{ gridColumn: line(c.i) }}
        >
          <div
            ref={(el) => {
              fills.current[c.i] = el;
            }}
            className="rl-fill"
            data-now={c.i === idx ? "" : undefined}
          />
        </div>
      ))}
    </div>
  );
}

// Play/pause, current chapter, time, full screen.
export function ReelControls({ className = "" }: { className?: string }) {
  const {
    reel,
    skin,
    chapters,
    idx,
    playing,
    fullscreen,
    toggle,
    toggleFullscreen,
    subscribe,
  } = useReel();
  const time = useRef<HTMLSpanElement>(null);
  const T = TYPE[skin];
  const c = chapters[idx];

  useEffect(
    () =>
      subscribe((t, d) => {
        if (time.current) time.current.textContent = `${mss(t)} / ${mss(d)}`;
      }),
    [subscribe],
  );

  return (
    <div className={`${T.small} flex items-center gap-x-4 ${className}`}>
      <button type="button" onClick={toggle} className="rl-btn">
        <Glyph kind={playing ? "pause" : "play"} />
        <span className="w-[2.6em]">{playing ? "Pause" : "Play"}</span>
      </button>
      <span className="min-w-0 flex-1 truncate">
        <span className={T.num}>{pad2(idx + 1)}</span>
        <span className="text-[var(--rl-mute)]">
          {" / "}
          {pad2(chapters.length)}
        </span>{" "}
        <span className="max-md:hidden">{c.robot} · </span>
        {c.title}
      </span>
      <span ref={time} className={`${T.num} text-[var(--rl-mute)]`}>
        {`0:00 / ${mss(reel.duration)}`}
      </span>
      <button type="button" onClick={toggleFullscreen} className="rl-btn">
        <Glyph kind={fullscreen ? "exit" : "full"} />
        <span className="max-md:sr-only">
          {fullscreen ? "Exit full screen" : "Full screen"}
        </span>
      </button>
    </div>
  );
}

// Chapter list grouped by robot: number, title, start time. The current
// chapter is marked and shows its progress; a click plays from its start.
export function ReelChapters({ className = "" }: { className?: string }) {
  const { skin, chapters, groups, idx, goTo, subscribe } = useReel();
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  const uid = useId();
  const T = TYPE[skin];

  useEffect(
    () =>
      subscribe((t) => {
        const { i, frac } = progress(chapters, t);
        fills.current.forEach((el, k) => {
          if (el) el.style.transform = `scaleX(${k === i ? frac : 0})`;
        });
      }),
    [subscribe, chapters],
  );

  return (
    <nav aria-label="Chapters" className={`rl-chapters ${className}`}>
      {groups.map((g, gi) => (
        <div key={gi} className="rl-group">
          <p id={`${uid}-${gi}`} className={`rl-head ${T.small}`}>
            <span className={T.strong}>{g.robot}</span>
            <span className="text-right text-[var(--rl-mute)]">{g.label}</span>
          </p>
          <ol aria-labelledby={`${uid}-${gi}`}>
            {chapters.slice(g.from, g.to + 1).map((c) => (
              <li key={c.i}>
                <button
                  type="button"
                  className={`rl-row ${T.row}`}
                  aria-current={c.i === idx ? "true" : undefined}
                  onClick={() => goTo(c.i)}
                >
                  <span
                    ref={(el) => {
                      fills.current[c.i] = el;
                    }}
                    className="rl-rowfill"
                    aria-hidden="true"
                  />
                  <span className={T.num}>{pad2(c.i + 1)}</span>
                  <span>{c.title}</span>
                  <span className={`${T.num} flex items-center gap-2`}>
                    {skin === "swiss" && c.i === idx && (
                      <span className="rl-mark" aria-hidden="true" />
                    )}
                    {mss(c.start)}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </nav>
  );
}

// The chapters as a labelled timeline: the bar, chapter numbers and titles
// under it, and the robots as ruled bands under those, all on one grid so
// they line up. On phones the titles collapse to numbers.
export function ReelTimeline({ className = "" }: { className?: string }) {
  const { skin, chapters, groups, idx, goTo } = useReel();
  const tpl = useMemo(() => tracks(chapters), [chapters]);
  const T = TYPE[skin];
  return (
    <div
      className={`rl-timeline ${T.small} ${className}`}
      style={{ gridTemplateColumns: tpl }}
    >
      <ReelBar style={{ gridColumn: "1 / -1", gridRow: 1 }} />
      {chapters.map((c) => (
        <button
          key={c.i}
          type="button"
          className="rl-tick"
          style={{ gridColumn: line(c.i), gridRow: 2 }}
          aria-current={c.i === idx ? "true" : undefined}
          onClick={() => goTo(c.i)}
        >
          <span className={`${T.num} block`}>{pad2(c.i + 1)}</span>
          <span className="rl-tick-title block leading-tight">{c.title}</span>
        </button>
      ))}
      {groups.map((g, gi) => (
        <p
          key={gi}
          className="rl-band"
          style={{
            gridColumn: `${line(g.from)} / ${line(g.to) + 1}`,
            gridRow: 3,
          }}
        >
          <span className={T.strong}>{g.robot}</span>{" "}
          <span className="text-[var(--rl-mute)] max-md:block">{g.label}</span>
        </p>
      ))}
    </div>
  );
}

export function ReelCaption({
  className = "",
  id,
  as: Tag = "figcaption",
  children,
}: {
  className?: string;
  id?: string;
  // "figcaption" inside ReelPlayer; "p" when it sits elsewhere on the grid.
  as?: "figcaption" | "p";
  children?: ReactNode;
}) {
  const { reel, skin } = useReel();
  return (
    <Tag
      id={id}
      className={`${TYPE[skin].small} max-w-[56ch] text-[var(--rl-mute)] ${className}`}
    >
      {children ?? defaultCaption(reel)}
    </Tag>
  );
}
