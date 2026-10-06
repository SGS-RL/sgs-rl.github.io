import "../_poster/poster.css";
import "../_site/site.css";
import Header from "./Header";
import { SCHEMES } from "./inks";
import "./combined.css";

// /lab/header-colors: the combined page's header in each colour scheme of
// ./inks.ts, one after another, so they can be compared. Each comes with a
// still copy of the black bar that sits above it on the page.
function Bar() {
  return (
    <div className="pz-grid pz-small h-[var(--bar)] items-center bg-black text-white">
      <span className="col-span-3">SGS</span>
      <span className="col-span-3 justify-self-end md:hidden">Menu</span>
      <span className="hidden justify-self-end md:col-span-9 md:flex md:gap-4">
        <span>Paper ↗</span>
        <span>Code ↗</span>
      </span>
    </div>
  );
}

export default function HeaderColors() {
  return (
    <div className="pz st cb">
      {SCHEMES.map((s) => (
        <section key={s.id} className="border-b-[24px] border-black">
          <p className="pz-grid pz-small bg-white py-2">
            <span className="col-span-1">{s.id.toUpperCase()}</span>
            <span className="col-span-5 md:col-span-11">
              {s.name}
              <span className="text-black/50">
                {" "}
                · {s.group}
                {s.note && <>. {s.note}</>}
              </span>
            </span>
          </p>
          <div data-scheme={s.id}>
            <Bar />
            <Header inks={s.inks} id={s.id} />
          </div>
        </section>
      ))}
    </div>
  );
}
