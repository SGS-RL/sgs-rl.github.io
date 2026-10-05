"use client";

import { useEffect, useRef, useState } from "react";
import { LINKS } from "../content";

export const SECTIONS: { id: string; n: string; label: string }[] = [
  { id: "summary", n: "01", label: "Summary" },
  { id: "setup", n: "02", label: "Setup" },
  { id: "method", n: "03", label: "Method" },
  { id: "results", n: "04", label: "Results" },
  { id: "runs", n: "05", label: "Runs" },
  { id: "clips", n: "06", label: "Clips" },
  { id: "cite", n: "07", label: "Cite" },
];

// Sticky bar (copied from _swiss2, with Runs added). From 768 px: section links, the one in view underlined, and
// Paper / Code once the title's own links have scrolled out of view. On
// phones: the section in view next to the name, and a full-screen menu.
export default function Nav({ linksId }: { linksId: string }) {
  const [active, setActive] = useState<string | null>(null);
  const [late, setLate] = useState(false);
  const [open, setOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
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
      { rootMargin: "-40% 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    // Above the first section nothing is marked.
    const top = () => {
      const first = els[0];
      if (first && first.getBoundingClientRect().top > innerHeight * 0.45)
        setActive(null);
    };
    window.addEventListener("scroll", top, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", top);
    };
  }, []);

  useEffect(() => {
    const el = document.getElementById(linksId);
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setLate(!e.isIntersecting && e.boundingClientRect.top < 0),
      { rootMargin: "-44px 0px 0px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [linksId]);

  useEffect(() => {
    if (!open) return;
    const btn = menuBtn.current;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const html = document.documentElement;
    html.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      btn?.focus({ preventScroll: true });
    };
  }, [open]);

  const current = SECTIONS.find((s) => s.id === active);

  return (
    <>
      <div className="s3-bar">
        <div className="sw-grid s3-wrap sw-label h-full items-center">
          <a
            href="#top"
            className="col-span-1 flex items-baseline gap-3 whitespace-nowrap lg:col-span-3"
          >
            <span className="text-base font-semibold tracking-[-0.03em]">
              SGS
            </span>
            <span className="hidden text-sw-mute xl:inline">
              Success-Guided Sampling
            </span>
          </a>
          <p
            className="sw-num col-span-2 truncate text-sw-mute md:hidden"
            aria-hidden="true"
          >
            {current && (
              <>
                {current.n}&ensp;
                <span className="text-sw-fg">{current.label}</span>
              </>
            )}
          </p>
          <nav
            aria-label="Sections"
            className="col-span-8 hidden gap-x-5 md:flex lg:col-span-6"
          >
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                aria-current={active === s.id ? "location" : undefined}
                className="s3-navlink"
              >
                {s.label}
              </a>
            ))}
          </nav>
          <div className="col-span-1 flex justify-end gap-5 md:col-span-3">
            <span
              className="s3-late hidden gap-5 md:flex"
              data-hidden={late ? undefined : ""}
            >
              <a
                href={LINKS.paper}
                className="sw-link"
                tabIndex={late ? 0 : -1}
              >
                Paper ↗
              </a>
              <a href={LINKS.code} className="sw-link" tabIndex={late ? 0 : -1}>
                Code ↗
              </a>
            </span>
            <button
              ref={menuBtn}
              type="button"
              aria-expanded={open}
              aria-controls="s3-menu"
              onClick={() => setOpen(true)}
              className="-my-2 py-2 md:hidden"
            >
              Menu
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div
          id="s3-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="s3-menu"
        >
          <div className="s3-bar">
            <div className="sw-grid sw-label h-full items-center">
              <a
                href="#top"
                onClick={() => setOpen(false)}
                className="col-span-2 text-base font-semibold tracking-[-0.03em]"
              >
                SGS
              </a>
              <button
                type="button"
                autoFocus
                onClick={() => setOpen(false)}
                className="col-span-2 -my-2 justify-self-end py-2"
              >
                Close
              </button>
            </div>
          </div>
          <nav aria-label="Sections" className="px-4 pt-6">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setOpen(false)}
                aria-current={active === s.id ? "location" : undefined}
                className="s3-menu-row text-2xl font-medium tracking-[-0.02em]"
              >
                <span className="sw-label sw-num self-center text-sw-mute">
                  {s.n}
                </span>
                <span>{s.label}</span>
                {active === s.id && (
                  <span
                    className="h-2 w-2 self-center bg-sw-accent"
                    aria-hidden="true"
                  />
                )}
              </a>
            ))}
          </nav>
          <div className="mt-auto flex gap-6 border-t border-sw-rule px-4 py-4 text-lg">
            <a href={LINKS.paper} className="sw-link">
              Paper ↗
            </a>
            <a href={LINKS.code} className="sw-link">
              Code ↗
            </a>
          </div>
        </div>
      )}
    </>
  );
}
