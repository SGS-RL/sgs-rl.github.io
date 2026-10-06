import "../_poster/poster.css";
import "../_site/site.css";
import Header from "./Header";
import Nav from "./Nav";
import "./combined.css";

// /lab/combined: the site the owner is assembling from the studies, one
// section at a time, each approved before the next. Parts are copied into
// this folder rather than imported from the study they came from, so the
// studies stay as reviewed; shared, unchanged pieces (content.ts, the
// Wordmark, poster.css and site.css) are imported.
//
// Sections so far:
// 1. Header, from /lab/site-2 and /lab/site-3, with the full title.
export default function CombinedPage() {
  return (
    <div className="pz st cb">
      <Nav />
      <Header />
    </div>
  );
}
