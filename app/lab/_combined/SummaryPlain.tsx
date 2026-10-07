import { Fragment } from "react";

// The summary with no label column (/lab/summaries/ C–F, owner,
// 2026-10-07: "I like the text of B better, but I don't like the sidebar
// thing"). The paragraph in the page's single typeface, across the page:
//   c  nothing else: no label, no rule
//   d  a rule above, no label
//   e  larger type, no label, no rule
//   f  a big "Summary" title band, as Highlights has (the owner's pick)
export type SummaryVariant = "c" | "d" | "e" | "f";

// Under F, three things are tried (/lab/combined-f-sizes/, owner,
// 2026-10-07):
// size    f the original, f1 and f2 one and two steps down, f3 about the
//         size of the reel's chapter list
// width   cap: a reading measure (34–40em); full: to the right margin, level
//         with the chapter list above; video: as wide as the video above
//         (phones: full)
// stroke  regular 400; light 300; light + key words at 600; thin 200 + key
//         words at 500
export type SummarySize = "f" | "f1" | "f2" | "f3";
export type SummaryWidth = "cap" | "full" | "video";
export type SummaryStroke = "regular" | "light" | "light-key" | "thin-key";
export const SUMMARY_SIZES: SummarySize[] = ["f", "f1", "f2", "f3"];
export const SUMMARY_WIDTHS: SummaryWidth[] = ["cap", "full", "video"];
export const SUMMARY_STROKES: SummaryStroke[] = [
  "regular",
  "light",
  "light-key",
  "thin-key",
];

// The paragraph, with its key phrases marked.
const PARTS: [string, boolean][] = [
  ["Success-Guided Sampling (SGS)", true],
  [" spends parallel simulation on the task configurations a policy ", false],
  ["solves only some of the time", true],
  [". With it, reinforcement learning keeps improving ", false],
  ["up to one million parallel environments", true],
  [", in legged locomotion and contact-rich manipulation.", false],
];

export const SUMMARY_TEXT = PARTS.map(([t]) => t).join("");

export default function SummaryPlain({
  v,
  size = "f",
  width = "cap",
  stroke = "regular",
  id = "summary",
}: {
  v: SummaryVariant;
  size?: SummarySize;
  width?: SummaryWidth;
  stroke?: SummaryStroke;
  id?: string;
}) {
  const type =
    v === "e"
      ? "cb-sum-big"
      : `${size === "f" ? "cb-sum" : `cb-sum-${size}`} cb-w-${width} cb-w-${width}-${size}`;
  const keys = stroke.endsWith("-key");
  return (
    <section
      id={id}
      aria-label="Summary"
      className="scroll-mt-[var(--bar)] pb-16 md:pb-24"
    >
      {v === "f" && (
        <h2 className="pz-head border-y border-black bg-white px-[var(--m)] pb-[0.08em] pt-[0.04em]">
          Summary
        </h2>
      )}
      <div className="pz-grid pt-6 md:pt-10">
        {v === "d" && <div className="col-span-full mb-4 h-px bg-black" />}
        <p className={`col-span-full ${type} cb-stroke-${stroke}`}>
          {PARTS.map(([t, key], i) =>
            key && keys ? (
              <strong key={i}>{t}</strong>
            ) : (
              <Fragment key={i}>{t}</Fragment>
            ),
          )}
        </p>
      </div>
    </section>
  );
}
