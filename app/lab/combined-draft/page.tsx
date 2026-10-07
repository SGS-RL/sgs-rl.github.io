import type { Metadata } from "next";
import CombinedPage from "../_combined/CombinedPage";

// The combined page with sections 6–12 (set up 2026-10-07, not yet
// reviewed), parked here while /lab/combined/ keeps the approved sections.
export const metadata: Metadata = { title: "Combined, draft" };

export default function Page() {
  return <CombinedPage draft />;
}
