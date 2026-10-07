import type { Metadata } from "next";
import HeaderSizes from "../_combined/HeaderSizes";

export const metadata: Metadata = { title: "Header sizes" };

export default function Page() {
  return <HeaderSizes />;
}
