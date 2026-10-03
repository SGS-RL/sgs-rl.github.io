import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a fully static site into `out/` for GitHub Pages.
  output: "export",
  // Emit `lab/swiss/index.html` rather than `lab/swiss.html`, so nested pages
  // resolve on GitHub Pages (a `lab.html` next to a `lab/` folder does not).
  trailingSlash: true,
  // GitHub Pages has no image optimization server, so serve images as-is.
  images: { unoptimized: true },
};

export default nextConfig;
