import {
  AXIS1_COMPANY_LAUNCH_PRICE,
  AXIS1_COMPANY_MONTHLY_PRICE,
} from "@/lib/axis1-product-policy";

export const siteConfig = {
  name: "KitchenPermit",
  description:
    "Branded service report links and PDFs for hood cleaning companies after every cleaning job.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kitchenpermit.com",
  supportEmail:
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "compliance@kitchenpermit.com",
  navigation: [
    { href: "/", label: "Home" },
    { href: "/axis-1", label: "Service Report" },
    { href: "/samples/axis-1", label: "Sample" },
    { href: "/resources", label: "Resources" },
    { href: "/pricing", label: "Pricing" },
    { href: "/dashboard", label: "Account" },
  ],
  pricing: [
    {
      name: "Company Version",
      price: AXIS1_COMPANY_MONTHLY_PRICE,
      summary: `Saved company details, hosted service report links, clean PDF copies, and report history for ${AXIS1_COMPANY_LAUNCH_PRICE}.`,
    },
  ],
} as const;
