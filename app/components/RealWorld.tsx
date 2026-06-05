import SectionVideo from "./SectionVideo";

export default function RealWorld() {
  return (
    <section id="real-world" className="relative bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-28 md:px-10 md:py-40">
        <div className="eyebrow-box mb-8">
          <span className="eyebrow text-ink">Real-world</span>
        </div>
        <h2 className="display max-w-3xl text-4xl text-ink md:text-6xl">
          On real hardware.
        </h2>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted md:text-lg">
          Policies transferred from simulation to physical robots.
        </p>
        <SectionVideo
          src="/real-world.mp4"
          poster="/real-world-poster.jpg"
        />
      </div>
    </section>
  );
}
