import SectionVideo from "./SectionVideo";

export default function Scaling() {
  return (
    <section id="scaling" className="relative bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-28 md:px-10 md:py-40">
        <div className="eyebrow-box mb-8">
          <span className="eyebrow text-ink">Scaling</span>
        </div>
        <h2 className="display max-w-3xl text-4xl text-ink md:text-6xl">
          Past one million environments.
        </h2>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted md:text-lg">
          Success rate continues to rise as parallel environments grow to over
          one million, 16x prior work.
        </p>
        <SectionVideo src="/scaling.mp4" poster="/scaling-poster.jpg" />
      </div>
    </section>
  );
}
