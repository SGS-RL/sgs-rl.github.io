import SectionVideo from "./SectionVideo";

export default function Manipulation() {
  return (
    <section id="manipulation" className="relative bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-28 md:px-10 md:py-40">
        <div className="eyebrow-box mb-8">
          <span className="eyebrow text-ink">Manipulation</span>
        </div>
        <h2 className="display max-w-3xl text-4xl text-ink md:text-6xl">
          Contact-rich assembly.
        </h2>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted md:text-lg">
          A NIST taskboard task, trained with reinforcement learning, no
          demonstrations.
        </p>

        <SectionVideo
          src="/manipulation.mp4"
          poster="/manipulation-poster.jpg"
        />
      </div>
    </section>
  );
}
