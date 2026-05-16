"use client";

import { useEffect, useMemo, useState } from "react";
import { Printer, TriangleAlert } from "lucide-react";
import { Axis1PacketDocument } from "@/components/axis1/packet-document";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import type { Axis1LocalPacketRecord } from "@/lib/axis1-local-packet-store";
import {
  axis1DefaultReportSections,
  buildAxis1PacketDataFromRecord,
} from "@/lib/axis1-report-record";
import { loadAxis1ServerReport } from "@/lib/axis1-server-storage";
import { axis1BuilderDefaults } from "@/lib/axis1-packet-builder";
import {
  getAxis1ProductPlanPolicy,
  type Axis1ProductPlan,
} from "@/lib/axis1-product-policy";

type ServerAxis1ReportClientProps = {
  publicId: string;
  outputIntent?: "customer-link" | "service-record";
};

type ReportLoadState =
  | { status: "loading" }
  | { status: "ready"; record: Axis1LocalPacketRecord }
  | { status: "expired" }
  | { status: "missing" }
  | { status: "error" };

function serviceRecordPdfViewHref(publicId: string) {
  return `/p/server?reportId=${encodeURIComponent(publicId)}&format=pdf`;
}

function hostedPdfHref(
  response: Awaited<ReturnType<typeof loadAxis1ServerReport>>,
) {
  const downloadHref = response.pdfExport?.serverDownloadReady
    ? response.pdfExport.downloadHref?.trim()
    : "";

  return downloadHref || serviceRecordPdfViewHref(response.publicId);
}

function withServerPdfHref(
  packetData: Axis1LocalPacketRecord["packetData"],
  pdfHref?: string,
) {
  if (!packetData || !pdfHref || !packetData.closeout) {
    return packetData;
  }

  const ctas = packetData.closeout.ctas ?? [];
  const nextCtas = ctas.some((cta) => cta.kind === "download_pdf")
    ? ctas.map((cta) =>
        cta.kind === "download_pdf"
          ? {
              ...cta,
              href: pdfHref,
              enabled: true,
              label: cta.label || "Open PDF copy",
            }
          : cta,
      )
    : [
        ...ctas,
        {
          kind: "download_pdf",
          label: "Open PDF copy",
          href: pdfHref,
          priority: "utility" as const,
          enabled: true,
        },
      ];

  return {
    ...packetData,
    closeout: {
      ...packetData.closeout,
      ctas: nextCtas,
    },
  };
}

function isUsableHostedPacketData(
  packetData: Axis1LocalPacketRecord["packetData"],
): packetData is NonNullable<Axis1LocalPacketRecord["packetData"]> {
  return Boolean(
    packetData?.vendor?.name &&
      packetData.vendor.initials &&
      packetData.packetHeader?.title &&
      packetData.packetHeader.copy &&
      Array.isArray(packetData.packetHeader.quickFacts) &&
      Array.isArray(packetData.summaryCards) &&
      Array.isArray(packetData.systemIdentityRows) &&
      Array.isArray(packetData.serviceRecordRows) &&
      Array.isArray(packetData.routeSegments) &&
      Array.isArray(packetData.proofPhotos) &&
      Array.isArray(packetData.proofPolicyRows) &&
      Array.isArray(packetData.componentStatusRows) &&
      Array.isArray(packetData.photoCoverageRows) &&
      Array.isArray(packetData.scopeRows) &&
      Array.isArray(packetData.completedWork) &&
      Array.isArray(packetData.operationalChecks) &&
      Array.isArray(packetData.frequencyRows) &&
      packetData.callout?.title &&
      packetData.callout.copy &&
      packetData.notesSection?.title &&
      Array.isArray(packetData.deficiencyRows) &&
      packetData.customerClose?.title &&
      packetData.customerClose.copy &&
      Array.isArray(packetData.customerClose.actionItems) &&
      Array.isArray(packetData.closeoutRows) &&
      Array.isArray(packetData.acknowledgementRows) &&
      Array.isArray(packetData.sampleFooter) &&
      (!packetData.closeout || Array.isArray(packetData.closeout.ctas)),
  );
}

function normalizeDisplayValue(value?: string | null) {
  return (value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

function rowValue(
  rows: ReadonlyArray<readonly string[]> | undefined,
  label: string,
) {
  return rows?.find(([rowLabel]) => rowLabel.toLowerCase() === label.toLowerCase())?.[1] ?? "";
}

function hasHostedPacketDataMismatch(
  values: Partial<Axis1LocalPacketRecord["values"]>,
  packetData: NonNullable<Axis1LocalPacketRecord["packetData"]>,
) {
  const checks = [
    [values.propertyName, packetData.packetHeader.title],
    [values.siteCity, rowValue(packetData.packetHeader.quickFacts, "Location")],
    [values.systemName, rowValue(packetData.packetHeader.quickFacts, "System")],
  ];

  return checks.some(
    ([expected, actual]) =>
      normalizeDisplayValue(expected) !== "" &&
      normalizeDisplayValue(actual) !== "" &&
      normalizeDisplayValue(expected) !== normalizeDisplayValue(actual),
  );
}

function normalizeHostedValues(
  values: Partial<Axis1LocalPacketRecord["values"]>,
): Axis1LocalPacketRecord["values"] {
  return {
    ...axis1BuilderDefaults,
    ...values,
    exceptionKinds: Array.isArray(values.exceptionKinds)
      ? values.exceptionKinds
      : axis1BuilderDefaults.exceptionKinds,
    followUpMode: values.followUpMode ?? axis1BuilderDefaults.followUpMode,
  };
}

function toHostedRecord(
  response: Awaited<ReturnType<typeof loadAxis1ServerReport>>,
): Axis1LocalPacketRecord | null {
  const payload = response.payload;

  if (
    !payload?.values ||
    !payload.uploadedFieldPhotos ||
    !payload.photoSlotResolutions ||
    !payload.presentationMode ||
    !payload.visibleSections
  ) {
    return null;
  }

  const pdfHref = hostedPdfHref(response);
  const hostedPacketData = isUsableHostedPacketData(payload.packetData)
    ? withServerPdfHref(payload.packetData, pdfHref)
    : undefined;
  const packetData =
    hostedPacketData && !hasHostedPacketDataMismatch(payload.values, hostedPacketData)
      ? hostedPacketData
      : undefined;

  return {
    schemaVersion: 1,
    id: response.publicId,
    createdAt: response.createdAt,
    expiresAt: response.expiresAt ?? undefined,
    productPlan: response.productPlan as Axis1ProductPlan,
    companyProfile: payload.companyProfile,
    values: normalizeHostedValues(payload.values),
    uploadedFieldPhotos: payload.uploadedFieldPhotos,
    photoSlotResolutions: payload.photoSlotResolutions,
    links: pdfHref ? { ...payload.links, pdfHref } : payload.links,
    presentationMode: payload.presentationMode,
    visibleSections: payload.visibleSections,
    packetData,
  };
}

export function ServerAxis1ReportClient({
  publicId,
  outputIntent = "customer-link",
}: ServerAxis1ReportClientProps) {
  const [state, setState] = useState<ReportLoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    loadAxis1ServerReport(publicId)
      .then((response) => {
        if (cancelled) {
          return;
        }

        const record = toHostedRecord(response);
        setState(record ? { status: "ready", record } : { status: "missing" });
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        const message = error instanceof Error ? error.message : "";
        setState(message.includes("410") ? { status: "expired" } : { status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [publicId]);

  const record = state.status === "ready" ? state.record : null;
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

  if (state.status === "loading") {
    return (
      <main className="min-h-screen bg-[#e9e1d7] px-3 py-4 text-[#151515] sm:px-5 sm:py-6 lg:py-8">
        <Panel className="mx-auto max-w-2xl px-6 py-6">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Loading hosted service report link
          </p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Pulling the saved report record from the server.
          </p>
        </Panel>
      </main>
    );
  }

  if (state.status === "expired") {
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
            service report links that stay live while subscribed.
          </p>
        </Panel>
      </main>
    );
  }

  if (state.status !== "ready" || !record || !packetData) {
    return (
      <main className="min-h-screen bg-[#e9e1d7] px-3 py-4 text-[#151515] sm:px-5 sm:py-6 lg:py-8">
        <Panel className="mx-auto max-w-2xl px-6 py-6">
          <div className="inline-flex rounded-full bg-[#fff0e7] p-3 text-[#bc3d1f]">
            <TriangleAlert className="h-5 w-5" />
          </div>
          <p className="mt-5 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Hosted service report link unavailable
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-[-0.06em] text-foreground">
            This saved report could not be loaded.
          </h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Open the builder and create a fresh service report if this link was
            deleted or never finished saving.
          </p>
        </Panel>
      </main>
    );
  }

  const visibleSections = record.visibleSections ?? axis1DefaultReportSections;
  const photoCount = packetData.proofPhotos.length;
  const isServiceRecord = outputIntent === "service-record";
  const productPlan = record.productPlan ?? "free";
  const productPolicy = getAxis1ProductPlanPolicy(productPlan);
  const reportVisibleSections = isServiceRecord
    ? visibleSections
    : {
        ...axis1DefaultReportSections,
        ...visibleSections,
        checklist: false,
        photos: photoCount > 0,
        routeDetail: false,
      };
  const reportPresentationMode = isServiceRecord ? record.presentationMode : "short";

  return (
    <main
      className={`min-h-screen text-[#151515] print:bg-white print:px-0 print:py-0 ${
        isServiceRecord
          ? "axis1-service-record-screen bg-[#d8d0c7] px-3 py-3 sm:px-5 sm:py-5 lg:py-6"
          : "bg-[#f7f1e9]"
      }`}
    >
      {isServiceRecord ? (
        <div className="pdf-preview-toolbar pdf-print-hide mx-auto mb-3 flex w-[min(816px,100%)] flex-col gap-3 border border-[#b8b0a7] bg-white px-3 py-2 shadow-[0_10px_28px_rgba(24,20,17,0.12)] md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#6f665d]">
              Service report PDF / {productPolicy.shortLabel}
            </p>
            <p className="mt-1 text-xs font-semibold leading-5 text-[#423c36]">
              {productPolicy.pdfPolicy}. Print or save this PDF as the retained service copy.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={printReport}
              className="rounded-[6px] bg-[#111315] px-3 text-[11px] font-bold uppercase tracking-[0.1em] text-white hover:bg-[#111315]/90"
            >
              <Printer className="h-3.5 w-3.5" />
              Save PDF
            </Button>
          </div>
        </div>
      ) : null}
      <div className={isServiceRecord ? "mx-auto w-[min(816px,100%)]" : "w-full"}>
        <Axis1PacketDocument
          data={packetData}
          variant="customer-report"
          outputIntent={outputIntent}
          presentationMode={reportPresentationMode}
          visibleSections={reportVisibleSections}
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
