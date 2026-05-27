import type { Metadata } from "next";
import Link from "@/components/navigation/static-link";
import { ArrowRight, Check, FileText, Paintbrush, Repeat2 } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-header";
import { ResourceLinkStrip } from "@/components/marketing/resource-link-strip";
import { Panel } from "@/components/ui/panel";
import {
  AXIS1_COMPANY_MONTHLY_PRICE,
  AXIS1_DESIGN_HELP_STARTING_PRICE,
} from "@/lib/axis1-product-policy";
import { publicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = publicPageMetadata({
  title: "Pricing",
  description:
    "Pricing for the free service report builder, company version, and optional design help.",
  path: "/pricing",
});

const offerTracks = [
  {
    label: "Free builder",
    title: "Free builder",
    price: "$0",
    copy:
      "Create a short-lived test service report before using KitchenPermit under your company name.",
    href: "/axis-1/tool?account=free",
    cta: "Build a free test report",
    icon: FileText,
    points: [
      "No login required",
      "Create a test service report",
      "7-day test report link",
      "Watermarked PDF",
      "No company logo or contact line",
      "No saved report history",
    ],
    featured: false,
  },
  {
    label: "Company version",
    title: "Company version",
    price: AXIS1_COMPANY_MONTHLY_PRICE,
    copy:
      "Send branded service records customers can save alongside invoices, photos, and internal files.",
    href: "/company-version?pilot=1",
    cta: "Request 30-day pilot",
    icon: Repeat2,
    points: [
      "Company logo and customer-facing contact",
      "Clean branded PDFs",
      "Retained report links",
      "Saved service records",
      "Customer history",
      "Next-service follow-up reminders",
      "Built for repeated customer reports",
    ],
    featured: true,
  },
  {
    label: "Optional setup help",
    title: "Optional setup help",
    price: `From ${AXIS1_DESIGN_HELP_STARTING_PRICE}`,
    copy:
      "KitchenPermit remains self-serve. Setup help is only for companies that want report wording or layout polish.",
    href: "/start",
    cta: "Request setup help",
    icon: Paintbrush,
    points: [
      "Report wording polish",
      "Logo/contact layout",
      "Sample branded report review",
      "Optional - the product remains self-serve",
    ],
    featured: false,
  },
] as const;

const freeVsPaid = [
  ["Company details", "Free output has no company logo/contact line. Company output carries your company name, logo, report color, phone, and reply path."],
  ["Link life", "Free report links are limited to 7 days. Company links and PDFs stay available after creation."],
  ["PDF", "Free PDFs carry a watermark. Company PDFs are clean branded copies."],
  ["History", "Free reports do not create account history. Company reports are grouped by customer/site in Account."],
  ["Follow-up", "Free output ends after the test link. Company history shows next service timing and gives staff a customer-ready message to send."],
] as const;

const pricingFaq = [
  [
    "Does KitchenPermit replace a hood cleaning certificate?",
    "No. KitchenPermit helps create service reports. It does not issue permits, certificates, inspections, or compliance approvals.",
  ],
  [
    "What happens after the free builder?",
    "The free builder creates a short-lived test report link and watermarked PDF. Company version is for saved branded reports.",
  ],
  [
    "Is a card required for the launch pilot?",
    "No card is required for the launch pilot.",
  ],
  [
    "Can I cancel?",
    "Subscriptions can be canceled to stop future renewals. See the refund policy for billing details.",
  ],
] as const;

export default function PricingPage() {
  return (
    <>
      <PageHeader
        label="Pricing"
        title={`Free builder. ${AXIS1_COMPANY_MONTHLY_PRICE} company version.`}
        description="The free builder proves the output. The company version is the paid product: company logo/contact, clean PDF, retained restaurant report links, customer history, and follow-up workflow."
      />

      <section className="container-shell pb-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link
            href="/company-version?pilot=1"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f26a21] px-5 text-sm font-black text-white transition hover:bg-[#dd5b17]"
          >
            Request 30-day pilot
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </Link>
          <Link
            href="/axis-1/tool?account=free"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-border-strong bg-white/80 px-5 text-sm font-black text-foreground transition hover:bg-white"
          >
            Build a free test report
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </Link>
          <Link
            href="/samples/quick-closeout"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-border-strong bg-white/60 px-5 text-sm font-black text-foreground transition hover:bg-white"
          >
            View quick sample
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
              `Company version: ${AXIS1_COMPANY_MONTHLY_PRICE} for saved company details, retained service report links, clean PDFs, customer history, and follow-up reminders. During launch, request 30 days of company access with no card required.`,
              `Setup help: optional from ${AXIS1_DESIGN_HELP_STARTING_PRICE}, only when a company wants report wording or layout polish.`,
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

      <section className="container-shell pb-8">
        <Panel className="grid gap-5 border-[#f26a21]/24 bg-[#fff7ef] px-5 py-5 md:grid-cols-[0.86fr_1.14fr] md:px-8 md:py-7">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">
              Launch pilot access
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-[2.1rem] font-bold leading-[0.94] tracking-[-0.06em] text-foreground md:text-4xl">
              Request company access during the launch pilot.
            </h2>
          </div>
          <div className="grid content-center gap-4">
            <p className="text-sm font-semibold leading-6 text-muted-foreground md:text-base md:leading-7">
              Create or sign into an account, verify the email, then request 30
              days of company access with no card. We review the account email,
              enable the company version, email you when access is ready, and
              ask for product feedback after you use it.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Link
                href="/company-version?pilot=1"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#111315] px-5 text-sm font-black text-white transition hover:bg-[#20262d]"
              >
                Request 30-day pilot
                <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
              </Link>
              <Link
                href="/samples/quick-closeout"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border-strong bg-white/80 px-5 text-sm font-black text-foreground transition hover:bg-white"
              >
                View output sample
                <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
              </Link>
            </div>
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

      <ResourceLinkStrip
        label="Pricing resources"
        title="Free hood cleaning report resources."
        description="Use these templates and examples to compare the free builder, sample report, and company version before requesting access."
      />

      <section className="container-shell pb-8">
        <Panel className="grid gap-6 px-5 py-5 md:grid-cols-[0.72fr_1.28fr] md:px-8 md:py-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.26em] text-accent">
              What changes when paid
            </p>
            <h2 className="mt-4 font-display text-[2.1rem] font-bold leading-[0.94] tracking-[-0.06em] text-foreground md:text-4xl">
              Paid is not more editing. Paid is trust, storage, and continuity.
            </h2>
            <p className="mt-4 max-w-md text-sm font-semibold leading-6 text-muted-foreground">
              Keeping one recurring customer can cover far more than the cost of
              KitchenPermit.
            </p>
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

      <section className="container-shell pb-20">
        <div className="mb-5 border-b border-border-strong pb-4">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">
            FAQ
          </p>
          <h2 className="mt-3 font-display text-[2.1rem] font-bold leading-[0.94] tracking-[-0.06em] text-foreground md:text-4xl">
            Pricing questions
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {pricingFaq.map(([question, answer]) => (
            <Panel key={question} className="px-5 py-5">
              <h3 className="text-lg font-black tracking-[-0.035em] text-foreground">
                {question}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {answer}
              </p>
            </Panel>
          ))}
        </div>
      </section>
    </>
  );
}
