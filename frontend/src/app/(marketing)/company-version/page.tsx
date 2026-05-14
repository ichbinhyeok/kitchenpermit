import type { Metadata } from "next";
import Link from "@/components/navigation/static-link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { PaddleCheckoutButton } from "@/components/billing/paddle-checkout-button";
import { Reveal } from "@/components/marketing/reveal";
import {
  AXIS1_COMPANY_MONTHLY_PRICE,
  AXIS1_DESIGN_HELP_STARTING_PRICE,
} from "@/lib/axis1-product-policy";

export const metadata: Metadata = {
  title: "Company Version",
  description:
    "The paid KitchenPermit company version for saved company details, live service report links, clean PDFs, and report history.",
};

const storedItems = [
  ["Company identity", "Company name, logo, report color, service area, and customer-facing contact."],
  ["Reply path", "Phone, dispatch email, and the action buttons customers use after service."],
  ["Live delivery", "Service report links and PDF copies stay live while the subscription is active."],
  ["Customer history", "Saved restaurant/site records, next-service timing, and resend-ready customer messages."],
] as const;

const flowItems = [
  ["1. Save company profile", "Logo, report color, and contact details become the default."],
  ["2. Build each job report", "Use the builder for photos, open items, and next actions."],
  ["3. Send branded output", "The restaurant receives a clean link and PDF under the vendor name."],
  ["4. Work the history", "Dashboard history shows repeat customers, next service timing, and the message to send."],
] as const;

function CtaLink({
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
      ? "bg-[#f26a21] text-white shadow-[0_18px_48px_rgba(242,106,33,0.26)] hover:bg-[#dd5b17]"
      : tone === "light"
        ? "border border-white/16 bg-white/8 text-white hover:bg-white/14"
        : "bg-[#111315] text-white hover:bg-[#20262d]";

  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-black transition ${toneClass}`}
    >
      <span>{children}</span>
      <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
    </Link>
  );
}

export default function CompanyVersionPage() {
  return (
    <div className="-mt-[82px] overflow-hidden bg-[#080a0c] text-white">
      <section className="relative isolate px-4 pb-16 pt-[112px] sm:px-5 md:pb-24 md:pt-[128px]">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_22%_0%,rgba(242,106,33,0.30),transparent_28%),radial-gradient(circle_at_74%_18%,rgba(255,255,255,0.10),transparent_26%),linear-gradient(180deg,#080a0c_0%,#11161b_64%,#080a0c_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(180deg,black,transparent_76%)]" />

        <Reveal className="mx-auto grid min-h-[calc(100svh-150px)] w-[min(1180px,100%)] gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
          <div className="max-w-4xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-[#ffb27c]">
              Company version // {AXIS1_COMPANY_MONTHLY_PRICE}
            </p>
            <h1 className="mt-5 max-w-[12ch] font-display text-[clamp(3.2rem,10vw,7.2rem)] font-bold leading-[0.86] tracking-[-0.085em]">
              Save your company info once. Send every report under your name.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/68 md:text-xl md:leading-9">
              The paid path for saved company details, clean inspection PDFs,
              live service report links, customer history, and next-service
              follow-up for hood cleaning companies that want the report to
              carry their name.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <PaddleCheckoutButton className="bg-[#f26a21] text-white shadow-[0_18px_48px_rgba(242,106,33,0.26)] hover:bg-[#dd5b17]">
                Start $79 checkout
              </PaddleCheckoutButton>
              <CtaLink href="/dashboard" tone="light">
                View dashboard
              </CtaLink>
              <CtaLink href="/samples/axis-1" tone="light">
                View sample report
              </CtaLink>
              <CtaLink href="/pricing" tone="light">
                View pricing
              </CtaLink>
            </div>
          </div>

          <div className="rounded-[34px] border border-white/12 bg-white/[0.055] p-4 shadow-[0_36px_120px_rgba(0,0,0,0.34)] backdrop-blur sm:p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#ffb27c]">
              What gets saved
            </p>
            <div className="mt-4 divide-y divide-white/10 border-y border-white/10">
              {storedItems.map(([label, copy]) => (
                <div key={label} className="grid gap-3 py-5 sm:grid-cols-[0.34fr_0.66fr]">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/42">
                    {label}
                  </p>
                  <p className="text-sm font-bold leading-6 text-white/82">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="bg-[#f6efe6] px-4 py-16 text-[#111315] sm:px-5 md:py-24">
        <Reveal className="mx-auto grid w-[min(1180px,100%)] gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#75695f]">
              Builder vs company version
            </p>
            <h2 className="mt-4 max-w-3xl font-display text-[clamp(2.8rem,8vw,5.8rem)] font-bold leading-[0.9] tracking-[-0.078em]">
              The free builder makes one report. The company version makes it usable.
            </h2>
          </div>
          <div className="grid gap-0 border-y border-black/12">
            {flowItems.map(([label, copy]) => (
              <div key={label} className="grid gap-4 border-b border-black/10 py-6 last:border-b-0 md:grid-cols-[0.34fr_0.66fr]">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#75695f]">
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

      <section className="bg-[#f6efe6] px-4 pb-16 text-[#111315] sm:px-5 md:pb-24">
        <Reveal className="mx-auto w-[min(1180px,100%)]">
          <div className="grid overflow-hidden rounded-[36px] bg-[#111315] text-white shadow-[0_34px_120px_rgba(17,19,21,0.24)] lg:grid-cols-[1fr_0.9fr]">
            <div className="p-6 sm:p-8 lg:p-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#ffb27c]">
                Paid version
              </p>
              <h2 className="mt-4 max-w-3xl font-display text-[clamp(2.5rem,7vw,5.4rem)] font-bold leading-[0.9] tracking-[-0.075em]">
                {AXIS1_COMPANY_MONTHLY_PRICE} for the version customers should actually receive.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/64">
                Free output is intentionally limited: no company logo/contact,
                7-day links, watermarked PDFs, and no history. The company
                version removes those limits and turns saved reports into a
                simple follow-up workspace.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <PaddleCheckoutButton className="bg-[#f26a21] text-white shadow-[0_18px_48px_rgba(242,106,33,0.26)] hover:bg-[#dd5b17]">
                  Start company version
                </PaddleCheckoutButton>
                <CtaLink href="/axis-1/tool?step=outputs&account=company" tone="light">
                  Preview company mode
                </CtaLink>
              </div>
            </div>
            <div className="border-t border-white/10 bg-[#f8f1e8] p-6 text-[#111315] sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#75695f]">
                Included in company version
              </p>
              <div className="mt-5 divide-y divide-black/10 border-y border-black/10">
                {[
                  "Saved company profile",
                  "Logo upload and report color",
                  "No PDF watermark",
                  "Live service report links while subscribed",
                  "Customer/site history",
                  "Next-service follow-up view",
                  "Customer-ready send message",
                  `Optional design help from ${AXIS1_DESIGN_HELP_STARTING_PRICE}`,
                ].map((item) => (
                  <p key={item} className="py-4 text-lg font-black tracking-[-0.045em]">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
