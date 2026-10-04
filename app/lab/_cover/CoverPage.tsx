import "../_poster/poster.css";
import Cover, { COVERS, type CoverVariant } from "./Cover";
import { SiteFooter, SiteHeader } from "./SiteHeader";
import Wordmark from "./Wordmark";
import { WORDMARKS, type WordmarkVariant } from "./wordmarks";
import "./cover.css";

const VARIANTS = Object.keys(WORDMARKS) as WordmarkVariant[];
const COVER_IDS = Object.keys(COVERS) as CoverVariant[];

function Band({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="cv-band border-y border-black bg-white px-[var(--m)] text-black"
    >
      {children}
    </h2>
  );
}

export default function CoverPage() {
  return (
    <div className="pz cv-page">
      <div className="cv-tag pz-small">
        <span>SGS lab: wordmarks and covers</span>
        <span className="flex gap-4">
          <a href="#wordmarks">A Wordmarks</a>
          <a href="#covers">B Covers</a>
        </span>
      </div>

      <Band id="wordmarks">A Wordmarks</Band>
      {VARIANTS.map((v, i) => {
        const w = WORDMARKS[v];
        return (
          <section
            key={v}
            id={`wm-${v}`}
            className={`bg-white pb-8 pt-2 text-[#ff6464] ${i ? "border-t border-black" : ""}`}
          >
            <div className="pz-grid pz-small gap-y-1 pb-3 text-black">
              <p className="col-span-2 md:col-span-3">
                V{i + 1} {w.label}
              </p>
              <p className="col-span-4 max-w-[60ch] text-black/60 md:col-span-9">
                {w.note}
              </p>
            </div>
            <div className="px-[var(--m)]">
              <Wordmark variant={v} />
            </div>
          </section>
        );
      })}

      <section id="wm-header" className="border-t border-black">
        <div className="cv-tag pz-small">
          <span>Header with the cap (V3)</span>
          <span>Paper Code</span>
        </div>
        <SiteHeader variant="v3" />
      </section>

      <section id="wm-footer">
        <div className="cv-tag pz-small border-t border-white/40">
          <span>Footer, white on black (V3)</span>
        </div>
        <SiteFooter variant="v3" />
      </section>

      <Band id="covers">B Covers</Band>
      {COVER_IDS.map((c, i) => (
        <div key={c} id={`cover-${c}`}>
          <div className="cv-tag pz-small">
            <span>
              C{i + 1} {COVERS[c].label}
            </span>
            <span className="hidden text-white/60 md:block">
              {Object.values(COVERS[c].inks).join("  ")}
            </span>
          </div>
          <Cover variant={c} />
        </div>
      ))}
    </div>
  );
}
