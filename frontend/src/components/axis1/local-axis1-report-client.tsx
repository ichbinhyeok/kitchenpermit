"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Copy, Printer, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import {
  Axis1PacketDocument,
} from "@/components/axis1/packet-document";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import {
  getAxis1LocalPacketHref,
  readAxis1LocalPacket,
  type Axis1LocalPacketRecord,
} from "@/lib/axis1-local-packet-store";
import {
  axis1DefaultReportSections,
  buildAxis1PacketDataFromRecord,
} from "@/lib/axis1-report-record";
import {
  getAxis1ProductPlanPolicy,
  isAxis1FreeLinkExpired,
} from "@/lib/axis1-product-policy";

type LocalAxis1ReportClientProps = {
  packetId: string;
  outputIntent?: "customer-link" | "service-record";
};

function subscribeToLocalPacketStorage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

export function LocalAxis1ReportClient({
  packetId,
  outputIntent = "customer-link",
}: LocalAxis1ReportClientProps) {
  const record = useSyncExternalStore<Axis1LocalPacketRecord | null | undefined>(
    subscribeToLocalPacketStorage,
    () => readAxis1LocalPacket(packetId),
    () => undefined,
  );

  const packetData = useMemo(
    () => (record ? buildAxis1PacketDataFromRecord(record) : null),
    [record],
  );

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

  async function copyCurrentLink() {
    const shareUrl = new URL(
      getAxis1LocalPacketHref(packetId),
      window.location.origin,
    ).toString();

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Local service report link copied", {
        description: "Works only in this browser until hosted storage is connected.",
      });
    } catch {
      toast.error("Could not copy automatically", {
        description: "Copy the browser address manually.",
      });
    }
  }

  if (record === undefined) {
    return (
      <main className="min-h-screen bg-[#e9e1d7] px-3 py-4 text-[#151515] sm:px-5 sm:py-6 lg:py-8">
        <Panel className="mx-auto max-w-2xl px-6 py-6">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Loading local service report link
          </p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Checking this browser for the saved report and local photos.
          </p>
        </Panel>
      </main>
    );
  }

  if (!record || !packetData) {
    return (
      <main className="min-h-screen bg-[#e9e1d7] px-3 py-4 text-[#151515] sm:px-5 sm:py-6 lg:py-8">
        <Panel className="mx-auto max-w-2xl px-6 py-6">
          <div className="inline-flex rounded-full bg-[#fff0e7] p-3 text-[#bc3d1f]">
            <TriangleAlert className="h-5 w-5" />
          </div>
          <p className="mt-5 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Local service report link unavailable
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-[-0.06em] text-foreground">
            This browser does not have the saved service report link.
          </h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            This is expected for the local test version. Photos are stored only
            in the browser that created the link. R2/hosted storage will replace
            this for real customer delivery.
          </p>
          <a
            href="/axis-1/tool?step=photos"
            className="mt-6 inline-flex rounded-full bg-[#111315] px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white"
          >
            Open builder
          </a>
        </Panel>
      </main>
    );
  }

  const visibleSections = record.visibleSections ?? axis1DefaultReportSections;
  const photoCount = packetData.proofPhotos.length;
  const isServiceRecord = outputIntent === "service-record";
  const productPlan = record.productPlan ?? "free";
  const productPolicy = getAxis1ProductPlanPolicy(productPlan);
  const isExpiredFreeLink =
    productPlan === "free" && isAxis1FreeLinkExpired(record.createdAt);

  if (isExpiredFreeLink) {
    return (
      <main className="min-h-screen bg-[#e9e1d7] px-3 py-4 text-[#151515] sm:px-5 sm:py-6 lg:py-8">
        <Panel className="mx-auto max-w-2xl px-6 py-6">
          <div className="inline-flex rounded-full bg-[#fff0e7] p-3 text-[#bc3d1f]">
            <TriangleAlert className="h-5 w-5" />
          </div>
          <p className="mt-5 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Free test link expired
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-[-0.06em] text-foreground">
            Free builder links last 7 days.
          </h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Create a fresh free test report, or use the company version for
            retained service report links and clean PDF copies.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <a
              href="/axis-1/tool?step=photos"
              className="inline-flex rounded-full bg-[#111315] px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white"
            >
              Open builder
            </a>
            <a
              href="/company-version"
              className="inline-flex rounded-full border border-black/10 bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-foreground"
            >
              Company version
            </a>
          </div>
        </Panel>
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen px-3 text-[#151515] print:bg-white print:px-0 print:py-0 sm:px-5 ${
        isServiceRecord
          ? "axis1-service-record-screen bg-[#d8d0c7] py-3 sm:py-5 lg:py-6"
          : "bg-[#e9e1d7] py-4 sm:py-6 lg:py-8"
      }`}
    >
      <div
        className={`pdf-print-hide mx-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between ${
          isServiceRecord
            ? "pdf-preview-toolbar mb-3 w-[min(816px,100%)] border border-[#b8b0a7] bg-white px-3 py-2 shadow-[0_10px_28px_rgba(24,20,17,0.12)]"
            : "mb-4 w-[min(1080px,100%)] rounded-[22px] border border-black/8 bg-white/90 px-4 py-3 shadow-[0_18px_44px_rgba(17,17,17,0.08)] backdrop-blur"
        }`}
      >
        <div className="min-w-0">
          <p
            className={`font-mono text-[10px] font-bold uppercase ${
              isServiceRecord
                ? "tracking-[0.12em] text-[#6f665d]"
                : "tracking-[0.18em] text-[#f26a21]"
            }`}
          >
            {isServiceRecord ? "Service report PDF" : "Service report link"} /{" "}
            {productPolicy.shortLabel}
          </p>
          <p
            className={`mt-1 font-semibold ${
              isServiceRecord ? "text-xs leading-5 text-[#423c36]" : "text-sm leading-6 text-foreground"
            }`}
          >
            {isServiceRecord
              ? `${productPolicy.pdfPolicy}. Print or save this PDF as the retained service copy.`
              : `${photoCount} photo(s) attached. ${productPolicy.linkPolicy}.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={copyCurrentLink}
            className={`rounded-full border border-black/10 bg-white px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-foreground hover:bg-white ${
              isServiceRecord ? "hidden" : ""
            }`}
          >
            <Copy className="h-3.5 w-3.5" />
            Copy link
          </Button>
          <Button
            type="button"
            onClick={printReport}
            className={`bg-[#111315] text-[11px] font-bold uppercase text-white hover:bg-[#111315]/90 ${
              isServiceRecord
                ? "rounded-[6px] px-3 tracking-[0.1em]"
                : "rounded-full px-4 tracking-[0.14em]"
            }`}
          >
            <Printer className="h-3.5 w-3.5" />
            Save as PDF
          </Button>
        </div>
      </div>
      <div className={`mx-auto ${isServiceRecord ? "w-[min(816px,100%)]" : "w-[min(1080px,100%)]"}`}>
        <Axis1PacketDocument
          data={packetData}
          variant="customer-report"
          outputIntent={outputIntent}
          presentationMode={record.presentationMode}
          visibleSections={visibleSections}
          watermarkLabel={
            isServiceRecord && productPlan === "free"
              ? productPolicy.watermarkLabel
              : undefined
          }
        />
      </div>
    </main>
  );
}
