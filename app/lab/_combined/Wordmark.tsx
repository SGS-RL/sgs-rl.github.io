import type { CSSProperties } from "react";
import type { InsetWord } from "../_cover/wordmarks";
import "../_cover/cover.css";

// A copy of _cover/Wordmark fixed to the V6 layout, with Guided moved: the
// owner asked for it more centred in the G at the same height
// (2026-10-06). It is now centred between the G's bowl and its inner stem
// at the word's own height (the counter runs x 0.637–1.056em at mid-word,
// measured from Inter Tight); in V6 it hung from the end of the G's bar.
// Positions are in em of the mark (see ../_cover/wordmarks.ts); w is the
// word's advance in its own em.
const WORDS: InsetWord[] = [
  {
    text: "Success-",
    x: 0.149,
    y: 0.1813,
    anchor: "cap",
    align: "left",
    maxX: 0.4,
    w: 3.891,
  },
  {
    text: "Guided",
    x: 0.846,
    y: 0.4853,
    anchor: "cap",
    align: "center",
    w: 2.957,
  },
  {
    text: "Sampling",
    x: 1.31,
    y: 0.5938,
    anchor: "base",
    align: "left",
    maxX: 1.53,
    w: 3.816,
  },
];

const em = (n: number) => `${n}em`;

function Inset({ word }: { word: InsetWord }) {
  // Positions are in em of the mark: this wrapper inherits the mark's size,
  // the word inside it takes the inset size.
  const left =
    word.maxX !== undefined && word.align === "left"
      ? `min(${em(word.x)}, calc(${em(word.maxX)} - ${word.w} * var(--wm-f)))`
      : em(word.x);
  return (
    <span className="cv-wm-at" style={{ left, top: em(word.y) }}>
      <span
        className="cv-wm-word"
        data-anchor={word.anchor}
        data-align={word.align}
      >
        {word.text}
      </span>
    </span>
  );
}

// The large "SGS" with "Success-Guided Sampling" set inside its letters.
// measure: the width it spans (default: the page measure); cap: upper limit
// for its font-size (the mark is 1.6815em wide and 0.7275em tall); color:
// ink of the mark and the words; words: a different ink for the words.
export default function Wordmark({
  measure,
  cap,
  color,
  words,
}: {
  measure?: string;
  cap?: string;
  color?: string;
  words?: string;
}) {
  return (
    <div
      role="img"
      aria-label="SGS, Success-Guided Sampling"
      data-step={2}
      className="cv-wm"
      style={
        {
          ...(measure ? { "--wm-measure": measure } : {}),
          ...(cap ? { "--wm-cap": cap } : {}),
          ...(color ? { color } : {}),
        } as CSSProperties
      }
    >
      <span className="cv-wm-mark" aria-hidden="true">
        SGS
      </span>
      <span aria-hidden="true" style={words ? { color: words } : undefined}>
        {WORDS.map((w) => (
          <Inset key={w.text} word={w} />
        ))}
      </span>
    </div>
  );
}
