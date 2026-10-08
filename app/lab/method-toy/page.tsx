import type { Metadata } from "next";
import MethodToy from "../_combined/MethodToy";

export const metadata: Metadata = { title: "Method, toy example" };

export default function Page() {
  return <MethodToy />;
}
