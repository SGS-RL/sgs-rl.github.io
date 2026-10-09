import { Inter_Tight } from "next/font/google";
import Analytics from "./_analytics/Analytics";
import CombinedPage from "./lab/_combined/CombinedPage";
import { shareMetadata } from "./lab/_combined/share";
import "./lab/lab.css";

// The site (owner, 2026-10-09): the combined page, built and reviewed at
// /lab/combined/, now at the root. As under the lab layout, it needs Inter
// Tight (the page's face) and the lab styles. The earlier site's
// components stay in ./components, unused. The first screen is F2 with the
// run-in chapter list, L3 (owner, 2026-10-09; /lab/fold-2/, /lab/list-3/),
// and W1 for wide screens (/lab/wide-1/).
const interTight = Inter_Tight({
  variable: "--font-swiss-display",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

export const metadata = shareMetadata("/");

export default function Home() {
  return (
    <div className={interTight.variable}>
      <CombinedPage fold="f2" fit="runin" wide="w1" />
      {/* Visitor stats, on the site only (./_analytics/Analytics.tsx). */}
      <Analytics />
    </div>
  );
}
