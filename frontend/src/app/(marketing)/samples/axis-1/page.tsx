import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Flame } from "lucide-react";
import { Axis1PacketDocument } from "@/components/axis1/packet-document";
import { getAxis1PacketPreviewData } from "@/lib/axis1-packet-preview";

export const metadata: Metadata = {
  title: "Kitchen Exhaust Cleaning Report Sample",
  description:
    "A public kitchen exhaust cleaning report sample for vendors who want a customer-readable service report after the hood cleaning visit.",
};

const sampleData = getAxis1PacketPreviewData({
  branding: "neutral",
  scenario: "exception",
});

const proofRows = [
  {
    label: "Customer read",
    title: "The operator sees what happened without decoding technician notes.",
    copy: "Result, open item, photo proof, and next step stay in one readable sequence.",
  },
  {
    label: "Vendor defense",
    title: "Blocked access is shown cleanly instead of being buried.",
    copy: "The report protects the vendor from implying a section was cleaned when it was not reachable.",
  },
  {
    label: "Paid setup",
    title: "The public sample becomes sendable once branding and delivery are attached.",
    copy: "Logo, office line, dispatch email, technician reference, and customer-specific delivery stay behind setup.",
  },
] as const;

const handoffRows = [
  ["What was cleaned", "Readable scope, not a photo dump"],
  ["What stayed open", "Access issue remains visible"],
  ["What proves it", "Section-linked image evidence"],
  ["What happens next", "Reply path and next visit window"],
] as const;

const setupRows = [
  ["Vendor identity", "Logo, office line, dispatch email, direct callback path"],
  ["Technician context", "Tech ID, service reference, certificate or internal record"],
  ["Delivery format", "Public link, branded PDF, and same-day customer handoff"],
  ["Scenario coverage", "Clean-close reports and open-item reports"],
] as const;

const snapshotRows: ReadonlyArray<readonly [ReactNode, string]> = [
  [<>Today&apos;s result</>, "Reachable hood and duct path cleaned."],
  ["Still open", "Rear access panel remained blocked during service."],
  ["Next step", "Clear access or confirm next service window."],
];

function ActionLink({
  href,
  children,
  tone = "dark",
}: {
  href: string;
  children: ReactNode;
  tone?: "dark" | "accent" | "light" | "outline";
}) {
  const toneClass =
    tone === "accent"
      ? "bg-[#f26a21] text-white hover:bg-[#dd5b17]"
      : tone === "light"
        ? "border border-white/18 bg-white/10 text-white hover:bg-white/16"
        : tone === "outline"
          ? "border border-black/12 bg-white/70 text-[#111315] hover:bg-white"
        : "bg-[#111315] text-white hover:bg-[#20262d]";

  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 text-[15px] font-bold transition ${toneClass}`}
    >
      <span>{children}</span>
      <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
    </Link>
  );
}

function ReportProofPlate() {
  return (
    <div className="border border-white/22 bg-[#f8f2ea]/92 p-5 text-[#111315] shadow-[0_30px_90px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-6">
      <div className="flex items-start justify-between gap-5 border-b border-black/12 pb-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#75695f]">
            Public sample shell
          </p>
          <h2 className="mt-3 max-w-sm font-display text-[2.05rem] font-bold leading-[0.92] tracking-[-0.055em]">
            Same-day service report
          </h2>
        </div>
        <Flame className="h-5 w-5 shrink-0 text-[#f26a21]" strokeWidth={2} />
      </div>
      <div className="divide-y divide-black/10">
        {snapshotRows.map(([label, copy]) => (
          <div key={copy} className="grid gap-2 py-4 sm:grid-cols-[0.34fr_0.66fr]">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#75695f]">
              {label}
            </p>
            <p className="text-sm font-semibold leading-6">{copy}</p>
          </div>
        ))}
      </div>
      <p className="border-t border-black/12 pt-4 text-sm leading-6 text-[#60554c]">
        The live branded version carries the vendor identity, direct phone, and
        customer-specific record. This public version shows the structure safely.
      </p>
    </div>
  );
}

export default function SampleAxis1Page() {
  return (
    <div className="pb-8 md:pb-12">
      <section className="container-shell pt-4 sm:pt-6">
        <div className="relative overflow-hidden rounded-[34px] bg-[#0f1317] text-white shadow-[0_46px_130px_rgba(13,10,8,0.26)] md:rounded-[46px]">
          <Image
            src="/images/packet-proof/ai-hood-after.jpg"
            alt="Clean commercial kitchen exhaust hood after service"
            fill
            sizes="100vw"
            className="object-cover object-[62%_50%] opacity-72"
            priority
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#0f1317_0%,rgba(15,19,23,0.96)_34%,rgba(15,19,23,0.58)_64%,rgba(15,19,23,0.20)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(255,255,255,0.12),transparent_24%),linear-gradient(180deg,transparent,rgba(0,0,0,0.24))]" />

          <div className="relative grid min-h-[720px] lg:grid-cols-[minmax(0,0.96fr)_minmax(360px,0.74fr)]">
            <div className="flex flex-col justify-between gap-12 px-5 py-7 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
              <div className="max-w-3xl">
                <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-[#ffb27c]">
                  Vendor-facing product sample
                </p>
                <h1 className="mt-8 max-w-[11ch] font-display text-[3.7rem] font-bold leading-[0.88] tracking-[-0.065em] text-white min-[390px]:text-[4.15rem] md:text-[6rem] xl:text-[6.7rem]">
                  Proof your customer can read.
                </h1>
                <p className="mt-7 max-w-xl text-base leading-8 text-white/72 md:text-lg">
                  A public sample of the customer-facing report after a kitchen exhaust
                  cleaning visit: cleaned areas, blocked access, photo proof, and the
                  next action.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <ActionLink href="#sample-report" tone="accent">
                    View the report
                  </ActionLink>
                  <ActionLink href="/reports/sample-hood-cleaning" tone="light">
                    Open customer link
                  </ActionLink>
                </div>
              </div>

              <div className="grid border-t border-white/12 pt-6 sm:grid-cols-3">
                {[
                  ["Customer sees", "A clean service record."],
                  ["Vendor gets", "Fewer explanation calls."],
                  ["Paid setup", "Brand and delivery attached."],
                ].map(([label, value], index) => (
                  <div
                    key={label}
                    className={`py-3 sm:px-5 ${index > 0 ? "border-t border-white/10 sm:border-l sm:border-t-0" : ""}`}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/38">
                      {label}
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex items-end px-5 pb-5 sm:px-8 sm:pb-8 lg:items-center lg:px-10 lg:py-12">
              <div className="w-full max-w-[520px] lg:ml-auto">
                <ReportProofPlate />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-14 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
              Why this sample exists
            </p>
            <h2 className="mt-4 font-display text-[2.8rem] font-bold leading-[0.92] tracking-[-0.06em] text-foreground md:text-[5rem]">
              It should feel sendable before the demo.
            </h2>
          </div>

          <div className="min-w-0 border-y border-black/12">
            {proofRows.map((row, index) => (
              <div
                key={row.label}
                className={`grid gap-4 py-7 md:grid-cols-[0.28fr_0.72fr] ${index > 0 ? "border-t border-black/10" : ""}`}
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8b8178]">
                  {row.label}
                </p>
                <div>
                  <h3 className="max-w-2xl font-display text-[2rem] font-bold leading-[0.98] tracking-[-0.055em] text-foreground">
                    {row.title}
                  </h3>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                    {row.copy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-shell pb-14 md:pb-18">
        <div className="grid overflow-hidden rounded-[32px] border border-black/10 bg-[#111315] text-white md:grid-cols-[0.92fr_1.08fr]">
          <div className="p-6 sm:p-8 md:p-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#ffb27c]">
              What the handoff must answer
            </p>
            <h3 className="mt-5 max-w-xl font-display text-[2.65rem] font-bold leading-[0.92] tracking-[-0.06em] md:text-[4rem]">
              No decoding. No callback just to ask what happened.
            </h3>
          </div>
          <div className="divide-y divide-white/10 border-t border-white/10 md:border-l md:border-t-0">
            {handoffRows.map(([label, value]) => (
              <div key={label} className="grid gap-3 px-6 py-5 sm:grid-cols-[0.36fr_0.64fr] sm:px-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/42">
                  {label}
                </p>
                <p className="text-base font-semibold leading-7 text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-5 border-y border-black/12 py-6 md:grid-cols-[0.45fr_0.55fr] md:items-start">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
              Public sample vs paid setup
            </p>
            <h3 className="mt-4 max-w-xl font-display text-[2.35rem] font-bold leading-[0.95] tracking-[-0.055em] text-foreground">
              Neutral enough to share. Branded enough to sell.
            </h3>
          </div>
          <div className="divide-y divide-black/10">
            {setupRows.map(([label, value]) => (
              <div key={label} className="grid gap-2 py-4 sm:grid-cols-[0.34fr_0.66fr]">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8b8178]">
                  {label}
                </p>
                <p className="text-sm font-medium leading-6 text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="sample-report" className="container-shell pb-10">
        <div className="mb-5 grid gap-6 border-y border-black/12 py-7 md:grid-cols-[0.82fr_1.18fr] md:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
              Vendor sample page
            </p>
            <h2 className="mt-4 font-display text-[2.6rem] font-bold leading-[0.92] tracking-[-0.06em] text-foreground md:text-[4.45rem]">
              The report structure, shown safely.
            </h2>
          </div>
          <div className="space-y-5">
            <p className="max-w-2xl text-base leading-8 text-muted-foreground">
              This page explains the product to vendors. The embedded report below uses
              a neutral shell, while the customer-facing link removes the product tour
              and shows the report as a restaurant operator would receive it.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ActionLink
                href="/reports/sample-hood-cleaning"
                tone="dark"
              >
                Open customer report
              </ActionLink>
              <ActionLink
                href="/exports/axis-1-packet?branding=applied&scenario=exception"
                tone="outline"
              >
                Open PDF preview
              </ActionLink>
              <ActionLink href="/start" tone="accent">
                Request setup
              </ActionLink>
            </div>
          </div>
        </div>

        <Axis1PacketDocument data={sampleData} />
      </section>

      <section className="container-shell pb-6 md:pb-10">
        <div className="relative overflow-hidden rounded-[34px] bg-[#101419] p-6 text-white shadow-[0_34px_100px_rgba(8,10,12,0.24)] sm:p-9 md:p-11">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_16%,rgba(242,106,33,0.18),transparent_28%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-end">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#ffb27c]">
                Setup path
              </p>
              <h2 className="mt-5 max-w-2xl font-display text-[2.35rem] font-bold leading-[0.93] tracking-[-0.055em] md:text-[3.8rem]">
                If the sample looks sendable, setup makes it yours.
              </h2>
            </div>
            <div className="space-y-5">
              <p className="text-base leading-8 text-white/64">
                Public samples stay neutral. Paid setup carries the vendor brand,
                phone, email, report variants, and delivery workflow.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <ActionLink href="/start" tone="accent">
                  Request setup
                </ActionLink>
                <ActionLink
                  href="/reports/sample-hood-cleaning"
                  tone="light"
                >
                  Customer report link
                </ActionLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
