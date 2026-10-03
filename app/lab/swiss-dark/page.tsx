import type { Metadata } from "next";
import SwissPage from "../_components/SwissPage";

export const metadata: Metadata = { title: "Swiss, dark" };

export default function Page() {
  return <SwissPage theme="dark" hero="loop" />;
}
