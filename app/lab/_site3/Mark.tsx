import Wordmark from "../_cover/Wordmark";
import { HEADER_CAP } from "../_cover/SiteHeader";

// The cover study's V6 wordmark: "Success", "Guided", "Sampling" hug the
// strokes and step down diagonally. HEADER_CAP keeps the whole header on
// the first screen of a short, wide screen; when it acts, the mark stays
// flush left.
export function HeaderMark() {
  return <Wordmark variant="v6" color="#ff6464" cap={HEADER_CAP} />;
}

// Footer: white on black, same cap.
export function FooterMark() {
  return <Wordmark variant="v6" cap={HEADER_CAP} />;
}
