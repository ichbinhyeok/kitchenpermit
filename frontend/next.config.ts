import type { NextConfig } from "next";

const apiProxyTarget = process.env.HOOD_API_PROXY_TARGET?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 92],
  },
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    if (!apiProxyTarget) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
