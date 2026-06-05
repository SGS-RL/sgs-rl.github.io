import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-display",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const inter = Inter({
  variable: "--font-sans-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "A Balanced Data Diet: Mega-Scale RL for Robot Control",
  description:
    "Success-Guided Sampling allocates parallel simulation across task configurations by current success rate, scaling reinforcement learning past one million environments for locomotion and manipulation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} ${inter.variable} no-scroll-bounce`}
    >
      <body>{children}</body>
    </html>
  );
}
