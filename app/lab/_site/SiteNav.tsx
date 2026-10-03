"use client";

import { useEffect, useState } from "react";
import { LINKS } from "../content";

export const SECTIONS: [string, string][] = [
  ["overview", "Overview"],
  ["method", "Method"],
  ["results", "Results"],
  ["clips", "Clips"],
  ["cite", "Cite"],
];

// Black bar as on the NOF website. Marks the section in view; on phones the
// links move into a full-screen menu.
export default function SiteNav() {
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const els = SECTIONS.map(([id]) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          )[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const html = document.documentElement;
    html.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <div className="pz-grid pz-small sticky top-0 z-50 h-[var(--bar)] items-center bg-black text-white">
        <a href="#top" className="col-span-2 md:col-span-3">
          SGS
        </a>
        <nav aria-label="Sections" className="col-span-6 hidden gap-5 md:flex">
          {SECTIONS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active === id ? "location" : undefined}
              className={
                active === id
                  ? "underline underline-offset-4"
                  : "opacity-70 hover:opacity-100"
              }
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="col-span-4 flex justify-end gap-4 md:col-span-3">
          <a href={LINKS.paper} className="hidden md:inline">
            Paper ↗
          </a>
          <a href={LINKS.code} className="hidden md:inline">
            Code ↗
          </a>
          <button
            type="button"
            className="md:hidden"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            Menu
          </button>
        </div>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[60] flex flex-col bg-black text-white"
        >
          <div className="pz-grid pz-small h-[var(--bar)] items-center">
            <span className="col-span-3">SGS</span>
            <button
              type="button"
              className="col-span-3 justify-self-end"
              onClick={() => setOpen(false)}
              autoFocus
            >
              Close
            </button>
          </div>
          <nav
            aria-label="Sections"
            className="flex flex-1 flex-col px-[var(--m)] pt-4"
          >
            {SECTIONS.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setOpen(false)}
                className="pz-head border-t border-white/40 py-1"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="pz-grid pz-small gap-y-1 border-t border-white/40 py-3">
            <a href={LINKS.paper} className="col-span-3">
              Paper ↗
            </a>
            <a href={LINKS.code} className="col-span-3">
              Code ↗
            </a>
          </div>
        </div>
      )}
    </>
  );
}
