import type { Metadata } from "next";
import CombinedPage from "../_combined/CombinedPage";

export const metadata: Metadata = { title: "Combined" };

export default function Page() {
  return <CombinedPage />;
}
