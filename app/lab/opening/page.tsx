import type { Metadata } from "next";
import OpeningStudy from "../_combined/OpeningStudy";

export const metadata: Metadata = { title: "Opening" };

export default function Page() {
  return <OpeningStudy />;
}
