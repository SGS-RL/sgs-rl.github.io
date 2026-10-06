// The summary of /lab/swiss-3 ("01 Summary"): a rule, a small label on the
// left, one large paragraph on columns 4–12. Set in the combined page's
// single weight; the section number is left out, as this page does not
// number its sections.
export default function Summary({ id = "summary" }: { id?: string }) {
  return (
    <section
      id={id}
      className="pz-grid scroll-mt-[var(--bar)] gap-y-4 pb-16 md:pb-24"
    >
      <div className="col-span-full h-px bg-black" />
      <h2 className="pz-small col-span-6 md:col-span-3">Summary</h2>
      <p className="cb-sum col-span-6 md:col-span-9">
        Success-Guided Sampling (SGS) spends parallel simulation on the task
        configurations a policy solves only some of the time. With it,
        reinforcement learning keeps improving past one million parallel
        environments, in legged locomotion and contact-rich manipulation.
      </p>
    </section>
  );
}
