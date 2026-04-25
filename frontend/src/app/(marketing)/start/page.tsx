import type { Metadata } from "next";
import { StartRequestForm } from "@/components/marketing/start-request-form";
import { PageHeader } from "@/components/marketing/page-header";
import { Panel } from "@/components/ui/panel";
import { buildEmailDraftUrl } from "@/lib/start-request";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Request Proof Packet Setup",
  description: "Request a proof packet setup or sales list conversation for hood vendors.",
};

export default function StartPage() {
  const genericDraftUrl = buildEmailDraftUrl({});
  const nextSteps = [
    "1. Tell us whether you want proof packet setup, sales lists, or both.",
    `2. Open the structured email draft to ${siteConfig.supportEmail}.`,
    "3. We reply manually with setup scope, price, and the next delivery step.",
  ] as const;

  return (
    <>
      <PageHeader
        label="START // SETUP REQUEST"
        title="Request the proof packet setup when the sample value is obvious."
        description="The free builder stays neutral. Setup is the manual path for vendor branding, delivery, saved records, and real customer-ready operation."
      />
      <section className="container-shell grid gap-6 pb-20 md:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <Panel className="px-6 py-6">
          <div className="mb-6 border-b border-border pb-5">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Vendor setup request
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">
              Send one clean request for setup or sales-list delivery.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
              No account or checkout yet. The form creates a structured inquiry,
              then email handles the actual setup, quote, and delivery path.
            </p>
          </div>
          <StartRequestForm />
        </Panel>
        <div className="grid gap-6">
          <Panel className="px-6 py-6">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
              What happens next
            </p>
            <div className="mt-5 grid gap-3">
              {nextSteps.map((step) => (
                <div key={step} className="border border-border bg-white px-4 py-4 text-sm leading-7 text-foreground">
                  {step}
                </div>
              ))}
            </div>
          </Panel>
          <Panel className="px-6 py-6">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Manual commerce rule
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="border border-border bg-[rgba(17,17,17,0.03)] px-4 py-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  This page does
                </p>
                <p className="mt-3 text-sm leading-7 text-foreground">
                  Capture a structured request and route it into manual follow-up.
                </p>
              </div>
              <div className="border border-border bg-[rgba(17,17,17,0.03)] px-4 py-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  This page does not
                </p>
                <p className="mt-3 text-sm leading-7 text-foreground">
                  Create an account, auto-charge a card, or pretend fulfillment is already self-serve.
                </p>
              </div>
            </div>
          </Panel>
          <Panel className="px-6 py-6">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Direct email fallback
            </p>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              If you want to bypass the form, send a direct note with company name,
              contact, market, and whether you need proof packet setup, sales lists, or both.
            </p>
            <a
              href={genericDraftUrl}
              className="mt-5 inline-flex text-base font-semibold text-accent"
            >
              {siteConfig.supportEmail}
            </a>
          </Panel>
        </div>
      </section>
    </>
  );
}
