import ScaleCompare from "../_scaling/ScaleCompare";
import {
  LINKS,
  SUBTITLE,
  TITLE,
  AFFILIATIONS,
  AUTHORS,
  EQUAL,
  BIBTEX,
  VENUE,
} from "../content";
import { LIBRARY, RUNS } from "../library";
import Collection from "./Collection";
import CopyBlock from "./CopyBlock";
import { COUNTS, inGroup, plural, taskList, word } from "./data";
import Gallery from "./Gallery";
import Highlights from "./Highlights";
import Method from "./Method";
import Nav from "./Nav";
import Runs from "./Runs";
import Section from "./Section";
import Transfer from "./Transfer";
import Wall from "./Wall";
import "./swiss3.css";

// Round 3 of the serious page: /lab/swiss-2 with the owner's footage
// (app/lab/library.ts) in place of the placeholders.

// The reel's video height on laptops and wider, so that title, authors and
// the whole reel (video, bar, controls) share the first screen. The title's
// size is the --title of .sw-hero in lab.css; 18.5rem is the bar, the
// subtitle/author row and the gaps. Same formula as /lab/reel/a/.
const FIT =
  "min(64svh, max(16rem, 100svh - 18.5rem - 0.86 * min(8.4vw, 15svh)))";

// Line beside each block of the collection.
const NOTES: Record<string, string> = {
  "UR5e|Real": `Manipulation on the physical arm: ${taskList(inGroup("UR5e", "Real"))}. One clip per run.`,
  "UR5e|Sim": `Manipulation: ${taskList(inGroup("UR5e", "Sim"))}. Each clip shows two runs side by side, the most interesting one on the left and a nominal one on the right.`,
  "Franka|Sim": `Manipulation: ${taskList(inGroup("Franka", "Sim"))}, from a wide and a close camera.`,
  "ANYmal D|Sim": `Locomotion: one clip per terrain, ${inGroup("ANYmal D", "Sim").length} terrains.`,
};

function Opening() {
  return (
    <header id="top" className="sw-hero">
      <div className="sw-grid s3-wrap gap-y-5 pb-12 md:gap-y-6 md:pb-14">
        <h1 className="sw-display sw-hero-title col-span-full pt-3 md:pt-4">
          A Balanced <br className="md:hidden" />
          Data Diet
        </h1>
        <p className="col-span-full text-xl font-medium leading-tight tracking-[-0.02em] md:col-span-4 md:text-2xl lg:col-span-3">
          {SUBTITLE}
        </p>
        <div className="col-span-full md:col-span-8 lg:col-span-6">
          <p className="text-base leading-snug md:text-lg">
            {AUTHORS.map(([name, aff], i) => (
              <span key={i} className="inline-block whitespace-nowrap pr-4">
                {name}
                <sup className="sw-num pl-px text-[0.6em]">{aff}</sup>
              </span>
            ))}
          </p>
          <p className="sw-label mt-2 text-sw-mute">
            {AFFILIATIONS.map((a, i) => (
              <span key={i} className="inline-block whitespace-nowrap pr-4">
                <sup>{i + 1}</sup>
                {a}
              </span>
            ))}
            <span className="inline-block whitespace-nowrap pr-4">{EQUAL}</span>
            <span className="inline-block whitespace-nowrap">{VENUE}</span>
          </p>
        </div>
        <p
          id="s3-links"
          className="col-span-full flex gap-5 whitespace-nowrap text-base md:col-span-8 md:col-start-5 md:text-lg lg:col-span-3 lg:col-start-auto lg:justify-end"
        >
          <a href={LINKS.paper} className="sw-link">
            Paper ↗
          </a>
          <a href={LINKS.code} className="sw-link">
            Code ↗
          </a>
          <a href="#cite" className="sw-link">
            Cite ↓
          </a>
        </p>
      </div>
    </header>
  );
}

export default function Swiss3Page() {
  return (
    <div className="swiss s3" data-theme="light">
      <Gallery items={LIBRARY}>
        <Nav linksId="s3-links" />
        <Opening />

        <section id="highlights" className="sw-grid s3-wrap pb-24 md:pb-36">
          <div className="col-span-full h-px bg-sw-rule" />
          <Highlights maxHeight={FIT} className="pt-3" />
        </section>

        <Section id="summary" n="01" label="Summary">
          <p className="sw-lead col-span-full">
            Success-Guided Sampling (SGS) spends parallel simulation on the task
            configurations a policy solves only some of the time. With it,
            reinforcement learning keeps improving past one million parallel
            environments, in legged locomotion and contact-rich manipulation.
          </p>
        </Section>

        {/* Setup (02) and Method (03), from the method study. Its sections
            sit on the uncapped page grid, so this wrapper caps them. */}
        <div className="s3-wrap -mt-16 md:-mt-28">
          <Method />
        </div>

        <Section id="results" n="04" label="Results">
          <p className="s3-body s3-measure col-span-full">
            Success rate on the fixed set of configurations against the number
            of parallel environments, from 4K to 1M on a log scale. Prior work
            ran up to about 64K. Pick a scale on the chart to see the policy
            each method trained at that scale.
          </p>
          <div className="col-span-full">
            <ScaleCompare skin="swiss" />
          </div>
          <Transfer />
        </Section>

        <Section id="runs" n="05" label="Runs">
          <p className="s3-body s3-measure col-span-full">
            {word(COUNTS.runs)} continuous runs, uncut. Each frame loops the
            whole run sped up, muted. The full run plays at 1× only when you ask
            for it.
          </p>
          <Runs runs={RUNS} />
        </Section>

        {/* Transition into the collection: a full-bleed band, no captions. */}
        <div className="pb-20 md:pb-28">
          <Wall />
          <p className="sw-grid s3-wrap sw-label pt-2.5">
            <span className="col-span-3 md:col-span-9">
              {plural(COUNTS.clips, "clip")} of {plural(COUNTS.robots, "robot")}
              , in simulation and on hardware. Select any clip to play it.
            </span>
            <a
              href="#clips"
              className="sw-link col-span-1 justify-self-end whitespace-nowrap md:col-span-3"
            >
              All clips ↓
            </a>
          </p>
        </div>

        <Section
          id="clips"
          n="06"
          label="Clips"
          wide
          note={`Every clip in the collection, ${COUNTS.clips} in all, by robot and by simulation or hardware. All clips on screen play, muted; select one to watch it large, with the rest of the collection beside it. All play at 1×.`}
        >
          <Collection notes={NOTES} />
        </Section>

        <Section id="cite" n="07" label="Cite">
          <div className="col-span-full s3-measure">
            <CopyBlock text={BIBTEX} />
          </div>
        </Section>

        <footer className="sw-grid s3-wrap sw-label gap-y-3 pb-10">
          <div className="col-span-full h-px bg-sw-rule" />
          <p className="col-span-full md:col-span-6">
            {TITLE}: {SUBTITLE}
          </p>
          <div className="col-span-full flex gap-5 md:col-span-6 md:justify-end">
            <a href={LINKS.paper} className="sw-link">
              Paper ↗
            </a>
            <a href={LINKS.code} className="sw-link">
              Code ↗
            </a>
            <a href="#top" className="sw-link">
              Top ↑
            </a>
          </div>
        </footer>
      </Gallery>
    </div>
  );
}
