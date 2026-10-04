// One requestAnimationFrame loop for every method figure on the page. A job
// runs only while its element is on screen (or within a margin of it), and
// the loop stops when no job is visible. Lower `order` runs first, so the
// simulations advance before the figures draw from them.

type Job = {
  el: Element;
  run: (dt: number) => void;
  order: number;
  on: boolean;
};

const jobs: Job[] = [];
let raf = 0;
let last = 0;
let io: IntersectionObserver | null = null;

function frame(now: number) {
  const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
  last = now;
  let any = false;
  for (const j of jobs) {
    if (!j.on) continue;
    any = true;
    j.run(dt);
  }
  if (any) raf = requestAnimationFrame(frame);
  else raf = last = 0;
}

function wake() {
  if (raf || !jobs.some((j) => j.on)) return;
  last = 0;
  raf = requestAnimationFrame(frame);
}

export function onFrame(el: Element, run: (dt: number) => void, order = 1) {
  io ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries)
        for (const j of jobs) if (j.el === e.target) j.on = e.isIntersecting;
      wake();
    },
    { rootMargin: "80px 0px" },
  );
  // Observing an element twice is a no-op, so a second job on the same
  // element takes its current state from the first.
  const twin = jobs.find((j) => j.el === el);
  const job: Job = { el, run, order, on: twin?.on ?? false };
  jobs.push(job);
  jobs.sort((a, b) => a.order - b.order);
  if (twin) wake();
  else io.observe(el);
  return () => {
    const k = jobs.indexOf(job);
    if (k >= 0) jobs.splice(k, 1);
    if (!jobs.some((j) => j.el === el)) io?.unobserve(el);
  };
}

/** Ask for one more frame, e.g. after a paused figure changed. */
export const nudge = wake;
