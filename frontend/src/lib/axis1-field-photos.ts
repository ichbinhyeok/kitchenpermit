import type { Axis1PacketPreviewData } from "@/lib/axis1-packet-preview";

export const axis1FieldPhotoSlots = [
  {
    id: "hood-before",
    proofId: "P-01",
    systemRef: "HD-01",
    label: "Hood before",
    shortLabel: "Before",
    title: "Hood interior before clean",
    caption: "Field photo captured before work began.",
    proofRole: "Before clean reference",
    tone: "before",
    keywords: ["before", "pre", "dirty", "start", "hood"],
    required: true,
  },
  {
    id: "hood-after",
    proofId: "P-02",
    systemRef: "HD-01",
    label: "Hood after",
    shortLabel: "After",
    title: "Hood interior after clean",
    caption: "Field photo captured after reachable surfaces were cleaned.",
    proofRole: "After clean confirmation",
    tone: "after",
    keywords: ["after", "clean", "final", "done", "complete"],
    required: true,
  },
  {
    id: "filter-bank",
    proofId: "P-03",
    systemRef: "FL-01",
    label: "Filter bank / tracks",
    shortLabel: "Filters",
    title: "Baffle filter reset",
    caption: "Filters shown removed, cleaned, checked, or returned to service.",
    proofRole: "Section reset evidence",
    tone: "after",
    keywords: ["filter", "baffle", "filters", "fl"],
    required: false,
  },
  {
    id: "access-condition",
    proofId: "P-04",
    systemRef: "DK-02",
    label: "Access condition",
    shortLabel: "Access",
    title: "Duct access condition",
    caption: "Access, blocked section, or exception condition tied to the report.",
    proofRole: "Access-path record",
    tone: "issue",
    keywords: ["access", "duct", "panel", "block", "blocked", "exception", "dk"],
    required: false,
  },
  {
    id: "rooftop-fan",
    proofId: "P-05",
    systemRef: "RF-01",
    label: "Rooftop fan",
    shortLabel: "Fan",
    title: "Rooftop fan line",
    caption: "Visible fan, hinge, curb, or rooftop condition tied to the report.",
    proofRole: "Rooftop condition record",
    tone: "record",
    keywords: ["roof", "rooftop", "fan", "hinge", "curb", "rf"],
    required: false,
  },
  {
    id: "grease-containment",
    proofId: "P-06",
    systemRef: "GC-01",
    label: "Grease path / containment",
    shortLabel: "Grease",
    title: "Grease removed / containment",
    caption: "Removed buildup, containment, or drip-path condition recorded.",
    proofRole: "Residue removal evidence",
    tone: "record",
    keywords: ["grease", "contain", "drip", "scrape", "residue", "gc"],
    required: false,
  },
  {
    id: "service-label",
    proofId: "P-07",
    systemRef: "LBL-01",
    label: "Service label / notice",
    shortLabel: "Label",
    title: "Service label / notice posted",
    caption: "Close-out label, exception notice, or next-due sticker captured.",
    proofRole: "Close-out label evidence",
    tone: "record",
    keywords: ["label", "sticker", "notice", "tag", "next", "due", "lbl"],
    required: false,
  },
] as const;

export type Axis1FieldPhotoSlot = (typeof axis1FieldPhotoSlots)[number];
export type Axis1FieldPhotoSlotId = Axis1FieldPhotoSlot["id"];
export type Axis1FieldPhotoConfidence = "keyword" | "order" | "manual";
export type Axis1PhotoSlotResolution = "open" | "not-captured" | "not-applicable";
export type Axis1RecordType =
  | "photo_proof_packet"
  | "after_cleaning_record"
  | "photo_supported_service_record"
  | "service_closeout_record"
  | "access_issue_record";

export type Axis1UploadedFieldPhoto = {
  localId?: string;
  src: string;
  name: string;
  source: "bulk" | "manual";
  confidence: Axis1FieldPhotoConfidence;
  matchLabel: string;
  assistSuggestionId?: string;
  assistSource?: "mock" | "gemini";
  assistConfidence?: number;
  assistReason?: string;
  assistSuggestedSlotId?: Axis1FieldPhotoSlotId | null;
  needsVendorReview?: boolean;
  vendorDecision?: "confirmed" | "edited" | "rejected" | "pending";
};

export type Axis1UploadedFieldPhotoState = Record<
  Axis1FieldPhotoSlotId,
  Axis1UploadedFieldPhoto | null
>;

export type Axis1PhotoSlotResolutionState = Record<
  Axis1FieldPhotoSlotId,
  Axis1PhotoSlotResolution
>;

export type Axis1PhotoCoverageSummary = {
  totalPhotos: number;
  placedPhotos: number;
  extraPhotos: number;
  hoodBeforeCount: number;
  hoodAfterCount: number;
  filterPhotoCount: number;
  ductAccessPhotoCount: number;
  rooftopFanPhotoCount: number;
  greasePathPhotoCount: number;
  blockedPhotoCount: number;
  serviceLabelPhotoCount: number;
  openRequiredSlotCount: number;
  markedNotCapturedCount: number;
};

export type Axis1RecordTypeMeta = {
  type: Axis1RecordType;
  label: string;
  builderTitle: string;
  builderCopy: string;
  customerCopy: string;
  recordBasis: string;
};

export const axis1RecordTypeMeta: Record<Axis1RecordType, Axis1RecordTypeMeta> = {
  photo_proof_packet: {
    type: "photo_proof_packet",
    label: "Full Photo Service Record",
    builderTitle: "Full photo record format",
    builderCopy:
      "Before/after and multiple exhaust-path photos are attached, so the customer link can show strong visual support while the PDF carries the evidence record.",
    customerCopy:
      "This record includes before/after service photos and supporting exhaust-path field photos.",
    recordBasis: "Vendor-confirmed service result with attached field photos",
  },
  after_cleaning_record: {
    type: "after_cleaning_record",
    label: "After-Cleaning Service Record",
    builderTitle: "After-photo record format",
    builderCopy:
      "After photos are attached without a reliable before comparison, so the customer link stays formal without forcing a false comparison.",
    customerCopy:
      "After-cleaning field photos are attached for this service record. No before-photo comparison is included.",
    recordBasis: "Vendor-confirmed service result with after-cleaning field photos",
  },
  photo_supported_service_record: {
    type: "photo_supported_service_record",
    label: "Photo Service Record",
    builderTitle: "Photo record format",
    builderCopy:
      "Some field photos are attached. The output stays formal and separates service scope from the areas shown in photos.",
    customerCopy:
      "Attached field photos support this service record. Photos may represent only the areas shown.",
    recordBasis: "Vendor-confirmed service result with partial attached field photos",
  },
  service_closeout_record: {
    type: "service_closeout_record",
    label: "Service Closeout Record",
    builderTitle: "Written closeout record format",
    builderCopy:
      "No field photos are attached. The output becomes a formal written closeout record instead of using photo-led language.",
    customerCopy:
      "This record summarizes the service provider closeout for this visit. Field photos are not attached to this link.",
    recordBasis: "Vendor-confirmed written closeout; no field photos attached",
  },
  access_issue_record: {
    type: "access_issue_record",
    label: "Access Issue Record",
    builderTitle: "Access issue record format",
    builderCopy:
      "The customer value is the open access item. Completed work and unresolved access stay separated.",
    customerCopy:
      "This record separates completed service areas from the access item that needs customer action.",
    recordBasis: "Vendor-confirmed access issue with service closeout details",
  },
};

export function emptyAxis1FieldPhotoState(): Axis1UploadedFieldPhotoState {
  return Object.fromEntries(
    axis1FieldPhotoSlots.map((slot) => [slot.id, null]),
  ) as Axis1UploadedFieldPhotoState;
}

export function emptyAxis1PhotoSlotResolutions(): Axis1PhotoSlotResolutionState {
  return Object.fromEntries(
    axis1FieldPhotoSlots.map((slot) => [slot.id, "open"]),
  ) as Axis1PhotoSlotResolutionState;
}

export function summarizeAxis1PhotoCoverage(
  uploadedFieldPhotos: Partial<Record<Axis1FieldPhotoSlotId, Axis1UploadedFieldPhoto | null>>,
  photoSlotResolutions: Partial<Record<Axis1FieldPhotoSlotId, Axis1PhotoSlotResolution>>,
  extraPhotoCount = 0,
): Axis1PhotoCoverageSummary {
  const hasPhoto = (slotId: Axis1FieldPhotoSlotId) =>
    uploadedFieldPhotos[slotId] ? 1 : 0;

  return {
    totalPhotos:
      axis1FieldPhotoSlots.filter((slot) => uploadedFieldPhotos[slot.id]).length +
      extraPhotoCount,
    placedPhotos: axis1FieldPhotoSlots.filter((slot) => uploadedFieldPhotos[slot.id]).length,
    extraPhotos: extraPhotoCount,
    hoodBeforeCount: hasPhoto("hood-before"),
    hoodAfterCount: hasPhoto("hood-after"),
    filterPhotoCount: hasPhoto("filter-bank"),
    ductAccessPhotoCount: hasPhoto("access-condition"),
    rooftopFanPhotoCount: hasPhoto("rooftop-fan"),
    greasePathPhotoCount: hasPhoto("grease-containment"),
    blockedPhotoCount: hasPhoto("access-condition"),
    serviceLabelPhotoCount: hasPhoto("service-label"),
    openRequiredSlotCount: axis1FieldPhotoSlots.filter(
      (slot) =>
        slot.required &&
        !uploadedFieldPhotos[slot.id] &&
        (photoSlotResolutions[slot.id] ?? "open") === "open",
    ).length,
    markedNotCapturedCount: axis1FieldPhotoSlots.filter(
      (slot) => photoSlotResolutions[slot.id] === "not-captured",
    ).length,
  };
}

export function selectAxis1RecordType(options: {
  coverage: Axis1PhotoCoverageSummary;
  hasAccessIssue: boolean;
}): Axis1RecordType {
  const { coverage, hasAccessIssue } = options;

  if (hasAccessIssue) {
    return "access_issue_record";
  }

  if (coverage.totalPhotos === 0) {
    return "service_closeout_record";
  }

  if (
    coverage.hoodBeforeCount > 0 &&
    coverage.hoodAfterCount > 0 &&
    coverage.placedPhotos >= 4
  ) {
    return "photo_proof_packet";
  }

  if (coverage.hoodAfterCount > 0 && coverage.hoodBeforeCount === 0) {
    return "after_cleaning_record";
  }

  return "photo_supported_service_record";
}

const componentPhotoSlotRules: ReadonlyArray<{
  pattern: RegExp;
  slotIds: readonly Axis1FieldPhotoSlotId[];
}> = [
  { pattern: /hood canopy|hood interior/i, slotIds: ["hood-before", "hood-after"] },
  { pattern: /filter|baffle/i, slotIds: ["filter-bank"] },
  { pattern: /plenum|duct|access/i, slotIds: ["access-condition"] },
  { pattern: /fan|roof/i, slotIds: ["rooftop-fan"] },
  { pattern: /grease|containment|trough/i, slotIds: ["grease-containment"] },
  { pattern: /label|notice/i, slotIds: ["service-label"] },
];

function slotIdsForRecordLabel(label: string) {
  const rule = componentPhotoSlotRules.find((item) => item.pattern.test(label));

  return rule?.slotIds ?? [];
}

function proofRefsForSlots(
  slotIds: readonly Axis1FieldPhotoSlotId[],
  uploadedFieldPhotos: Partial<Record<Axis1FieldPhotoSlotId, Axis1UploadedFieldPhoto | null>>,
) {
  return slotIds.flatMap((slotId) => {
    if (!uploadedFieldPhotos[slotId]) {
      return [];
    }

    const slot = axis1FieldPhotoSlots.find((item) => item.id === slotId);
    return slot ? [slot.proofId] : [];
  });
}

function proofSummaryForSlots(
  slotIds: readonly Axis1FieldPhotoSlotId[],
  uploadedFieldPhotos: Partial<Record<Axis1FieldPhotoSlotId, Axis1UploadedFieldPhoto | null>>,
) {
  const proofRefs = proofRefsForSlots(slotIds, uploadedFieldPhotos);

  if (proofRefs.length === 0) {
    return "Service record";
  }

  if (proofRefs.length < slotIds.length) {
    return `Partial: ${proofRefs.join(" / ")}`;
  }

  return proofRefs.join(" / ");
}

function removeStaticPhotoProofCopy(note: string) {
  return note
    .replace(" Linked to field photos P-01 / P-02.", "")
    .replace(" Photo evidence is tied to P-01 and P-02.", "")
    .replace(" Proof is tied to P-01 and P-02.", "")
    .replace("Before and after photos attached to HD-01.", "Work recorded for this section.")
    .trim();
}

export function buildAxis1PacketDataWithFieldPhotos(
  data: Axis1PacketPreviewData,
  uploadedFieldPhotos: Partial<Record<Axis1FieldPhotoSlotId, Axis1UploadedFieldPhoto | null>>,
  photoSlotResolutions: Partial<Record<Axis1FieldPhotoSlotId, Axis1PhotoSlotResolution>>,
): Axis1PacketPreviewData {
  const serviceLabelUpload = uploadedFieldPhotos["service-label"];

  return {
    ...data,
    proofPhotos: [
      ...data.proofPhotos.flatMap((photo) => {
        const slot = axis1FieldPhotoSlots.find((item) => item.proofId === photo.proofId);
        const uploaded = slot ? uploadedFieldPhotos[slot.id] : null;

        if (!slot) {
          return [photo];
        }

        if (!uploaded) {
          return [];
        }

        return [
          {
            ...photo,
            src: uploaded.src,
            label: slot.shortLabel,
            title: slot.title,
            caption: `${slot.caption} Local field photo: ${uploaded.name}.`,
            proofRole: slot.proofRole,
          },
        ];
      }),
      ...(serviceLabelUpload
        ? [
            {
              src: serviceLabelUpload.src,
              proofId: "P-07",
              systemRef: "LBL-01",
              label: "Label",
              title: "Service label / notice posted",
              caption: `Close-out label or notice captured from the field file: ${serviceLabelUpload.name}.`,
              proofRole: "Close-out label evidence",
              tone: "record" as const,
              position: "50% 50%",
            },
          ]
        : []),
    ],
    componentStatusRows: data.componentStatusRows.map((row) => {
      const slotIds = slotIdsForRecordLabel(row.component);

      if (slotIds.length === 0) {
        return row;
      }

      return {
        ...row,
        proof: proofSummaryForSlots(slotIds, uploadedFieldPhotos),
        note: removeStaticPhotoProofCopy(row.note),
      };
    }),
    routeSegments: data.routeSegments.map((segment) => {
      const slotIds = slotIdsForRecordLabel(`${segment.code} ${segment.title}`);

      if (slotIds.length === 0) {
        return segment;
      }

      return {
        ...segment,
        note: removeStaticPhotoProofCopy(segment.note),
      };
    }),
    photoCoverageRows: data.photoCoverageRows.map((row) => {
      const slot = axis1FieldPhotoSlots.find(
        (item) =>
          item.proofId === row.proof ||
          (item.id === "service-label" && row.item === "Service label / notice"),
      );
      const uploaded = slot ? uploadedFieldPhotos[slot.id] : null;
      const resolution = slot ? photoSlotResolutions[slot.id] ?? "open" : "open";

      if (uploaded) {
        return {
          ...row,
          status: "Uploaded",
        };
      }

      if (resolution === "not-captured") {
        return {
          ...row,
          status: "Not captured",
        };
      }

      if (resolution === "not-applicable") {
        return {
          ...row,
          status: "N/A",
        };
      }

      if (slot) {
        return {
          ...row,
          status: "Not attached",
        };
      }

      return row;
    }),
    scopeRows: data.scopeRows.map(([area, status, note]) => [
      area,
      status,
      removeStaticPhotoProofCopy(note),
    ]),
  };
}
