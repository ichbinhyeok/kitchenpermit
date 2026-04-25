import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-header";
import { Panel } from "@/components/ui/panel";

export const metadata: Metadata = {
  title: "Samples",
  description: "Public sample links for service packets and sales lists.",
};

const samples = [
  {
    href: "/samples/axis-1",
    label: "Existing-Customer Sample",
    title: "Service completion brief preview",
    description:
      "A free public sample link that vendors can use in cold email, follow-up, and search to show what the service packet feels like.",
    visible: [
      "Service summary, work scope, and next-step structure",
      "Evidence block rhythm and customer-facing language",
      "How inaccessible or partial work is surfaced",
    ],
    hidden: [
      "Vendor-specific brand setup and full delivery export",
      "Raw internal note layer and unfiltered media set",
    ],
  },
  {
    href: "/samples/axis-2",
    label: "New-Sales Sample",
    title: "Sales dossier preview",
    description:
      "A masked list-first sample showing how live prospects are framed, scored, and turned into first-touch outreach.",
    visible: [
      "2 to 3 masked rows with trigger-led framing",
      "Why-now explanation and first-touch packet logic",
      "Batch structure that feels commercial, not generic data",
    ],
    hidden: [
      "Direct usable contact paths and complete personalization",
      "Full deduped batch export and enrichment logic",
    ],
  },
] as const;

export default function SamplesPage() {
  return (
    <>
      <PageHeader
        label="SAMPLES // PUBLIC PROOF LINKS"
        title="Preview the packet surfaces."
        description="These sample pages are meant to be public. They help vendors understand the product, support cold outreach, and give search traffic something real to inspect without leaking the paid SKU."
      />
      <section className="container-shell grid gap-6 pb-10 md:grid-cols-2">
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
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent"
            >
              Open sample
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Panel>
        ))}
      </section>
      <section className="container-shell pb-20">
        <Panel className="grid gap-6 px-6 py-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-start">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Sample rules
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-foreground">
              The sample should prove product quality, not leak the SKU.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              "The service packet sample proves readability, findings clarity, and rebook posture.",
              "The sales-list sample stays list-first and shows only 2 to 3 masked rows publicly.",
              "These sample links are free and public on purpose. They should work in cold email and in SEO.",
              "HTML and PDF previews are fine, but a free sample cannot become a usable paid batch substitute.",
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
