import type { Metadata } from "next";
import TitleStudy from "../_title/TitleStudy";

export const metadata: Metadata = { title: "Full title" };

export default function Page() {
  return <TitleStudy />;
}
