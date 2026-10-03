import type { Metadata } from "next";
import SitePage from "../_site/SitePage";

export const metadata: Metadata = { title: "Site" };

export default function Page() {
  return <SitePage />;
}
