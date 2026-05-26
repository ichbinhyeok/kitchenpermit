import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/navigation/static-link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  Link2,
} from "lucide-react";
import { AXIS1_BLOCKED_ACCESS_SAMPLE_PDF_HREF } from "@/lib/axis1-sample-packets";
import { publicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = publicPageMetadata({
  title: "Quick Hood Cleaning Closeout Sample",
  description:
    "A short sample entry point showing the customer link and retained PDF copy for a hood cleaning closeout record.",
  path: "/samples/quick-closeout",
});

const serviceFacts = [
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

const outputRoles = [
  {
    icon: Link2,
    title: "Customer link",
    body: "Open on a phone after service so the restaurant can review the date, photos, blocked access, and next action.",
  },
  {
    icon: FileText,
    title: "PDF copy",
    body: "A separate copy the customer can save alongside invoices, manager records, or job files.",
  },
] as const;

const builderSteps = [
  "Pick the service result",
  "Add date, photos, and notes",
  "Send the link or PDF copy",
] as const;

export default function QuickCloseoutSamplePage() {
  return (
    <main className="bg-[#f6f2eb] text-[#151515]">
      <section className="px-4 pb-10 pt-6 sm:px-5 sm:pt-8 lg:pb-14">
        <div className="mx-auto grid max-w-[1180px] gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 border border-[#d8d0c4] bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.13em] text-[#6d6257]">
              <span className="h-2 w-2 bg-[#f26a21]" />
              Generic sample output
            </div>

            <h1 className="mt-4 font-display text-[2.25rem] font-black leading-[0.98] tracking-[-0.045em] text-[#121212] sm:text-[4rem] sm:tracking-[-0.065em] lg:text-[4.75rem]">
              Hood closeout record. Link + PDF.
            </h1>

            <p className="mt-4 max-w-lg text-base font-semibold leading-7 text-[#665d54]">
              Service date, before/after photos, blocked access, and next
              action in one customer-ready record.
            </p>

            <div className="mt-6 grid max-w-md grid-cols-2 gap-2">
              <Link
                href="/p/sample-blocked-access"
                className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#f26a21] px-4 text-center text-sm font-black text-white shadow-[0_16px_34px_rgba(242,106,33,0.24)] transition hover:bg-[#dd5b17]"
              >
                View link
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={AXIS1_BLOCKED_ACCESS_SAMPLE_PDF_HREF}
                className="inline-flex min-h-12 items-center justify-center gap-2 border border-[#151515] bg-[#151515] px-4 text-center text-sm font-black text-white transition hover:bg-[#2a2a2a]"
              >
                <FileText className="h-4 w-4" />
                Open PDF
              </Link>
            </div>

            <p className="mt-4 text-sm font-black leading-5 text-[#3f3932] lg:hidden">
              The link is for review. The PDF is for customer files.
            </p>

            <div className="mt-6 hidden gap-px overflow-hidden border border-[#ded6cc] bg-[#ded6cc] sm:grid-cols-2 lg:grid">
              {outputRoles.map((role) => {
                const Icon = role.icon;

                return (
                  <div key={role.title} className="bg-white p-4">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-[#f26a21]" />
                      <p className="text-sm font-black">{role.title}</p>
                    </div>
                    <p className="mt-2 text-xs font-semibold leading-5 text-[#665d54]">
                      {role.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-3 top-6 hidden h-[86%] w-[34%] border border-[#d8d0c4] bg-white shadow-[0_24px_70px_rgba(27,22,16,0.12)] lg:block">
              <div className="border-b border-[#e5ded4] px-4 py-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8a7f72]">
                  PDF copy
                </p>
                <p className="mt-2 text-lg font-black leading-tight">
                  Hood Cleaning Closeout Record
                </p>
              </div>
              <div className="space-y-3 px-4 py-4">
                <div className="h-2 w-3/4 bg-[#ded6cc]" />
                <div className="h-2 w-full bg-[#ded6cc]" />
                <div className="h-2 w-2/3 bg-[#ded6cc]" />
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <div className="aspect-[3/4] bg-[#f1ebe3]" />
                  <div className="aspect-[3/4] bg-[#f1ebe3]" />
                </div>
              </div>
            </div>

            <article className="relative border border-[#cfc6b9] bg-white shadow-[0_28px_80px_rgba(27,22,16,0.16)] lg:mr-[17%]">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e6ded3] px-4 py-4 sm:px-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-[#85796d]">
                    Sample Hood Service Co.
                  </p>
                  <h2 className="mt-1.5 text-xl font-black tracking-[-0.035em] text-[#111315] sm:text-3xl">
                    Hood Cleaning Closeout Record
                  </h2>
                </div>
                <div className="flex items-center gap-2 bg-[#eaf6ee] px-3 py-2 text-xs font-black text-[#146039]">
                  <CheckCircle2 className="h-4 w-4" />
                  Reachable work completed
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-px border-b border-[#e6ded3] bg-[#e6ded3] sm:grid-cols-4">
                {serviceFacts.map(([label, value]) => (
                  <div key={label} className="bg-[#fbf8f3] px-3 py-3 sm:px-4">
                    <dt className="text-[9px] font-black uppercase tracking-[0.14em] text-[#8a7f72]">
                      {label}
                    </dt>
                    <dd className="mt-1.5 text-sm font-black leading-tight text-[#191919]">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="p-3 sm:p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-black text-[#191919]">
                    <CalendarDays className="h-4 w-4 text-[#f26a21]" />
                    Before/after photos
                  </div>
                  <p className="hidden text-xs font-bold text-[#7a7066] sm:block">
                    Customer-facing link preview
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {photos.map((photo) => (
                    <figure key={photo.label} className="overflow-hidden border border-[#ddd4c9] bg-[#111315]">
                      <div className="relative aspect-[4/3]">
                        <Image
                          src={photo.src}
                          alt={photo.title}
                          fill
                          priority
                          sizes="(min-width: 1024px) 360px, 50vw"
                          className="object-cover"
                        />
                      </div>
                      <figcaption className="bg-[#111315] px-3 py-2.5 text-white sm:py-3">
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#ff9b63]">
                          {photo.label}
                        </p>
                        <p className="mt-1 text-xs font-black leading-tight sm:text-sm">
                          {photo.title}
                        </p>
                      </figcaption>
                    </figure>
                  ))}
                </div>

                <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_0.95fr]">
                  <div className="border border-[#e1d8cd] bg-[#fbf8f3] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8a7f72]">
                      Areas shown
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {areas.map((area) => (
                        <span
                          key={area}
                          className="border border-[#d8d0c4] bg-white px-2.5 py-1.5 text-xs font-black text-[#4d453e]"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border border-[#efc0a4] bg-[#fff4ec] p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#bc3d1f]" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#9b3f13]">
                          Customer action
                        </p>
                        <p className="mt-2 text-sm font-black leading-5">
                          Clear rear duct access before follow-up service.
                        </p>
                        <p className="mt-2 text-xs font-semibold leading-5 text-[#6f4d3d]">
                          The blocked area stays separate and is not presented
                          as cleaned.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="border-y border-[#ddd4c9] bg-[#111315] px-4 py-8 text-white sm:px-5">
        <div className="mx-auto grid max-w-[1180px] gap-5 md:grid-cols-[0.82fr_1.18fr] md:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ff9b63]">
              Fast to create
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.05em]">
              Not a new workflow for the crew.
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden border border-white/12 bg-white/12 sm:grid-cols-3">
            {builderSteps.map((step, index) => (
              <div key={step} className="bg-[#171a1d] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/38">
                  Step {index + 1}
                </p>
                <p className="mt-2 text-sm font-black leading-5">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f6f2eb] px-4 py-6 text-[#655c53] sm:px-5">
        <p className="mx-auto max-w-[1180px] text-xs leading-6">
          KitchenPermit is service report software. This generic sample is for
          customer recordkeeping only. It does not issue permits, certificates,
          inspections, insurance approvals, or compliance determinations.
        </p>
      </section>
    </main>
  );
}
