"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Copy, Printer, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import {
  Axis1PacketDocument,
  type Axis1PacketDocumentSectionVisibility,
} from "@/components/axis1/packet-document";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { buildAxis1NeutralPacketData } from "@/lib/axis1-packet-builder";
import { buildAxis1PacketDataWithFieldPhotos } from "@/lib/axis1-field-photos";
import {
  getAxis1LocalPacketHref,
  readAxis1LocalPacket,
  type Axis1LocalPacketRecord,
} from "@/lib/axis1-local-packet-store";

type LocalAxis1ReportClientProps = {
  packetId: string;
};

const defaultSections: Axis1PacketDocumentSectionVisibility = {
  photos: true,
  checklist: true,
  routeDetail: true,
  nextService: true,
};

function subscribeToLocalPacketStorage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

export function LocalAxis1ReportClient({ packetId }: LocalAxis1ReportClientProps) {
  const record = useSyncExternalStore<Axis1LocalPacketRecord | null | undefined>(
    subscribeToLocalPacketStorage,
    () => readAxis1LocalPacket(packetId),
    () => undefined,
  );

  const packetData = useMemo(() => {
    if (!record) {
      return null;
    }

    return buildAxis1PacketDataWithFieldPhotos(
      buildAxis1NeutralPacketData(record.values),
      record.uploadedFieldPhotos,
      record.photoSlotResolutions,
    );
  }, [record]);

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
      toast.success("Local packet link copied", {
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
            Loading local packet
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
            Local packet unavailable
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-[-0.06em] text-foreground">
            This browser does not have the saved packet.
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

  const visibleSections = record.visibleSections ?? defaultSections;
  const photoCount = packetData.proofPhotos.length;

  return (
    <main className="min-h-screen bg-[#e9e1d7] px-3 py-4 text-[#151515] sm:px-5 sm:py-6 lg:py-8 print:bg-white print:px-0 print:py-0">
      <div className="pdf-print-hide mx-auto mb-4 flex w-[min(1080px,100%)] flex-col gap-3 rounded-[22px] border border-black/8 bg-white/90 px-4 py-3 shadow-[0_18px_44px_rgba(17,17,17,0.08)] backdrop-blur md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#f26a21]">
            Local photo link
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-foreground">
            {photoCount} photo(s) attached. This link works in this browser only
            until hosted storage is connected.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={copyCurrentLink}
            className="rounded-full border border-black/10 bg-white px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-foreground hover:bg-white"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy link
          </Button>
          <Button
            type="button"
            onClick={printReport}
            className="rounded-full bg-[#111315] px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-white hover:bg-[#111315]/90"
          >
            <Printer className="h-3.5 w-3.5" />
            Save PDF
          </Button>
        </div>
      </div>
      <div className="mx-auto w-[min(1080px,100%)]">
        <Axis1PacketDocument
          data={packetData}
          variant="customer-report"
          presentationMode={record.presentationMode}
          visibleSections={visibleSections}
        />
      </div>
    </main>
  );
}
