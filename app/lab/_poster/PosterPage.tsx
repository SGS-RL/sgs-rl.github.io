import type { ReactNode } from "react";
import { CLIPS, LINKS, SUBTITLE, TITLE } from "../content";
import ClipQuilt from "./ClipQuilt";
import HalftoneVideo from "./HalftoneVideo";
import MethodRaster from "./MethodRaster";
import PosterChart from "./PosterChart";
import PosterHero, { ROBOT_FOCUS } from "./PosterHero";
import { P, vars } from "./palettes";
import "./poster.css";

const NAV: [string, string][] = [
  ["Summary", "#summary"],
  ["Method", "#method"],
  ["Scaling", "#scaling"],
  ["Manipulation", "#manipulation"],
  ["Clips", "#clips"],
];

function TopBar() {
  return (
    <div className="pz-grid pz-small sticky top-0 z-50 h-[var(--bar)] items-center bg-black text-white">
      <a href="#top" className="col-span-2">
        SGS
      </a>
      <nav className="col-span-7 hidden gap-4 md:flex">
        {NAV.map(([l, h]) => (
          <a key={h} href={h}>
            {l}
          </a>
        ))}
      </nav>
      <div className="col-span-4 flex justify-end gap-4 md:col-span-3">
        <a href={LINKS.paper}>Paper</a>
        <a href={LINKS.code}>Code</a>
      </div>
    </div>
  );
}

// White heading band between rules, as on the NOF website.
function Heading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="pz-head scroll-mt-[var(--bar)] border-y border-black bg-white px-[var(--m)] pb-[0.08em] pt-[0.04em] text-black"
    >
      {children}
    </h2>
  );
}

const ROWS: [string, string, string][] = [
  ["Policy", "Markovian MLP, 4–8 layers", "No transformer, no LSTM"],
  ["Terrain input", "Heightmap", ""],
  ["Goal", "One target pose per terrain", ""],
  ["Reward", "Sparse success signal", "Plus generic regularizers"],
  ["Demonstrations", "None", ""],
  ["Distillation", "None", ""],
  ["Parallel environments", "Over one million", "Prior work: about 64K"],
];

export default function PosterPage() {
  const strip = [1, 4, 8].map((i) => CLIPS[i]);
  return (
    <div className="pz">
      <TopBar />
      <PosterHero />

      <Heading id="summary">Summary</Heading>
      <section className="pz-poster pb-6" style={vars(P.listing)}>
        <div className="pz-grid gap-y-3 pb-8 pt-3">
          <p className="pz-mid col-span-6 md:col-span-4">
            Success-Guided Sampling
          </p>
          <p className="pz-mid col-span-6 md:col-span-8">
            allocates parallel simulation across task configurations by the
            policy&apos;s current success rate. With it, reinforcement learning
            keeps improving past one million parallel environments, for legged
            locomotion and contact-rich manipulation.
          </p>
        </div>
        <dl className="pz-small">
          {ROWS.map(([k, v, n]) => (
            <div key={k} className="pz-grid border-t border-black py-1.5">
              <dt className="col-span-2 md:col-span-4">{k}</dt>
              <dd className="col-span-2 md:col-span-4">{v}</dd>
              <dd className="col-span-2 md:col-span-4">{n}</dd>
            </div>
          ))}
        </dl>
        <div className="pz-grid mt-6 gap-y-4">
          {strip.map((c) => (
            <figure key={c.id} className="col-span-2 md:col-span-4">
              <HalftoneVideo
                src={c.src}
                poster={c.poster}
                ink={P.listing.raster}
                pitch={5}
                angle={20}
                focus={ROBOT_FOCUS}
                className="aspect-[3/4] md:aspect-[4/3]"
              />
              <figcaption className="pz-small mt-1">{c.title}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <Heading id="method">Method</Heading>
      <section className="pz-poster pb-6 pt-3" style={vars(P.method)}>
        <div className="pz-grid pz-small gap-y-3 pb-4">
          <p className="col-span-3 md:col-span-3">Schematic of training</p>
          <p className="col-span-3 md:col-span-5">
            Each dot is a task configuration, sized by the policy&apos;s success
            rate on it. Every iteration samples configurations with a weight
            that peaks at intermediate success, so rollouts concentrate where
            the policy succeeds only part of the time.
          </p>
        </div>
        <div className="px-[var(--m)]">
          <MethodRaster
            raster={P.method.raster}
            type={P.method.type}
            ground={P.method.ground}
          />
        </div>
      </section>

      <Heading id="scaling">Scaling</Heading>
      <section className="pz-poster pb-8 pt-3" style={vars(P.scaling)}>
        <div className="pz-grid pz-small gap-y-3 pb-6">
          <p className="col-span-3 md:col-span-3">
            Success rate by parallel environments
          </p>
          <p className="col-span-3 md:col-span-5">
            Success rate from 0 to 1 against parallel environments, 4K to 1M on
            a log scale. Prior methods were run up to about 64K. Touch or hover
            a chart to read the values at each scale.
          </p>
        </div>
        <div className="px-[var(--m)]">
          <PosterChart type={P.scaling.type} raster={P.scaling.raster} />
        </div>
      </section>

      <Heading id="manipulation">Manipulation</Heading>
      <section className="pz-poster pb-10 pt-3" style={vars(P.manip)}>
        <div className="pz-grid gap-y-4">
          <h3 className="pz-big col-span-6 text-[21vw] md:col-span-7 md:text-[10.5vw]">
            NIST
            <br />
            Taskboard
          </h3>
          <p className="pz-small col-span-6 text-black md:col-span-3 md:col-start-10 md:pt-3">
            Contact-rich assembly, trained with reinforcement learning and no
            demonstrations, then transferred to hardware.
          </p>
          <figure className="col-span-6 md:col-span-7">
            <HalftoneVideo
              src="/lab/media/manipulation-960.mp4"
              poster="/manipulation-poster.jpg"
              ink={P.manip.raster}
              pitch={6}
              angle={30}
              lo={0.3}
              hi={0.8}
              gamma={1.5}
              className="aspect-video"
            />
            <figcaption className="pz-small mt-1 text-black">
              Simulation
            </figcaption>
          </figure>
          <figure className="col-span-6 md:col-span-5">
            <HalftoneVideo
              src="/lab/media/real-world-960.mp4"
              poster="/real-world-poster.jpg"
              ink={P.manip.raster}
              pitch={6}
              angle={30}
              focus={[0.5, 0.6]}
              lo={0.2}
              hi={0.85}
              className="aspect-[4/3]"
            />
            <figcaption className="pz-small mt-1 text-black">
              Hardware, 3× speed
            </figcaption>
          </figure>
        </div>
      </section>

      <Heading id="clips">Clips</Heading>
      <ClipQuilt />

      <footer className="bg-black pb-[var(--m)] pt-3 text-white">
        <div className="pz-grid pz-small gap-y-3 pb-10">
          <p className="col-span-6 md:col-span-6">
            {TITLE}: {SUBTITLE}
          </p>
          <p className="col-span-3 md:col-span-3">
            <a href={LINKS.paper} className="pz-u">
              Paper
            </a>
            <br />
            <a href={LINKS.code} className="pz-u">
              Code
            </a>
          </p>
          <p className="col-span-3 md:col-span-3">
            Lab study, not linked
            <br />
            from the main site
          </p>
        </div>
        <span className="pz-mark px-[var(--m)]" aria-hidden="true">
          SGS
        </span>
      </footer>
    </div>
  );
}
