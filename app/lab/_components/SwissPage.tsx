import { LINKS, METHOD_STEPS, SETUP, TITLE, SUBTITLE } from "../content";
import { ClipGrid } from "./Clips";
import Hero from "./Hero";
import InViewVideo from "./InViewVideo";
import ScalingChart from "./ScalingChart";
import Section from "./Section";

function Figure({
  src,
  poster,
  caption,
  className = "",
}: {
  src: string;
  poster?: string;
  caption: string;
  className?: string;
}) {
  return (
    <figure className={className}>
      <div className="relative aspect-video overflow-hidden bg-sw-panel">
        <InViewVideo
          src={src}
          poster={poster}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <figcaption className="sw-label mt-2 text-sw-mute">{caption}</figcaption>
    </figure>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="col-span-2 border-t border-sw-rule pt-2 md:col-span-3 md:border-t-0 md:pt-0">
      <div className="text-[clamp(3rem,7vw,6rem)] font-semibold leading-none tracking-[-0.05em]">
        {value}
      </div>
      <p className="sw-label mt-2 max-w-[28ch] text-sw-mute">{label}</p>
    </div>
  );
}

export default function SwissPage({
  theme,
  hero,
}: {
  theme: "light" | "dark";
  hero: "scrub" | "loop";
}) {
  return (
    <div className="swiss" data-theme={theme}>
      <Hero mode={hero} />

      <div className="pt-16 md:pt-28">
        <Section id="summary" n="01" label="Summary">
          <p className="sw-lead col-span-full">
            Success-Guided Sampling (SGS) allocates parallel simulation across
            task configurations by the policy&apos;s current success rate. With
            it, reinforcement learning keeps improving up to one million
            parallel environments, for legged locomotion and contact-rich
            manipulation.
          </p>
        </Section>

        <Section id="setup" n="02" label="Setup">
          <dl className="col-span-full grid grid-cols-subgrid">
            {SETUP.map(([k, v]) => (
              <div
                key={k}
                className="col-span-full grid grid-cols-subgrid border-t border-sw-hair py-2.5 md:first:border-t-0 md:first:pt-0"
              >
                <dt className="col-span-2 text-sw-mute md:col-span-3">{k}</dt>
                <dd className="col-span-2 md:col-span-6">{v}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section id="method" n="03" label="Method">
          <Figure
            src="/method.mp4"
            poster="/lab/media/method-poster.jpg"
            caption="The sampling weight peaks at intermediate success rates and falls off toward 0 and 1."
            className="col-span-full md:col-span-6 md:col-start-4 md:row-start-1"
          />
          <ol className="col-span-full md:col-span-3 md:row-start-1">
            {METHOD_STEPS.map((s, i) => (
              <li
                key={s}
                className="grid grid-cols-[2rem_1fr] border-t border-sw-hair py-2.5 md:first:border-t-0 md:first:pt-0"
              >
                <span className="sw-num text-sw-mute">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="scaling" n="04" label="Scaling">
          <Stat
            value="0.72"
            label="Locomotion success at 1M environments. Best baseline: 0.60."
          />
          <Stat
            value="0.62"
            label="Manipulation success at 1M environments. Best baseline: 0.08."
          />
          <Stat
            value="16×"
            label="More parallel environments than the largest prior runs (about 64K)."
          />
          <div className="col-span-full mt-8 grid grid-cols-subgrid">
            <ScalingChart />
          </div>
        </Section>

        <Section id="manipulation" n="05" label="Manipulation">
          <Figure
            src="/manipulation.mp4"
            poster="/manipulation-poster.jpg"
            caption="Simulation. NIST assembly task board, trained with reinforcement learning and no demonstrations."
            className="col-span-full md:col-span-6 lg:col-span-5"
          />
          <Figure
            src="/real-world.mp4"
            poster="/real-world-poster.jpg"
            caption="Hardware. Policy transferred from simulation to a physical arm. 3× speed."
            className="col-span-full md:col-span-6 lg:col-span-4"
          />
        </Section>

        <Section id="clips" n="06" label="Clips">
          <ClipGrid />
          <p className="sw-label col-span-full">
            <a href="/lab/clips/" className="sw-link">
              Other layouts for the clip collection →
            </a>
          </p>
        </Section>
      </div>

      <footer className="sw-grid sw-label gap-y-3 pb-10">
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
    </div>
  );
}
