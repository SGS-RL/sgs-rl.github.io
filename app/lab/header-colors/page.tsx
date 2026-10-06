import type { Metadata } from "next";
import HeaderColors from "../_combined/HeaderColors";

export const metadata: Metadata = { title: "Header colours" };

export default function Page() {
  return <HeaderColors />;
}
