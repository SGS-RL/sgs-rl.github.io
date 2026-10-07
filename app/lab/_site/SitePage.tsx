import type { CSSProperties, ReactNode } from "react";
import {
  CLIPS,
  LINKS,
  METHOD_STEPS,
  SUBTITLE,
  TITLE,
  AFFILIATIONS,
  AUTHORS,
  ADVISING,
  EQUAL,
  BIBTEX,
} from "../content";
import HalftoneVideo from "../_poster/HalftoneVideo";
import MethodRaster from "../_poster/MethodRaster";
import PosterChart from "../_poster/PosterChart";
import { ROBOT_FOCUS } from "../_poster/PosterHero";
import "../_poster/poster.css";
import ClipIndex from "./ClipIndex";
import CopyBlock from "./CopyBlock";
import SiteNav from "./SiteNav";
import "./site.css";

const SETUP: [string, string, string][] = [
  ["Policy", "Markovian MLP, 4–8 layers", "No transformer, no LSTM"],
  ["Terrain input", "Heightmap", ""],
  ["Goal", "One target pose per terrain", ""],
  ["Reward", "Sparse success signal", "Plus generic regularizers"],
  ["Demonstrations", "None", ""],
  ["Distillation", "None", ""],
  ["Parallel environments", "Over one million", "Prior work: about 64K"],
];

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

// One listing entry, as an event on the NOF site: a colour band with
// three columns of text and a row of rastered images.
function Entry({
  color,
  ink,
  title,
  facts,
  children,
  media = [],
}: {
  color: string;
  ink: string;
  title: string;
  facts: ReactNode;
  children: ReactNode;
  media?: {
    src: string;
    poster: string;
    caption: string;
    focus?: [number, number];
  }[];
}) {
  return (
    <article
      className="border-t border-black text-black"
      style={{ background: color }}
    >
      <div className="pz-grid gap-y-2 pb-5 pt-1.5">
        <h3 className="st-entry col-span-6 md:col-span-4">{title}</h3>
        <p className="st-entry col-span-6 md:col-span-4">{facts}</p>
        <div className="pz-small col-span-6 max-w-[46ch] md:col-span-4">
          {children}
        </div>
      </div>
      {media.length > 0 && (
        <div className="pz-grid gap-y-3 pb-[var(--m)]">
          {media.map((m) => (
            <figure key={m.src} className="col-span-2 md:col-span-4">
              <HalftoneVideo
                src={m.src}
                poster={m.poster}
                ink={ink}
                pitch={5}
                angle={20}
                focus={m.focus}
                lo={0.22}
                hi={0.9}
                gamma={1.2}
                className="aspect-[3/4] md:aspect-[4/3]"
              />
              <figcaption className="pz-small mt-1">{m.caption}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </article>
  );
}

export default function SitePage() {
  const loco = [1, 4, 8].map((i) => CLIPS[i]);
  return (
    <div className="pz st">
      <SiteNav />

      <header id="top" className="bg-white">
        <div className="relative px-[var(--m)] pt-2 text-[var(--coral)]">
          <span className="pz-mark" aria-label="SGS">
            SGS
          </span>
          <span
            className="pz-slot"
            style={{ marginLeft: "0.71em", marginTop: "0.19em" }}
          >
            <span className="st-slot">
              Success-
              <br />
              Guided
              <br />
              Sampling
            </span>
          </span>
        </div>
        <div className="pz-grid gap-y-5 pb-8 pt-4 md:pb-12">
          <h1 className="st-lead col-span-6 md:col-span-8">
            {TITLE}:
            <br />
            {SUBTITLE}
          </h1>
          <div className="pz-small col-span-6 flex flex-col gap-3 md:col-span-4 md:pt-1">
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
          facts={<>One policy, ten terrains, one run without resets</>}
          media={loco.map((c) => ({
            src: c.src,
            poster: c.poster,
            caption: c.title,
            focus: ROBOT_FOCUS,
          }))}
        >
          A single MLP policy drives ANYmal across ten terrains back to back. It
          sees the terrain as a heightmap, gets one goal pose per terrain, and
          is trained on a sparse success signal with generic regularizers. No
          demonstrations, no distillation.
        </Entry>
        <Entry
          color="#f5a3b7"
          ink="#1f61d6"
          title="Manipulation"
          facts={<>NIST taskboard, in simulation and on hardware</>}
          media={[
            {
              src: CLIPS[10].src,
              poster: CLIPS[10].poster,
              caption: "Simulation",
            },
            {
              src: CLIPS[11].src,
              poster: CLIPS[11].poster,
              caption: "Simulation, close",
            },
            {
              src: CLIPS[13].src,
              poster: CLIPS[13].poster,
              caption: "Hardware, 3× speed",
              focus: [0.5, 0.6],
            },
          ]}
        >
          Contact-rich assembly trained with the same recipe and no
          demonstrations, then transferred from simulation to a physical arm.
        </Entry>
        <Entry
          color="#a3e4d7"
          ink="#ef5a9d"
          title="Scaling"
          facts={<>Past one million parallel environments</>}
        >
          At 1M environments SGS reaches a success rate of 0.72 in locomotion
          and 0.62 in manipulation; the best baselines reach 0.60 and 0.08.
          Prior work stopped near 64K.{" "}
          <a href="#results" className="st-link">
            Results ↓
          </a>
        </Entry>
      </Section>

      <Section id="method" title="Method">
        <div className="pz-grid gap-y-6 pb-8 pt-3">
          <p className="st-lead col-span-6 md:col-span-9">
            SGS allocates parallel simulation across task configurations by the
            policy&apos;s current success rate, concentrating rollouts on the
            configurations it solves only part of the time.
          </p>
          <ol className="col-span-6 grid grid-cols-subgrid gap-y-3 md:col-span-12">
            {METHOD_STEPS.map((s, i) => (
              <li
                key={s}
                className="pz-small col-span-3 border-t border-black pt-1.5"
              >
                <span className="pz-num mb-3 block">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </div>
        <div
          className="border-t border-black pb-6 pt-3"
          style={{ background: "#a3e4d7", color: "#1d5ccf" } as CSSProperties}
        >
          <p className="pz-small px-[var(--m)] pb-3">
            Schematic. Each dot is a task configuration, sized by the
            policy&apos;s success rate on it; ringed dots are sampled this
            iteration.
          </p>
          <div className="px-[var(--m)]">
            <MethodRaster
              raster="#ef5a9d"
              type="#1d5ccf"
              ground="#a3e4d7"
              heightClass="h-[100vw] md:h-[30vw]"
            />
          </div>
        </div>
        <dl className="pz-small border-t border-black">
          <div className="pz-grid py-1.5">
            <dt className="col-span-6 md:col-span-4">Setup</dt>
          </div>
          {SETUP.map(([k, v, n]) => (
            <div key={k} className="pz-grid border-t border-black/25 py-1.5">
              <dt className="col-span-2 md:col-span-4">{k}</dt>
              <dd className="col-span-2 md:col-span-4">{v}</dd>
              <dd className="col-span-2 text-black/60 md:col-span-4">{n}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="results" title="Results">
        <div className="pz-grid gap-y-4 pb-10 pt-3">
          <p className="pz-small col-span-6 max-w-[52ch] md:col-span-6">
            Success rate, from 0 to 1, against the number of parallel
            environments on a log scale. Prior methods were run up to about 64K.
            Touch or hover a chart to read the values at each scale.
          </p>
          <div className="col-span-6 md:col-span-12">
            <PosterChart type="#111111" raster="#8c8c87" variant="web" />
          </div>
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
        <span className="pz-mark px-[var(--m)]" aria-hidden="true">
          SGS
        </span>
      </footer>
    </div>
  );
}
