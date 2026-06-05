import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a fully static site into `out/` for GitHub Pages.
  output: "export",
  // GitHub Pages has no image optimization server, so serve images as-is.
  images: { unoptimized: true },
};

export default nextConfig;
