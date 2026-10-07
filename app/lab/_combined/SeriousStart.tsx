import type { ReactNode } from "react";
import "../_poster/poster.css";
import "../_site/site.css";
import Gallery from "../_site3/Gallery";
import {
  ADVISING,
  EQUAL,
  FULL_SUBTITLE,
  LINKS,
  TITLE,
  VENUE,
} from "../content";
import { AFFILIATIONS, AUTHORS } from "./content";
import { REEL } from "./Opening";
import Overview, { OVERVIEW_CLIPS } from "./Overview";
import QuietReel from "./Reel";
import { STANDIN_REEL } from "../library";
import "./combined.css";

// /lab/serious-start: a page that starts serious and turns colourful as it
// goes down (owner, 2026-10-06). The top is the Swiss system the owner
// loved in /lab/swiss (paper, heavy black display type, hairline rules,
// small labels, one red accent); no wordmark, but each opening (O1–O4)
// says "SGS" another way, since the title does not. Then, the same for
// all four: the highlight reel, the summary, and the colourful Overview
// of Site 3, where the bands of colour begin.

const RED = "text-[var(--sw-accent)]";

// Browsers may break a line after the hyphen in "Mega-Scale"; keep it whole.
const [pre, post] = FULL_SUBTITLE.split("Mega-Scale");
const Subtitle = () => (
  <>
    {pre}
    <span className="whitespace-nowrap">Mega-Scale</span>
    {post}
  </>
);

// The full title. "lead": one block at the lead size. "display": "A
// Balanced Data Diet:" at display size over the subtitle at the lead size.
// Either way it copies as one line (the break is drawn by CSS).
function SwissTitle({
  size,
  className = "",
}: {
  size: "lead" | "display";
  className?: string;
}) {
  return size === "lead" ? (
    <h1 className={`cb-ss-lead ${className}`}>
      <span className="cb-hd-break">{TITLE}:&nbsp;</span>
      <Subtitle />
    </h1>
  ) : (
    <h1 className={`cb-ss-lead ${className}`}>
      <span className="cb-hd-break cb-ss-display">{TITLE}:&nbsp;</span>
      <Subtitle />
    </h1>
  );
}

// Authors, affiliations, venue and links, as in /lab/swiss-3.
function SwissMeta({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <p className="text-base leading-snug md:text-lg">
        {AUTHORS.map(([name, aff], i) => (
          <span key={i} className="inline-block whitespace-nowrap pr-4">
            {name}
            <sup className="sw-num pl-px text-[0.6em]">{aff}</sup>
          </span>
        ))}
      </p>
      <p className="sw-label text-sw-mute">
        {AFFILIATIONS.map((a, i) => (
          <span key={i} className="inline-block whitespace-nowrap pr-4">
            <sup>{i + 1}</sup>
            {a}
          </span>
        ))}
        <span className="inline-block whitespace-nowrap pr-4">{EQUAL}</span>
        <span className="inline-block whitespace-nowrap pr-4">{ADVISING}</span>
        <span className="inline-block whitespace-nowrap">{VENUE}</span>
      </p>
      <p className="mt-2 flex flex-wrap gap-x-5 text-base md:text-lg">
        <a href={LINKS.paper} className="sw-link">
          Paper ↗
        </a>
        <a href={LINKS.code} className="sw-link">
          Code ↗
        </a>
      </p>
    </div>
  );
}

// A still copy of the Swiss bar: SGS and the name, the sections, links.
function SwissBar() {
  return (
    <div className="cb-ss-bar sw-grid items-center">
      <p className="col-span-3 flex items-baseline gap-2 md:col-span-4">
        <span className="font-semibold">SGS</span>
        <span className="sw-label text-sw-mute">Success-Guided Sampling</span>
      </p>
      <p className="sw-label hidden gap-5 text-sw-mute md:col-span-6 md:flex">
        <span>Highlights</span>
        <span>Summary</span>
        <span>Overview</span>
      </p>
      <p className="sw-label col-span-1 justify-self-end md:col-span-2">
        <span className="md:hidden">Menu</span>
        <span className="hidden gap-4 md:flex">
          <span>Paper ↗</span>
          <span>Code ↗</span>
        </span>
      </p>
    </div>
  );
}

// ---- The four openings -------------------------------------------------

// O1: the method's name at display size, its initials in red; the paper
// title under it at the lead size.
function Initials() {
  return (
    <header className="sw-grid gap-y-6 pb-12 pt-4 md:pb-16">
      <p className="cb-ss-name col-span-full">
        <span className={RED}>S</span>uccess-
        <span className={RED}>G</span>uided <span className={RED}>S</span>
        ampling
      </p>
      <SwissTitle size="lead" className="col-span-full md:col-span-9" />
      <SwissMeta className="col-span-full md:col-span-9" />
    </header>
  );
}

// O2: an acrostic. Large red S, G, S down the left, each word beside its
// letter; the title and authors to the right (under it on phones).
function Acrostic() {
  const rows: [string, string][] = [
    ["S", "Success-"],
    ["G", "Guided"],
    ["S", "Sampling"],
  ];
  return (
    <header className="sw-grid gap-y-8 pb-12 pt-4 md:pb-16">
      <div className="col-span-full flex flex-col md:col-span-5">
        {rows.map(([letter, word], i) => (
          <p key={i} className="cb-ss-acro">
            <span className={`cb-ss-acro-letter ${RED}`} aria-hidden="true">
              {letter}
            </span>
            <span className="cb-ss-acro-word">{word}</span>
          </p>
        ))}
      </div>
      <div className="col-span-full flex flex-col gap-8 md:col-span-7 md:pt-3">
        <SwissTitle size="lead" />
        <SwissMeta />
      </div>
    </header>
  );
}

// O3: a red tag with SGS and the name beside it, then the title as in the
// Swiss study, "A Balanced Data Diet" at display size.
function Label() {
  return (
    <header className="sw-grid gap-y-6 pb-12 pt-6 md:pb-16">
      <p className="cb-ss-tagline col-span-full flex items-center gap-3">
        <span className="cb-ss-tag">SGS</span>
        <span>Success-Guided Sampling</span>
      </p>
      <SwissTitle size="display" className="col-span-full" />
      <SwissMeta className="col-span-full md:col-span-9" />
    </header>
  );
}

// O4: plain letters. SGS in the Swiss display type, no inset words, the
// name beside it; the title under them at the lead size.
function Letters() {
  return (
    <header className="sw-grid gap-y-6 pb-12 pt-4 md:pb-16">
      <p className="col-span-full flex flex-wrap items-baseline gap-x-6 gap-y-1">
        <span className="cb-ss-letters">SGS</span>
        <span className="cb-ss-lead text-sw-mute">Success-Guided Sampling</span>
      </p>
      <SwissTitle size="lead" className="col-span-full md:col-span-9" />
      <SwissMeta className="col-span-full md:col-span-9" />
    </header>
  );
}

// ---- What follows every opening ----------------------------------------

// A Swiss section: rule, small label on the left, content on columns 4–12.
function SwissSection({
  label,
  children,
  wide = false,
}: {
  label: string;
  children?: ReactNode;
  wide?: boolean;
}) {
  return (
    <section className="sw-grid gap-y-4 pb-16 md:pb-24">
      <div className="col-span-full h-px bg-sw-rule" />
      <h2 className="sw-label col-span-full font-medium md:col-span-3">
        {label}
      </h2>
      {children && (
        <div
          className={
            wide ? "col-span-full" : "col-span-full md:col-span-9 md:pt-0"
          }
        >
          {children}
        </div>
      )}
    </section>
  );
}

function Rest({ id }: { id: string }) {
  return (
    <>
      <SwissSection label="Highlights">
        <QuietReel reel={REEL} controls="under" maxH="calc(100svh - 10rem)" />
      </SwissSection>
      <SwissSection label="Summary">
        <p className="sw-lead">
          Success-Guided Sampling (SGS) spends parallel simulation on the task
          configurations a policy solves only some of the time. With it,
          reinforcement learning keeps improving up to one million parallel
          environments, in legged locomotion and contact-rich manipulation.
        </p>
      </SwissSection>
      <div className="cb-ss-colour pz st">
        <Overview id={`${id}-overview`} stick="top-0" />
      </div>
    </>
  );
}

const OPENINGS: [string, string, string, () => ReactNode][] = [
  [
    "o1",
    "Initials",
    "The method's name at display size, S, G and S in red; the paper title under it.",
    Initials,
  ],
  [
    "o2",
    "Acrostic",
    "Large red S, G, S down the left, each word beside its letter; title and authors to the right.",
    Acrostic,
  ],
  [
    "o3",
    "Label",
    "A red SGS tag and the name, then the title in the Swiss display type.",
    Label,
  ],
  [
    "o4",
    "Plain letters",
    "SGS in the Swiss display type, no inset words, the name beside it; the title under them.",
    Letters,
  ],
];

export default function SeriousStart() {
  return (
    <div className="swiss cb">
      <Gallery clips={OVERVIEW_CLIPS}>
        <p className="sw-grid sw-label bg-white py-3">
          <span className="col-span-full md:col-span-9">
            Four serious openings, each followed by the same reel, summary and
            colourful Overview.
            {REEL === STANDIN_REEL &&
              " The reel and the manipulation clips are stand-ins; the hardware clips are missing."}
          </span>
        </p>
        {OPENINGS.map(([id, name, note, Opening]) => (
          <section key={id} className="border-b-[24px] border-black">
            <p className="sw-grid sw-label bg-white py-2">
              <span className="col-span-1">{id.toUpperCase()}</span>
              <span className="col-span-3 md:col-span-11">
                {name} <span className="text-sw-mute">· {note}</span>
              </span>
            </p>
            <div data-variant={id} className="bg-[var(--sw-bg)]">
              <SwissBar />
              <Opening />
              <Rest id={id} />
            </div>
          </section>
        ))}
      </Gallery>
    </div>
  );
}
