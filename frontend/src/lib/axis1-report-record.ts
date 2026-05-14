import type { Axis1PacketDocumentSectionVisibility } from "@/components/axis1/packet-document";
import {
  applyAxis1CloseoutEngineToPacket,
  evaluateAxis1Closeout,
} from "@/lib/axis1-closeout-engine";
import { applyAxis1CompanyProfileToPacketData } from "@/lib/axis1-company-profile";
import { buildAxis1PacketDataWithFieldPhotos } from "@/lib/axis1-field-photos";
import type { Axis1LocalPacketRecord } from "@/lib/axis1-local-packet-store";
import { buildAxis1NeutralPacketData } from "@/lib/axis1-packet-builder";

export const axis1DefaultReportSections: Axis1PacketDocumentSectionVisibility = {
  photos: true,
  checklist: true,
  routeDetail: true,
  nextService: true,
};

export function buildAxis1PacketDataFromRecord(record: Axis1LocalPacketRecord) {
  if (record.packetData) {
    return record.packetData;
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

  return record.productPlan === "company" && record.companyProfile
    ? applyAxis1CompanyProfileToPacketData(generatedPacket, record.companyProfile)
    : generatedPacket;
}
