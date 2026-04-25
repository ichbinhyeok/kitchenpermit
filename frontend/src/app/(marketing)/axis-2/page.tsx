import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, MapPinned, Radar, Rows3, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-header";
import { Panel } from "@/components/ui/panel";

export const metadata: Metadata = {
  title: "Axis 2",
  description:
    "A deduped opportunity list plus first-touch packet structure for kitchen exhaust vendors buying live outbound inventory.",
};

const rules = [
  "Restaurant remodel and finish-out focus beats generic lead-gen language.",
  "Each paid row represents one canonical opportunity, not one raw source row.",
  "Public sample stays masked. Paid batch stays commercially usable.",
  "Recurring delivery is earned after repeat usage evidence, not assumed on day one.",
] as const;

const sampleRows = [
  {
    business: "Masked Prospect A",
    trigger: "Remodel permit filed",
    fit: "Kitchen scope visible, hood relevance high",
    contact: "Owner + office route",
    freshness: "6 days",
  },
  {
    business: "Masked Prospect B",
    trigger: "Opening activity confirmed",
    fit: "Food-service certainty strong, buyer path workable",
    contact: "Manager route + main line",
    freshness: "11 days",
  },
  {
    business: "Masked Prospect C",
    trigger: "Change of use review",
    fit: "Commercial exhaust requirement likely",
    contact: "Direct business contact",
    freshness: "9 days",
  },
] as const;

const paidRowIncludes = [
  "Business identity and masked public-sample equivalent",
  "Trigger reason and why it matters now",
  "Hood relevance and food-service certainty",
  "Usable buyer or contact path",
  "Freshness signal strong enough to defend commercially",
] as const;

const packetBlocks = [
  {
    label: "Why now",
    copy:
      "Recent permit and activation signals suggest a live hood-related decision window rather than abstract long-term interest.",
  },
  {
    label: "Fit explanation",
    copy:
      "The row should explain why the opportunity is hood-relevant and why this vendor can plausibly help right now.",
  },
  {
    label: "Contact ladder",
    copy:
      "Owner, manager, office, or direct line paths should be organized into a usable first-touch order instead of dumped as enrichment noise.",
  },
  {
    label: "First opener",
    copy:
      "The packet should help the vendor sound timing-aware and specific, not like another generic clean-your-hood blast.",
  },
] as const;

const flow = [
  "Public masked sample",
  "Paid batch of 10 live prospects",
  "Optional first-touch packet setup",
  "Repeat paid batch",
  "Quoted recurring delivery only after repeat usage evidence",
] as const;

export default function Axis2Page() {
  return (
    <>
      <PageHeader
        label="AXIS 2 // NEW SALES"
        title="A live opportunity list, not generic lead gen."
        description="Axis 2 combines a deduped list of trigger-led opportunities with a first-touch packet that helps a hood vendor explain why the lead matters right now."
      />

      <section className="container-shell grid gap-6 pb-8 md:grid-cols-2">
        <Panel className="px-6 py-6">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">
            Main hook
          </p>
          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-foreground">
            The list gets bought first.
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Vendors buy the opportunity because it can move revenue. The packet matters
            because it helps that opportunity become outreach instead of another
            spreadsheet row.
          </p>
          <div className="mt-6 border-l-2 border-accent pl-4 text-sm leading-7 text-foreground">
            Axis 2 is not packet-only. The list is the commercial hook. The packet is
            the sales-enablement layer that helps close.
          </div>
        </Panel>

        <Panel className="px-6 py-6">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">
            Why this is not generic lead gen
          </p>
          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-foreground">
            Quality comes from trigger truth, not directory volume.
          </h2>
          <div className="mt-6 space-y-3">
            {rules.map((rule) => (
              <div
                key={rule}
                className="flex items-start gap-3 border border-border bg-surface px-4 py-4"
              >
                <Check className="mt-0.5 h-4 w-4 text-accent" strokeWidth={2.2} />
                <p className="text-sm leading-6 text-foreground">{rule}</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="container-shell grid gap-6 py-8 md:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <Panel className="overflow-hidden">
          <div className="border-b border-border bg-[rgba(17,17,17,0.05)] px-5 py-4">
            <div className="flex items-center gap-3">
              <Rows3 className="h-4 w-4 text-accent" strokeWidth={2} />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
                List sample structure
              </p>
            </div>
          </div>
          <div className="grid bg-[rgba(17,17,17,0.04)] text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground md:grid-cols-[1fr_1fr_1.25fr_0.95fr_0.7fr]">
            <div className="border-b border-border px-5 py-4 md:border-b-0 md:border-r">
              Business
            </div>
            <div className="border-b border-border px-5 py-4 md:border-b-0 md:border-r">
              Trigger
            </div>
            <div className="border-b border-border px-5 py-4 md:border-b-0 md:border-r">
              Fit note
            </div>
            <div className="border-b border-border px-5 py-4 md:border-b-0 md:border-r">
              Contact path
            </div>
            <div className="px-5 py-4">Freshness</div>
          </div>
          {sampleRows.map((row) => (
            <div
              key={row.business}
              className="grid border-t border-border bg-white md:grid-cols-[1fr_1fr_1.25fr_0.95fr_0.7fr]"
            >
              <div className="px-5 py-4 text-sm font-medium text-foreground md:border-r md:border-border">
                {row.business}
              </div>
              <div className="px-5 py-4 text-sm text-foreground md:border-r md:border-border">
                {row.trigger}
              </div>
              <div className="px-5 py-4 text-sm leading-6 text-muted-foreground md:border-r md:border-border">
                {row.fit}
              </div>
              <div className="px-5 py-4 text-sm leading-6 text-foreground md:border-r md:border-border">
                {row.contact}
              </div>
              <div className="px-5 py-4 font-mono text-xs uppercase tracking-[0.18em] text-accent">
                {row.freshness}
              </div>
            </div>
          ))}
        </Panel>

        <Panel className="px-6 py-6">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">
            Paid batch row
          </p>
          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-foreground">
            What one commercial row has to carry
          </h2>
          <div className="mt-6 space-y-3">
            {paidRowIncludes.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 border border-border bg-[rgba(17,17,17,0.04)] px-4 py-4"
              >
                <Radar className="mt-0.5 h-4 w-4 text-accent" strokeWidth={2} />
                <p className="text-sm leading-6 text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="container-shell grid gap-6 py-8 md:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
        <Panel className="px-6 py-6">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">
            First-touch packet excerpt
          </p>
          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-foreground">
            The packet helps the first touch sound prepared.
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {packetBlocks.map((item) => (
              <div key={item.label} className="border border-border px-5 py-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-4 text-sm leading-7 text-foreground">{item.copy}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="px-6 py-6">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">
            Coverage discipline
          </p>
          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-foreground">
            Austin-first fulfillment, not fake multi-city claims.
          </h2>
          <div className="mt-6 space-y-4">
            <div className="border border-border bg-surface px-4 py-4 text-sm leading-7 text-muted-foreground">
              Austin is the locked active coverage metro for MVP paid inventory. San
              Antonio and DFW remain prospectable vendor markets, but should not be
              sold as live Axis 2 inventory until their signal pipeline is active and
              QA-passing.
            </div>
            <div className="flex items-start gap-3 border border-border bg-[rgba(17,17,17,0.04)] px-4 py-4">
              <MapPinned className="mt-0.5 h-4 w-4 text-accent" strokeWidth={2} />
              <p className="text-sm leading-6 text-foreground">
                Austin-first does not mean Austin-only. It means coverage claims stay
                honest while the broader Texas vendor market remains in view.
              </p>
            </div>
          </div>
        </Panel>
      </section>

      <section className="container-shell grid gap-6 py-8 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Panel className="px-6 py-6">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">
            Commercial flow
          </p>
          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-foreground">
            Batch-first before recurring.
          </h2>
          <div className="mt-6 space-y-3">
            {flow.map((step, index) => (
              <div
                key={step}
                className="flex items-start gap-4 border border-border bg-surface px-4 py-4"
              >
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center border border-border-strong text-xs font-semibold text-foreground">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-foreground">{step}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 border-l-2 border-accent pl-4 text-sm leading-7 text-foreground">
            Do not assume subscription behavior before repeat purchase behavior is
            visible.
          </div>
        </Panel>

        <Panel className="px-6 py-6">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">
            Pricing CTA
          </p>
          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-foreground">
            Sell the sample honestly, then open the paid batch.
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-[0.72fr_1.28fr]">
            <div className="border border-border bg-[rgba(17,17,17,0.04)] px-5 py-5">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Starting at
              </p>
              <p className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-foreground">
                $149
              </p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Paid batch of 10 live prospects.
              </p>
            </div>
            <div className="border border-border bg-surface px-5 py-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-accent" strokeWidth={2} />
                <p className="text-sm leading-7 text-muted-foreground">
                  Public sample stays masked at two to three rows. The paid delivery
                  carries the usable list plus the first-touch framing that makes the
                  outreach motion stronger.
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/start"
                  className="inline-flex items-center gap-2 border border-accent bg-accent px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-accent-strong"
                >
                  Start Axis 2
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/samples/axis-2"
                  className="inline-flex items-center gap-2 border border-border-strong bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-foreground transition hover:bg-surface"
                >
                  View sample
                </Link>
              </div>
            </div>
          </div>
        </Panel>
      </section>
    </>
  );
}
