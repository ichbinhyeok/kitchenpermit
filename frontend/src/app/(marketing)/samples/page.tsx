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
    href: "/samples/axis-1",
    label: "Customer Service Report Sample",
    title: "Hood closeout service report preview",
    description:
      "A free public sample vendors can use in cold email, follow-up, and search to show what the restaurant receives after service.",
    visible: [
      "Service summary, work scope, and next-step structure",
      "Photo evidence rhythm and customer-facing language",
      "How inaccessible or partial work is surfaced",
    ],
    hidden: [
      "Company-specific logo/contact and clean delivery export",
      "Raw internal note layer and unfiltered media set",
    ],
  },
] as const;

export default function SamplesPage() {
  return (
    <>
      <PageHeader
        label="SAMPLES // SERVICE REPORT"
        title="Preview the customer service report."
        description="The public sample should prove the product without asking a vendor to imagine it: service result, blocked access, photo evidence, PDF posture, and next action in one customer-readable record."
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
              View sample report
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
            Future samples can cover other vendor workflows. For now, the public sample
            path should lead with the finished customer service report restaurants can save.
          </p>
        </Panel>
      </section>
      <ResourceLinkStrip
        label="Sample follow-up links"
        title="Give vendors a page for the exact question they ask next."
        description="After the sample, link them to the template, restaurant-report, photo-report, or after-service handoff page instead of repeating the whole pitch."
      />
      <section className="container-shell pb-20">
        <Panel className="grid gap-6 px-6 py-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-start">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Sample rules
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-foreground">
              The sample should prove product quality, not internal product mechanics.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              "The service report sample proves readability, findings clarity, and rebook posture.",
              "This sample link is free and public on purpose. It should work in cold email and in SEO.",
              "HTML and PDF previews are fine, but the public sample should not pretend every company detail is already configured.",
              "A vendor should leave the page thinking the artifact is credible, not that the data was handed away.",
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
