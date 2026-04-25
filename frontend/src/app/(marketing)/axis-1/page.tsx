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
  title: "Proof Packets for Existing Customers",
  description:
    "Customer-ready proof packets for hood vendors that cut explanation calls, show proof clearly, and defend open items.",
};

const roleFrames = [
  {
    label: "Customer sees",
    copy:
      "One readable proof packet instead of a loose pile of photos, notes, and invoice fragments.",
  },
  {
    label: "Vendor gets",
    copy:
      "A same-day proof packet that protects trust, premium positioning, and open-item defense.",
  },
] as const;

const whyItPays = [
  {
    label: "Right after service",
    title: "Most vendors still make the customer guess what actually happened.",
    copy:
      "Loose photos, note fragments, and invoice lines force the customer to decode the job or call back for clarification.",
  },
  {
    label: "When price gets compared",
    title: "If the proof feels sloppy, premium service feels overpriced.",
    copy:
      "A readable packet makes the work look serious before anyone questions the price or the quality of the visit.",
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
    title: "Photo proof tied to the right area",
    copy:
      "Before-and-after proof supports the packet without turning into a giant image dump.",
  },
  {
    title: "What you need to do next",
    copy:
      "The customer sees the next action clearly instead of calling the office to ask what happens now.",
  },
  {
    title: "Who to contact",
    copy:
      "The packet ends with a real contact path so the handoff does not feel improvised.",
  },
] as const;

const packetFlow = [
  {
    step: "01",
    title: "Finish the service event",
    copy:
      "The visit closes with one customer-ready proof packet instead of scattered notes, photos, and invoice fragments.",
  },
  {
    step: "02",
    title: "Send the packet same day",
    copy:
      "The customer sees what was done, what stayed open, and what to do next without a callback explanation.",
  },
  {
    step: "03",
    title: "Let the packet carry the explanation",
    copy:
      "That same packet makes premium service look organized and keeps blocked-access or open-item defense inside the document.",
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
    title: "Premium handoff",
    copy:
      "Clear proof and open-item handling make higher-quality service feel worth the price.",
    icon: Repeat2,
  },
] as const;

const lockedRules = [
  "The proof packet is the product surface. Raw technician notes can exist internally, but they are not the customer deliverable.",
  "Blocked or unworked items stay visible when they matter. Hiding them makes the page cleaner and the vendor less trustworthy.",
  "The public sample proves that the handoff is readable. The paid setup is the real delivery system.",
] as const;

const heroProofRows = [
  ["Today's result", "Hood and reachable duct-path cleaning completed."],
  ["Still open", "Rear panel blocked. Correction recommended before next cycle."],
  ["Next step", "Confirm access correction or the next service window."],
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
                <h1 className="font-display text-[clamp(2.65rem,13vw,5.1rem)] font-bold leading-[0.9] tracking-[-0.09em] text-foreground md:max-w-[10.5ch] md:text-[clamp(4.9rem,7.2vw,7rem)]">
                  Turn hood job photos into a customer-ready proof packet.
                </h1>
                <p className="max-w-2xl border-l border-border-strong pl-4 text-[15px] leading-[1.62] text-muted-foreground md:pl-5 md:text-lg md:leading-8">
                  Your crew already takes photos. Your office should not have to
                  rewrite them into a customer explanation after every hood
                  cleaning visit.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ButtonLink
                  href="/axis-1/tool"
                  withIcon
                  className="w-full justify-between sm:w-auto sm:justify-center"
                >
                  Try neutral builder
                </ButtonLink>
                <ButtonLink
                  href="/samples/axis-1"
                  variant="outline"
                  withIcon
                  className="w-full justify-between sm:w-auto sm:justify-center"
                >
                  Open public sample
                </ButtonLink>
                <ButtonLink
                  href="/start"
                  variant="outline"
                  withIcon
                  className="w-full justify-between sm:w-auto sm:justify-center"
                >
                  Request setup
                </ButtonLink>
              </div>
              <div className="hidden gap-2 sm:grid-cols-3 md:grid">
                {[
                  "Less photo-dump confusion",
                  "No office rewrite",
                  "Clear blocked-access record",
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
                        Same-day proof packet
                      </p>
                      <h2 className="mt-2 font-display text-3xl font-bold leading-[0.92] tracking-[-0.06em] md:text-4xl">
                        Customer-ready proof
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
                        The customer understands the job without another explanation call.
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
            The visit ends with one readable proof packet that explains what was done,
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
            The first value is fewer callbacks and a stronger premium handoff.
          </h2>
          <div className="mt-5 grid gap-3">
            {[
              "A customer-ready proof packet instead of raw note clutter",
              "Less office time rewriting crew photos into customer explanations",
              "Blocked access and open items made visible without a follow-up explanation call",
              "Premium service looks premium the moment the packet lands",
              "A public sample link that lets vendors show quality before setup",
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
            One clean proof-packet surface with visible proof, open items, and next action.
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
            Finish the visit. Send the packet. Let it carry the explanation.
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
              Locked rule
            </p>
            <p className="mt-3 text-sm leading-6 text-white">
              In MVP, detailed internal notes can still exist, but the customer-facing
              product is the readable proof packet, not a raw compliance dump.
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
              one pass, without replacing the paid setup and delivery workflow.
            </p>
          </div>
          <span className="hidden font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground md:block">
            SEND-READY PROOF
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
              Product + sample + request
            </p>
            <h2 className="mt-4 font-display text-[2.2rem] font-bold leading-[0.92] tracking-[-0.06em] text-foreground md:text-4xl">
              Understand it here. Prove it with the sample. Start setup when the value is obvious.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
              Public pricing starts at $149 for proof packet setup. The free sample
              is a shareable proof link. The paid version is the real send-ready packet
              system used after live jobs.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-[0.78fr_1.22fr]">
            <div className="rounded-[24px] border border-border bg-[rgba(17,17,17,0.04)] px-5 py-5">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Starting at
              </p>
              <p className="mt-2 font-display text-5xl font-bold tracking-[-0.06em] text-foreground">
                $149
              </p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Proof packet setup
              </p>
            </div>
            <div className="rounded-[24px] border border-border bg-white px-5 py-5">
              <p className="text-sm leading-6 text-muted-foreground">
                Includes the readable proof structure, photo layout, and open-item
                handling that make the service look serious right after the visit.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <ButtonLink href="/samples/axis-1" variant="outline" withIcon>
                  Open public sample
                </ButtonLink>
                <ButtonLink href="/start" withIcon>
                  Request setup
                </ButtonLink>
              </div>
              <a
                href="/samples/axis-1"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-accent"
              >
                View the free proof link
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </Panel>
      </section>
    </>
  );
}
