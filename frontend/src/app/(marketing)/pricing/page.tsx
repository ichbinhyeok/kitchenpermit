import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/marketing/page-header";
import { Panel } from "@/components/ui/panel";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Starting-at pricing for Axis 1, Axis 2, bundle, and live batches.",
};

export default function PricingPage() {
  const [axis1Setup, axis2Setup, bundle, liveBatch] = siteConfig.pricing;
  const pricingCards = [
    {
      ...axis1Setup,
      label: "Axis 1 setup",
      summary:
        "Customer-facing packet setup for service completion, proof-of-work clarity, and rebook posture.",
      bullets: [
        "Vendor header, contact block, and outward-facing narrative structure",
        "HTML-first packet that can also export cleanly to PDF",
        "Built to reduce rewriting after the service visit",
      ],
      featured: false,
    },
    {
      ...axis2Setup,
      label: "Axis 2 setup",
      summary:
        "First-touch packet setup for the vendor-side outbound motion once a lead becomes worth contacting.",
      bullets: [
        "Packet framing for why this lead matters now",
        "Suggested opener blocks and outreach posture",
        "Supports a list-first commercial motion rather than generic marketing copy",
      ],
      featured: false,
    },
    {
      ...bundle,
      label: "Bundle",
      summary:
        "Both packet systems for vendors who want current-customer proof and new-sales support together.",
      bullets: [
        "Shared vendor language layer across Axis 1 and Axis 2",
        "Best entry point when the vendor wants retention and growth together",
        "Most efficient paid setup for a two-motion operator",
      ],
      featured: true,
    },
    {
      ...liveBatch,
      label: "Paid batch",
      summary:
        "Ten deduped live opportunities with batch framing strong enough to use immediately in outbound.",
      bullets: [
        "Built from canonical opportunities after QA and dedupe",
        "Masked public sample stays free, full usable batch stays paid",
        "Recurring delivery is not assumed before repeat purchase exists",
      ],
      featured: false,
    },
  ] as const;

  return (
    <>
      <PageHeader
        label="PRICING // STARTING AT"
        title="Commercial offers that match the actual MVP."
        description="hood is not seat-based SaaS pricing. Public pricing should show the opening commercial frame, keep the offer legible, and avoid pretending recurring demand is already proven."
      />
      <section className="container-shell grid gap-6 pb-10 md:grid-cols-2 xl:grid-cols-4">
        {pricingCards.map((item) => (
          <Panel
            key={item.name}
            className={`flex h-full flex-col px-6 py-6 ${item.featured ? "border-accent bg-white" : ""}`}
          >
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
              {item.label}
            </p>
            <p className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-foreground">
              {item.price}
            </p>
            <p className="mt-4 text-base leading-8 text-muted-foreground">{item.summary}</p>
            <div className="mt-6 space-y-3 border-t border-border pt-5">
              {item.bullets.map((bullet) => (
                <p key={bullet} className="text-sm leading-7 text-foreground">
                  {bullet}
                </p>
              ))}
            </div>
          </Panel>
        ))}
      </section>
      <section className="container-shell grid gap-6 pb-20 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <Panel className="px-6 py-6">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Commercial honesty notes
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              "Axis 2 coverage should not be sold as live outside active metros.",
              "Public samples stay masked and cannot leak a fully usable lead package.",
              "Lists are freshness-sensitive. The promise is signal quality, not guaranteed closed business.",
              "Recurring delivery gets quoted only after repeat usage evidence exists.",
            ].map((rule) => (
              <div key={rule} className="border border-border bg-white px-4 py-4 text-sm leading-7 text-muted-foreground">
                {rule}
              </div>
            ))}
          </div>
        </Panel>
        <Panel className="px-6 py-6">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
            How the sale actually works
          </p>
          <div className="mt-5 space-y-4">
            {[
              "Start with a structured request or direct email.",
              "Review masked samples and opening pricing before a manual follow-up.",
              "Buy a setup or paid batch first. Repeat usage comes before any recurring quote.",
            ].map((step) => (
              <div key={step} className="border border-border bg-[rgba(17,17,17,0.03)] px-4 py-4 text-sm leading-7 text-foreground">
                {step}
              </div>
            ))}
            <Link
              href="/start"
              className="inline-flex w-full items-center justify-center border border-accent bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-accent-strong"
            >
              Start the intake
            </Link>
          </div>
        </Panel>
      </section>
    </>
  );
}
