import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/seo";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/api/axis1/assets/",
          "/api/axis1/reports/public/",
        ],
        disallow: [
          "/api/",
          "/auth/",
          "/dashboard",
          "/exports/",
          "/forgot-password",
          "/login",
          "/ops/",
          "/reset-password",
          "/start/submitted",
        ],
      },
    ],
    sitemap: canonicalUrl("/sitemap.xml"),
  };
}
