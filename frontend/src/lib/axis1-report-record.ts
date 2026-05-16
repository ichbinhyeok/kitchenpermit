import type { Axis1PacketDocumentSectionVisibility } from "@/components/axis1/packet-document";
import {
  applyAxis1CloseoutEngineToPacket,
  evaluateAxis1Closeout,
} from "@/lib/axis1-closeout-engine";
import { applyAxis1CompanyProfileToPacketData } from "@/lib/axis1-company-profile";
import { buildAxis1PacketDataWithFieldPhotos } from "@/lib/axis1-field-photos";
import type { Axis1LocalPacketRecord } from "@/lib/axis1-local-packet-store";
import { buildAxis1NeutralPacketData } from "@/lib/axis1-packet-builder";
import type { Axis1PacketPreviewData } from "@/lib/axis1-packet-preview";

export const axis1DefaultReportSections: Axis1PacketDocumentSectionVisibility = {
  photos: true,
  checklist: true,
  routeDetail: true,
  nextService: true,
};

function rowWithValue(
  rows: readonly (readonly [string, string])[],
  label: string,
  value: string,
): [string, string][] {
  let replaced = false;
  const nextRows = rows.map(([rowLabel, rowValue]) => {
    if (rowLabel.toLowerCase() !== label.toLowerCase()) {
      return [rowLabel, rowValue] as [string, string];
    }

    replaced = true;
    return [rowLabel, value] as [string, string];
  });

  return replaced ? nextRows : [...nextRows, [label, value] as [string, string]];
}

function savedReportDisplayId(record: Axis1LocalPacketRecord) {
  const compactId = record.id.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 8);
  return compactId ? `SR-${compactId}` : "SR-RECORDED";
}

function withSavedReportIdentity(
  packetData: Axis1PacketPreviewData,
  record: Axis1LocalPacketRecord,
): Axis1PacketPreviewData {
  const reportId = savedReportDisplayId(record);

  return {
    ...packetData,
    packetHeader: {
      ...packetData.packetHeader,
      quickFacts: rowWithValue(packetData.packetHeader.quickFacts, "Report ID", reportId),
    },
    serviceRecordRows: rowWithValue(packetData.serviceRecordRows, "Report ID", reportId),
  };
}

export function buildAxis1PacketDataFromRecord(record: Axis1LocalPacketRecord) {
  if (record.packetData) {
    return withSavedReportIdentity(record.packetData, record);
  }

  const basePacket = buildAxis1PacketDataWithFieldPhotos(
    buildAxis1NeutralPacketData(record.values),
    record.uploadedFieldPhotos,
    record.photoSlotResolutions,
  );
  const closeoutEngine = evaluateAxis1Closeout({
    values: record.values,
    outcomeSelected: true,
    uploadedFieldPhotos: record.uploadedFieldPhotos,
    unplacedPhotoCount: 0,
    photoSlotResolutions: record.photoSlotResolutions,
    links: record.links,
  });
  const generatedPacket = applyAxis1CloseoutEngineToPacket(
    basePacket,
    closeoutEngine,
  );

  const packetData = record.productPlan === "company" && record.companyProfile
    ? applyAxis1CompanyProfileToPacketData(generatedPacket, record.companyProfile)
    : generatedPacket;

  return withSavedReportIdentity(packetData, record);
}
