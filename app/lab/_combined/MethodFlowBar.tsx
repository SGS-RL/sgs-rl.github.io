// A still copy of the combined page's black bar, with its section links.
export function HighlightsBar() {
  return (
    <div className="pz-grid pz-small h-[var(--bar)] items-center bg-black text-white">
      <span className="col-span-3 md:col-span-3">SGS</span>
      <span className="hidden gap-4 opacity-70 md:col-span-6 md:flex">
        <span>Highlights</span>
        <span>Summary</span>
        <span>Overview</span>
        <span className="underline underline-offset-4 opacity-100">Method</span>
      </span>
      <span className="col-span-3 justify-self-end md:hidden">Menu</span>
      <span className="hidden justify-self-end md:col-span-3 md:flex md:gap-4">
        <span>Paper ↗</span>
        <span>Code ↗</span>
      </span>
    </div>
  );
}
