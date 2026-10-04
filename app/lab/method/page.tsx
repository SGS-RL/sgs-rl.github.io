import type { Metadata } from "next";
import MethodLab from "../_method/MethodLab";

export const metadata: Metadata = { title: "Method" };

export default function Page() {
  return <MethodLab />;
}
