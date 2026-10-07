import type { CSSProperties, ReactNode } from "react";
import {
  AFFILIATIONS,
  AUTHORS,
  BIBTEX,
  ADVISING,
  EQUAL,
  LINKS,
  SUBTITLE,
  TITLE,
  VENUE,
} from "../content";
import { LIBRARY, RUNS } from "../library";
import MethodSite from "../_method/MethodSite";
import ScaleCompare from "../_scaling/ScaleCompare";
import "../_poster/poster.css";
import CopyBlock from "../_site/CopyBlock";
import "../_site/site.css";
import ClipIndex from "./ClipIndex";
import Gallery from "./Gallery";
import Highlights from "./Highlights";
import { byId, groupItems } from "./items";
import { FooterMark, HeaderMark } from "./Mark";
import { Row } from "./Media";
import Nav from "./Nav";
import { Run, type Band } from "./Runs";
import "./site3.css";

// /lab/site-3: /lab/site-2 with the owner's footage (LIBRARY, RUNS, REEL3
// in ../library.ts). Header, Method, Results, Cite and footer as in
// site-2; new: the highlight reel after the header, Overview entries built
// on the real clips (shown as recorded), the continuous runs, and the clip
// index of the real collection.

// One colour per kind of footage, used by its entry and its run. Yellow
// and red come from the simulation (goal marker, robot), blue from the
// hardware task board.
const LOCO: Band = { ground: "#f6ee1f", type: "#111" };
const MANIP: Band = { ground: "#f5a3b7", type: "#111" };
const REAL: Band = { ground: "#1f61d6", type: "#fff" };
const SCALE: Band = { ground: "#a3e4d7", type: "#111" };
const REEL = "#b0b5bb";

const clip = (id: string) => byId(LIBRARY, id);
const groups = groupItems(LIBRARY);
const count = (f: (c: (typeof LIBRARY)[number]) => boolean) =>
  LIBRARY.filter(f).length;

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
// three columns of text (name, the facts, a plain description and links)
// and the clips under them, unaltered.
function Entry({
  band,
  title,
  facts,
  text,
  links,
  children,
}: {
  band: Band;
  title: string;
  facts: ReactNode;
  text: ReactNode;
  links?: [string, string][];
  children?: ReactNode;
}) {
  return (
    <article
      className="s3-entry border-t border-black"
      style={{ background: band.ground, color: band.type }}
    >
      <div className="pz-grid gap-y-2 pb-5 pt-1.5">
        <h3 className="st-entry col-span-6 md:col-span-4">{title}</h3>
        <p className="st-entry col-span-6 md:col-span-4">{facts}</p>
        <div className="pz-small col-span-6 flex max-w-[46ch] flex-col gap-2 md:col-span-4">
          <p>{text}</p>
          {links && (
            <p className="flex flex-wrap gap-x-4 gap-y-1">
              {links.map(([href, label]) => (
                <a key={href} href={href} className="st-link">
                  {label}
                </a>
              ))}
            </p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex flex-col gap-y-4 px-[var(--m)] pb-[var(--m)] md:gap-y-5">
          {children}
        </div>
      )}
    </article>
  );
}

const group = (robot: string, domain: string) =>
  groups.find((g) => g.robot === robot && g.domain === domain)!;
const ANYMAL_D = group("ANYmal D", "Simulation");
const UR5E_REAL = group("UR5e", "Hardware");
const UR5E_SIM = group("UR5e", "Simulation");
const sim = count((c) => c.category === "Manipulation" && c.domain === "Sim");
const run = (robot: string) => RUNS.find((r) => r.robot === robot)!;

export default function Site3Page() {
  return (
    <div className="pz st s3">
      <Gallery clips={LIBRARY}>
        <Nav />

        <header id="top" className="s3-hd bg-white">
          <div className="s3-hd-mark">
            <HeaderMark />
          </div>
          <div className="s3-hd-info pz-grid gap-y-5 pb-8 pt-4 md:pb-12">
            <h1 className="s3-hd-title st-lead col-span-6 md:col-span-8">
              {TITLE}:
              <br />
              {SUBTITLE}
            </h1>
            <div className="s3-hd-meta pz-small col-span-6 flex flex-col gap-3 md:col-span-4 md:pt-1">
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
                <span className="inline-block whitespace-nowrap pr-3">
                  {ADVISING}
                </span>
              </p>
              <p className="flex flex-wrap gap-x-4">
                <span>{VENUE}</span>
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

        <Section id="highlights" title="Highlights">
          <div className="pb-8 pt-3 md:pb-12" style={{ background: REEL }}>
            <div className="pz-grid">
              <Highlights />
            </div>
          </div>
        </Section>

        <Section id="overview" title="Overview">
          <Entry
            band={LOCO}
            title="Locomotion"
            facts="ANYmal D and ANYmal C over rough terrain, in simulation"
            text={
              <>
                The policy walks the robot to a goal, the yellow marker, over
                terrain it sees as a heightmap. It is an MLP trained with a
                sparse success reward and generic regularizers: no
                demonstrations, no distillation. ANYmal D is shown on twelve
                terrains, one clip each; ANYmal C in one continuous minute.
              </>
            }
            links={[
              [
                `#${ANYMAL_D.id}`,
                `All ${ANYMAL_D.clips.length} ANYmal D clips ↓`,
              ],
              [`#${run("ANYmal C").id}`, "ANYmal C, the full minute ↓"],
            ]}
          >
            <Row
              lead
              clips={[
                clip("anymal-d-stairs"),
                clip("anymal-d-balancing-beam"),
                clip("anymal-d-radiating-beam"),
              ]}
            />
          </Entry>
          <Entry
            band={MANIP}
            title="Manipulation"
            facts="UR5e and Franka on an assembly task board, in simulation"
            text={
              <>
                Contact-rich insertion on a task board modelled on the NIST
                assembly task board, trained with the same recipe and no
                demonstrations. UR5e: rod, nut, gear mesh, BNC connector,
                waterproof connector and rectangular peg. Franka: nut. Each UR5e
                clip shows two runs of one task side by side, the most
                interesting on the left and a nominal one on the right.
              </>
            }
            links={[
              [`#${UR5E_SIM.id}`, `All ${sim} clips in simulation ↓`],
              [`#${run("Franka").id}`, "Franka, a 30 s run ↓"],
            ]}
          >
            <Row
              withRobot
              clips={[clip("ur5e-sim-rod"), clip("ur5e-sim-bnc")]}
            />
            <Row
              withRobot
              clips={[
                clip("ur5e-sim-gear-mesh"),
                clip("franka-sim-nut-2"),
                clip("franka-sim-nut-1"),
              ]}
            />
          </Entry>
          <Entry
            band={REAL}
            title="Hardware"
            facts="UR5e on a physical task board: rod, nut and gear mesh"
            text={
              <>
                Policies trained in simulation, run on a UR5e arm and a physical
                board. The clips play as recorded, at 1×.
              </>
            }
            links={[
              [
                `#${UR5E_REAL.id}`,
                `All ${UR5E_REAL.clips.length} hardware clips ↓`,
              ],
              [`#${run("UR5e").id}`, "Gear mesh, a one-minute run ↓"],
            ]}
          >
            <Row
              lead
              clips={[
                clip("ur5e-real-rod-1"),
                clip("ur5e-real-nut-1"),
                clip("ur5e-real-gear-mesh-4"),
              ]}
            />
          </Entry>
          <Entry
            band={SCALE}
            title="Scaling"
            facts="Past one million parallel environments"
            text={
              <>
                With 1M parallel environments SGS reaches a success rate of 0.72
                in locomotion and 0.62 in manipulation. The best baseline at
                that scale reaches 0.60 and 0.08. Prior work stopped near 64K
                environments.
              </>
            }
            links={[["#results", "Results ↓"]]}
          />
        </Section>

        <Section id="runs" title="Continuous runs">
          <div className="pz-grid pb-5 pt-3">
            <p className="pz-small col-span-6 max-w-[52ch]">
              Three runs, each recorded in one take. The preview plays the whole
              run sped up; the full run plays at 1×, with controls, when you ask
              for it.
            </p>
          </div>
          {RUNS.map((r) => (
            <div key={r.id} id={r.id} className="s3-anchor">
              <Run
                run={r}
                band={
                  r.category === "Locomotion"
                    ? LOCO
                    : r.domain === "Real"
                      ? REAL
                      : MANIP
                }
              />
            </div>
          ))}
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
              <br />
              {VENUE}
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
      </Gallery>
    </div>
  );
}
