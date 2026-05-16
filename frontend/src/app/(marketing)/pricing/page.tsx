import type { Metadata } from "next";
import Link from "@/components/navigation/static-link";
import { ArrowRight, Check, FileText, Paintbrush, Repeat2 } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-header";
import { Panel } from "@/components/ui/panel";
import {
  AXIS1_COMPANY_MONTHLY_PRICE,
  AXIS1_DESIGN_HELP_STARTING_PRICE,
} from "@/lib/axis1-product-policy";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Pricing for the free service report builder, company version, and optional design help.",
};

const offerTracks = [
  {
    label: "Free builder",
    title: "Try the report flow without an account.",
    price: "Free",
    copy:
      "Create an unbranded test report from job photos and notes. This is for evaluating the output before using it under your company name.",
    href: "/axis-1/tool?account=free",
    cta: "Try free builder",
    icon: FileText,
    points: [
      "No login required",
      "No company logo or contact line",
      "7-day report link lifespan",
      "Watermarked PDF",
      "No report history",
    ],
    featured: false,
  },
  {
    label: "Company version",
    title: "Use the report under your company name.",
    price: AXIS1_COMPANY_MONTHLY_PRICE,
    copy:
      "For vendors who want reports under their company name, clean PDFs, saved company details, customer history, and follow-up reminders after each service.",
    href: "/company-version",
    cta: "Start company version",
    icon: Repeat2,
    points: [
      "Save company logo, report color, and contact details",
      "Customer-friendly send message for each saved report",
      "No PDF watermark",
      "Hosted links stay live while subscribed",
      "Customer/site history and next-service follow-up view",
    ],
    featured: true,
  },
  {
    label: "Design help",
    title: "Optional brand/report design help.",
    price: `From ${AXIS1_DESIGN_HELP_STARTING_PRICE}`,
    copy:
      "The product should be self-serve by default. If a vendor wants help polishing the branded version, design support is a separate request.",
    href: "/start",
    cta: "Request design help",
    icon: Paintbrush,
    points: [
      "Optional, not required",
      "Brand/report polish",
      "Company defaults review",
      "Quoted after request",
    ],
    featured: false,
  },
] as const;

const freeVsPaid = [
  ["Company details", "Free output has no company logo/contact line. Paid output carries the vendor name, logo, report color, phone, and reply path."],
  ["Link life", "Free report links are limited to 7 days. Paid links stay live while the subscription is active."],
  ["PDF", "Free PDFs carry a watermark. Paid PDFs are clean customer/inspection copies."],
  ["History", "Free reports do not create an account history. Paid reports are grouped by customer/site in Account."],
  ["Follow-up", "Free output ends after the test link. Paid history shows next service timing and gives staff a customer-ready message to send."],
] as const;

export default function PricingPage() {
  return (
    <>
      <PageHeader
        label="Pricing"
        title={`Free builder. ${AXIS1_COMPANY_MONTHLY_PRICE} company version.`}
        description="The free builder proves the output. The company version is the paid product: company logo/contact, clean PDF, live restaurant report links, customer history, and follow-up workflow."
      />

      <section className="container-shell pb-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link
            href="/company-version"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f26a21] px-5 text-sm font-black text-white transition hover:bg-[#dd5b17]"
          >
            Start company version
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </Link>
          <Link
            href="/axis-1/tool?account=free"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-border-strong bg-white/80 px-5 text-sm font-black text-foreground transition hover:bg-white"
          >
            Try free builder
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </Link>
          <Link
            href="/samples/axis-1"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-border-strong bg-white/60 px-5 text-sm font-black text-foreground transition hover:bg-white"
          >
            View sample report
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </Link>
        </div>
      </section>

      <section className="container-shell pb-8">
        <Panel className="grid gap-5 overflow-hidden bg-[#111315] px-5 py-5 text-white md:grid-cols-[0.82fr_1.18fr] md:px-8 md:py-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.26em] text-[#ffb489]">
              Product policy
            </p>
            <h2 className="mt-4 max-w-3xl font-display text-[2.4rem] font-bold leading-[0.9] tracking-[-0.07em] md:text-5xl">
              Test the report free. Pay when it carries your company name.
            </h2>
          </div>
          <div className="grid content-end gap-3">
            {[
              "Free builder: no login, no company logo/contact, 7-day link, watermarked PDF.",
              `Company version: ${AXIS1_COMPANY_MONTHLY_PRICE} for saved company details, live service report links, clean PDFs, customer history, and follow-up reminders.`,
              `Design help: optional from ${AXIS1_DESIGN_HELP_STARTING_PRICE}, only when a vendor wants brand/report polish.`,
            ].map((item) => (
              <div
                key={item}
                className="border-t border-white/12 pt-4 text-sm font-semibold leading-6 text-white/74 md:text-base md:leading-7"
              >
                {item}
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="container-shell grid gap-4 pb-10 md:grid-cols-3 md:gap-5">
        {offerTracks.map((track) => {
          const Icon = track.icon;

          return (
            <Panel
              key={track.label}
              className={`flex h-full flex-col px-5 py-5 md:px-6 md:py-6 ${
                track.featured
                  ? "border-[#f26a21]/32 bg-[#fff7ef] shadow-[0_24px_70px_rgba(242,106,33,0.12)]"
                  : "bg-white/78"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  {track.label}
                </p>
                <div className="rounded-full bg-[rgba(242,106,33,0.09)] p-2 text-accent">
                  <Icon className="h-4 w-4" strokeWidth={2.2} />
                </div>
              </div>
              <h2 className="mt-5 font-display text-[2.05rem] font-bold leading-[0.94] tracking-[-0.06em] text-foreground md:text-[2.35rem]">
                {track.title}
              </h2>
              <p className="mt-4 font-display text-4xl font-bold tracking-[-0.055em] text-foreground">
                {track.price}
              </p>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {track.copy}
              </p>
              <div className="mt-5 grid gap-3 border-t border-border pt-5">
                {track.points.map((point) => (
                  <div key={point} className="flex items-start gap-3 text-sm leading-6 text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2.3} />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
              <Link
                href={track.href}
                className={`mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-black transition ${
                  track.featured
                    ? "bg-[#f26a21] text-white hover:bg-[#dd5b17]"
                    : "border border-border-strong bg-white/80 text-foreground hover:bg-white"
                }`}
              >
                {track.cta}
                <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
              </Link>
            </Panel>
          );
        })}
      </section>

      <section className="container-shell pb-20">
        <Panel className="grid gap-6 px-5 py-5 md:grid-cols-[0.72fr_1.28fr] md:px-8 md:py-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.26em] text-accent">
              What changes when paid
            </p>
            <h2 className="mt-4 font-display text-[2.1rem] font-bold leading-[0.94] tracking-[-0.06em] text-foreground md:text-4xl">
              Paid is not more editing. Paid is trust, storage, and continuity.
            </h2>
          </div>
          <div className="divide-y divide-border border-y border-border">
            {freeVsPaid.map(([label, copy]) => (
              <div key={label} className="grid gap-3 py-4 text-sm leading-6 text-foreground md:grid-cols-[0.28fr_0.72fr] md:text-base md:leading-7">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {label}
                </p>
                <p className="font-semibold">{copy}</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </>
  );
}
