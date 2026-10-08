import { Geist_Mono, IBM_Plex_Mono } from "next/font/google";

// Monospace faces tried for the PPO block on /lab/ppo-styles/ (JetBrains
// Mono is loaded by the root layout as --font-mono-display).
export const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
});
export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
});
