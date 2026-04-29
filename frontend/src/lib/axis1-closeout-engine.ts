import type { Axis1BuilderFormValues } from "@/lib/axis1-packet-builder";
import type { Axis1PacketPreviewData } from "@/lib/axis1-packet-preview";
import type {
  Axis1FieldPhotoSlotId,
  Axis1PhotoSlotResolution,
  Axis1UploadedFieldPhoto,
} from "@/lib/axis1-field-photos";

export type Axis1CloseoutCase =
  | "needs_outcome"
  | "clean_closeout"
  | "access_exception"
  | "condition_review";

export type Axis1CloseoutEvidenceBasis =
  | "no_photos"
  | "partial_photos"
  | "photo_record";

export type Axis1CloseoutClaimLevel =
  | "written_record"
  | "partial_photo_record"
  | "photo_supported_record";

export type Axis1CloseoutEngineInput = {
  values: Axis1BuilderFormValues;
  outcomeSelected: boolean;
  uploadedFieldPhotos: Record<Axis1FieldPhotoSlotId, Axis1UploadedFieldPhoto | null>;
  unplacedPhotoCount: number;
  photoSlotResolutions: Record<Axis1FieldPhotoSlotId, Axis1PhotoSlotResolution>;
};

export type Axis1CloseoutEngineResult = {
  caseType: Axis1CloseoutCase;
  canGeneratePacket: boolean;
  canUsePhotoProofLanguage: boolean;
  evidenceBasis: Axis1CloseoutEvidenceBasis;
  claimLevel: Axis1CloseoutClaimLevel;
  primaryStatusLabel: string;
  basisLabel: string;
  customerResultCopy: string;
  evidenceCopy: string;
  claimLimitCopy: string;
  blockingReason: string | null;
  warnings: string[];
};

const requiredCorePhotoSlots: Axis1FieldPhotoSlotId[] = [
  "hood-before",
  "hood-after",
];

export function evaluateAxis1Closeout(
  input: Axis1CloseoutEngineInput,
): Axis1CloseoutEngineResult {
  const uploadedCount =
    Object.values(input.uploadedFieldPhotos).filter(Boolean).length +
    input.unplacedPhotoCount;
  const requiredCapturedCount = requiredCorePhotoSlots.filter(
    (slot) => input.uploadedFieldPhotos[slot],
  ).length;
  const skippedCoreCount = requiredCorePhotoSlots.filter(
    (slot) =>
      !input.uploadedFieldPhotos[slot] &&
      input.photoSlotResolutions[slot] !== "open",
  ).length;
  const canUsePhotoProofLanguage = requiredCapturedCount === requiredCorePhotoSlots.length;
  const evidenceBasis: Axis1CloseoutEvidenceBasis =
    uploadedCount === 0
      ? "no_photos"
      : canUsePhotoProofLanguage
        ? "photo_record"
        : "partial_photos";
  const claimLevel: Axis1CloseoutClaimLevel =
    evidenceBasis === "photo_record"
      ? "photo_supported_record"
      : evidenceBasis === "partial_photos"
        ? "partial_photo_record"
        : "written_record";

  if (!input.outcomeSelected) {
    return {
      caseType: "needs_outcome",
      canGeneratePacket: false,
      canUsePhotoProofLanguage: false,
      evidenceBasis,
      claimLevel,
      primaryStatusLabel: "Pick result",
      basisLabel:
        evidenceBasis === "no_photos"
          ? "No photos attached"
          : "Photos waiting for result",
      customerResultCopy:
        "No customer-facing result has been generated because the crew has not selected what happened today.",
      evidenceCopy:
        "The tool is waiting for a selected service outcome before it can describe the record basis.",
      claimLimitCopy:
        "Do not show completed, blocked, or proof language until a result is selected.",
      blockingReason: "Select today's service result before generating a link or PDF.",
      warnings: [
        "No completed/blocked/result language should be shown before the crew picks the outcome.",
      ],
    };
  }

  const hasAccessException =
    input.values.scenario === "exception" &&
    input.values.exceptionKinds.some((kind) =>
      ["blocked-storage", "sealed-panel", "unsafe-access", "not-cleaned"].includes(kind),
    );
  const caseType: Axis1CloseoutCase =
    input.values.scenario === "clean"
      ? "clean_closeout"
      : hasAccessException
        ? "access_exception"
        : "condition_review";

  const warnings: string[] = [];

  if (evidenceBasis === "no_photos") {
    warnings.push(
      "Packet is based on selected outcome and written notes only; do not imply photo proof.",
    );
  }

  if (evidenceBasis === "partial_photos") {
    warnings.push(
      "Photo set is partial; keep missing-photo or record-only language visible.",
    );
  }

  if (skippedCoreCount > 0) {
    warnings.push("One or more core photo slots were marked not captured.");
  }

  return {
    caseType,
    canGeneratePacket: true,
    canUsePhotoProofLanguage,
    evidenceBasis,
    claimLevel,
    primaryStatusLabel:
      caseType === "clean_closeout"
        ? "Closed"
        : caseType === "access_exception"
          ? "Open item"
          : "Review item",
    basisLabel:
      evidenceBasis === "photo_record"
        ? "Photo record"
        : evidenceBasis === "partial_photos"
          ? "Partial photos"
          : "Written record",
    customerResultCopy: buildCustomerResultCopy(caseType, evidenceBasis),
    evidenceCopy: buildEvidenceCopy(evidenceBasis),
    claimLimitCopy: buildClaimLimitCopy(caseType, evidenceBasis),
    blockingReason: null,
    warnings,
  };
}

function buildCustomerResultCopy(
  caseType: Axis1CloseoutCase,
  evidenceBasis: Axis1CloseoutEvidenceBasis,
) {
  if (caseType === "access_exception") {
    return evidenceBasis === "photo_record"
      ? "Accessible areas were completed and an access exception remains open. Attached field photos support the completed work and recorded access issue."
      : evidenceBasis === "partial_photos"
        ? "Accessible areas were completed and an access exception remains open. Attached photos support only the areas shown."
        : "Accessible areas were completed and an access exception remains open. This packet is a written service record without attached field photos.";
  }

  if (caseType === "condition_review") {
    return evidenceBasis === "photo_record"
      ? "The visit was closed with a recorded condition for review. Attached field photos support the service record."
      : evidenceBasis === "partial_photos"
        ? "The visit was closed with a recorded condition for review. Attached photos support only the areas shown."
        : "The visit was closed with a recorded condition for review. This packet is a written service record without attached field photos.";
  }

  return evidenceBasis === "photo_record"
    ? "The accessible kitchen exhaust service path was completed and supported by attached before/after field photos."
    : evidenceBasis === "partial_photos"
      ? "The accessible kitchen exhaust service path was completed. Attached photos support only the areas shown."
      : "The accessible kitchen exhaust service path was completed. This packet is a written service record without attached field photos.";
}

function buildEvidenceCopy(evidenceBasis: Axis1CloseoutEvidenceBasis) {
  if (evidenceBasis === "photo_record") {
    return "Before/after core photos are attached, so the packet can use photo-supported service record language.";
  }

  if (evidenceBasis === "partial_photos") {
    return "Some field photos are attached, but the photo set is not complete enough to imply full before/after proof.";
  }

  return "No field photos are attached. The packet must read as a vendor-confirmed written service record.";
}

function buildClaimLimitCopy(
  caseType: Axis1CloseoutCase,
  evidenceBasis: Axis1CloseoutEvidenceBasis,
) {
  const proofLimit =
    evidenceBasis === "photo_record"
      ? "Photo language is limited to the attached field photos and service areas shown."
      : evidenceBasis === "partial_photos"
        ? "Avoid before/after proof claims; describe attached photos as partial field support only."
        : "Avoid photo proof claims; describe the output as a written closeout record.";

  if (caseType === "access_exception") {
    return `${proofLimit} Do not imply inaccessible areas were cleaned.`;
  }

  return `${proofLimit} Do not imply official inspection, code compliance approval, or fire suppression coverage.`;
}

function upsertRows(
  rows: readonly [string, string][],
  additions: readonly [string, string][],
) {
  const next = rows.filter(
    ([label]) => !additions.some(([additionLabel]) => additionLabel === label),
  );

  return [...next, ...additions] as readonly [string, string][];
}

function replacePhotoProofLanguage(value: string, result: Axis1CloseoutEngineResult) {
  if (result.evidenceBasis === "photo_record") {
    return value;
  }

  return value
    .replace(/proof photos P-01 \/ P-02/gi, "the service record")
    .replace(/Proof is tied to P-01 and P-02\./g, "Record is tied to the selected service result.")
    .replace(/Linked to proof photos P-01 \/ P-02\./g, "Recorded in the service closeout.")
    .replace(/blocked access photo/gi, "recorded access item")
    .replace(/proof photos/gi, "field photos")
    .replace(/proof link/gi, "service record");
}

export function applyAxis1CloseoutEngineToPacket(
  data: Axis1PacketPreviewData,
  result: Axis1CloseoutEngineResult,
): Axis1PacketPreviewData {
  const resultTitle =
    result.caseType === "clean_closeout"
      ? "Completed service record"
      : result.caseType === "access_exception"
        ? "Completed with open access item"
        : "Completed with recorded condition";

  const proofLabel =
    result.claimLevel === "photo_supported_record"
      ? "Photo-supported service record"
      : result.claimLevel === "partial_photo_record"
        ? "Partial-photo service record"
        : "Written service record";

  return {
    ...data,
    packetHeader: {
      ...data.packetHeader,
      copy: `${result.customerResultCopy} ${result.claimLimitCopy}`,
      quickFacts: upsertRows(data.packetHeader.quickFacts, [
        ["Evidence basis", result.basisLabel],
        ["Claim level", proofLabel],
      ]),
    },
    summaryCards: data.summaryCards.map((card, index) =>
      index === 0
        ? {
            ...card,
            title: resultTitle,
            copy: result.customerResultCopy,
          }
        : card,
    ),
    serviceRecordRows: upsertRows(data.serviceRecordRows, [
      ["Evidence basis", result.evidenceCopy],
      ["Claim limit", result.claimLimitCopy],
    ]),
    proofPolicyRows: upsertRows(data.proofPolicyRows, [
      ["Evidence basis", result.evidenceCopy],
      ["Claim limit", result.claimLimitCopy],
    ]),
    routeSegments: data.routeSegments.map((segment) => ({
      ...segment,
      note: replacePhotoProofLanguage(segment.note, result),
    })),
    scopeRows: data.scopeRows.map(([area, status, note]) => [
      area,
      status,
      replacePhotoProofLanguage(note, result),
    ]),
    componentStatusRows: data.componentStatusRows.map((row) => ({
      ...row,
      proof:
        result.evidenceBasis === "photo_record"
          ? row.proof
          : result.evidenceBasis === "partial_photos"
            ? "Partial field photos"
            : "Service record",
      note: replacePhotoProofLanguage(row.note, result),
    })),
    customerClose: {
      ...data.customerClose,
      copy: `${data.customerClose.copy} ${result.claimLimitCopy}`,
    },
    closeoutRows: upsertRows(data.closeoutRows, [
      ["Evidence basis", result.evidenceCopy],
      ["Claim limit", result.claimLimitCopy],
    ]),
    scopeNote: `${data.scopeNote} ${result.claimLimitCopy}`,
  };
}
