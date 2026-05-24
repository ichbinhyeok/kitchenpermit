import Image from "next/image";
import Link from "@/components/navigation/static-link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";
import { ResourceLinkStrip } from "@/components/marketing/resource-link-strip";
import { AXIS1_COMPANY_MONTHLY_PRICE } from "@/lib/axis1-product-policy";
import { publicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = publicPageMetadata({
  title: "KitchenPermit | Hood Cleaning Service Report Software",
  description:
    "KitchenPermit helps hood cleaning companies send restaurant-ready service reports with photos, open items, next actions, and a PDF copy.",
  path: "/",
});

const inputRows = [
  ["Job photos", "Hood, filter, fan, and access photos"],
  ["Open item", "Rear access panel blocked"],
  ["Next action", "Clear access before the next visit"],
] as const;

const reportRows = [
  ["Work result", "Reachable hood, filters, and duct path cleaned"],
  ["Photos", "Before/after photos grouped by hood area"],
  ["Open item", "Blocked access kept separate from completed work"],
  ["Saved copy", "Link/PDF for inspection records"],
] as const;

const valueRows = [
  ["Step 1", "Choose whether the job was completed, completed where reachable, blocked by access, or needs customer action."],
  ["Step 2", "Add before/after photos, blocked access photos, and condition notes only where they help the customer understand the record."],
  ["Step 3", "Send a clean report link and PDF the restaurant can save, forward, or keep with service records."],
] as const;

const reportContents = [
  ["Completed work", "Reachable work written in plain English"],
  ["Blocked access", "Areas needing access kept separate from completed work"],
  ["Condition found", "Recorded conditions shown without implying repair or correction"],
  ["Next routine service", "Recommended window stays visible for follow-up"],
  ["Customer-facing contact", "Phone or reply path appears on the company version"],
  ["PDF copy", "A report the restaurant can save with service records"],
] as const;

const planCues = [
  ["Free", "No login. Unbranded 7-day test link and watermarked PDF."],
  [
    "Company",
    `${AXIS1_COMPANY_MONTHLY_PRICE}. Your logo/contact, clean PDFs, live links, and history.`,
  ],
] as const;

function ActionLink({
  href,
  children,
  tone = "dark",
}: {
  href: string;
  children: ReactNode;
  tone?: "dark" | "light" | "accent";
}) {
  const toneClass =
    tone === "accent"
      ? "bg-[#f26a21] text-white shadow-[0_18px_48px_rgba(242,106,33,0.28)] hover:bg-[#dd5b17]"
      : tone === "light"
        ? "border border-white/18 bg-white/8 text-white hover:bg-white/14"
        : "bg-[#111315] text-white hover:bg-[#20262d]";

  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-bold transition ${toneClass}`}
    >
      <span>{children}</span>
      <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
    </Link>
  );
}

function ProductSurface() {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/12 bg-[#101419] p-3 shadow-[0_40px_140px_rgba(0,0,0,0.42)]">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#f26a21]" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/24" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/16" />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/42">
          Sample service report
        </p>
      </div>

      <div className="grid gap-3 p-3 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-[#ffb27c]">
            From the field
          </p>
          <h3 className="mt-3 max-w-sm text-[2rem] font-black leading-[0.9] tracking-[-0.06em] text-white">
            What the crew sends in
          </h3>
          <div className="mt-5 grid gap-3">
            {inputRows.map(([label, copy]) => (
              <div key={label} className="rounded-[18px] border border-white/10 bg-black/18 p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/36">
                  {label}
                </p>
                <p className="mt-2 text-sm font-bold leading-6 text-white">{copy}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-[24px] bg-[#f7efe4] text-[#111315]">
          <div className="grid gap-5 border-b border-black/10 p-5 md:grid-cols-[1fr_170px]">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#75695f]">
                What the restaurant gets
              </p>
              <h3 className="mt-3 max-w-xl font-display text-[clamp(2.5rem,6vw,4.8rem)] font-bold leading-[0.86] tracking-[-0.078em]">
                One report, ready to save
              </h3>
            </div>
            <div className="relative min-h-[130px] overflow-hidden rounded-[22px] bg-[#111315]">
              <Image
                src="/images/packet-proof/ai-baffle-filters.jpg"
                alt="Clean baffle filters after kitchen exhaust service"
                fill
                sizes="170px"
                className="object-cover"
              />
            </div>
          </div>

          <div className="grid gap-0 p-5">
            {reportRows.map(([label, copy]) => (
              <div key={label} className="grid gap-2 border-t border-black/10 py-4 first:border-t-0 sm:grid-cols-[0.28fr_0.72fr]">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#75695f]">
                  {label}
                </p>
                <p className="text-sm font-bold leading-6">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="-mt-[82px] overflow-hidden bg-[#080a0c] text-white">
      <section className="relative isolate min-h-[100svh] px-4 pb-12 pt-[104px] sm:px-5 md:pt-[120px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-8%,rgba(242,106,33,0.30),transparent_26%),radial-gradient(circle_at_72%_28%,rgba(123,153,175,0.16),transparent_28%),linear-gradient(180deg,#080a0c_0%,#101419_62%,#080a0c_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(180deg,black,transparent_72%)]" />

        <div className="relative mx-auto flex min-h-[calc(100svh-140px)] w-[min(1240px,100%)] flex-col justify-end gap-8">
          <Reveal className="max-w-5xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-[#ffb27c]">
              For hood cleaning companies
            </p>
            <h1 className="mt-5 max-w-[15ch] font-display text-[clamp(2.95rem,8.7vw,6.35rem)] font-bold leading-[0.88] tracking-[-0.075em] text-white">
              Send hood cleaning reports your customers can actually save.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 md:text-xl md:leading-9">
              KitchenPermit helps hood cleaning companies turn service notes,
              photos, blocked access, and next actions into a restaurant-ready
              report link and PDF.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ActionLink href="/axis-1/tool?account=free" tone="accent">
                Build a free test report
              </ActionLink>
              <ActionLink href="/samples/axis-1" tone="light">
                View sample report
              </ActionLink>
              <ActionLink href="/company-version" tone="light">
                See company version
              </ActionLink>
            </div>
            <div className="mt-4 grid max-w-2xl gap-2 text-sm leading-6 text-white/64 sm:grid-cols-2">
              {planCues.map(([label, copy]) => (
                <p key={label} className="border-l border-white/14 pl-3">
                  <span className="font-bold text-white">{label}:</span> {copy}
                </p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <ProductSurface />
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-5 md:py-24">
        <Reveal className="mx-auto grid w-[min(1180px,100%)] gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#ffb27c]">
              How it works
            </p>
            <h2 className="mt-4 max-w-4xl font-display text-[clamp(2.8rem,8vw,6rem)] font-bold leading-[0.88] tracking-[-0.078em]">
              Pick the result first. Add the record after.
            </h2>
          </div>
          <div className="grid gap-0 overflow-hidden rounded-[32px] border border-white/10 bg-white/5">
            {valueRows.map(([label, copy]) => (
              <div key={label} className="grid gap-4 border-b border-white/10 px-5 py-6 last:border-b-0 md:grid-cols-[0.25fr_0.75fr] md:px-7">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/42">
                  {label}
                </p>
                <p className="max-w-2xl text-[1.35rem] font-bold leading-[1.1] tracking-[-0.045em] text-white md:text-[1.65rem]">
                  {copy}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="bg-[#f6efe6] px-4 py-16 text-[#111315] sm:px-5 md:py-24">
        <Reveal className="mx-auto grid w-[min(1180px,100%)] gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#75695f]">
              Built for real hood cleaning workflows
            </p>
            <h2 className="mt-4 max-w-4xl font-display text-[clamp(2.8rem,8vw,6rem)] font-bold leading-[0.88] tracking-[-0.078em]">
              The report answers the questions after service.
            </h2>
            <p className="mt-6 max-w-lg text-base leading-8 text-[#665c53]">
              Each report separates completed work, photos, open items,
              and the next action so the restaurant does not have to decode a
              camera roll.
            </p>
          </div>
          <div className="min-w-0 border-y border-black/12">
            {reportContents.map(([label, copy]) => (
              <div key={label} className="grid gap-4 border-b border-black/10 py-6 last:border-b-0 md:grid-cols-[0.3fr_0.7fr]">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8b8178]">
                  {label}
                </p>
                <p className="max-w-2xl text-[1.35rem] font-bold leading-[1.1] tracking-[-0.045em] md:text-[1.6rem]">
                  {copy}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <div className="bg-[#f6efe6] text-[#111315]">
        <ResourceLinkStrip
          label="Free hood cleaning report resources"
          title="Templates and examples for clearer customer reports."
          description="Use these templates and examples to improve how your company explains completed work, blocked access, photos, and next actions after service."
        />
      </div>

      <section className="bg-[#f6efe6] px-4 pb-16 text-[#111315] sm:px-5 md:pb-24">
        <Reveal className="mx-auto w-[min(1180px,100%)]">
          <div className="grid overflow-hidden rounded-[38px] bg-[#111315] text-white shadow-[0_34px_120px_rgba(17,19,21,0.22)] lg:grid-cols-[1fr_0.92fr]">
            <div className="p-6 sm:p-8 lg:p-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#ffb27c]">
                For your company
              </p>
              <h2 className="mt-4 max-w-3xl font-display text-[clamp(2.6rem,7vw,5.7rem)] font-bold leading-[0.9] tracking-[-0.075em]">
                Want this under your company name?
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/64">
                Start with the public sample or create a free unbranded test
                report without login. Move to the $79/month company version when
                you want your logo/contact, clean PDFs, retained service report
                links, and report history.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ActionLink href="/axis-1/tool?account=free" tone="accent">
                  Build a free test report
                </ActionLink>
                <ActionLink href="/samples/axis-1" tone="light">
                  View sample report
                </ActionLink>
                <ActionLink href="/company-version" tone="light">
                  See company version
                </ActionLink>
              </div>
            </div>
            <div className="border-t border-white/10 bg-[#f8f1e8] p-6 text-[#111315] lg:border-l lg:border-t-0 sm:p-8 lg:p-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#75695f]">
                Pricing rule
              </p>
              <div className="mt-5 divide-y divide-black/10 border-y border-black/10">
                {[
                  ["Free builder", "No login, no company logo/contact, 7-day link, watermarked PDF"],
                  ["Company version", "$79/month for company logo/contact, retained service report links, clean PDFs, and history"],
                  ["Design help", "Optional brand/report polish from $249"],
                ].map(([label, copy]) => (
                  <div key={label} className="grid gap-3 py-5 sm:grid-cols-[0.32fr_0.68fr]">
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#75695f]">
                      {label}
                    </p>
                    <p className="text-sm font-bold leading-6">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
