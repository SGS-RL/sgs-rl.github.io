import "../_poster/poster.css";
import "../_site/site.css";
import "./combined.css";
import "./reels.css";
import MethodFlow2 from "./MethodFlow2";

// /lab/method-toy: Method parts 03 (the weighting) and 04 (sampling during
// training), the navigation toy example, parked here as they were on
// /lab/combined on 2026-10-08, with the copy the owner edited.
export default function MethodToy() {
  return (
    <div className="pz st cb">
      <MethodFlow2
        id="toy"
        style="w1"
        algo="c"
        parts={["weighting", "sampling"]}
        heading="Method, toy example (parked)"
      />
    </div>
  );
}
