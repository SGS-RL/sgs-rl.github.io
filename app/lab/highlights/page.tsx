import type { Metadata } from "next";
import HighlightsStudy from "../_combined/HighlightsStudy";

export const metadata: Metadata = { title: "Highlights" };

export default function Page() {
  return <HighlightsStudy />;
}
