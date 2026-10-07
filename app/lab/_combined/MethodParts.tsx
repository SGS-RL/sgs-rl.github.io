import type { ReactNode } from "react";
import BetaExplorer from "./BetaExplorer";
import { ConfigurationText, ExplainerLink, ToyExampleText } from "./Method";
import MethodMaze from "./MethodMaze";
import PinnedBand from "./PinnedBand";

// The Method split into three parts with their own subtitles, still under
// the one Method heading (owner, 2026-10-07: "split up the method section
// into different subtitles, but like show they are still within
// methods"). The text and figures are the approved Method's
// (./Method.tsx), regrouped: 1 what a task configuration is, 2 the toy
// example (the live maze), 3 the weighting (the Beta explorer). Four ways
// to set the subtitles, compared on /lab/method-parts/:
//   rules   a hairline and a small numbered label per part
//   path    "Method / A toy example" at the entry size, on a hairline
//   bands   smaller white bands under the Method band, "Method" beside
//           each part's name
//   pinned  as rules, and the Method band stays at the top while its
//           parts scroll by, naming the part on screen

export type PartsStyle = "rules" | "path" | "bands" | "pinned";

export const PARTS: [slug: string, title: string][] = [
  ["configurations", "Task configurations"],
  ["toy-example", "A toy example"],
  ["weighting", "The weighting"],
];

export function PartHead({
  n,
  title,
  style,
}: {
  n: number;
  title: string;
  style: PartsStyle;
}) {
  if (style === "path")
    return (
      <h3 className="cb-part-path st-entry">
        <span className="cb-part-dim">Method /</span> {title}
      </h3>
    );
  if (style === "bands")
    return (
      <h3 className="cb-part-band">
        <span className="cb-part-kicker pz-small">Method</span>
        <span className="pz-mid">{title}</span>
      </h3>
    );
  return (
    <h3 className="cb-part-rule">
      <span className="pz-num">{n}</span>
      <span>{title}</span>
    </h3>
  );
}

export function Part({
  id,
  n,
  title,
  style,
  children,
}: {
  id: string;
  n: number;
  title: string;
  style: PartsStyle;
  children: ReactNode;
}) {
  return (
    <div
      id={id}
      data-part={title}
      className="cb-part scroll-mt-[calc(var(--bar)+6rem)]"
    >
      <PartHead n={n} title={title} style={style} />
      <div className={style === "bands" ? "cb-part-in-band" : "cb-part-in"}>
        {children}
      </div>
    </div>
  );
}

export default function MethodParts({
  id = "method",
  style,
  stick = "top-[var(--bar)]",
}: {
  id?: string;
  style: PartsStyle;
  // Where the pinned band sticks: under the page's bar, or "top-0" on a
  // study page without one.
  stick?: string;
}) {
  const part = (i: number) => `${id}-${PARTS[i][0]}`;
  return (
    <section
      id={id}
      aria-label="Method"
      data-parts={style}
      className="cb-method scroll-mt-[var(--bar)] pb-16 md:pb-24"
    >
      {style === "pinned" ? (
        <PinnedBand section={id} stick={stick} />
      ) : (
        <h2 className="pz-head border-y border-black bg-white px-[var(--m)] pb-[0.08em] pt-[0.04em]">
          Method
        </h2>
      )}
      <div
        className={
          style === "bands" ? "cb-method-body cb-parts-bands" : "cb-method-body"
        }
      >
        <Part id={part(0)} n={1} title={PARTS[0][1]} style={style}>
          <div className="cb-part-lead">
            <ConfigurationText />
          </div>
        </Part>
        <Part id={part(1)} n={2} title={PARTS[1][1]} style={style}>
          <div className="cb-method-row">
            <div className="cb-maze">
              <MethodMaze />
            </div>
            <div className="cb-reading">
              <ToyExampleText />
              <ExplainerLink />
            </div>
          </div>
        </Part>
        <Part id={part(2)} n={3} title={PARTS[2][1]} style={style}>
          <BetaExplorer />
        </Part>
      </div>
    </section>
  );
}
