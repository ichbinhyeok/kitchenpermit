import type { Metadata } from "next";
import Link from "@/components/navigation/static-link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-header";
import { Panel } from "@/components/ui/panel";
import { publicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = publicPageMetadata({
  title: "Customer Service Report Link and PDF Sample",
  description:
    "A real sample customer service report link and PDF copy for a hood cleaning job.",
  path: "/samples/axis-1",
});

const previewCards = [
  ["Service result", "Reachable work completed."],
  ["Customer action", "Blocked access is separated from completed work."],
  ["PDF copy", "The restaurant can save the report for records."],
] as const;

export default function SampleAxis1Page() {
  return (
    <>
      <PageHeader
        label="Sample report"
        title="See the report your customer opens."
        description="This sample shows how completed work, blocked access, photos, customer action, and PDF records appear in a restaurant-ready report."
      />
      <section className="container-shell pb-20">
        <Panel className="grid gap-6 px-5 py-5 md:grid-cols-[0.92fr_1.08fr] md:items-center md:px-8 md:py-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">
              Customer-facing preview
            </p>
            <h2 className="mt-4 font-display text-[2.25rem] font-bold leading-[0.94] tracking-[-0.06em] text-foreground md:text-5xl">
              A short preview before opening the full sample.
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
              The full sample report opens as the restaurant would see it: status first,
              customer action next, then photos, service coverage, and a PDF copy.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/p/sample-blocked-access"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f26a21] px-5 text-sm font-black text-white transition hover:bg-[#dd5b17]"
              >
                Open sample customer report
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/axis-1/tool?account=free"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-border-strong bg-white/80 px-5 text-sm font-black text-foreground transition hover:bg-white"
              >
                Build a free test report
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="grid gap-3">
            {previewCards.map(([title, copy]) => (
              <div
                key={title}
                className="rounded-[22px] border border-border bg-white/78 px-5 py-5"
              >
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  {title}
                </p>
                <p className="mt-3 text-lg font-black tracking-[-0.035em] text-foreground">
                  {copy}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </>
  );
}
