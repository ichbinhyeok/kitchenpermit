import type { Metadata } from "next";
import { StartRequestForm } from "@/components/marketing/start-request-form";
import { PageHeader } from "@/components/marketing/page-header";
import { Panel } from "@/components/ui/panel";
import { buildEmailDraftUrl } from "@/lib/start-request";
import { siteConfig } from "@/lib/site";
import { publicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = publicPageMetadata({
  title: "Optional Setup Help",
  description: "Request optional setup help for company-branded hood cleaning service reports.",
  path: "/start",
});

export default function StartPage() {
  const genericDraftUrl = buildEmailDraftUrl({});
  const nextSteps = [
    "1. Tell us where you operate and what you want polished in the branded report.",
    `2. Open a prepared email to ${siteConfig.supportEmail}.`,
    "3. We reply manually with the next step. Design help starts at $249.",
  ] as const;

  return (
    <>
      <PageHeader
        label="Optional setup help"
        title="Optional setup help."
        description="KitchenPermit is self-serve. If you want help polishing your report wording, logo/contact layout, or sample branded report, you can request setup help."
      />
      <section className="container-shell grid gap-6 pb-20 md:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <Panel className="px-6 py-6">
          <div className="mb-4 border-b border-border pb-4 sm:mb-6 sm:pb-5">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Setup request
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">
              <span className="sm:hidden">Design help request.</span>
              <span className="hidden sm:inline">
                Request optional setup help from $249.
              </span>
            </h2>
            <p className="mt-3 hidden max-w-2xl text-sm leading-7 text-muted-foreground sm:block">
              No payment is taken on this request. The form creates an inquiry for
              optional setup help; the report builder remains self-serve.
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
              Optional help boundaries
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="border border-border bg-[rgba(17,17,17,0.03)] px-4 py-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  What this request does
                </p>
                <p className="mt-3 text-sm leading-7 text-foreground">
                  Sends your brand/report notes to support so we can reply with a
                  design-help next step.
                </p>
              </div>
              <div className="border border-border bg-[rgba(17,17,17,0.03)] px-4 py-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  What this request does not do
                </p>
                <p className="mt-3 text-sm leading-7 text-foreground">
                  Create an account, auto-charge a card, or make design help look required.
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
              contact, market, and what your service report needs to show after service.
            </p>
            <a
              href={genericDraftUrl}
              className="mt-5 inline-flex min-h-10 items-center text-base font-semibold text-accent"
            >
              Open email request
            </a>
          </Panel>
        </div>
      </section>
    </>
  );
}
