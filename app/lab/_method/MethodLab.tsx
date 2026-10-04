import type { ReactNode } from "react";
import "../_poster/poster.css";
import "../_site/site.css";
import MethodPoster from "./MethodPoster";
import MethodSite from "./MethodSite";
import MethodSwiss from "./MethodSwiss";

const VARIANTS: [string, string, string][] = [
  ["a", "A", "Site"],
  ["b", "B", "Poster"],
  ["c", "C", "Swiss"],
];

function Label({
  id,
  letter,
  title,
  children,
}: {
  id: string;
  letter: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <header
      id={id}
      className="scroll-mt-[var(--bar)] bg-black pb-6 pt-10 text-white"
    >
      <div className="pz-grid gap-y-3">
        <p className="pz-mid col-span-6 md:col-span-4">
          <span className="pz-num mr-3">{letter}</span>
          {title}
        </p>
        <p className="pz-small col-span-6 max-w-[60ch] md:col-span-6 md:pt-2">
          {children}
        </p>
      </div>
    </header>
  );
}

/** /lab/method: three takes on the Method section, one after another. */
export default function MethodLab() {
  return (
    <div className="pz st">
      <nav className="pz-grid pz-small sticky top-0 z-50 h-[var(--bar)] items-center bg-black text-white">
        <a href="#top" className="col-span-3 md:col-span-4">
          SGS lab: Method
        </a>
        <span className="col-span-3 flex justify-end gap-4 md:col-span-8">
          {VARIANTS.map(([id, l, t]) => (
            <a key={id} href={`#${id}`} className="st-link">
              {l} {t}
            </a>
          ))}
        </span>
      </nav>
      <div id="top" />

      <Label id="a" letter="A" title="Site style">
        The Method section of /lab/site, rebuilt: lead, four steps, a live
        figure that runs the paper&apos;s loop, and a setup table per task.
      </Label>
      <MethodSite id="method-a" />

      <Label id="b" letter="B" title="Poster">
        Method as a full-colour poster in its three inks. The successor of the
        dot raster on /lab/poster: the same labels, now following one
        environment through the loop, and the kernel drawn large.
      </Label>
      <MethodPoster id="method-b" />

      <Label id="c" letter="C" title="Swiss, light">
        Setup and Method for /lab/swiss: four numbered parts, each a few
        sentences and a small live figure, and an interactive kernel.
      </Label>
      <div className="swiss" data-theme="light">
        <MethodSwiss />
      </div>
    </div>
  );
}
