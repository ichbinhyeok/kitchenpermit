import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    qualities: [75, 92],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
