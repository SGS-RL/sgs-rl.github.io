import type { CSSProperties, ReactNode } from "react";
import { LINKS, SUBTITLE, TITLE } from "../content";
import { LIBRARY } from "../library";
import Cover from "../_cover/Cover";
import MethodPoster from "../_method/MethodPoster";
import { P, vars } from "../_poster/palettes";
import "../_poster/poster.css";
import ClipIndex from "./ClipIndex";
import { FACTS } from "./facts";
import Gallery from "./Gallery";
import { INK } from "./inks";
import Locomotion from "./Locomotion";
import Manipulation from "./Manipulation";
import Quilt from "./Quilt";
import Reel3 from "./Reel3";
import Runs from "./Runs";
import Scaling from "./Scaling";
import "./poster3.css";

const NAV: [string, string][] = [
  ["Highlights", "#highlights"],
  ["Summary", "#summary"],
  ["Method", "#method"],
  ["Scaling", "#scaling"],
  ["Manipulation", "#manipulation"],
  ["Locomotion", "#locomotion"],
  ["Runs", "#runs"],
  ["Clips", "#clips"],
];

// The quilt shows 16:9 clips only: a square cell would crop one of the two
// runs in a 32:9 simulation pair.
const QUILT = LIBRARY.filter((c) => c.kind === "clip");

function TopBar() {
  return (
    <div className="pz-grid pz-small sticky top-0 z-50 h-[var(--bar)] items-center bg-black text-white">
      <a href="#top" className="col-span-2 lg:col-span-1">
        SGS
      </a>
      <nav className="hidden gap-4 lg:col-span-9 lg:flex">
        {NAV.map(([l, h]) => (
          <a key={h} href={h}>
            {l}
          </a>
        ))}
      </nav>
      <div className="col-span-4 flex justify-end gap-4 md:col-span-10 lg:col-span-2">
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

// Two columns of small type under a band's title row.
function Intro({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="pz-grid pz-small gap-y-3 pb-6">
      <p className="col-span-3 md:col-span-3">{label}</p>
      <p className="col-span-3 max-w-[64ch] md:col-span-5">{children}</p>
    </div>
  );
}

export default function PosterPage3() {
  return (
    <Gallery clips={LIBRARY}>
      <div className="pz">
        <TopBar />

        {/* 1. Cover: the static poster from round 2, unchanged. */}
        <Cover variant="c1" id="top" />

        {/* 2. The reel right after the cover, now the owner's mock cut:
            hardware first, then simulation; speed on every chapter. */}
        <Heading id="highlights">Highlights</Heading>
        <section
          className="pb-8 pt-3 md:pb-12"
          style={{ background: INK.reel.ground, color: INK.reel.type }}
        >
          <div className="pz-grid">
            <Reel3 ink={INK.reel.type} />
          </div>
        </section>

        {/* 3. Summary, as loved; the facts now start from the footage. */}
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
              Draft, to be curated: what the footage shows, then the method and
              the training setup.
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

        {/* 5. Scaling, full-page pink: the plots alone until the clips per
            method and scale are recorded. */}
        <Heading id="scaling">Scaling</Heading>
        <section className="pz-poster pb-12 pt-3" style={vars(P.scaling)}>
          <Intro label="Success rate by parallel environments">
            Success rate from 0 to 1 against parallel environments, 4K to 1M on
            a log scale; prior methods were run up to about 64K. Pick a point to
            read its value. Clips of each method at each scale will sit here
            once recorded.
          </Intro>
          <div className="px-[var(--m)]">
            <Scaling />
          </div>
        </section>

        {/* 6. Manipulation: the loved title, then the footage unaltered. */}
        <Heading id="manipulation">Manipulation</Heading>
        <Manipulation />

        {/* 7. Locomotion: ANYmal D on twelve terrains, unaltered. */}
        <Heading id="locomotion">Locomotion</Heading>
        <Locomotion />

        {/* 8. Continuous runs: shown in full, only on request. */}
        <Heading id="runs">Runs</Heading>
        <Runs />

        {/* 9. Index: the quilt turns into the real clips as it scrolls up,
            then every clip as a list. */}
        <div
          id="clips"
          className="scroll-mt-[var(--bar)] border-t border-black"
        >
          <Quilt clips={QUILT} direction="toReal" />
        </div>
        <Heading>Clips</Heading>
        <section className="bg-white px-[var(--m)] pb-20 pt-6 md:pb-28 md:pt-10">
          <ClipIndex />
        </section>

        {/* 10. Footer with the big mark. */}
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
    </Gallery>
  );
}
