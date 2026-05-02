 "use client";

import Link from "next/link";
import { Download, Mail } from "lucide-react";
import { Suspense, useSyncExternalStore } from "react";
import { Axis1PacketDocument } from "@/components/axis1/packet-document";
import { PreviewStateControls } from "@/components/axis1/preview-state-controls";
import { Separator } from "@/components/ui/separator";
import {
  parseAxis1PacketBranding,
  parseAxis1PacketScenario,
  type Axis1PacketBranding,
  type Axis1PacketScenario,
} from "@/lib/axis1-packet-preview";
import { buildAxis1SampleProofData } from "@/lib/axis1-sample-packets";
import { siteConfig } from "@/lib/site";

const brandingOptions: ReadonlyArray<{
  value: Axis1PacketBranding;
  label: string;
  description: string;
}> = [
  {
    value: "applied",
    label: "Brand applied",
    description: "Vendor logo, contacts, and technician ref are visible.",
  },
  {
    value: "neutral",
    label: "Brand hidden",
    description: "Public sample shell hides the paid setup layer.",
  },
] as const;

const scenarioOptions: ReadonlyArray<{
  value: Axis1PacketScenario;
  label: string;
  description: string;
}> = [
  {
    value: "exception",
    label: "Access exception",
    description: "Shows blocked access and an open customer action.",
  },
  {
    value: "clean",
    label: "Clean close",
    description: "Shows a normal close-out with no open exception.",
  },
] as const;

function subscribeToLocationChanges(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  return () => {
    window.removeEventListener("popstate", onStoreChange);
  };
}

function getLocationSearch() {
  return window.location.search;
}

function getServerLocationSearch() {
  return "";
}

function readQueryValue(value: string | null) {
  return value ?? undefined;
}

function buildSetupEmailUrl(options: {
  branding: Axis1PacketBranding;
  scenario: Axis1PacketScenario;
}) {
  const subject = "Customer link setup request";
  const body = [
    "Kitchen Permit team,",
    "",
    "I want to discuss a customer link setup.",
    "",
    `Preview state: ${options.branding} branding / ${options.scenario} scenario`,
    "Company:",
    "Service area:",
    "Direct phone:",
    "",
    "Notes:",
  ].join("\r\n");

  const params = new URLSearchParams({
    subject,
    body,
  });

  return `mailto:${siteConfig.supportEmail}?${params.toString().replaceAll("+", "%20")}`;
}

function buildPreviewData(options: {
  branding: Axis1PacketBranding;
  scenario: Axis1PacketScenario;
}) {
  const data = buildAxis1SampleProofData(
    options.scenario === "clean" ? "clean" : "blocked_access",
  );
  const maskRows = (rows: readonly [string, string][]) =>
    rows.map(([label, value]) => {
      if (label === "Technician" || label === "Prepared by technician") {
        return [label, "Technician / crew ID"] as [string, string];
      }

      if (label === "Credential" || label === "Technician credential") {
        return [label, "Credential appears after setup"] as [string, string];
      }

      if (
        label === "Dispatch" ||
        label === "Direct line" ||
        label === "After-hours" ||
        label === "Follow-up contact"
      ) {
        return [label, "Available after setup"] as [string, string];
      }

      return [
        label,
        value
          .replaceAll("Summit Hood Service Co. | SH-114", "Technician / crew ID")
          .replaceAll("Summit Hood Service Co.", "Sample Hood Service Co.")
          .replaceAll("dispatch@summit.example", "dispatch@samplehood.co")
          .replaceAll("(512) 555-0148", "(512) 555-0148"),
      ] as [string, string];
    });

  if (options.branding === "applied") {
    return data;
  }

  return {
    ...data,
    branding: "neutral" as const,
    vendor: {
      ...data.vendor,
      name: "Sample Hood Service Co.",
      initials: "SH",
      office: "Vendor branding, dispatch, and service contact appear here",
      directLine: "",
      dispatch: "",
      certification: "",
      technician: "Technician / crew ID",
      afterHours: "",
      reviewPrompt: "",
      preparedBy: "Technician / crew ID",
      previewBlurb:
        "Public sample uses example branding. Setup replaces this with the vendor logo, direct line, dispatch email, credential, and technician reference.",
      brandingApplied: false,
    },
    serviceRecordRows: maskRows(data.serviceRecordRows),
    closeoutRows: maskRows(data.closeoutRows),
  };
}

function Axis1PacketPdfPreviewContent({
  branding,
  scenario,
}: {
  branding: Axis1PacketBranding;
  scenario: Axis1PacketScenario;
}) {
  const data = buildPreviewData({ branding, scenario });
  const setupEmailUrl = buildSetupEmailUrl({ branding, scenario });
  const defaultDownloadState = branding === "applied" && scenario === "exception";
  const currentBranding = brandingOptions.find((option) => option.value === branding);
  const currentScenario = scenarioOptions.find((option) => option.value === scenario);

  return (
    <div className="px-3 py-4 sm:px-4 sm:py-6">
      <div className="mx-auto flex w-[min(1080px,100%)] flex-col gap-3">
        <section className="pdf-print-hide overflow-hidden rounded-[28px] border border-black/10 bg-[linear-gradient(180deg,rgba(252,250,247,0.98),rgba(247,243,237,0.98))] px-4 py-4 sm:px-5 sm:py-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,0.8fr)_minmax(420px,1.2fr)] lg:items-start">
            <div className="min-w-0 space-y-3">
              <div className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Cold-email preview // Customer link
              </div>
              <div className="space-y-3">
                <h1 className="max-w-3xl font-display text-[1.9rem] font-bold leading-[0.92] tracking-[-0.07em] text-foreground sm:text-[2.2rem]">
                  This is the customer link your customer receives after the job.
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
                  First click should feel like a real delivery artifact, not a product
                  tour. The point is simple: fewer explanation calls, clearer follow-up
                        notes, and a more premium handoff after the visit.
                </p>
              </div>

              <div className="rounded-[18px] border border-black/10 bg-white px-4 py-3">
                <div className="grid gap-2">
                  {[
                    ["Customer clarity", "Result, open item, and next step are visible without a callback."],
                    ["Defensible record", "Blocked access stays explicit instead of buried in technician notes."],
                    ["Premium handoff", "The report makes serious service look organized the moment it lands."],
                  ].map(([label, copy]) => (
                    <div
                      key={label}
                      className="flex flex-col gap-1 border-b border-black/8 py-1.5 last:border-b-0"
                    >
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {label}
                      </p>
                      <p className="text-sm leading-5.5 text-foreground">{copy}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <div className="rounded-[20px] border border-black/10 bg-white p-4 sm:p-5">
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 border-b border-black/8 pb-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        Document state
                      </p>
                      <h2 className="mt-3 font-display text-[1.26rem] font-bold leading-[0.95] tracking-[-0.05em] text-foreground">
                        Review the customer link state and evidence PDF state vendors care about.
                      </h2>
                    </div>
                    <div className="max-w-[260px] rounded-[14px] border border-black/10 bg-[rgba(17,17,17,0.02)] px-3 py-2.5">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        Browser preview / print export
                      </p>
                      <p className="mt-2 text-sm leading-5.5 text-foreground">
                        Same engine result. PDF is tighter only because print delivery is denser than browser preview.
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Preview controls
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Adjust the live preview state, then check how the report handles
                      attached photos, open items, and the customer next step.
                    </p>
                  </div>

                  <PreviewStateControls
                    branding={branding}
                    scenario={scenario}
                    brandingOptions={brandingOptions}
                    scenarioOptions={scenarioOptions}
                  />

                  <Separator />

                  <div className="grid gap-2 rounded-[18px] border border-black/10 bg-[rgba(17,17,17,0.03)] px-4 py-3">
                    {[
                      ["Current branding", currentBranding?.label ?? branding],
                      ["Current state", currentScenario?.label ?? scenario],
                      ["Delivery note", "Same engine content / tighter print PDF"],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-4 border-b border-black/8 py-2 text-sm last:border-b-0"
                      >
                        <span className="text-muted-foreground">{label}</span>
                        <span className="max-w-[56%] text-right font-medium text-foreground">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                    <a
                      href={setupEmailUrl}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-accent bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white sm:w-auto"
                    >
                      <Mail className="h-4 w-4" />
                      Email For Branded Setup
                    </a>
                    {defaultDownloadState ? (
                      <a
                        href="/downloads/axis1-branded-sample-packet.pdf"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-foreground sm:w-auto"
                      >
                        <Download className="h-4 w-4" />
                        Download Evidence PDF
                      </a>
                    ) : (
                      <Link
                        href="/exports/axis-1-packet?branding=applied&scenario=exception"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-foreground sm:w-auto"
                      >
                        <Download className="h-4 w-4" />
                        View Evidence PDF State
                      </Link>
                    )}
                    <Link
                      href="/samples/axis-1"
                      className="inline-flex w-full items-center justify-center rounded-full border border-black/10 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:w-auto"
                    >
                      Open SEO Sample
                    </Link>
                  </div>

                  <div className="rounded-[18px] border border-black/10 bg-[rgba(17,17,17,0.03)] px-4 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        Why this works in cold email
                      </p>
                      <p className="mt-2 text-sm leading-5.5 text-foreground">
                        {data.vendor.previewBlurb} The first click should answer one
                        question fast: &quot;Would this make my service look more serious
                        to the customer?&quot;
                      </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Axis1PacketDocument
          data={data}
          variant="customer-report"
          outputIntent="service-record"
        />
      </div>
    </div>
  );
}

function Axis1PacketPdfPreviewRouteContent() {
  const queryString = useSyncExternalStore(
    subscribeToLocationChanges,
    getLocationSearch,
    getServerLocationSearch,
  );
  const searchParams = new URLSearchParams(queryString);
  const branding = parseAxis1PacketBranding(
    readQueryValue(searchParams.get("branding")),
  );
  const scenario = parseAxis1PacketScenario(
    readQueryValue(searchParams.get("scenario")),
  );

  return <Axis1PacketPdfPreviewContent branding={branding} scenario={scenario} />;
}

export default function Axis1PacketPdfPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="px-3 py-4 sm:px-4 sm:py-6">
          <div className="mx-auto w-[min(1080px,100%)] rounded-[28px] border border-black/10 bg-white px-4 py-6 text-sm text-muted-foreground">
            Loading customer link preview.
          </div>
        </div>
      }
    >
      <Axis1PacketPdfPreviewRouteContent />
    </Suspense>
  );
}
