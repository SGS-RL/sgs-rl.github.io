import type { Metadata } from "next";
import MethodNav from "../_nav/MethodNav";

export const metadata: Metadata = { title: "Method as navigation" };

export default function Page() {
  return <MethodNav />;
}
