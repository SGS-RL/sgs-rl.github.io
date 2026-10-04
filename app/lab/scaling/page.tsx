import type { Metadata } from "next";
import ScalingStudy from "../_scaling/ScalingStudy";

export const metadata: Metadata = { title: "Scaling, with clips" };

export default function Page() {
  return <ScalingStudy />;
}
