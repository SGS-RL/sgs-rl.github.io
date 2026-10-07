import "../_poster/poster.css";
import "../_site/site.css";
import MethodParts, { type PartsStyle } from "./MethodParts";
import "./combined.css";

// /lab/method-parts: the Method in three parts, with four ways to set the
// subtitles (./MethodParts.tsx). Each is shown under a still copy of the
// page's bar.
const STYLES: [PartsStyle, string, string][] = [
  [
    "rules",
    "Rules",
    "A hairline and a small numbered label per part, under the Method band.",
  ],
  [
    "path",
    "Path",
    "Each part headed “Method / …” at the size of the Overview's entries.",
  ],
  [
    "bands",
    "Bands",
    "Smaller white bands under the Method band, with “Method” beside each part's name.",
  ],
  [
    "pinned",
    "Pinned",
    "As Rules, and the Method band stays at the top while its parts go by, naming the part on screen.",
  ],
];

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

export default function MethodPartsStudy() {
  return (
    <div className="pz st cb">
      {STYLES.map(([style, name, note], i) => (
        <section key={style} className="border-b-[24px] border-black">
          <p className="pz-grid pz-small bg-white py-2">
            <span className="col-span-1">{`M${i + 1}`}</span>
            <span className="col-span-5 md:col-span-11">
              {name} <span className="text-black/50">· {note}</span>
            </span>
          </p>
          <div data-variant={style} className="bg-white">
            <Bar />
            <MethodParts id={`m-${style}`} style={style} stick="top-0" />
          </div>
        </section>
      ))}
    </div>
  );
}
