import "../_poster/poster.css";
import "../_site/site.css";
import MethodFlow from "./MethodFlow";
import { HighlightsBar } from "./MethodFlowBar";
import "./combined.css";

// /lab/method-flow: the Method in the owner's order, with band subtitles,
// under a still copy of the page's bar.
export default function MethodFlowStudy() {
  return (
    <div className="pz st cb bg-white">
      <HighlightsBar />
      <MethodFlow />
    </div>
  );
}
