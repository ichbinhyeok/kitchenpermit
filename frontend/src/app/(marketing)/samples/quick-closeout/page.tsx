import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/navigation/static-link";
import { AlertTriangle, ArrowRight, CheckCircle2, FileText } from "lucide-react";
import { AXIS1_BLOCKED_ACCESS_SAMPLE_PDF_HREF } from "@/lib/axis1-sample-packets";
import { publicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = publicPageMetadata({
  title: "Quick Hood Cleaning Closeout Sample",
  description:
    "A short sample entry point showing the customer link and retained PDF copy for a hood cleaning closeout record.",
  path: "/samples/quick-closeout",
});

const facts = [
  ["Service date", "Apr 24, 2026"],
  ["Customer", "Sample Restaurant Group"],
  ["Result", "Reachable work completed"],
  ["Open item", "Rear duct access blocked"],
] as const;

const photos = [
  {
    label: "Before",
    title: "Hood interior before service",
    src: "/images/packet-proof/ai-hood-before.jpg",
  },
  {
    label: "After",
    title: "Hood interior after service",
    src: "/images/packet-proof/ai-hood-after.jpg",
  },
] as const;

const areas = [
  "Hood canopy",
  "Filters",
  "Duct access",
  "Rooftop fan",
  "Grease containment",
] as const;

const inputSteps = [
  ["1", "Pick result"],
  ["2", "Add service date + photos"],
  ["3", "Confirm blocked access + next action"],
] as const;

export default function QuickCloseoutSamplePage() {
  return (
    <main className="-mt-[82px] bg-[#e7ded3] px-4 pb-12 pt-[96px] text-[#151515] sm:px-5 sm:pt-[108px] md:pt-[122px]">
      <section className="mx-auto w-[min(1080px,100%)] overflow-hidden rounded-[28px] border border-black/10 bg-[#fbfaf7] shadow-[0_28px_90px_rgba(55,43,31,0.18)]">
        <header className="flex flex-col gap-3 border-b border-[#ded6cc] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[#111315] text-sm font-black text-[#ff9b63]">
              HL
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black">Sample Hood Service Co.</p>
              <p className="mt-1 text-xs font-semibold text-[#6f665d]">
                Generic sample outputs
              </p>
            </div>
          </div>
          <p className="rounded-full border border-[#ded6cc] bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.1em] text-[#6f665d]">
            Customer link + PDF copy
          </p>
        </header>

        <div className="grid gap-0 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="px-4 py-5 sm:px-6 sm:py-6">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#9b3f13]">
              Generic sample: what the customer receives
            </p>
            <h1 className="mt-3 max-w-xl font-display text-[2.1rem] font-bold leading-[0.94] tracking-[-0.05em] sm:text-[3.45rem] sm:tracking-[-0.055em] lg:text-[3.9rem]">
              One job record, two customer outputs.
            </h1>
            <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-[#5f574f] sm:mt-4 sm:leading-7">
              A phone-friendly customer link for review, plus a retained PDF
              copy the restaurant can save with job files.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#b8d7c7] bg-[#f1f8f4] px-3 py-2 text-sm font-black text-[#1f6248] sm:mt-5">
              <CheckCircle2 className="h-4 w-4" />
              Same sample data in both outputs
            </div>
          </div>

          <div className="border-t border-[#ded6cc] bg-white px-4 py-4 sm:px-5 lg:border-l lg:border-t-0">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <article className="rounded-[18px] border border-[#d6cec4] bg-[#fbfaf7] p-3 sm:rounded-[24px] sm:p-4">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#83786d]">
                  Output 1
                </p>
                <h2 className="mt-2 text-lg font-black leading-tight tracking-[-0.04em] sm:mt-3 sm:text-2xl sm:tracking-[-0.045em]">
                  Customer link
                </h2>
                <p className="mt-2 hidden text-sm font-semibold leading-6 text-[#5f574f] sm:mt-3 sm:block">
                  Opens on a phone or desktop so the restaurant can review the
                  service date, photos, blocked access, and next action.
                </p>
                <Link
                  href="/p/sample-blocked-access"
                  className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-[#f26a21] px-3 text-xs font-black text-white transition hover:bg-[#dd5b17] sm:mt-5 sm:min-h-11 sm:px-4 sm:text-sm"
                >
                  <span className="sm:hidden">View link</span>
                  <span className="hidden sm:inline">View customer link</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>

              <article className="rounded-[18px] border border-[#111315] bg-[#111315] p-3 text-white sm:rounded-[24px] sm:p-4">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
                  Output 2
                </p>
                <h2 className="mt-2 text-lg font-black leading-tight tracking-[-0.04em] sm:mt-3 sm:text-2xl sm:tracking-[-0.045em]">
                  Retained PDF copy
                </h2>
                <p className="mt-2 hidden text-sm font-semibold leading-6 text-white/68 sm:mt-3 sm:block">
                  A document-style copy for customer files, invoice attachments,
                  manager records, or outside record requests.
                </p>
                <Link
                  href={AXIS1_BLOCKED_ACCESS_SAMPLE_PDF_HREF}
                  className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-white px-3 text-xs font-black text-[#111315] transition hover:bg-[#f4eee6] sm:mt-5 sm:min-h-11 sm:px-4 sm:text-sm"
                >
                  <FileText className="h-4 w-4" />
                  <span className="sm:hidden">View PDF</span>
                  <span className="hidden sm:inline">View retained PDF copy</span>
                </Link>
              </article>
            </div>

            <div className="mt-3 rounded-[18px] border border-[#ded6cc] bg-[#fbfaf7] px-3 py-3">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#83786d]">
                What the crew enters
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {inputSteps.map(([step, label]) => (
                  <div
                    key={step}
                    className="flex items-center gap-2 rounded-[14px] bg-white px-3 py-2 text-xs font-black text-[#423c36]"
                  >
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#111315] text-[10px] text-white">
                      {step}
                    </span>
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {photos.map((photo) => (
                <figure
                  key={photo.label}
                  className="overflow-hidden rounded-[18px] border border-[#ded6cc] bg-[#fbfaf7]"
                >
                  <div className="relative aspect-[4/3] bg-[#111315]">
                    <Image
                      src={photo.src}
                      alt={photo.title}
                      fill
                      priority
                      sizes="(min-width: 1024px) 240px, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="px-3 py-2">
                    <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[#9b3f13]">
                      {photo.label}
                    </p>
                    <p className="mt-1 text-xs font-black leading-tight">
                      {photo.title}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>

        <section className="grid gap-0 border-t border-[#ded6cc] lg:grid-cols-[1fr_0.92fr]">
          <div className="px-4 py-4 sm:px-6">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#83786d]">
              Sample job details
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
              {facts.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[16px] border border-[#ded6cc] bg-white px-3 py-3"
                >
                  <dt className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[#83786d]">
                    {label}
                  </dt>
                  <dd className="mt-1.5 text-sm font-black leading-tight tracking-[-0.02em]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#83786d]">
              Hood-specific areas shown
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {areas.map((area) => (
                <span
                  key={area}
                  className="rounded-full border border-[#ded6cc] bg-white px-3 py-2 text-xs font-black text-[#423c36]"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-[#ded6cc] px-4 py-4 sm:px-6 lg:border-l lg:border-t-0">
            <div className="flex items-start gap-3 rounded-[20px] border border-[#efc0a4] bg-[#fff4ec] px-4 py-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#bc3d1f]" />
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#9b3f13]">
                  Customer action
                </p>
                <p className="mt-2 text-sm font-black leading-5">
                  Clear rear duct access before follow-up service.
                </p>
                <p className="mt-2 text-xs font-semibold leading-5 text-[#6f4d3d]">
                  The blocked area stays separate and is not presented as cleaned.
                </p>
              </div>
            </div>
          </div>
        </section>
      </section>

      <p className="mx-auto mt-5 max-w-[1080px] text-xs leading-6 text-[#6f665d]">
        KitchenPermit is service report software. This generic sample is for
        customer recordkeeping only. It does not issue permits, certificates,
        inspections, insurance approvals, or compliance determinations.
      </p>
    </main>
  );
}
