import { Mark, Meta, Title } from "./Header";
import { HEADER_INKS as inks } from "./inks";
import "./sizes.css";

// The combined page's header, in colour scheme H4 and one of two layouts
// from /lab/header-sizes/ (owner, 2026-10-07: S4 and S6, both kept for
// now). S4: the mark on half the page, the title beside its foot, the
// authors under the title. S6: the mark on 8 columns on the right, the
// authors on the left at its foot, the title below. On phones the mark
// spans the page, then the title and the authors. Layouts in ./sizes.css.
export type TopLayout = "s4" | "s6";

export default function Top({
  layout = "s4",
  id = "top",
  links = false,
}: {
  layout?: TopLayout;
  id?: string;
  // Link each author's name to their page (the combined page).
  links?: boolean;
}) {
  return (
    <header
      id={id}
      className={`hs hs-${layout} pz-grid`}
      style={{ background: inks.ground, color: inks.type }}
    >
      <div className="hs-mark">
        <Mark measure="var(--hs-measure)" />
      </div>
      <Title className="hs-title st-lead" />
      <Meta className="hs-meta" links={links} />
    </header>
  );
}
