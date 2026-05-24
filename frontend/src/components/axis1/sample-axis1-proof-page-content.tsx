"use client";

import { Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { Axis1PacketDocument } from "@/components/axis1/packet-document";
import { Button } from "@/components/ui/button";
import {
  buildAxis1SampleProofData,
  type Axis1SampleProofVariant,
} from "@/lib/axis1-sample-packets";

type SampleAxis1ProofPageContentProps = {
  scenario: Axis1SampleProofVariant;
};

function subscribeToLocationChanges(onLocationChange: () => void) {
  window.addEventListener("popstate", onLocationChange);
  return () => {
    window.removeEventListener("popstate", onLocationChange);
  };
}

function printReport() {
  document.documentElement.classList.add("app-printing");

  const clearPrintUiLock = () => {
    document.documentElement.classList.remove("app-printing");
  };

  window.addEventListener("afterprint", clearPrintUiLock, { once: true });
  window.setTimeout(() => {
    window.print();
    window.setTimeout(clearPrintUiLock, 900);
  }, 120);
}

export function SampleAxis1ProofPageContent({
  scenario,
}: SampleAxis1ProofPageContentProps) {
  const [queryString, setQueryString] = useState("");

  useEffect(() => {
    const syncLocation = () => {
      setQueryString(window.location.search);
    };

    syncLocation();
    return subscribeToLocationChanges(syncLocation);
  }, []);

  const searchParams = new URLSearchParams(queryString);
  const isServiceRecord = searchParams.get("format") === "pdf";
  const reportData = buildAxis1SampleProofData(scenario);
  const nextRoutineService =
    reportData.customerClose.actionItems.find(
      ([label]) => label === "Next visit window" || label === "Next routine service",
    )?.[1] ??
    reportData.serviceRecordRows.find(
      ([label]) => label === "Next routine service" || label === "Next visit window",
    )?.[1] ??
    "See service details below";

  useEffect(() => {
    const marker = "kitchenpermit-format-robots";
    let robotsMeta = document.head.querySelector<HTMLMetaElement>(
      `meta[data-owner="${marker}"]`,
    );

    if (!isServiceRecord) {
      robotsMeta?.remove();
      return;
    }

    if (!robotsMeta) {
      robotsMeta = document.createElement("meta");
      robotsMeta.name = "robots";
      robotsMeta.dataset.owner = marker;
      document.head.appendChild(robotsMeta);
    }

    robotsMeta.content = "noindex, nofollow";

    return () => {
      robotsMeta?.remove();
    };
  }, [isServiceRecord]);

  return (
    <main
      className={`min-h-screen text-[#151515] print:bg-white print:px-0 print:py-0 ${
        isServiceRecord
          ? "axis1-service-record-screen bg-[#d8d0c7] px-3 py-3 sm:px-5 sm:py-5 lg:py-6"
          : "bg-[#e4dbcf]"
      }`}
    >
      {isServiceRecord ? (
        <div className="pdf-preview-toolbar pdf-print-hide mx-auto mb-3 flex w-[min(816px,100%)] flex-col gap-3 border border-[#b8b0a7] bg-white px-3 py-2 shadow-[0_10px_28px_rgba(24,20,17,0.12)] md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#6f665d]">
              Sample service report PDF
            </p>
            <p className="mt-1 text-xs font-semibold leading-5 text-[#423c36]">
              Print or save this retained service copy.
            </p>
          </div>
          <Button
            type="button"
            onClick={printReport}
            className="rounded-[6px] bg-[#111315] px-3 text-[11px] font-bold uppercase tracking-[0.1em] text-white hover:bg-[#111315]/90"
          >
            <Printer className="h-3.5 w-3.5" />
            Save as PDF
          </Button>
        </div>
      ) : null}
      <div
        className={
          isServiceRecord
            ? "mx-auto w-[min(816px,100%)]"
            : "relative mx-auto w-[min(1180px,100%)]"
        }
      >
        <section
          className={`mb-3 border bg-white px-4 py-4 shadow-[0_10px_28px_rgba(24,20,17,0.10)] print:mb-3 print:shadow-none ${
            isServiceRecord
              ? "rounded-[8px] border-[#b8b0a7]"
              : "rounded-[28px] border-black/10 md:px-6 md:py-5"
          }`}
        >
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#6f665d]">
                1-minute summary
              </p>
              <h1 className="mt-2 text-2xl font-black leading-[0.95] tracking-[-0.055em] text-[#151515] md:text-4xl">
                Completed with open access item
              </h1>
              <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#574f47]">
                Work was completed where reachable. The blocked area requires
                customer action before follow-up. The blocked area is not
                presented as cleaned.
              </p>
            </div>
            {!isServiceRecord ? (
              <a
                href="/p/sample-blocked-access?format=pdf"
                className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#111315] px-4 text-[11px] font-black uppercase tracking-[0.12em] text-white"
              >
                PDF copy available
              </a>
            ) : null}
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-4">
            {[
              ["Status", "Completed with open access item"],
              ["Action needed", "Clear rear duct access for follow-up service."],
              ["Photos", "Photos attached"],
              ["Next routine service", nextRoutineService],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[14px] border border-black/10 bg-[#f8f4ec] px-3 py-3"
              >
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.13em] text-[#6f665d]">
                  {label}
                </p>
                <p className="mt-1.5 text-sm font-bold leading-5 text-[#151515]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>
        <Axis1PacketDocument
          data={reportData}
          variant="customer-report"
          outputIntent={isServiceRecord ? "service-record" : "customer-link"}
          presentationMode={isServiceRecord ? "standard" : "short"}
          visibleSections={isServiceRecord ? undefined : { routeDetail: false }}
        />
      </div>
    </main>
  );
}
