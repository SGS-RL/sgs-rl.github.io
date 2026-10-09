"use client";

import { useState } from "react";
import { BIBTEX } from "../content";
import { Mark } from "./Header";
import { HEADER_INKS } from "./inks";

// The end of the page (owner, 2026-10-08: "finish up with a bibtex section,
// and also at the end maybe we can close with a full screen SGS, but this
// time black background, white letters"). The citation, as the paper's
// BibTeX (key in the usual last-name, year, first-word form), in the PPO
// block's mono face, with Copy; then the mark across a black screen,
// white with the words in the page's red, as the header inverted.

const BIB = BIBTEX.replace(
  "@inproceedings{sgs,",
  "@inproceedings{zhang2026balanced,",
);

export function Bibtex() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(BIB);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <section
      id="bibtex"
      aria-label="BibTeX"
      className="scroll-mt-[var(--bar)] pb-16 md:pb-24"
    >
      <h2 className="pz-head border-y border-black bg-white px-[var(--m)] pb-[0.08em] pt-[0.04em]">
        BibTeX
      </h2>
      <div className="px-[var(--m)] pt-6 md:pt-10">
        <div className="cb-bib">
          <pre>
            <code>{BIB}</code>
          </pre>
          <button type="button" className="cb-bib-copy pz-small" onClick={copy}>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </section>
  );
}

// `terms`: a line at the foot pointing to the Terms of Use, and the page's
// license link for machines (owner, 2026-10-09: "If you want to adapt this
// website, see Terms of Use").
export function EndMark({ terms = false }: { terms?: boolean }) {
  return (
    <section aria-label="SGS, Success-Guided Sampling" className="cb-end">
      <Mark
        inks={{ ...HEADER_INKS, ground: "#000", mark: "#fff", type: "#fff" }}
        measure="calc(100vw - 2 * var(--m))"
        cap="80svh"
      />
      {terms && (
        <>
          <link rel="license" href="/terms/" />
          <p className="cb-end-terms pz-small">
            If you want to adapt this website or use its videos, see the{" "}
            <a href="/terms/">Terms of Use</a>.
          </p>
        </>
      )}
    </section>
  );
}
