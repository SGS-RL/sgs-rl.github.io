import type { Metadata } from "next";
import CoverPage from "../_cover/CoverPage";

export const metadata: Metadata = { title: "Wordmarks and covers" };

export default function Page() {
  return <CoverPage />;
}
