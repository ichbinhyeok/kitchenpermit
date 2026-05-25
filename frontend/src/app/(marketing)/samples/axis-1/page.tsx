import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/navigation/static-link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-header";
import { Panel } from "@/components/ui/panel";
import { buildAxis1SampleProofData } from "@/lib/axis1-sample-packets";
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
  const sampleData = buildAxis1SampleProofData("blocked_access");
  const serviceDate =
    sampleData.packetHeader.quickFacts.find(([label]) => label === "Service date")?.[1] ??
    "Service date recorded";
  const previewPhotos = [
    sampleData.proofPhotos.find((photo) => photo.tone === "issue"),
    sampleData.proofPhotos.find((photo) => photo.tone === "after"),
  ].filter(Boolean) as typeof sampleData.proofPhotos;

  return (
    <>
      <PageHeader
        label="Sample report"
        title="See the report your customer opens."
        description="This sample shows how completed work, blocked access, photos, customer action, and PDF records appear in a restaurant-ready report."
      />
      <section className="container-shell pb-20">
        <Panel className="grid gap-6 px-5 py-5 md:grid-cols-[0.86fr_1.14fr] md:items-center md:px-8 md:py-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">
              Customer-facing preview
            </p>
            <h2 className="mt-4 font-display text-[2.25rem] font-bold leading-[0.94] tracking-[-0.06em] text-foreground md:text-5xl">
              A quick preview before opening the full sample.
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
              The full sample report opens as the restaurant would see it: status first,
              customer action next, then photos, service coverage, and a PDF copy.
            </p>
            <div className="mt-5 grid gap-2 rounded-[22px] border border-border bg-[#f8f4ec] px-4 py-4 sm:grid-cols-[0.44fr_0.56fr]">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Service date
                </p>
                <p className="mt-2 text-lg font-black tracking-[-0.035em] text-foreground">
                  {serviceDate}
                </p>
              </div>
              <p className="text-sm font-semibold leading-6 text-muted-foreground">
                The sample opens with the date, access action, attached photos,
                and PDF copy before the longer service details.
              </p>
            </div>
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
            <div className="overflow-hidden rounded-[26px] border border-black/10 bg-[#111315] p-3 text-white">
              <div className="mb-3">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#ffb27c]">
                  What the customer sees first
                </p>
                <p className="mt-1 text-sm font-semibold leading-5 text-white/72">
                  Access issue and cleaned area photos stay attached to the same service record.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {previewPhotos.map((photo) => (
                  <figure
                    key={photo.proofId}
                    className="overflow-hidden rounded-[18px] border border-white/12 bg-white/[0.04]"
                  >
                    <div className="relative aspect-[4/3] bg-black">
                      <Image
                        src={photo.src}
                        alt={photo.title}
                        fill
                        sizes="(min-width: 768px) 280px, 100vw"
                        className="object-cover"
                        style={{ objectPosition: photo.position }}
                      />
                    </div>
                    <figcaption className="px-3 py-2">
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#ffb27c]">
                        {photo.label}
                      </p>
                      <p className="mt-1 text-sm font-semibold leading-5 text-white">
                        {photo.title}
                      </p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {previewCards.map(([title, copy]) => (
                <div
                  key={title}
                  className="rounded-[22px] border border-border bg-white/78 px-4 py-4"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {title}
                  </p>
                  <p className="mt-2 text-sm font-black leading-5 tracking-[-0.025em] text-foreground">
                    {copy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </section>
    </>
  );
}
