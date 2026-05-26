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

const valuePoints = [
  "One crew entry creates both the customer link and the retained PDF copy.",
  "The link is for the restaurant to review on a phone after the job.",
  "The PDF is a separate document the customer can save with invoices or job files.",
] as const;

export default function QuickCloseoutSamplePage() {
  const afterPhoto = photos[1];

  return (
    <main className="-mt-[82px] bg-[#111315] text-white">
      <section className="relative overflow-hidden px-4 pb-8 pt-[96px] sm:px-5 sm:pt-[108px] md:pt-[122px] lg:pb-12">
        <Image
          src={afterPhoto.src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="scale-105 object-cover opacity-18 blur-[1px]"
          style={{ objectPosition: "center" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,19,21,0.82)_0%,rgba(17,19,21,0.96)_62%,#111315_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(242,106,33,0.28),transparent_32%)]" />

        <div className="relative mx-auto grid max-w-[1180px] gap-7 lg:min-h-[760px] lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-10">
          <div className="max-w-xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-white text-sm font-black text-[#f26a21]">
                HL
              </div>
              <div>
                <p className="text-sm font-black">Sample Hood Service Co.</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/42">
                  Sample customer output
                </p>
              </div>
            </div>

            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff9b63]">
              Generic sample: what the customer receives
            </p>
            <h1 className="mt-3 font-display text-[2.35rem] font-bold leading-[0.92] tracking-[-0.045em] text-white sm:text-[4.7rem] sm:tracking-[-0.065em] lg:text-[5.4rem]">
              One closeout record. Link + PDF.
            </h1>
            <p className="mt-4 max-w-lg text-base font-semibold leading-7 text-white/72">
              Service date, before/after photos, blocked access, and next
              action from one result-first entry.
            </p>

            <div className="mt-5 grid max-w-md grid-cols-2 gap-2">
              <Link
                href="/p/sample-blocked-access"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f26a21] px-4 text-center text-sm font-black text-white shadow-[0_18px_44px_rgba(242,106,33,0.28)] transition hover:bg-[#ff7a2c]"
              >
                Open link
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={AXIS1_BLOCKED_ACCESS_SAMPLE_PDF_HREF}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/18 bg-white px-4 text-center text-sm font-black text-[#111315] transition hover:bg-[#f4eee6]"
              >
                <FileText className="h-4 w-4" />
                Open PDF
              </Link>
            </div>

            <p className="mt-4 text-sm font-black leading-5 text-white/88">
              Link for review. PDF for files. Simple to make.
            </p>

            <ul className="mt-5 hidden gap-2 text-sm font-semibold leading-5 text-white/64 sm:grid">
              {valuePoints.map((point) => (
                <li key={point} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#7bd8a9]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[30px] border border-white/14 bg-white/[0.075] p-2 shadow-[0_34px_110px_rgba(0,0,0,0.34)] backdrop-blur-xl">
            <div className="grid gap-2 sm:grid-cols-2">
              {photos.map((photo) => (
                <figure
                  key={photo.label}
                  className="overflow-hidden rounded-[24px] bg-[#080a0c]"
                >
                  <div className="relative aspect-[4/3] bg-[#111315] sm:aspect-[3/4] lg:aspect-[4/5]">
                    <Image
                      src={photo.src}
                      alt={photo.title}
                      fill
                      priority
                      sizes="(min-width: 1024px) 420px, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="px-4 py-3">
                    <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#ff9b63]">
                      {photo.label}
                    </p>
                    <p className="mt-1 text-sm font-black leading-tight text-white">
                      {photo.title}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>

            <div className="mt-2 grid gap-2 rounded-[24px] border border-white/10 bg-[#0e1114]/88 p-4 sm:grid-cols-2">
              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white/38">
                  Customer link
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-white/72">
                  Review from text or email: date, photos, blocked access, and
                  next action.
                </p>
              </div>
              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white/38">
                  Retained PDF copy
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-white/72">
                  Save alongside invoices, manager records, or job files.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f4ede4] px-4 py-8 text-[#151515] sm:px-5 sm:py-10">
        <div className="mx-auto grid max-w-[1180px] gap-7 lg:grid-cols-[1fr_0.86fr]">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#83786d]">
              Sample job details
            </p>
            <dl className="mt-3 grid gap-px overflow-hidden rounded-[22px] border border-[#ded6cc] bg-[#ded6cc] sm:grid-cols-2 lg:grid-cols-4">
              {facts.map(([label, value]) => (
                <div
                  key={label}
                  className="bg-white px-4 py-4"
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

          <div className="grid gap-4">
            <div className="rounded-[24px] border border-[#ded6cc] bg-white px-4 py-4">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#83786d]">
                Fast to make
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#6f665d]">
                The builder starts with the result, then adds only the record
                details needed for the customer output.
              </p>
              <div className="mt-4 grid gap-2">
                {inputSteps.map(([step, label]) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 rounded-[16px] bg-[#f7f1e9] px-3 py-3 text-sm font-black text-[#423c36]"
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#111315] text-[11px] text-white">
                      {step}
                    </span>
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-[24px] border border-[#efc0a4] bg-[#fff4ec] px-4 py-4">
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
        </div>
      </section>

      <section className="bg-[#f4ede4] px-4 pb-10 text-[#6f665d] sm:px-5">
        <p className="mx-auto max-w-[1180px] border-t border-[#ded6cc] pt-5 text-xs leading-6">
          KitchenPermit is service report software. This generic sample is for
          customer recordkeeping only. It does not issue permits, certificates,
          inspections, insurance approvals, or compliance determinations.
        </p>
      </section>
    </main>
  );
}
