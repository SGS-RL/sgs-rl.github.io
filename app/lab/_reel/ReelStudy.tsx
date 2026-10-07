import type { CSSProperties, ReactNode } from "react";
import {
  LINKS,
  SUBTITLE,
  TITLE,
  AFFILIATIONS,
  AUTHORS,
  ADVISING,
  EQUAL,
  VENUE,
} from "../content";
import Section from "../_components/Section";
import SwissHeader from "../_components/SwissHeader";
import "../_poster/poster.css";
import HighlightReel from "./HighlightReel";

const SUMMARY =
  "Success-Guided Sampling (SGS) allocates parallel simulation across task configurations by the policy’s current success rate. With it, reinforcement learning keeps improving up to one million parallel environments, for legged locomotion and contact-rich manipulation.";

export type Variant = "a" | "b" | "c";

export const VARIANTS: Record<Variant, { name: string; note: string }> = {
  a: {
    name: "A. Serious, chapter list",
    note: "Title, authors and links first. The reel below them, with the chapter list on the left as in the old hero.",
  },
  b: {
    name: "B. Serious, labelled timeline",
    note: "Same opening. No list: the chapters label the bar under the video, robots as bands.",
  },
  c: {
    name: "C. Playful, after the cover",
    note: "Poster style: the reel as its own band right after the cover, before the summary.",
  },
};

// ---------------------------------------------------------------- Serious

function SwissOpening({ v }: { v: Variant }) {
  return (
    <header id={`top-${v}`} className="sw-hero">
      <SwissHeader
        home={`#top-${v}`}
        nav={[
          ["Highlights", `#highlights-${v}`],
          ["Summary", `#summary-${v}`],
          ["Method", `#method-${v}`],
          ["Scaling", `#scaling-${v}`],
          ["Clips", `#clips-${v}`],
        ]}
      />
      <div className="sw-grid gap-y-5 pb-12 md:gap-y-6 md:pb-14">
        <h1 className="sw-display sw-hero-title col-span-full border-t border-sw-rule pt-3">
          A Balanced <br className="md:hidden" />
          Data Diet
        </h1>
        <p className="col-span-full text-xl font-medium leading-tight tracking-[-0.02em] md:col-span-4 md:text-2xl lg:col-span-3">
          {SUBTITLE}
        </p>
        <div className="col-span-full md:col-span-8 lg:col-span-6">
          <p className="text-base leading-snug md:text-lg">
            {AUTHORS.map(([name, aff], i) => (
              <span key={i} className="inline-block whitespace-nowrap pr-4">
                {name}
                <sup className="sw-num pl-px text-[0.6em]">{aff}</sup>
              </span>
            ))}
          </p>
          <p className="sw-label mt-2 text-sw-mute">
            {AFFILIATIONS.map((a, i) => (
              <span key={i} className="inline-block whitespace-nowrap pr-4">
                <sup>{i + 1}</sup>
                {a}
              </span>
            ))}
            <span className="inline-block whitespace-nowrap pr-4">{EQUAL}</span>
            <span className="inline-block whitespace-nowrap pr-4">
              {ADVISING}
            </span>
            <span className="inline-block whitespace-nowrap">{VENUE}</span>
          </p>
        </div>
        <p className="col-span-full flex gap-5 whitespace-nowrap text-base md:col-span-8 md:col-start-5 md:text-lg lg:col-span-3 lg:col-start-auto lg:justify-end">
          <a href={LINKS.paper} className="sw-link">
            Paper ↗
          </a>
          <a href={LINKS.code} className="sw-link">
            Code ↗
          </a>
          <a href={`#rest-${v}`} className="sw-link">
            Cite ↓
          </a>
        </p>
      </div>
    </header>
  );
}

// On laptops and wider, size the video so the whole reel (video, bar,
// controls, caption) fits on the first screen under the title block. The
// title's size is the --title of .sw-hero in lab.css.
const fit = (rem: number) =>
  `min(64svh, max(16rem, 100svh - ${rem}rem - 0.86 * min(8.4vw, 15svh)))`;

function SwissVariant({ v }: { v: "a" | "b" }) {
  return (
    <div className="swiss" data-theme="light">
      <SwissOpening v={v} />
      <section
        id={`highlights-${v}`}
        className="sw-grid scroll-mt-2 pb-24 md:pb-36"
      >
        <div className="col-span-full h-px bg-sw-rule" />
        <HighlightReel
          skin="swiss"
          layout={v === "a" ? "list" : "timeline"}
          maxHeight={fit(v === "a" ? 19.5 : 25)}
          className="pt-3"
        />
      </section>
      <Section id={`summary-${v}`} n="01" label="Summary">
        <p className="sw-lead col-span-full">{SUMMARY}</p>
      </Section>
      <div id={`rest-${v}`} className="sw-grid sw-label pb-16 text-sw-mute">
        <span id={`method-${v}`} />
        <span id={`scaling-${v}`} />
        <span id={`clips-${v}`} />
        <p className="col-span-full border-t border-sw-hair pt-3">
          The rest of the page (setup, method, scaling, clips) is on the full
          serious study.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Playful

function PzBar() {
  return (
    <div className="pz-grid pz-small sticky top-0 z-50 h-[var(--bar)] items-center bg-black text-white">
      <a href="#top-c" className="col-span-2 md:col-span-3">
        SGS
      </a>
      <nav className="col-span-6 hidden gap-4 md:flex">
        <a href="#highlights-c">Highlights</a>
        <a href="#summary-c">Summary</a>
        <a href="#summary-c">Method</a>
        <a href="#summary-c">Scaling</a>
        <a href="#summary-c">Clips</a>
      </nav>
      <div className="col-span-4 flex justify-end gap-4 md:col-span-3">
        <a href={LINKS.paper}>Paper</a>
        <a href={LINKS.code}>Code</a>
      </div>
    </div>
  );
}

function PzHeading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="pz-head scroll-mt-[var(--bar)] border-y border-black bg-white px-[var(--m)] pb-[0.08em] pt-[0.04em] text-black"
    >
      {children}
    </h2>
  );
}

const MINT = "#a3e4d7";

function PzVariant() {
  return (
    <div className="pz">
      <PzBar />
      {/* Placeholder: the cover is designed separately (/lab/cover/). It
          stops a little short of the fold so the next band shows. */}
      <div
        id="top-c"
        className="pz-poster"
        style={
          {
            "--ground": "#f3e21d",
            "--type": "#e8412b",
            height: "calc(100svh - var(--bar) - 2.75rem)",
            minHeight: "22rem",
          } as CSSProperties
        }
      >
        <div className="pz-grid h-full grid-rows-[auto_1fr] pb-[var(--m)] pt-2">
          <p className="pz-small col-span-full">
            Cover placeholder (designed on /lab/cover/)
          </p>
          <p className="pz-mid col-span-full self-end md:col-span-8">
            {TITLE}:
            <br />
            {SUBTITLE}
          </p>
        </div>
      </div>

      <PzHeading id="highlights-c">Highlights</PzHeading>
      <section style={{ background: MINT }} className="pb-8 pt-3 md:pb-12">
        <div className="pz-grid">
          <HighlightReel skin="pz" layout="list" heading={null} />
        </div>
      </section>

      <PzHeading id="summary-c">Summary</PzHeading>
      <section className="bg-[#f6ee1f] pb-16 text-[#111]">
        <div className="pz-grid gap-y-3 pt-3">
          <p className="pz-mid col-span-6 md:col-span-4">
            Success-Guided Sampling
          </p>
          <p className="pz-mid col-span-6 md:col-span-8">
            allocates parallel simulation across task configurations by the
            policy&apos;s current success rate. With it, reinforcement learning
            keeps improving up to one million parallel environments, for legged
            locomotion and contact-rich manipulation.
          </p>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------- Pages

export function ReelVariant({ v }: { v: Variant }) {
  return v === "c" ? <PzVariant /> : <SwissVariant v={v} />;
}

// All three, one after another, each under a plain study label.
export default function ReelStudy() {
  return (
    <div className="bg-[#1b1b1a]">
      {(["a", "b", "c"] as const).map((v) => (
        <div key={v} id={v}>
          <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-2.5 font-mono text-[12px] leading-snug text-white/70 md:px-10">
            <span className="text-white">{VARIANTS[v].name}</span>
            <span className="order-last basis-full md:order-none md:flex-1 md:basis-0">
              {VARIANTS[v].note}
            </span>
            <a href={`/lab/reel/${v}/`} className="text-white underline">
              Open alone
            </a>
          </p>
          <ReelVariant v={v} />
        </div>
      ))}
    </div>
  );
}
