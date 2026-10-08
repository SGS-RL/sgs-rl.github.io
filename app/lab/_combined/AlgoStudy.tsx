import "../_poster/poster.css";
import "../_site/site.css";
import { AlgoStyleBlock, type AlgoStyle } from "./AlgoStyles";
import "./algo.css";
import "./combined.css";

// /lab/ppo-styles: six ways to set Method part 01 (./AlgoStyles.tsx), each
// under the part's band and lead text as on /lab/combined.
const STYLES: [AlgoStyle, string, string][] = [
  ["a", "As now", "System monospace, two columns, changed lines tinted."],
  [
    "b",
    "Typeset",
    "The page's own face, like a paper's algorithm box: numbered lines, keywords bold, changes in red.",
  ],
  [
    "c",
    "JetBrains Mono",
    "A designed monospace, numbered lines, keywords bold, a solid red bar on the changes.",
  ],
  [
    "d",
    "One diff",
    "One block instead of two: the uniform reset struck out, SGS's lines in red. IBM Plex Mono.",
  ],
  ["e", "Panel", "Geist Mono on a light panel, the changes in red."],
  [
    "f",
    "Steps",
    "No code: the training loop as a row of steps, SGS's steps in red.",
  ],
];

export default function AlgoStudy() {
  return (
    <div className="pz st cb">
      {STYLES.map(([id, name, note]) => (
        <section key={id} id={id} className="border-b-[24px] border-black">
          <p className="pz-grid pz-small bg-white py-2">
            <span className="col-span-1">{id.toUpperCase()}</span>
            <span className="col-span-5 md:col-span-11">
              {name}
              <span className="text-black/50"> · {note}</span>
            </span>
          </p>
          <div className="cb-part pb-12">
            <h3 className="cb-part-band pz-mid border-t border-black">
              <span className="cb-step-num pz-num">01</span>
              <span>The change to PPO</span>
            </h3>
            <div className="cb-part-in-band pt-6">
              <div className="cb-flow-text cb-flow-w1">
                <p>
                  SGS is <strong>standard PPO with a small outer loop</strong>.
                  It changes only which <strong>task configuration</strong> an
                  environment resets to. The PPO policy update stays the same.
                </p>
              </div>
              <AlgoStyleBlock style={id} />
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
