import type { Metadata } from "next";
import SamplingOverlay, { type OverlayVariant } from "../../SamplingOverlay";

// Not for the site: frames for the thread video of "Sampling during
// training" with the plots over the footage, one page per version
// (../../SamplingOverlay.tsx).
export const metadata: Metadata = { title: "Thread, sampling overlay" };
export const dynamicParams = false;

// Listed here: a client module's exports are references on the server.
const VARIANTS: OverlayVariant[] = ["o1", "o2", "o3", "o5", "o6"];

export function generateStaticParams() {
  return VARIANTS.map((v) => ({ v }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ v: string }>;
}) {
  const { v } = await params;
  return <SamplingOverlay v={v as OverlayVariant} />;
}
