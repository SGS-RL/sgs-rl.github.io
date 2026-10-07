"use client";

import { useEffect, useState } from "react";

// The Method band, pinned while its section is on screen, with the name of
// the part in view beside "Method" (MethodParts, style "pinned"). The part
// in view is the last one whose top has passed the upper third of the
// screen.
export default function PinnedBand({
  section,
  stick,
}: {
  section: string;
  stick: string;
}) {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const root = document.getElementById(section);
    if (!root) return;
    const parts = [...root.querySelectorAll<HTMLElement>("[data-part]")];
    const update = () => {
      const line = window.innerHeight / 3;
      let hit: string | null = null;
      for (const p of parts)
        if (p.getBoundingClientRect().top < line) hit = p.dataset.part ?? null;
      setNow(hit);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [section]);
  return (
    <h2
      className={`cb-pinned sticky ${stick} z-30 border-y border-black bg-white px-[var(--m)] pb-[0.08em] pt-[0.04em]`}
    >
      <span className="pz-head">Method</span>
      <span className="cb-pinned-now pz-mid" aria-hidden="true">
        {now}
      </span>
    </h2>
  );
}
