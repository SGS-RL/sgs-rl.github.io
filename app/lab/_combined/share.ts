import type { Metadata } from "next";
import { FULL_SUBTITLE, TITLE } from "../content";
import { SUMMARY_TEXT_2 } from "./SummaryPlain";

// What a link to the page shows when it is shared (owner, 2026-10-08: the
// preview showed the starter template's triangle icon): the full title, the
// summary, and a 1200 × 630 card (public/og/, made on /lab/og/ by
// scripts/lab/og_cards.mjs). CARD picks the card; the icon is
// app/icon.png, app/apple-icon.png and app/favicon.ico (I4: "SGS", white on
// black, the favicon's 16, 32 and 48 px set natively at each size).
//
// Previews need absolute image URLs: SITE_URL at build time, else the
// GitHub Pages address. Build the Cloudflare preview with
// SITE_URL=https://sgs-rl-lab.mateogc.workers.dev so its cards resolve.

export const CARD = "/og/sgs-o2.jpg";
const SITE = process.env.SITE_URL ?? "https://sgs-rl.github.io";
const title = `${TITLE}: ${FULL_SUBTITLE}`;
const alt =
  "The SGS mark and the paper's title beside a UR5e gripper placing a nut by a bolt";

export function shareMetadata(path: string): Metadata {
  return {
    metadataBase: new URL(SITE),
    title: { absolute: title },
    description: SUMMARY_TEXT_2,
    openGraph: {
      type: "website",
      url: path,
      siteName: "SGS",
      title,
      description: SUMMARY_TEXT_2,
      locale: "en_US",
      images: [{ url: CARD, width: 1200, height: 630, alt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: SUMMARY_TEXT_2,
      images: [{ url: CARD, alt }],
    },
  };
}
