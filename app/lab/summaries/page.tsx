import type { Metadata } from "next";
import SummaryStudy from "../_combined/SummaryStudy";

export const metadata: Metadata = { title: "Summaries" };

export default function Page() {
  return <SummaryStudy />;
}
