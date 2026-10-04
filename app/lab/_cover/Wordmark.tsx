import type { CSSProperties } from "react";
import { WORDMARKS, type InsetWord, type WordmarkVariant } from "./wordmarks";
import "./cover.css";

export type { WordmarkVariant };

export type WordmarkProps = {
  // Each variant carries its own inset size (V1–V5 0.036em of the mark,
  // 12px minimum; V6 0.052em, 13px minimum); positions are checked for
  // that size only.
  variant?: WordmarkVariant;
  // Width the mark spans edge to edge (any CSS length). Default: the page
  // measure, 100vw minus the side margins.
  measure?: string;
  // Upper limit for the mark's font-size (any CSS length), e.g. a share of
  // the screen height so a short, wide screen does not crop it. The mark is
  // 1.6815em wide and 0.7275em tall (cap line to baseline).
  cap?: string;
  // Where the mark sits when the cap makes it narrower than the measure.
  align?: "left" | "right";
  // Ink of the mark and of the inset words (default: currentColor).
  color?: string;
  className?: string;
  style?: CSSProperties;
};

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
// Everything is positioned in em of the mark, so it scales as one piece.
// The inset words keep a 12px floor on phones; the layouts are checked to
// stay clear of the strokes down to a 366px-wide mark.
export default function Wordmark({
  variant = "v1",
  measure,
  cap,
  align = "left",
  color,
  className = "",
  style,
}: WordmarkProps) {
  const v = WORDMARKS[variant];
  return (
    <div
      role="img"
      aria-label="SGS, Success-Guided Sampling"
      data-step={v.step}
      data-align={align}
      className={`cv-wm ${className}`}
      style={
        {
          ...(measure ? { "--wm-measure": measure } : {}),
          ...(cap ? { "--wm-cap": cap } : {}),
          ...(color ? { color } : {}),
          ...style,
        } as CSSProperties
      }
    >
      <span className="cv-wm-mark" aria-hidden="true">
        SGS
      </span>
      <span aria-hidden="true">
        {v.words.map((w) => (
          <Inset key={w.text} word={w} />
        ))}
      </span>
    </div>
  );
}
