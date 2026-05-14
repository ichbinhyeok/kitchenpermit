import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    cpus: 2,
  },
  images: {
    unoptimized: true,
    qualities: [75, 92],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
