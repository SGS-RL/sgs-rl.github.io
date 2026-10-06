import { HEADER_CAP } from "../_cover/SiteHeader";
import { EQUAL, FULL_SUBTITLE, LINKS, TITLE, VENUE } from "../content";
import { AFFILIATIONS, AUTHORS } from "./content";
import CopyTitle from "./CopyTitle";
import { HEADER_INKS, type Inks } from "./inks";
import Wordmark from "./Wordmark";

// The header of /lab/site-2 and /lab/site-3: the wordmark ("Success",
// "Guided", "Sampling" set inside the letters and stepping down) across the
// measure, then the title (8 columns) and the authors, affiliations and
// links (4 columns). HEADER_CAP keeps it all on the first screen of a short,
// wide screen. Changed here: the paper's full title, which copies as one
// line (the break after the colon is drawn by CSS, so it is not copied),
// a "Copy title" button, Ignacio's affiliation, and Guided centred in the G.
// Browsers may break a line after the hyphen in "Mega-Scale"; keep it whole.
const [pre, post] = FULL_SUBTITLE.split("Mega-Scale");

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
        <Wordmark color={inks.mark} words={inks.words} cap={HEADER_CAP} />
      </div>
      <div className="cb-hd-info pz-grid gap-y-5 pb-8 pt-4 md:pb-12">
        <h1 className="cb-hd-title st-lead col-span-6 md:col-span-8">
          <span className="cb-hd-break">{TITLE}:&nbsp;</span>
          {pre}
          <span className="whitespace-nowrap">Mega-Scale</span>
          {post}
        </h1>
        <div className="cb-hd-meta pz-small col-span-6 flex flex-col gap-3 md:col-span-4 md:pt-1">
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
          </p>
          <p className="flex flex-wrap gap-x-4">
            <span>{VENUE}</span>
            <a href={LINKS.paper} className="st-link">
              Paper ↗
            </a>
            <a href={LINKS.code} className="st-link">
              Code ↗
            </a>
            <CopyTitle />
          </p>
        </div>
      </div>
    </header>
  );
}
