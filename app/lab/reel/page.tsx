import type { Metadata } from "next";
import ReelStudy from "../_reel/ReelStudy";

export const metadata: Metadata = { title: "Highlight reel" };

export default function Page() {
  return <ReelStudy />;
}
