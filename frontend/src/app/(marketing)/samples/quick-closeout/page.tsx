import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/navigation/static-link";
import { ArrowRight, CalendarDays, FileText, MapPin, Phone } from "lucide-react";
import { publicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = publicPageMetadata({
  title: "Quick Hood Cleaning Closeout Sample",
  description:
    "A short sample hood cleaning closeout record with service date, before/after photos, blocked access, next action, and PDF copy.",
  path: "/samples/quick-closeout",
});

const summaryRows = [
  ["Service date", "May 14, 2026"],
  ["Customer", "Sample Restaurant"],
  ["Result", "Reachable work completed"],
  ["Record copy", "Customer link + PDF copy"],
] as const;

const areasServiced = [
  ["Hood canopy", "Cleaned where reachable"],
  ["Filters", "Removed, cleaned, and reset"],
  ["Duct access", "Rear access blocked"],
  ["Rooftop fan", "Serviced where reachable"],
  ["Grease containment", "Checked and recorded"],
] as const;

const photoCards = [
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
  {
    label: "Open item",
    title: "Rear duct access blocked",
    src: "/images/packet-proof/ai-duct-access.jpg",
  },
] as const;

const fileCards = [
  {
    icon: CalendarDays,
    title: "Service date",
    copy: "Easy to file by visit date",
  },
  {
    icon: MapPin,
    title: "Job record",
    copy: "Photos and notes in one place",
  },
  {
    icon: Phone,
    title: "Next action",
    copy: "Clear access before follow-up",
  },
] as const;

export default function QuickCloseoutSamplePage() {
  return (
    <main className="-mt-[82px] bg-[#0b0d0f] px-4 pb-16 pt-[104px] text-white sm:px-5 md:pt-[118px]">
      <section className="mx-auto grid w-[min(1180px,100%)] gap-5 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
        <div className="rounded-[34px] border border-white/12 bg-[#14181d] p-5 shadow-[0_34px_120px_rgba(0,0,0,0.36)] sm:p-7">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-[#ffb27c]">
            Generic sample
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-[clamp(2.8rem,9vw,5.7rem)] font-bold leading-[0.88] tracking-[-0.078em]">
            Hood Cleaning Closeout Record
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/70">
            A simple customer-ready record with the service date, before/after
            photos, blocked access, and next action in one link/PDF the
            restaurant can save with the invoice or job files.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {summaryRows.map(([label, value]) => (
              <div key={label} className="rounded-[20px] border border-white/10 bg-white/[0.055] px-4 py-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/42">
                  {label}
                </p>
                <p className="mt-2 text-lg font-black leading-tight tracking-[-0.035em]">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[24px] border border-[#ffb27c]/24 bg-[#20140e] px-5 py-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#ffb27c]">
              Customer action
            </p>
            <h2 className="mt-3 text-2xl font-black leading-tight tracking-[-0.045em]">
              Clear rear duct access before follow-up service.
            </h2>
            <p className="mt-3 text-sm font-semibold leading-7 text-white/70">
              Work was completed where reachable. The blocked access point is
              separated from completed work and is not presented as cleaned.
            </p>
          </div>
        </div>

        <div className="rounded-[34px] border border-white/12 bg-[#f4eee6] p-3 text-[#111315] shadow-[0_34px_120px_rgba(0,0,0,0.32)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-3 py-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#7b7068]">
                Sample Hood Service Co.
              </p>
              <p className="mt-1 text-sm font-black">Customer closeout link</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black text-[#9b3f13]">
              <FileText className="h-3.5 w-3.5" />
              PDF copy available
            </div>
          </div>

          <div className="grid gap-3 p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {photoCards.slice(0, 2).map((photo) => (
                <figure key={photo.label} className="overflow-hidden rounded-[24px] border border-black/10 bg-white">
                  <div className="relative aspect-[4/3] bg-[#111315]">
                    <Image
                      src={photo.src}
                      alt={photo.title}
                      fill
                      sizes="(min-width: 1024px) 330px, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="px-4 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9b3f13]">
                      {photo.label}
                    </p>
                    <p className="mt-1 text-sm font-black">{photo.title}</p>
                  </figcaption>
                </figure>
              ))}
            </div>

            <figure className="grid overflow-hidden rounded-[24px] border border-black/10 bg-white sm:grid-cols-[0.48fr_0.52fr]">
              <div className="relative min-h-[190px] bg-[#111315]">
                <Image
                  src={photoCards[2].src}
                  alt={photoCards[2].title}
                  fill
                  sizes="(min-width: 1024px) 300px, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9b3f13]">
                  Blocked access
                </p>
                <h3 className="mt-2 text-2xl font-black leading-tight tracking-[-0.045em]">
                  Rear duct access blocked by stored items.
                </h3>
                <p className="mt-3 text-sm font-semibold leading-7 text-[#665c53]">
                  The access item stays separate from completed work so the
                  customer knows what to clear before follow-up.
                </p>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-5 grid w-[min(1180px,100%)] gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[30px] border border-white/12 bg-white/[0.055] p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[#ffb27c]">
            Areas shown in this sample
          </p>
          <div className="mt-5 grid gap-2">
            {areasServiced.map(([label, value]) => (
              <div key={label} className="grid gap-2 border-t border-white/10 py-3 first:border-t-0 sm:grid-cols-[0.36fr_0.64fr]">
                <p className="text-sm font-black text-white">{label}</p>
                <p className="text-sm font-semibold leading-6 text-white/64">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/12 bg-[#14181d] p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[#ffb27c]">
            Customer file copy
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {fileCards.map(({ icon: Icon, title, copy }) => (
              <div key={title} className="rounded-[22px] border border-white/10 bg-white/[0.055] p-4">
                <Icon className="h-5 w-5 text-[#ffb27c]" />
                <p className="mt-4 text-sm font-black">{title}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-white/60">
                  {copy}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/p/sample-blocked-access"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#f26a21] px-5 text-sm font-black text-white transition hover:bg-[#dd5b17]"
            >
              Open full sample report
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/axis-1"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/16 bg-white/8 px-5 text-sm font-black text-white transition hover:bg-white/14"
            >
              See how the builder works
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <p className="mx-auto mt-6 max-w-[1180px] text-xs leading-6 text-white/42">
        KitchenPermit is service report software. This generic sample is for
        customer recordkeeping only. It does not issue permits, certificates,
        inspections, insurance approvals, or compliance determinations.
      </p>
    </main>
  );
}
