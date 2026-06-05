import SectionVideo from "./SectionVideo";

export default function Method() {
  return (
    <section id="method" className="relative bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-28 md:px-10 md:py-40">
        <div className="eyebrow-box mb-8">
          <span className="eyebrow text-ink">Method</span>
        </div>
        <h2 className="display max-w-3xl text-4xl text-ink md:text-6xl">
          How SGS works.
        </h2>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted md:text-lg">
          Task configurations are sampled by the policy&apos;s current success
          rate, concentrating on the ones it solves about half the time.
        </p>
        <SectionVideo src="/method.mp4" poster="/method-poster.jpg" />
      </div>
    </section>
  );
}
