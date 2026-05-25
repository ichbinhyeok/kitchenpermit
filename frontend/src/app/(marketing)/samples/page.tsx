import type { Metadata } from "next";
import Link from "@/components/navigation/static-link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-header";
import { ResourceLinkStrip } from "@/components/marketing/resource-link-strip";
import { Panel } from "@/components/ui/panel";
import { publicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = publicPageMetadata({
  title: "Samples",
  description: "Public sample service report for hood cleaning customers after service.",
  path: "/samples",
});

const samples = [
  {
    href: "/samples/quick-closeout",
    label: "Output Overview",
    title: "One sample, two customer outputs",
    description:
      "Start here to see the customer link and the retained PDF copy side by side.",
    visible: [
      "Service date, before/after photos, blocked access, and next action",
      "Hood-specific areas like filters, duct access, fan, and grease containment",
      "Direct paths to the live customer link and PDF copy",
    ],
    hidden: [
      "Company-specific branding and contact details",
      "Saved report history and retained customer links",
    ],
  },
  {
    href: "/samples/axis-1",
    label: "Detailed Customer Link",
    title: "Open the restaurant-facing report",
    description:
      "The full customer link shows the same sample data in the report view the restaurant opens.",
    visible: [
      "Service summary, work scope, and next-step structure",
      "Photo organization and customer-facing language",
      "How inaccessible or partial work is surfaced",
    ],
    hidden: [
      "Company-specific logo/contact and clean delivery export",
      "Technician-only notes and unfiltered media set",
    ],
  },
] as const;

export default function SamplesPage() {
  return (
    <>
      <PageHeader
        label="SAMPLES // SERVICE REPORT"
        title="Preview the customer outputs."
        description="Start with the overview, then open the same sample as either a customer link or a retained PDF copy."
      />
      <section className="container-shell grid gap-6 pb-10 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.42fr)]">
        {samples.map((sample) => (
          <Panel key={sample.href} className="flex h-full flex-col justify-between px-6 py-6">
            <div className="space-y-6">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
                {sample.label}
              </p>
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-foreground">
                  {sample.title}
                </h2>
                <p className="mt-4 text-base leading-8 text-muted-foreground">
                  {sample.description}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="border border-border bg-white px-4 py-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                    Public sample shows
                  </p>
                  <div className="mt-4 space-y-3">
                    {sample.visible.map((item) => (
                      <p key={item} className="text-sm leading-6 text-foreground">
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="border border-border bg-[rgba(17,17,17,0.03)] px-4 py-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                    Paid version keeps back
                  </p>
                  <div className="mt-4 space-y-3">
                    {sample.hidden.map((item) => (
                      <p key={item} className="text-sm leading-6 text-muted-foreground">
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <Link
              href={sample.href}
              className="mt-8 inline-flex min-h-10 items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent"
            >
              {sample.href === "/samples/quick-closeout"
                ? "View output overview"
                : "Open customer link"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Panel>
        ))}
        <Panel className="px-6 py-6">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Later samples
          </p>
          <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-foreground">
            The first launch is focused on the service report.
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Future samples can cover other company workflows. For now, the public sample
            path should lead with the finished customer service report restaurants can save.
          </p>
        </Panel>
      </section>
      <ResourceLinkStrip
        label="More report resources"
        title="Use the resource pages when a company wants a specific template."
        description="Templates and examples cover blocked access wording, restaurant-facing reports, photo records, and after-service handoff language."
      />
      <section className="container-shell pb-20">
        <Panel className="grid gap-6 px-6 py-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-start">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
              How to read the samples
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-foreground">
              The sample pages show the customer record, not a full back-office system.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              "The overview is the best first link because it explains both outputs.",
              "The detailed sample is the restaurant-facing customer link.",
              "Sample company details are generic and do not represent a real customer account.",
              "KitchenPermit is service report software, not a permit, certificate, inspection, or compliance approval.",
            ].map((rule) => (
              <div key={rule} className="border border-border bg-white px-4 py-4 text-sm leading-7 text-muted-foreground">
                {rule}
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </>
  );
}
