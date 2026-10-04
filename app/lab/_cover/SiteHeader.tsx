import { LINKS, SUBTITLE, TITLE } from "../content";
import Wordmark, { type WordmarkVariant } from "./Wordmark";

// Header cap: the mark is 0.7275em tall, and below it the title block needs
// about 13.5rem (title, padding) plus the 30px bar. On a short, wide screen
// (2560x1080) this keeps the whole header on the first screen; on phones,
// iPads and laptops the width limits the mark first and the cap never acts.
export const HEADER_CAP =
  "calc((100svh - var(--bar, 30px) - 13.5rem) / 0.7275)";

// The /lab/site header rebuilt on the new Wordmark, for comparison. When the
// cap acts, the mark stays flush left on the margin, like the title below
// it, and the space to its right stays empty.
export function SiteHeader({
  variant = "v3",
  color = "#ff6464",
}: {
  variant?: WordmarkVariant;
  color?: string;
}) {
  return (
    <header className="bg-white">
      <div className="px-[var(--m)] pt-[max(8px,1.2svh)]">
        <Wordmark variant={variant} color={color} cap={HEADER_CAP} />
      </div>
      <div className="pz-grid gap-y-5 pb-8 pt-4 md:pb-12">
        <h1 className="cv-lead col-span-6 md:col-span-8">
          {TITLE}:
          <br />
          {SUBTITLE}
        </h1>
        <div className="pz-small col-span-6 flex flex-col gap-3 md:col-span-4 md:pt-1">
          <p>
            {["1", "1", "1, 2", "2"].map((aff, i) => (
              <span key={i} className="inline-block whitespace-nowrap pr-3">
                Firstname Lastname<sup>{aff}</sup>
              </span>
            ))}
          </p>
          <p className="text-black/60">
            <span className="pr-3">
              <sup>1</sup>Affiliation
            </span>
            <span className="pr-3">
              <sup>2</sup>Affiliation
            </span>
          </p>
          <p className="flex gap-4">
            <a href={LINKS.paper} className="cv-link">
              Paper ↗
            </a>
            <a href={LINKS.code} className="cv-link">
              Code ↗
            </a>
          </p>
        </div>
      </div>
    </header>
  );
}

// The black footer of /lab/site with the mark in white.
export function SiteFooter({ variant = "v3" }: { variant?: WordmarkVariant }) {
  return (
    <footer className="bg-black pb-[var(--m)] pt-3 text-white">
      <div className="pz-grid pz-small gap-y-3 pb-10">
        <p className="col-span-6 md:col-span-6">
          {TITLE}: {SUBTITLE}
        </p>
        <p className="col-span-3 md:col-span-3">
          <a href={LINKS.paper} className="cv-link">
            Paper ↗
          </a>
          <br />
          <a href={LINKS.code} className="cv-link">
            Code ↗
          </a>
        </p>
        <p className="col-span-3 md:col-span-3">
          <a href="#top" className="cv-link">
            Top ↑
          </a>
        </p>
      </div>
      <div className="px-[var(--m)] pb-[var(--m)]">
        <Wordmark variant={variant} cap={HEADER_CAP} />
      </div>
    </footer>
  );
}
