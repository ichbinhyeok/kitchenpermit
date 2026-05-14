import type { Metadata } from "next";
import {
  ArrowRight,
  Check,
  FileCheck2,
  Flame,
  Repeat2,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Panel } from "@/components/ui/panel";
import { SectionLabel } from "@/components/ui/section-label";

export const metadata: Metadata = {
  title: "Branded Service Reports for Hood Cleaning Jobs",
  description:
    "Branded service report links and inspection-ready PDFs for hood vendors after every cleaning job.",
};

const roleFrames = [
  {
    label: "Customer sees",
    copy:
      "One branded service report link/PDF they can save with restaurant files.",
  },
  {
    label: "Vendor gets",
    copy:
      "A same-day service report that makes the job easier to trust, file, and defend.",
  },
] as const;

const whyItPays = [
  {
    label: "Right after service",
    title: "Most vendors still make the customer guess what actually happened.",
    copy:
      "Loose photos and note fragments force the customer to decode the job or call back for clarification.",
  },
  {
    label: "When price gets compared",
    title: "If the report feels sloppy, premium service feels overpriced.",
    copy:
      "A branded service report link and PDF make the work look serious before anyone questions the price or the quality of the visit.",
  },
] as const;

const packetSections = [
  {
    title: "Today's result",
    copy: "What was completed today in language the customer can understand in one pass.",
  },
  {
    title: "What stayed open",
    copy:
      "Blocked access or incomplete areas stay visible instead of getting hidden in technician shorthand.",
  },
  {
    title: "Photos tied to the right area",
    copy:
      "Before-and-after photos support the link without turning into a giant image dump.",
  },
  {
    title: "Inspection-ready PDF",
    copy:
      "The same record can be saved as a PDF for manager files, inspection folders, or documentation requests.",
  },
  {
    title: "What you need to do next",
    copy:
      "The customer sees the next action clearly instead of calling the office to ask what happens now.",
  },
  {
    title: "Who to contact",
    copy:
      "The service report ends with a real contact path so the customer record does not feel improvised.",
  },
] as const;

const packetFlow = [
  {
    step: "01",
    title: "Finish the service event",
    copy:
      "The visit closes with one service report instead of scattered notes and loose photos.",
  },
  {
    step: "02",
    title: "Send the branded service report same day",
    copy:
      "The restaurant client sees what was done, what stayed open, what to do next, and the PDF they can save.",
  },
  {
    step: "03",
    title: "Let the service report carry the explanation",
    copy:
      "That same link makes premium service look organized and keeps blocked-access or open-item defense inside the customer service report.",
  },
] as const;

const sampleExcerpt = [
  {
    label: "Today's result",
    copy:
      "Crew completed hood and reachable duct-path cleaning. Primary work scope is legible in one screen without technician shorthand.",
  },
  {
    label: "Still open",
    copy:
      "Rear access panel remained difficult to reach during service and should be corrected before the next standard cycle.",
  },
  {
    label: "Next step",
    copy:
      "Recommended service window: 90 days. Confirm the next slot or request access correction review before revisit.",
  },
] as const;

const outcomes = [
  {
    title: "Trust",
    copy:
      "A serious vendor should look more disciplined within minutes of the visit, not more improvised.",
    icon: ShieldCheck,
  },
  {
    title: "Fewer callbacks",
    copy:
      "The customer should not need to call back just to ask what happened or what to do next.",
    icon: Wrench,
  },
  {
    title: "Premium report",
    copy:
      "A branded service report link and PDF make higher-quality service feel worth the price.",
    icon: Repeat2,
  },
] as const;

const lockedRules = [
  "The service report is the product surface. Raw technician notes can exist internally, but they are not the customer deliverable.",
  "Blocked or unworked items stay visible when they matter. Hiding them makes the page cleaner and the vendor less trustworthy.",
  "The public sample proves that the report is readable. The company version is the repeatable delivery system.",
] as const;

const heroProofRows = [
  ["Branded record", "Vendor logo, contact, job result, and PDF copy in one report."],
  ["Inspection file", "Restaurant client can save the link/PDF with service reports."],
  ["Next action", "Photos, open items, and the next service step stay clear."],
] as const;

export default function Axis1Page() {
  return (
    <>
      <section className="container-shell pb-8 pt-6 md:pb-10">
        <div className="relative overflow-hidden rounded-[38px] border border-border bg-[linear-gradient(140deg,rgba(255,255,255,0.86),rgba(243,239,233,0.52))] px-5 py-5 shadow-[var(--shadow)] md:rounded-[44px] md:px-8 md:py-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_12%,rgba(242,106,33,0.14),transparent_26%),radial-gradient(circle_at_86%_18%,rgba(17,17,17,0.06),transparent_24%),linear-gradient(180deg,transparent,rgba(255,255,255,0.2))]" />
          <div className="relative grid gap-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-center md:gap-8">
            <div className="space-y-5">
              <SectionLabel>FOR HOOD SERVICE VENDORS</SectionLabel>
              <div className="space-y-4">
                <h1 className="font-display text-[clamp(2.65rem,12vw,5.1rem)] font-bold leading-[0.9] tracking-[-0.09em] text-foreground md:max-w-[11.4ch] md:text-[clamp(4.6rem,6.9vw,6.6rem)]">
                  Send a branded service report after every hood cleaning job.
                </h1>
                <p className="max-w-2xl border-l border-border-strong pl-4 text-[15px] leading-[1.62] text-muted-foreground md:pl-5 md:text-lg md:leading-8">
                  Restaurant clients get one clean link/PDF they can save for
                  inspections, with photos, open items, and the next action.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ButtonLink
                  href="/samples/axis-1"
                  withIcon
                  className="w-full justify-between sm:w-auto sm:justify-center"
                >
                  View sample report
                </ButtonLink>
                <ButtonLink
                  href="/company-version"
                  variant="outline"
                  withIcon
                  className="w-full justify-between sm:w-auto sm:justify-center"
                >
                  Start company version
                </ButtonLink>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
                <a
                  href="/company-version"
                  className="inline-flex min-h-10 items-center text-accent underline-offset-4 transition hover:text-accent-strong hover:underline"
                >
                  See how this would look for my company
                </a>
                <a
                  href="/axis-1/tool?account=free"
                  className="inline-flex min-h-10 items-center text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
                >
                  Try the builder
                </a>
              </div>
              <div className="hidden gap-2 sm:grid-cols-3 md:grid">
                {[
                  "Branded service report",
                  "Inspection-ready PDF",
                  "Clear open-item record",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[18px] border border-border bg-white/62 px-3.5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-foreground shadow-[var(--shadow-soft)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-[32px] border border-black/12 bg-dark-surface p-3 shadow-[0_30px_90px_rgba(17,17,17,0.24)] md:rounded-[38px]">
                <div className="rounded-[26px] border border-white/10 bg-white px-4 py-4 text-foreground md:px-5 md:py-5">
                  <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-muted-foreground">
                        Branded service report + PDF
                      </p>
                      <h2 className="mt-2 font-display text-3xl font-bold leading-[0.92] tracking-[-0.06em] md:text-4xl">
                        Restaurant-ready service report
                      </h2>
                    </div>
                    <div className="rounded-full bg-[rgba(242,106,33,0.1)] p-2">
                      <Flame className="h-4 w-4 text-accent" strokeWidth={2.1} />
                    </div>
                  </div>
                  <div className="grid gap-3 py-4">
                    {heroProofRows.map(([label, copy]) => (
                      <div
                        key={label}
                        className="rounded-[18px] border border-border bg-[rgba(17,17,17,0.025)] px-4 py-3"
                      >
                        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                          {label}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-foreground">{copy}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-3 border-t border-border pt-4 md:grid-cols-[0.88fr_1.12fr]">
                    <div className="rounded-[20px] border border-border bg-[rgba(242,106,33,0.07)] px-4 py-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                        Next step
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-foreground">
                        Clear the blocked area or confirm the next visit window.
                      </p>
                    </div>
                    <div className="rounded-[20px] border border-border bg-dark-surface px-4 py-4 text-white">
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
                        Why vendors pay
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/72">
                        The customer can understand the job and save the record for files.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell grid gap-4 pb-8 md:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] md:gap-6">
        <Panel className="border-white/10 bg-dark-surface px-5 py-5 text-white md:px-6 md:py-6">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#ffb489]">
            What changes after each visit
          </p>
          <h2 className="mt-4 font-display text-[2.2rem] font-bold leading-[0.92] tracking-[-0.06em] md:text-4xl">
            The customer should not need a callback to understand the job.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/68 md:text-base md:leading-7">
            The visit ends with one readable service report that explains what was done,
            what stayed open, and what the customer needs to do next.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {roleFrames.map((item) => (
              <div
                key={item.label}
                className="rounded-[22px] border border-white/10 bg-white/4 px-4 py-4"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/45">
                  {item.label}
                </p>
                <p className="mt-3 text-sm leading-6 text-white">{item.copy}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="bg-white/78 px-5 py-5 md:px-6 md:py-6">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">
            Why vendors buy it
          </p>
          <h2 className="mt-4 font-display text-[2.15rem] font-bold leading-[0.92] tracking-[-0.06em] text-foreground md:text-4xl">
            The first value is fewer callbacks and a stronger premium report.
          </h2>
          <div className="mt-5 grid gap-3">
            {[
              "A service report instead of raw note clutter",
              "Less office time rewriting crew photos into customer explanations",
              "Blocked access and open items made visible without a follow-up explanation call",
              "Premium service looks premium the moment the service report lands",
              "A public sample link that lets vendors show quality before account creation",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-[20px] border border-border bg-white/78 px-4 py-4"
              >
                <Check className="mt-0.5 h-4 w-4 text-accent" strokeWidth={2.2} />
                <p className="text-sm leading-6 text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="container-shell py-8 md:py-10">
        <div className="mb-5 flex items-end justify-between gap-6 border-b border-border-strong pb-4 md:mb-6">
          <div>
            <h2 className="font-display text-[2.25rem] font-bold leading-[0.92] tracking-[-0.07em] text-foreground md:text-5xl">
              Where the money leaks without it
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
              Existing-customer value is not abstract. Money leaks when the customer has
              to decode the job after the crew leaves.
            </p>
          </div>
          <span className="hidden font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground md:block">
            POST-VISIT TRUST
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          {whyItPays.map((item) => (
            <Panel key={item.title} className="h-full bg-white/76 px-5 py-5 md:px-6 md:py-6">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">
                {item.label}
              </p>
              <h3 className="mt-4 font-display text-[2rem] font-bold leading-[0.95] tracking-[-0.06em] text-foreground md:text-3xl">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground md:leading-7">
                {item.copy}
              </p>
            </Panel>
          ))}
        </div>
      </section>

      <section className="container-shell grid gap-4 py-8 md:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] md:gap-6 md:py-10">
        <Panel className="bg-white/78 px-5 py-5 md:px-6 md:py-6">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">
            What goes inside
          </p>
          <h2 className="mt-4 font-display text-[2.2rem] font-bold leading-[0.92] tracking-[-0.06em] text-foreground md:text-4xl">
            One clean service report surface with photos, open items, and next action.
          </h2>
          <div className="mt-5 grid gap-3">
            {packetSections.map((item) => (
              <div
                key={item.title}
                className="rounded-[22px] border border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(255,255,255,0.54))] px-4 py-4"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  {item.title}
                </p>
                <p className="mt-3 text-sm leading-6 text-foreground">{item.copy}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="border-white/10 bg-dark-surface px-5 py-5 text-white md:px-6 md:py-6">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#ffb489]">
            How vendors use it
          </p>
          <h2 className="mt-4 font-display text-[2.15rem] font-bold leading-[0.92] tracking-[-0.06em] md:text-4xl">
            Finish the visit. Send the service report. Let it carry the explanation.
          </h2>
          <div className="mt-5 grid gap-3">
            {packetFlow.map((item) => (
              <div
                key={item.step}
                className="rounded-[22px] border border-white/10 bg-white/4 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/45">
                    Step {item.step}
                  </p>
                  <FileCheck2 className="h-4 w-4 text-accent" strokeWidth={2} />
                </div>
                <h3 className="mt-3 text-lg font-semibold tracking-[-0.03em] text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/68">{item.copy}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-[22px] border border-white/10 bg-[rgba(242,106,33,0.08)] px-4 py-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#ffb489]">
              Service report rule
            </p>
            <p className="mt-3 text-sm leading-6 text-white">
              Keep internal notes behind the scenes. The restaurant should receive a
              readable service report, not a raw back-office dump.
            </p>
          </div>
        </Panel>
      </section>

      <section className="container-shell py-8 md:py-10">
        <div className="mb-5 flex items-end justify-between gap-6 border-b border-border-strong pb-4 md:mb-6">
          <div>
            <h2 className="font-display text-[2.25rem] font-bold leading-[0.92] tracking-[-0.07em] text-foreground md:text-5xl">
              Public sample excerpt
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
              The sample page should prove that the customer can understand the job in
              one pass, without replacing the company-version delivery workflow.
            </p>
          </div>
          <span className="hidden font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground md:block">
            SEND-READY REPORT
          </span>
        </div>
        <Panel className="bg-white/78 px-5 py-5 md:px-6 md:py-6">
          <div className="grid gap-3 md:grid-cols-3 md:gap-4">
            {sampleExcerpt.map((item) => (
              <div
                key={item.label}
                className="rounded-[22px] border border-border bg-white/72 px-4 py-4"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-3 text-sm leading-6 text-foreground">{item.copy}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {lockedRules.map((rule) => (
              <div
                key={rule}
                className="rounded-[22px] border border-border bg-[rgba(17,17,17,0.03)] px-4 py-4"
              >
                <p className="text-sm leading-6 text-muted-foreground">{rule}</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="container-shell grid gap-3 py-8 md:grid-cols-3 md:gap-5 md:py-10">
        {outcomes.map((item) => {
          const Icon = item.icon;

          return (
            <Panel key={item.title} className="h-full bg-white/76 px-5 py-5 md:px-6 md:py-6">
              <div className="mb-4 inline-flex rounded-full bg-[rgba(242,106,33,0.08)] p-3 md:mb-5">
                <Icon className="h-5 w-5 text-accent" strokeWidth={2} />
              </div>
              <h3 className="font-display text-[2rem] font-bold uppercase tracking-[-0.04em] text-foreground md:text-3xl">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground md:leading-7">
                {item.copy}
              </p>
            </Panel>
          );
        })}
      </section>

      <section className="container-shell pb-20 pt-8">
        <Panel className="grid gap-5 px-5 py-5 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] md:items-center md:px-6 md:py-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">
              Product + sample + pricing
            </p>
            <h2 className="mt-4 font-display text-[2.2rem] font-bold leading-[0.92] tracking-[-0.06em] text-foreground md:text-4xl">
              See the sample first. Test the builder free. Use the company version when it should carry your brand.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
              The free builder creates an unbranded 7-day test link and a
              watermarked PDF. The $79/month company version adds your company logo/contact,
              clean PDFs, live service report links, customer history, and
              next-service follow-up.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-[0.78fr_1.22fr]">
            <div className="rounded-[24px] border border-border bg-[rgba(17,17,17,0.04)] px-5 py-5">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Price
              </p>
              <p className="mt-2 font-display text-5xl font-bold tracking-[-0.06em] text-foreground">
                $79/mo
              </p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Company version
              </p>
            </div>
            <div className="rounded-[24px] border border-border bg-white px-5 py-5">
              <p className="text-sm leading-6 text-muted-foreground">
                Company version is $79/month. Optional brand/report design help
                starts at $249 when a vendor wants extra polish. Paid workflow
                also saves customer/site history and a resend-ready message for
                each report.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <ButtonLink href="/samples/axis-1" variant="outline" withIcon>
                  View sample report
                </ButtonLink>
                <ButtonLink href="/company-version" withIcon>
                  Start company version
                </ButtonLink>
              </div>
              <a
                href="/axis-1/tool?account=free"
                className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-accent"
              >
                Try the builder
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </Panel>
      </section>
    </>
  );
}
