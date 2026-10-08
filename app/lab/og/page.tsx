import type { Metadata } from "next";
import OgCards from "../_combined/OgCards";

export const metadata: Metadata = { title: "Link previews" };

export default function Page() {
  return <OgCards />;
}
