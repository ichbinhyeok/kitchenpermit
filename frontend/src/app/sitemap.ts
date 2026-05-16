import type { MetadataRoute } from "next";
import {
  canonicalUrl,
  indexedSiteRoutes,
  sitemapLastModified,
} from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(sitemapLastModified);

  return indexedSiteRoutes.map((route) => ({
    url: canonicalUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
