import type { Metadata } from "next";
import SwissPage from "../_components/SwissPage";

export const metadata: Metadata = { title: "Swiss, light" };

export default function Page() {
  return <SwissPage theme="light" hero="scrub" />;
}
