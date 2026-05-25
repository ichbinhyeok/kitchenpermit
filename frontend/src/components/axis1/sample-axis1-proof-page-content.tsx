"use client";

import { Download, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { Axis1PacketDocument } from "@/components/axis1/packet-document";
import { Button } from "@/components/ui/button";
import {
  AXIS1_BLOCKED_ACCESS_SAMPLE_PDF_HREF,
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
  window.setTimeout(clearPrintUiLock, 2500);
  void document.documentElement.offsetHeight;
  window.print();
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
              PDF print preview
            </p>
            <p className="mt-1 text-xs font-semibold leading-5 text-[#423c36]">
              Open the PDF file, or print/save this preview from your browser.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              asChild
              className="rounded-[6px] bg-[#111315] px-3 text-[11px] font-bold uppercase tracking-[0.1em] text-white hover:bg-[#111315]/90"
            >
              <a href={AXIS1_BLOCKED_ACCESS_SAMPLE_PDF_HREF}>
                <Download className="h-3.5 w-3.5" />
                Open PDF file
              </a>
            </Button>
            <Button
              type="button"
              onClick={printReport}
              variant="outline"
              className="rounded-[6px] border-[#b8b0a7] bg-white px-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#151515] hover:bg-[#f4eee6]"
            >
              <Printer className="h-3.5 w-3.5" />
              Print / save
            </Button>
          </div>
        </div>
      ) : null}
      <div
        className={
          isServiceRecord
            ? "mx-auto w-[min(816px,100%)]"
            : "relative mx-auto w-[min(1180px,100%)]"
        }
      >
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
