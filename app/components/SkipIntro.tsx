"use client";

import { useEffect, useState } from "react";

const TARGET_ID = "manipulation";

export default function SkipIntro() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const target = document.getElementById(TARGET_ID);
    if (!target) return;
    const io = new IntersectionObserver(([e]) => setHidden(e.isIntersecting), {
      rootMargin: "0px 0px -45% 0px",
    });
    io.observe(target);
    return () => io.disconnect();
  }, []);

  const skip = () => {
    window.dispatchEvent(new Event("sgs:release"));
    document
      .getElementById(TARGET_ID)
      ?.scrollIntoView({ behavior: "auto", block: "start" });
  };

  return (
    <button
      type="button"
      onClick={skip}
      aria-label="Skip the intro and jump to the details"
      className={`group fixed right-6 top-6 z-50 flex items-center gap-2.5 border-2 border-beacon bg-paper/30 px-4 py-2.5 text-ink shadow-[0_0_0_4px_rgba(255,196,0,0.18)] backdrop-blur-sm transition-all duration-300 hover:bg-beacon md:right-10 md:top-9 ${
        hidden
          ? "pointer-events-none -translate-y-3 opacity-0"
          : "translate-y-0 opacity-100"
      }`}
    >
      <span className="block h-2 w-2 animate-pulse bg-beacon transition-opacity duration-300 group-hover:opacity-0" />
      <span className="eyebrow">Skip intro</span>
      <span className="text-sm leading-none transition-transform duration-300 group-hover:translate-y-0.5">
        ↓
      </span>
    </button>
  );
}
