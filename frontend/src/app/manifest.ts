import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KitchenPermit service report builder",
    short_name: "KitchenPermit",
    description:
      "Mobile-first service report builder for kitchen exhaust vendors.",
    start_url: "/axis-1/tool",
    scope: "/",
    display: "standalone",
    background_color: "#f3efe8",
    theme_color: "#f3efe8",
    orientation: "portrait",
    categories: ["business", "productivity", "utilities"],
    icons: [
      {
        src: "/icons/hood-app-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/hood-app-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/hood-maskable-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/hood-app-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Create service report",
        short_name: "Report",
        description: "Open the mobile service report builder.",
        url: "/axis-1/tool",
        icons: [
          {
            src: "/icons/hood-app-icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "View sample service report",
        short_name: "Sample",
        description: "Open the customer-facing sample service report.",
        url: "/p/sample-hood-cleaning",
        icons: [
          {
            src: "/icons/hood-app-icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    ],
  };
}
