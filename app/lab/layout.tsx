import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import "./lab.css";

const interTight = Inter_Tight({
  variable: "--font-swiss-display",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

// Unlisted design studies: reachable by URL only, kept out of search.
export const metadata: Metadata = {
  title: { template: "%s · SGS lab", default: "SGS lab" },
  robots: { index: false, follow: false },
};

export default function LabLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className={interTight.variable}>{children}</div>;
}
