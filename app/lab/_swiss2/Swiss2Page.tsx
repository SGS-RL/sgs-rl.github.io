import InViewVideo from "../_components/InViewVideo";
import { ClipGallery, ClipWall, RobotGrid } from "../_gallery";
import MethodSwiss from "../_method/MethodSwiss";
import HighlightReel from "../_reel/HighlightReel";
import ScaleCompare from "../_scaling/ScaleCompare";
import {
  CLIPS,
  LINKS,
  SUBTITLE,
  TITLE,
  AFFILIATIONS,
  AUTHORS,
  ADVISING,
  EQUAL,
  BIBTEX,
  VENUE,
} from "../content";
import CopyBlock from "./CopyBlock";
import Nav from "./Nav";
import Section from "./Section";
import "./swiss2.css";

const ROBOTS = new Set(CLIPS.map((c) => c.robot)).size;

// The reel's video height on laptops and wider, so that title, authors and
// the whole reel (video, bar, controls) share the first screen. The title's
// size is the --title of .sw-hero in lab.css; 18.5rem is the bar, the
// subtitle/author row and the gaps. Same formula as /lab/reel/a/.
const FIT =
  "min(64svh, max(16rem, 100svh - 18.5rem - 0.86 * min(8.4vw, 15svh)))";

function Opening() {
  return (
    <header id="top" className="sw-hero">
      <div className="sw-grid s2-wrap gap-y-5 pb-12 md:gap-y-6 md:pb-14">
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
            <span className="inline-block whitespace-nowrap pr-4">
              {ADVISING}
            </span>
            <span className="inline-block whitespace-nowrap">{VENUE}</span>
          </p>
        </div>
        <p
          id="s2-links"
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

function Video({
  src,
  poster,
  title,
  children,
}: {
  src: string;
  poster: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <figure>
      <h3 className="sw-label border-t border-sw-hair pb-2 pt-2.5 font-medium">
        {title}
      </h3>
      <div className="relative aspect-video overflow-hidden bg-sw-panel">
        <InViewVideo
          src={src}
          poster={poster}
          className="absolute inset-0 h-full w-full object-contain"
        />
      </div>
      <figcaption className="sw-label mt-2 text-sw-mute">{children}</figcaption>
    </figure>
  );
}

export default function Swiss2Page() {
  return (
    <div className="swiss s2" data-theme="light">
      <ClipGallery skin="swiss">
        <Nav linksId="s2-links" />
        <Opening />

        <section id="highlights" className="sw-grid s2-wrap pb-24 md:pb-36">
          <div className="col-span-full h-px bg-sw-rule" />
          <HighlightReel
            skin="swiss"
            layout="list"
            maxHeight={FIT}
            className="pt-3"
          />
        </section>

        <Section id="summary" n="01" label="Summary">
          <p className="sw-lead col-span-full">
            Success-Guided Sampling (SGS) spends parallel simulation on the task
            configurations a policy solves only some of the time. With it,
            reinforcement learning keeps improving up to one million parallel
            environments, in legged locomotion and contact-rich manipulation.
          </p>
        </Section>

        {/* Setup (02) and Method (03), from the method study. Its sections
            sit on the uncapped page grid, so this wrapper caps them. */}
        <div className="s2-wrap -mt-16 md:-mt-28">
          <MethodSwiss />
        </div>

        <Section id="results" n="04" label="Results">
          <p className="s2-body s2-measure col-span-full">
            Success rate on the fixed set of configurations against the number
            of parallel environments, from 4K to 1M on a log scale. Prior work
            ran up to about 64K. Pick a scale on the chart to see the policy
            each method trained at that scale.
          </p>
          <div className="col-span-full">
            <ScaleCompare skin="swiss" />
          </div>
          <div className="col-span-full mt-6 md:mt-10">
            <h3 className="sw-label font-medium">Transfer to hardware</h3>
            <p className="sw-label mt-1 max-w-[60ch] text-sw-mute">
              The manipulation policy, trained in simulation, transferred to a
              physical arm. Both videos are shown unaltered.
            </p>
            <div className="mt-4 grid gap-x-6 gap-y-8 md:grid-cols-2">
              <Video
                src="/lab/media/manipulation-960.mp4"
                poster="/manipulation-poster.jpg"
                title="Simulation"
              >
                NIST assembly task board, trained with reinforcement learning
                and no demonstrations. 1×.
              </Video>
              <Video
                src="/lab/media/real-world-960.mp4"
                poster="/real-world-poster.jpg"
                title="Hardware"
              >
                The policy on a physical arm. Shown at 3× speed.
              </Video>
            </div>
          </div>
        </Section>

        {/* Transition into the collection: a full-bleed band, no captions. */}
        <div className="pb-20 md:pb-28">
          <ClipWall caption={false} />
          <p className="sw-grid s2-wrap sw-label pt-2.5">
            <span className="col-span-3 md:col-span-9">
              {CLIPS.length} clips from {ROBOTS} robots, in simulation and on
              hardware. Select any clip to play it.
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
          n="05"
          label="Clips"
          wide
          note="Every clip in the collection, by robot. All clips on screen play, muted; select one to watch it large, with the rest of the collection beside it. Hardware clips are sped up and say so."
        >
          <RobotGrid />
        </Section>

        <Section id="cite" n="06" label="Cite">
          <div className="col-span-full s2-measure">
            <CopyBlock text={BIBTEX} />
          </div>
        </Section>

        <footer className="sw-grid s2-wrap sw-label gap-y-3 pb-10">
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
      </ClipGallery>
    </div>
  );
}
