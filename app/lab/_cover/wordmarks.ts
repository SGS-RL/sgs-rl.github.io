// Inset-word layouts for the SGS wordmark. Every number is in em of the
// mark, measured from the glyph outlines of Inter Tight 400 at the mark's
// tracking (-0.065em): x from the ink of the first S (the mark's left
// edge), y down from the cap line. The mark is 1.6815em wide and its
// baseline sits at y = 0.7275.
//
// Landmarks used below (em):
//   first S   upper counter x 0.11–0.43, y 0.07–0.27; terminal ends at y 0.18
//             lower counter x 0.10–0.43, y 0.38–0.66 (open to the left)
//   G         bar y 0.363–0.442, from x 0.872 to the right edge;
//             inner stem below the bar at x 1.06, bowl bottom at y 0.654
//   last S    = first S shifted 1.157em right (terminal inner edge 1.585)
//   stroke width about 0.086em, so half a stem is about 0.043em

export type Anchor = "cap" | "base"; // y is the word's cap line or baseline
export type Align = "left" | "right" | "center";

export type InsetWord = {
  text: string;
  x: number;
  y: number;
  anchor: Anchor;
  align: Align;
  // Left-aligned words shift left when the inset type is at its pixel
  // minimum (phones) so they end before this x.
  maxX?: number;
  // Advance of the word in its own em, at the inset tracking (-0.02em).
  w: number;
};

// Advances from the font's hmtx table, minus 0.02em per character.
const W = { success: 3.891, guided: 2.957, sampling: 3.816 } as const;

const success = (
  x: number,
  y: number,
  anchor: Anchor = "base",
  align: Align = "left",
  maxX?: number,
): InsetWord => ({ text: "Success-", x, y, anchor, align, maxX, w: W.success });
const guided = (
  x: number,
  y: number,
  anchor: Anchor = "cap",
  align: Align = "left",
  maxX?: number,
): InsetWord => ({ text: "Guided", x, y, anchor, align, maxX, w: W.guided });
const sampling = (
  x: number,
  y: number,
  anchor: Anchor = "base",
  align: Align = "left",
  maxX?: number,
): InsetWord => ({
  text: "Sampling",
  x,
  y,
  anchor,
  align,
  maxX,
  w: W.sampling,
});

export type WordmarkVariant = "v1" | "v2" | "v3" | "v4" | "v5" | "v6";

export const WORDMARKS: Record<
  WordmarkVariant,
  { label: string; note: string; step: 1 | 2; words: InsetWord[] }
> = {
  v1: {
    label: "As asked",
    note: "Success- and Sampling share a baseline in the upper counters of the two S; Guided hangs from the underside of the G's bar, flush with its end.",
    step: 1,
    words: [
      success(0.155, 0.2138, "base", "left", 0.395),
      guided(0.872, 0.4673, "cap", "left", 1.03),
      sampling(1.312, 0.2138),
    ],
  },
  v2: {
    label: "Offset",
    note: "As V1, but off the shared line: Success- one grid step (0.05em) higher and a little right, Sampling one step lower.",
    step: 1,
    words: [
      success(0.165, 0.1738, "base", "left", 0.395),
      guided(0.872, 0.4673, "cap", "left", 1.03),
      sampling(1.312, 0.2238),
    ],
  },
  v3: {
    label: "Diagonal",
    note: "Sampling moves to the lower counter of the last S, so the three words step down from left to right.",
    step: 1,
    words: [
      success(0.155, 0.1888, "base", "left", 0.395),
      guided(0.872, 0.4673, "cap", "left", 1.03),
      sampling(1.305, 0.5888, "base", "left", 1.535),
    ],
  },
  v4: {
    label: "Hung",
    note: "Each word hangs below a stroke end and is set flush right against it: the two S terminals and the inner stem of the G.",
    step: 1,
    words: [
      success(0.4275, 0.2063, "cap", "right"),
      guided(1.032, 0.4673, "cap", "right"),
      sampling(1.5845, 0.2063, "cap", "right"),
    ],
  },
  v5: {
    label: "Centred",
    note: "Each word optically centred in its counter; Guided in the pocket under the bar.",
    step: 1,
    words: [
      success(0.27, 0.2038, "base", "center"),
      guided(0.925, 0.5488, "base", "center"),
      sampling(1.427, 0.2038, "base", "center"),
    ],
  },
  v6: {
    label: "NOF",
    note: "After the NOF mark: each word hugs a stroke about half a stem off it and the words step down. Success- hangs at the height of the first S's terminal, Guided half a stem under the G's bar from its end, Sampling on the floor of the last S's lower counter. Words at 1/14 of the cap height: NOF's 1/10 does not fit the S counters.",
    step: 2,
    words: [
      success(0.149, 0.1813, "cap", "left", 0.4),
      guided(0.872, 0.4853, "cap", "left", 1.026),
      sampling(1.31, 0.5938, "base", "left", 1.53),
    ],
  },
};
