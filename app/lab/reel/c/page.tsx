import type { Metadata } from "next";
import { ReelVariant } from "../../_reel/ReelStudy";

export const metadata: Metadata = { title: "Highlight reel, C" };

export default function Page() {
  return <ReelVariant v="c" />;
}
