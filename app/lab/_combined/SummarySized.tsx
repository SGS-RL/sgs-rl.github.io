"use client";

import { makeChoice } from "./choice";
import SummaryPlain, {
  SUMMARY_SIZES,
  SUMMARY_STROKES,
  SUMMARY_WIDTHS,
  type SummaryVariant,
} from "./SummaryPlain";

// Summary F with its size, width and stroke chosen by switches at the bottom
// left, above the header switch (/lab/combined-f-sizes/). Each can be set in
// the address: ?size=f2&width=video&stroke=light-key.
const size = makeChoice("sgs-lab-summary-size", SUMMARY_SIZES, "f1", "size");
const width = makeChoice(
  "sgs-lab-summary-width",
  SUMMARY_WIDTHS,
  "cap",
  "width",
);
const stroke = makeChoice(
  "sgs-lab-summary-stroke",
  SUMMARY_STROKES,
  "regular",
  "stroke",
);

const LABELS: Record<string, string> = {
  cap: "Capped",
  full: "Full",
  video: "Video",
  regular: "Regular",
  light: "Light",
  "light-key": "Light + bold",
  "thin-key": "Thin + bold",
};

export default function SummarySized({ v = "f" }: { v?: SummaryVariant }) {
  return (
    <SummaryPlain
      v={v}
      size={size.useValue()}
      width={width.useValue()}
      stroke={stroke.useValue()}
    />
  );
}

function Row<T extends string>({
  label,
  choice,
}: {
  label: string;
  choice: {
    options: readonly T[];
    choose: (v: T) => void;
    useValue: () => T;
  };
}) {
  const now = choice.useValue();
  return (
    <div className="cb-switch-row" role="group" aria-label={label}>
      <span>{label}</span>
      {choice.options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={now === o}
          onClick={() => choice.choose(o)}
        >
          {LABELS[o] ?? o.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function SummarySizeSwitch() {
  return (
    <div className="cb-switch cb-switch-panel pz-small">
      <Row label="Size" choice={size} />
      <Row label="Width" choice={width} />
      <Row label="Stroke" choice={stroke} />
    </div>
  );
}
