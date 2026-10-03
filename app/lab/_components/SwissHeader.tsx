import { LINKS } from "../content";

const NAV: [string, string][] = [
  ["Summary", "#summary"],
  ["Method", "#method"],
  ["Scaling", "#scaling"],
  ["Manipulation", "#manipulation"],
  ["Clips", "#clips"],
];

export default function SwissHeader({
  nav = NAV,
  home = "#top",
}: {
  nav?: [string, string][];
  home?: string;
}) {
  return (
    <header className="sw-grid items-baseline py-3 md:py-4">
      <a
        href={home}
        className="col-span-2 flex items-baseline gap-3 md:col-span-3"
      >
        <span className="text-lg font-semibold tracking-[-0.03em]">SGS</span>
        <span className="sw-label hidden text-sw-mute lg:inline">
          Success-Guided Sampling
        </span>
      </a>
      <nav className="sw-label col-span-6 hidden gap-5 md:flex">
        {nav.map(([label, href]) => (
          <a key={href} href={href} className="sw-link">
            {label}
          </a>
        ))}
      </nav>
      <div className="sw-label col-span-2 flex justify-end gap-5 md:col-span-3">
        <a href={LINKS.paper} className="sw-link">
          Paper ↗
        </a>
        <a href={LINKS.code} className="sw-link">
          Code ↗
        </a>
      </div>
    </header>
  );
}
