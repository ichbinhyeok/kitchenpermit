"use client";

import { useSyncExternalStore } from "react";
import { Axis1PacketDocument } from "@/components/axis1/packet-document";
import {
  applyAxis1CloseoutEngineToPacket,
  evaluateAxis1Closeout,
} from "@/lib/axis1-closeout-engine";
import {
  emptyAxis1FieldPhotoState,
  emptyAxis1PhotoSlotResolutions,
} from "@/lib/axis1-field-photos";
import {
  buildAxis1FreeSharedPacketData,
  parseAxis1FreeReportSearchParams,
} from "@/lib/axis1-packet-builder";

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

export function FreeAxis1ProofPageContent() {
  const queryString = useSyncExternalStore(
    subscribeToLocationChanges,
    getLocationSearch,
    getServerLocationSearch,
  );
  const searchParams = new URLSearchParams(queryString);
  const values = parseAxis1FreeReportSearchParams(
    Object.fromEntries(searchParams.entries()),
  );
  const closeoutEngine = evaluateAxis1Closeout({
    values,
    outcomeSelected: true,
    uploadedFieldPhotos: emptyAxis1FieldPhotoState(),
    unplacedPhotoCount: 0,
    photoSlotResolutions: emptyAxis1PhotoSlotResolutions(),
  });
  const reportData = applyAxis1CloseoutEngineToPacket(
    buildAxis1FreeSharedPacketData(values),
    closeoutEngine,
  );

  return (
    <main className="min-h-screen bg-[#e9e1d7] px-3 py-4 text-[#151515] sm:px-5 sm:py-6 lg:py-8 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto w-[min(1080px,100%)]">
        <Axis1PacketDocument data={reportData} variant="customer-report" />
      </div>
    </main>
  );
}
