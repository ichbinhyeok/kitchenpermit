import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { Panel } from "@/components/ui/panel";

export const metadata: Metadata = {
  title: "Axis 2 Sample",
  description: "Masked sample of the Axis 2 list and first-touch packet.",
};

const sampleRows = [
  {
    business: "Masked Prospect A",
    city: "Austin",
    trigger: "Remodel",
    whyNow: "Permit timing and kitchen scope indicate active hood coordination.",
    contact: "Owner + office route",
    freshness: "6 days",
  },
  {
    business: "Masked Prospect B",
    city: "Round Rock",
    trigger: "Opening",
    whyNow: "Food-service certainty is high and buyer path remains usable.",
    contact: "Manager ladder",
    freshness: "4 days",
  },
  {
    business: "Masked Prospect C",
    city: "Cedar Park",
    trigger: "Change of use",
    whyNow: "Commercial exhaust need is likely and the signal is commercially explainable.",
    contact: "Direct line masked",
    freshness: "9 days",
  },
] as const;

export default function SampleAxis2Page() {
  return (
    <>
      <PageHeader
        label="SAMPLE // AXIS 2"
        title="The list is the hook. The packet sharpens the motion."
        description="A paid batch should defend why this prospect matters now, not just dump raw rows with vague relevance or stale generic business data."
      />
      <section className="container-shell grid gap-6 pb-8 md:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
        <Panel className="overflow-hidden bg-white">
          <div className="flex flex-col gap-4 border-b border-border px-5 py-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Paid batch sample
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                3 masked rows from a 10-opportunity batch
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-muted-foreground md:text-right">
              Each row is one canonical opportunity, not one raw source row.
            </p>
          </div>
          <div className="grid bg-[rgba(17,17,17,0.05)] text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground md:grid-cols-[1fr_0.75fr_0.8fr_1.15fr_0.9fr_0.7fr]">
            <div className="border-b border-border px-4 py-4 md:border-b-0 md:border-r">Prospect</div>
            <div className="border-b border-border px-4 py-4 md:border-b-0 md:border-r">City</div>
            <div className="border-b border-border px-4 py-4 md:border-b-0 md:border-r">Trigger</div>
            <div className="border-b border-border px-4 py-4 md:border-b-0 md:border-r">Why now</div>
            <div className="border-b border-border px-4 py-4 md:border-b-0 md:border-r">Contact path</div>
            <div className="px-4 py-4">Freshness</div>
          </div>
          {sampleRows.map((row) => (
            <div
              key={row.business}
              className="grid border-t border-border md:grid-cols-[1fr_0.75fr_0.8fr_1.15fr_0.9fr_0.7fr]"
            >
              <div className="px-4 py-4 text-sm leading-6 text-foreground md:border-r md:border-border">
                {row.business}
              </div>
              <div className="px-4 py-4 text-sm leading-6 text-foreground md:border-r md:border-border">
                {row.city}
              </div>
              <div className="px-4 py-4 text-sm leading-6 text-foreground md:border-r md:border-border">
                {row.trigger}
              </div>
              <div className="px-4 py-4 text-sm leading-6 text-muted-foreground md:border-r md:border-border">
                {row.whyNow}
              </div>
              <div className="px-4 py-4 text-sm leading-6 text-foreground md:border-r md:border-border">
                {row.contact}
              </div>
              <div className="px-4 py-4 font-mono text-[11px] uppercase tracking-[0.24em] text-accent">
                {row.freshness}
              </div>
            </div>
          ))}
          <div className="border-t border-border bg-[rgba(17,17,17,0.03)] px-5 py-4 text-sm leading-7 text-muted-foreground">
            Public sample stays masked. Direct usable emails, full contact ladders,
            source links, and complete batch export remain behind the paid delivery.
          </div>
        </Panel>
        <Panel className="px-6 py-6">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
            First-touch packet excerpt
          </p>
          <div className="mt-5 space-y-4">
            {[
              [
                "Why the lead was surfaced",
                "Public permit activity suggests a live hood-relevant timing window tied to an active food-service project, not a vague future maybe.",
              ],
              [
                "Suggested first email opener",
                "Reaching out because your remodel timing suggests hood coordination is active now, and we already mapped the most likely service decision path.",
              ],
              [
                "Suggested first call angle",
                "Lead with readiness and timing. Do not open with a generic service menu.",
              ],
              [
                "Prep point",
                "Reference the likely hood scope, explain why early coordination matters, and offer one concrete next step for inspection or quote readiness.",
              ],
            ].map(([label, copy], index) => (
              <div
                key={label}
                className={
                  index === 1
                    ? "border-l-2 border-accent pl-4"
                    : "border border-border bg-[rgba(17,17,17,0.03)] px-4 py-4"
                }
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  {label}
                </p>
                <p className="mt-3 text-sm leading-7 text-foreground">{copy}</p>
              </div>
            ))}
            <div className="border border-border bg-white px-4 py-4 text-sm leading-7 text-muted-foreground">
              Protected fields in the paid version include direct contact paths,
              complete personalization, and the structured export the vendor can
              operationalize immediately.
            </div>
          </div>
        </Panel>
      </section>
      <section className="container-shell pb-20">
        <div className="grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <Panel className="px-6 py-6">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Commercial flow
            </p>
            <div className="mt-5 grid gap-3">
              {[
                "Public masked sample",
                "Paid batch of 10 live prospects",
                "Optional first-touch packet setup",
                "Repeat paid batch",
                "Quoted recurring delivery only after repeat usage evidence",
              ].map((step) => (
                <div key={step} className="border border-border bg-white px-4 py-4 text-sm leading-6 text-foreground">
                  {step}
                </div>
              ))}
            </div>
          </Panel>
          <Panel className="px-6 py-6">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Batch quality bar
            </p>
            <div className="mt-5 space-y-4">
              <p className="text-sm leading-7 text-muted-foreground">
                If the opportunity cannot be defended in one sentence, it should not
                survive into the paid batch.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  "Freshness and hood relevance must be commercially explainable.",
                  "Food-service certainty and contactability cannot be hand-wavy.",
                  "No duplicate canonical project belongs in the same batch.",
                  "The product fails if it reads like generic business data.",
                ].map((rule) => (
                  <div key={rule} className="border border-border bg-[rgba(17,17,17,0.03)] px-4 py-4 text-sm leading-7 text-foreground">
                    {rule}
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </div>
      </section>
    </>
  );
}
