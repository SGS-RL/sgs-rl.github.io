import type { CSSProperties, ReactNode } from "react";
import { LINKS, SUBTITLE, TITLE } from "../content";
import { ClipGallery, QuiltSeparator, RobotGrid } from "../_gallery";
import Cover from "../_cover/Cover";
import MethodPoster from "../_method/MethodPoster";
import HighlightReel from "../_reel/HighlightReel";
import ScaleCompare from "../_scaling/ScaleCompare";
import { P, vars } from "../_poster/palettes";
import "../_poster/poster.css";
import { FACTS } from "./facts";
import Manipulation from "./Manipulation";
import "./poster2.css";

const NAV: [string, string][] = [
  ["Highlights", "#highlights"],
  ["Summary", "#summary"],
  ["Method", "#method"],
  ["Scaling", "#scaling"],
  ["Manipulation", "#manipulation"],
  ["Clips", "#clips"],
];

// The reel's band: NOF's silver (La Voix humaine), one neutral ink so the
// footage carries the colour. Mint is the Method's ground.
const REEL = { ground: "#b0b5bb", type: "#111111" };

function TopBar() {
  return (
    <div className="pz-grid pz-small sticky top-0 z-50 h-[var(--bar)] items-center bg-black text-white">
      <a href="#top" className="col-span-2">
        SGS
      </a>
      <nav className="col-span-7 hidden gap-4 md:flex">
        {NAV.map(([l, h]) => (
          <a key={h} href={h}>
            {l}
          </a>
        ))}
      </nav>
      <div className="col-span-4 flex justify-end gap-4 md:col-span-3">
        <a href={LINKS.paper}>Paper</a>
        <a href={LINKS.code}>Code</a>
      </div>
    </div>
  );
}

// White heading band between rules, as on the NOF website.
function Heading({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="pz-head scroll-mt-[var(--bar)] border-y border-black bg-white px-[var(--m)] pb-[0.08em] pt-[0.04em] text-black"
    >
      {children}
    </h2>
  );
}

// Two columns of small type under a band's title row, as on /lab/poster.
function Intro({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="pz-grid pz-small gap-y-3 pb-6">
      <p className="col-span-3 md:col-span-3">{label}</p>
      <p className="col-span-3 max-w-[64ch] md:col-span-5">{children}</p>
    </div>
  );
}

export default function PosterPage2() {
  return (
    <ClipGallery skin="pz">
      <div className="pz">
        <TopBar />

        {/* 1. Cover: a static poster (no video), yellow, red and ochre,
            the full title and SGS with words in its counters. */}
        <Cover variant="c1" id="top" />

        {/* 2. The reel right after the cover: the cover has no footage now,
            so this is the first moving image, one screen in. */}
        <Heading id="highlights">Highlights</Heading>
        <section
          className="pb-8 pt-3 md:pb-12"
          style={{ background: REEL.ground, color: REEL.type }}
        >
          <div className="pz-grid">
            <HighlightReel
              skin="pz"
              layout="list"
              heading={null}
              ink={REEL.type}
              maxHeight="min(64svh, 52rem)"
            />
          </div>
        </section>

        {/* 3. Summary, as loved; the facts are a draft to curate. */}
        <Heading id="summary">Summary</Heading>
        <section className="pz-poster pb-10" style={vars(P.listing)}>
          <div className="pz-grid gap-y-3 pb-10 pt-3">
            <p className="pz-mid col-span-6 md:col-span-4">
              Success-Guided Sampling
            </p>
            <p className="pz-mid col-span-6 md:col-span-8">
              allocates parallel simulation across task configurations by the
              policy&apos;s current success rate. With it, reinforcement
              learning keeps improving up to one million parallel environments,
              for legged locomotion and contact-rich manipulation.
            </p>
          </div>
          <div className="pz-grid pz-small pb-2">
            <p className="col-span-2 md:col-span-4">Facts</p>
            <p className="col-span-4 md:col-span-8">
              Draft: candidate rows from the method and setup, to be curated.
            </p>
          </div>
          <dl className="pz-small">
            {FACTS.map(([k, v, n]) => (
              <div
                key={k}
                className="pz-grid gap-y-0.5 border-t border-black py-1.5"
              >
                <dt className="col-span-2 md:col-span-4">{k}</dt>
                <dd className="col-span-4 md:col-span-4">{v}</dd>
                <dd className="col-span-4 col-start-3 opacity-70 md:col-span-4 md:col-start-auto md:opacity-100">
                  {n}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 4. Method: the paper-accurate poster method (own heading band). */}
        <MethodPoster id="method" />

        {/* 5. Scaling, full-page pink. */}
        <Heading id="scaling">Scaling</Heading>
        <section className="pz-poster pb-12 pt-3" style={vars(P.scaling)}>
          <Intro label="Success rate by parallel environments">
            Success rate from 0 to 1 against parallel environments, 4K to 1M on
            a log scale; prior methods were run up to about 64K. Pick a scale to
            play one clip per method at that scale, side by side. The clips are
            placeholders.
          </Intro>
          <div className="px-[var(--m)]">
            <ScaleCompare skin="poster" poster={P.scaling} />
          </div>
        </section>

        {/* 6. Manipulation: the loved title, then the footage unaltered. */}
        <Heading id="manipulation">Manipulation</Heading>
        <Manipulation />

        {/* 7. Index: the quilt turns into the real clips as it scrolls up,
            then every clip by robot. */}
        <div
          id="clips"
          className="scroll-mt-[var(--bar)] border-t border-black"
        >
          <QuiltSeparator direction="toReal" />
        </div>
        <Heading>Clips</Heading>
        <section className="bg-white px-[var(--m)] pb-20 pt-6 md:pb-28 md:pt-10">
          <RobotGrid skin="pz" />
        </section>

        {/* 8. Footer with the big mark. */}
        <footer className="bg-black pb-[var(--m)] pt-3 text-white">
          <div className="pz-grid pz-small gap-y-3 pb-10">
            <p className="col-span-6 md:col-span-6">
              {TITLE}: {SUBTITLE}
            </p>
            <p className="col-span-3 md:col-span-3">
              <a href={LINKS.paper} className="pz-u">
                Paper
              </a>
              <br />
              <a href={LINKS.code} className="pz-u">
                Code
              </a>
            </p>
            <p className="col-span-3 md:col-span-3">
              Lab study, not linked
              <br />
              from the main site
            </p>
          </div>
          <span
            className="pz-mark px-[var(--m)]"
            style={{ "--mark-cap": "90svh" } as CSSProperties}
            aria-hidden="true"
          >
            SGS
          </span>
        </footer>
      </div>
    </ClipGallery>
  );
}
