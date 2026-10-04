import type { CSSProperties, ReactNode } from "react";
import {
  CLIPS,
  LINKS,
  SUBTITLE,
  TITLE,
  AFFILIATIONS,
  AUTHORS,
  EQUAL,
  BIBTEX,
} from "../content";
import { ClipGallery } from "../_gallery";
import MethodSite from "../_method/MethodSite";
import ScaleCompare from "../_scaling/ScaleCompare";
import "../_poster/poster.css";
import CopyBlock from "../_site/CopyBlock";
import SiteNav from "../_site/SiteNav";
import "../_site/site.css";
import ClipIndex from "./ClipIndex";
import { FooterMark, HeaderMark } from "./Mark";
import Stills, { type Still } from "./Stills";
import "./site2.css";

const count = (cat: string) => CLIPS.filter((c) => c.category === cat).length;

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-[var(--bar)]">
      <h2 className="st-head sticky top-[var(--bar)] z-40 border-y border-black bg-white px-[var(--m)] text-black">
        {title}
      </h2>
      {children}
    </section>
  );
}

// One listing entry, as a production on the NOF site: a colour band with
// three columns of text (name, the facts, a plain description) and a row
// of stills.
function Entry({
  color,
  ink,
  title,
  facts,
  children,
  stills,
}: {
  color: string;
  ink: string;
  title: string;
  facts: ReactNode;
  children: ReactNode;
  stills?: Still[];
}) {
  return (
    <article
      className="border-t border-black text-black"
      style={{ background: color }}
    >
      <div className="pz-grid gap-y-2 pb-5 pt-1.5">
        <h3 className="st-entry col-span-6 md:col-span-4">{title}</h3>
        <p className="st-entry col-span-6 md:col-span-4">{facts}</p>
        <div className="pz-small col-span-6 flex max-w-[46ch] flex-col gap-2 md:col-span-4">
          {children}
        </div>
      </div>
      {stills && <Stills stills={stills} ink={ink} />}
    </article>
  );
}

const LOCO: Still[] = [
  { id: "loco-02", caption: "Stairs", focus: [0.42, 0.6] },
  { id: "loco-06", caption: "Platforms", focus: [0.36, 0.62] },
  { id: "loco-10", caption: "Lattice", focus: [0.45, 0.55] },
];
const MANIP: Still[] = [
  { id: "manip-01", caption: "Taskboard, simulation", focus: [0.55, 0.5] },
  { id: "manip-02", caption: "Taskboard, close", focus: [0.45, 0.5] },
  { id: "real-01", caption: "Block insertion, hardware, 3×", raw: true },
];

export default function Site2Page() {
  return (
    <div className="pz st s2">
      <ClipGallery skin="pz">
        <SiteNav />

        <header id="top" className="s2-hd bg-white">
          <div className="s2-hd-mark">
            <HeaderMark />
          </div>
          <div className="s2-hd-info pz-grid gap-y-5 pb-8 pt-4 md:pb-12">
            <h1 className="s2-hd-title st-lead col-span-6 md:col-span-8">
              {TITLE}:
              <br />
              {SUBTITLE}
            </h1>
            <div className="s2-hd-meta pz-small col-span-6 flex flex-col gap-3 md:col-span-4 md:pt-1">
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
                <span className="inline-block whitespace-nowrap pr-3">
                  {EQUAL}
                </span>
              </p>
              <p className="flex gap-4">
                <a href={LINKS.paper} className="st-link">
                  Paper ↗
                </a>
                <a href={LINKS.code} className="st-link">
                  Code ↗
                </a>
                <a href="#cite" className="st-link">
                  Cite ↓
                </a>
              </p>
            </div>
          </div>
        </header>

        <Section id="overview" title="Overview">
          <Entry
            color="#f6ee1f"
            ink="#ff4b1f"
            title="Locomotion"
            facts="One policy, ten terrains, one run without resets"
            stills={LOCO}
          >
            <p>
              A single MLP policy walks ANYmal over ten terrains back to back,
              from stairs and stepping blocks to a narrow bridge and a lattice.
              It sees the terrain as a heightmap and is given one goal pose per
              terrain. Training uses a sparse success reward with generic
              regularizers: no demonstrations, no distillation.
            </p>
            <p>
              <a href="#clips" className="st-link">
                All {count("Locomotion")} locomotion clips ↓
              </a>
            </p>
          </Entry>
          <Entry
            color="#f5a3b7"
            ink="#1f61d6"
            title="Manipulation"
            facts="NIST taskboard insertion, in simulation and on hardware"
            stills={MANIP}
          >
            <p>
              Contact-rich insertion on the NIST assembly taskboard, trained
              with the same recipe and no demonstrations, then transferred from
              simulation to a physical arm. Hardware footage is shown as
              recorded, at 3× speed.
            </p>
            <p>
              <a href="#clips" className="st-link">
                All {count("Manipulation")} manipulation clips ↓
              </a>
            </p>
          </Entry>
          <Entry
            color="#a3e4d7"
            ink="#ef5a9d"
            title="Scaling"
            facts="Past one million parallel environments"
          >
            <p>
              With 1M parallel environments SGS reaches a success rate of 0.72
              in locomotion and 0.62 in manipulation. The best baseline at that
              scale reaches 0.60 and 0.08. Prior work stopped near 64K
              environments.
            </p>
            <p>
              <a href="#results" className="st-link">
                Results ↓
              </a>
            </p>
          </Entry>
        </Section>

        <MethodSite id="method" />

        <Section id="results" title="Results">
          <div className="pz-grid pb-8 pt-3">
            <p className="pz-small col-span-6 max-w-[52ch]">
              Success rate, from 0 to 1, against parallel environments, 4K to 1M
              on a log scale. Prior methods were run up to about 64K. Pick a
              scale on the chart to play each method&apos;s policy at that
              scale.
            </p>
          </div>
          <div className="px-[var(--m)] pb-12">
            <ScaleCompare skin="web" />
          </div>
        </Section>

        <Section id="clips" title="Clips">
          <div
            className="pb-12 pt-3"
            style={
              { "--ground": "#f6ee1f", "--hover": "#f6ee1f" } as CSSProperties
            }
          >
            <ClipIndex />
          </div>
        </Section>

        <Section id="cite" title="Cite">
          <div className="pz-grid gap-y-3 pb-12 pt-3">
            <p className="pz-small col-span-6 md:col-span-4">BibTeX</p>
            <div className="col-span-6 md:col-span-8">
              <CopyBlock text={BIBTEX} />
            </div>
          </div>
        </Section>

        <footer className="bg-black pb-[var(--m)] pt-3 text-white">
          <div className="pz-grid pz-small gap-y-3 pb-10">
            <p className="col-span-6 md:col-span-6">
              {TITLE}: {SUBTITLE}
            </p>
            <p className="col-span-3 md:col-span-3">
              <a href={LINKS.paper} className="st-link">
                Paper ↗
              </a>
              <br />
              <a href={LINKS.code} className="st-link">
                Code ↗
              </a>
            </p>
            <p className="col-span-3 md:col-span-3">
              <a href="#top" className="st-link">
                Top ↑
              </a>
            </p>
          </div>
          <div className="px-[var(--m)]">
            <FooterMark />
          </div>
        </footer>
      </ClipGallery>
    </div>
  );
}
