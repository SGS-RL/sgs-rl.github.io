import "../_poster/poster.css";
import "../_site/site.css";
import MethodFlow2, { type FlowText } from "./MethodFlow2";
import { HighlightsBar } from "./MethodFlowBar";
import "./combined.css";

// /lab/method-flow-2: the Method in the owner's order, numbered, with the
// text across the page in two styles (./MethodFlow2.tsx).
const STYLES: [FlowText, string, string][] = [
  [
    "w1",
    "W1",
    "Text across the page, thin with bold key phrases, at the summary's next size down.",
  ],
  [
    "w2",
    "W2",
    "Text across the page, thin with bold key phrases, at the summary's size.",
  ],
];

export default function MethodFlow2Study() {
  return (
    <div className="pz st cb bg-white">
      {STYLES.map(([style, name, note]) => (
        <section key={style} className="border-b-[24px] border-black">
          <p className="pz-grid pz-small bg-white py-2">
            <span className="col-span-1">{name}</span>
            <span className="col-span-5 text-black/50 md:col-span-11">
              {note}
            </span>
          </p>
          <div data-variant={style} className="bg-white">
            <HighlightsBar />
            <MethodFlow2 id={`m-${style}`} style={style} />
          </div>
        </section>
      ))}
    </div>
  );
}
