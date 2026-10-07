import { HEADER_CAP } from "../_cover/SiteHeader";
import {
  ADVISING,
  EQUAL,
  FULL_SUBTITLE,
  LINKS,
  TITLE,
  VENUE,
} from "../content";
import { AFFILIATIONS, AUTHORS } from "./content";
import { HEADER_INKS, type Inks } from "./inks";
import Wordmark from "./Wordmark";

// The header of /lab/site-2 and /lab/site-3: the wordmark ("Success",
// "Guided", "Sampling" set inside the letters and stepping down) across the
// measure, then the title (8 columns) and the authors, affiliations and
// links (4 columns). HEADER_CAP keeps it all on the first screen of a short,
// wide screen. Changed here: the paper's full title, which copies as one
// line (the break after the colon is drawn by CSS, so it is not copied),
// Ignacio's affiliation, and Guided centred in the G. A "Copy title"
// button was tried and dropped (owner, 2026-10-06).
// Its parts (Mark, Title, Meta) are exported for the layouts compared on
// /lab/highlights/.

// Browsers may break a line after the hyphen in "Mega-Scale"; keep it whole.
const [pre, post] = FULL_SUBTITLE.split("Mega-Scale");

// measure: the width the mark spans (default: the page measure); cap: the
// upper limit of its font-size (it is 0.7275em tall).
export function Mark({
  inks = HEADER_INKS,
  measure,
  cap = HEADER_CAP,
}: {
  inks?: Inks;
  measure?: string;
  cap?: string;
}) {
  return (
    <Wordmark
      color={inks.mark}
      words={inks.words}
      measure={measure}
      cap={cap}
    />
  );
}

export function Title({ className = "st-lead" }: { className?: string }) {
  return (
    <h1 className={`cb-hd-title ${className}`}>
      <span className="cb-hd-break">{TITLE}:&nbsp;</span>
      {pre}
      <span className="whitespace-nowrap">Mega-Scale</span>
      {post}
    </h1>
  );
}

// Authors, affiliations, venue and links.
export function Meta({
  inks = HEADER_INKS,
  className = "",
}: {
  inks?: Inks;
  className?: string;
}) {
  return (
    <div className={`cb-hd-meta pz-small flex flex-col gap-3 ${className}`}>
      <p>
        {AUTHORS.map(([name, aff], i) => (
          <span key={i} className="inline-block whitespace-nowrap pr-3">
            {name}
            <sup>{aff}</sup>
          </span>
        ))}
      </p>
      <p style={{ color: inks.mute }}>
        {AFFILIATIONS.map((a, i) => (
          <span key={i} className="inline-block whitespace-nowrap pr-3">
            <sup>{i + 1}</sup>
            {a}
          </span>
        ))}
        <span className="inline-block whitespace-nowrap pr-3">{EQUAL}</span>
        <span className="inline-block whitespace-nowrap pr-3">{ADVISING}</span>
      </p>
      <p className="flex flex-wrap gap-x-4">
        <span>{VENUE}</span>
        <a href={LINKS.paper} className="st-link">
          Paper ↗
        </a>
        <a href={LINKS.code} className="st-link">
          Code ↗
        </a>
      </p>
    </div>
  );
}

// inks: the colour scheme (see ./inks.ts; /lab/header-colors/ compares
// several). id: "top" on the page, the scheme's id on the comparison.
export default function Header({
  inks = HEADER_INKS,
  id = "top",
}: {
  inks?: Inks;
  id?: string;
}) {
  return (
    <header
      id={id}
      className="cb-hd"
      style={{ background: inks.ground, color: inks.type }}
    >
      <div className="cb-hd-mark">
        <Mark inks={inks} />
      </div>
      <div className="cb-hd-info pz-grid gap-y-5 pb-8 pt-4 md:pb-12">
        <Title className="st-lead col-span-6 md:col-span-8" />
        <Meta inks={inks} className="col-span-6 md:col-span-4 md:pt-1" />
      </div>
    </header>
  );
}
