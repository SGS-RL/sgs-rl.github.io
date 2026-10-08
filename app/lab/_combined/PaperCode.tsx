import { CODE_URL, PAPER_URL } from "./content";

// "Paper" and "Code" in the header and the bar. Links once their URLs are
// set in ./content.ts; until then plain text, Code with "(coming soon)"
// (owner, 2026-10-08). `className` is for both states, `linkClass` only for
// the link.
export function PaperLink({
  className = "",
  linkClass = "",
}: {
  className?: string;
  linkClass?: string;
}) {
  return PAPER_URL ? (
    <a href={PAPER_URL} className={`${className} ${linkClass}`}>
      Paper ↗
    </a>
  ) : (
    <span className={className}>Paper</span>
  );
}

export function CodeLink({
  className = "",
  linkClass = "",
}: {
  className?: string;
  linkClass?: string;
}) {
  return CODE_URL ? (
    <a href={CODE_URL} className={`${className} ${linkClass}`}>
      Code ↗
    </a>
  ) : (
    <span className={className}>
      Code <span className="cb-soon">(coming soon)</span>
    </span>
  );
}
