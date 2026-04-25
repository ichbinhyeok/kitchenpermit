export const siteConfig = {
  name: "hood",
  description:
    "Product-grade service packets, live outbound dossiers, and manual commerce flows for kitchen exhaust vendors.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kitchenpermit.com",
  supportEmail:
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "compliance@kitchenpermit.com",
  navigation: [
    { href: "/", label: "Home" },
    { href: "/axis-1", label: "Existing Customers" },
    { href: "/axis-2", label: "New Sales" },
    { href: "/samples", label: "Samples" },
    { href: "/pricing", label: "Pricing" },
  ],
  pricing: [
    {
      name: "Service Packet Setup",
      price: "$149",
      summary: "Starting point for service-completion packets and repeat-trust proof.",
    },
    {
      name: "Sales Packet Setup",
      price: "$149",
      summary:
        "Starting point for first-touch outbound packet structure and positioning.",
    },
    {
      name: "Service + Sales Bundle",
      price: "$259",
      summary:
        "Combined setup for vendors running both existing-customer packets and new-sales outreach together.",
    },
    {
      name: "Live Sales Batch",
      price: "$149",
      summary: "Starting point for 10 live prospects after QA and dedupe.",
    },
  ],
} as const;
