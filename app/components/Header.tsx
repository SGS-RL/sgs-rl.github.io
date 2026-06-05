"use client";

const SECTIONS: [string, string][] = [
  ["Manipulation", "#manipulation"],
  ["Method", "#method"],
  ["Scaling", "#scaling"],
  ["Real-world", "#real-world"],
];

const LINKS: [string, string][] = [
  ["Paper", "#"],
  ["Code", "#"],
];

function releasePin() {
  window.dispatchEvent(new Event("sgs:release"));
}

export default function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-40 flex items-center gap-8 px-6 py-6 md:px-10">
      <a href="#" className="flex items-center gap-2.5">
        <span className="block h-2.5 w-2.5 bg-beacon shadow-[0_0_0_4px_rgba(255,196,0,0.25)]" />
        <span className="font-mono text-lg font-bold tracking-tight text-ink">
          SGS
        </span>
      </a>
      <nav className="hidden gap-7 md:flex">
        {SECTIONS.map(([label, href]) => (
          <a
            key={label}
            href={href}
            onClick={releasePin}
            className="eyebrow text-ink/70 transition-colors hover:text-robot"
          >
            {label}
          </a>
        ))}
        {LINKS.map(([label, href]) => (
          <a
            key={label}
            href={href}
            className="eyebrow text-ink/70 transition-colors hover:text-robot"
          >
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}
