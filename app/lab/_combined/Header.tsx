import { HEADER_CAP } from "../_cover/SiteHeader";
import Wordmark from "../_cover/Wordmark";
import {
  AFFILIATIONS,
  AUTHORS,
  EQUAL,
  LINKS,
  SUBTITLE,
  TITLE,
  VENUE,
} from "../content";

// The header of /lab/site-2 and /lab/site-3: the V6 wordmark ("Success",
// "Guided", "Sampling" hug the strokes and step down diagonally) across the
// measure, then the title (8 columns) and the authors, affiliations and
// links (4 columns). HEADER_CAP keeps it all on the first screen of a short,
// wide screen.
export default function Header() {
  return (
    <header id="top" className="cb-hd bg-white">
      <div className="cb-hd-mark">
        <Wordmark variant="v6" color="#ff6464" cap={HEADER_CAP} />
      </div>
      <div className="cb-hd-info pz-grid gap-y-5 pb-8 pt-4 md:pb-12">
        <h1 className="cb-hd-title st-lead col-span-6 md:col-span-8">
          {TITLE}:
          <br />
          {SUBTITLE}
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
          <p className="text-black/60">
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
          </p>
        </div>
      </div>
    </header>
  );
}
