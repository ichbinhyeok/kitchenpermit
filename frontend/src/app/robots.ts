import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/seo";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/auth/",
          "/dashboard",
          "/exports/",
          "/forgot-password",
          "/login",
          "/ops/",
          "/p/",
          "/reports/",
          "/reset-password",
          "/start/submitted",
        ],
      },
    ],
    sitemap: canonicalUrl("/sitemap.xml"),
  };
}
