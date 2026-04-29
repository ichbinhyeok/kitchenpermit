import type { Axis1PacketPreviewData } from "@/lib/axis1-packet-preview";

export const axis1FieldPhotoSlots = [
  {
    id: "hood-before",
    proofId: "P-01",
    systemRef: "HD-01",
    label: "Before hood interior",
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
    label: "After hood interior",
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
    label: "Filter bank reset",
    shortLabel: "Filters",
    title: "Baffle filter reset",
    caption: "Filters shown removed, cleaned, inspected, or returned to service.",
    proofRole: "Section reset proof",
    tone: "after",
    keywords: ["filter", "baffle", "filters", "fl"],
    required: false,
  },
  {
    id: "access-condition",
    proofId: "P-04",
    systemRef: "DK-02",
    label: "Access / exception condition",
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
    label: "Rooftop fan / hinge line",
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
    label: "Grease removed / containment",
    shortLabel: "Grease",
    title: "Grease removed / containment",
    caption: "Removed buildup, containment, or drip-path condition recorded.",
    proofRole: "Residue removal proof",
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
    proofRole: "Close-out label proof",
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
  src: string;
  name: string;
  source: "bulk" | "manual";
  confidence: Axis1FieldPhotoConfidence;
  matchLabel: string;
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
    label: "Photo Proof Packet",
    builderTitle: "Strong photo proof format",
    builderCopy:
      "Before/after and multiple exhaust-path photos are attached, so the packet can lead with visual proof.",
    customerCopy:
      "This record includes before/after service photos and supporting exhaust-path field photos.",
    recordBasis: "Vendor-confirmed service result with attached field photos",
  },
  after_cleaning_record: {
    type: "after_cleaning_record",
    label: "After-Cleaning Service Record",
    builderTitle: "After-photo record format",
    builderCopy:
      "After photos are attached without a reliable before comparison, so the packet stays premium but does not force a false slider.",
    customerCopy:
      "After-cleaning field photos are attached for this service record. No before-photo comparison is included.",
    recordBasis: "Vendor-confirmed service result with after-cleaning field photos",
  },
  photo_supported_service_record: {
    type: "photo_supported_service_record",
    label: "Photo-Supported Service Record",
    builderTitle: "Photo-supported record format",
    builderCopy:
      "Some field photos are attached. The output stays formal and separates service scope from photo coverage.",
    customerCopy:
      "Attached field photos support this service record. Photo coverage may represent only the areas shown.",
    recordBasis: "Vendor-confirmed service result with partial attached field photos",
  },
  service_closeout_record: {
    type: "service_closeout_record",
    label: "Service Closeout Record",
    builderTitle: "Written closeout record format",
    builderCopy:
      "No field photos are attached. The output becomes a formal closeout record instead of a weak photo packet.",
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

export function getAxis1AdaptiveRecordMeta(options: {
  uploadedFieldPhotos: Partial<Record<Axis1FieldPhotoSlotId, Axis1UploadedFieldPhoto | null>>;
  photoSlotResolutions: Partial<Record<Axis1FieldPhotoSlotId, Axis1PhotoSlotResolution>>;
  extraPhotoCount?: number;
  hasAccessIssue: boolean;
}) {
  const coverage = summarizeAxis1PhotoCoverage(
    options.uploadedFieldPhotos,
    options.photoSlotResolutions,
    options.extraPhotoCount ?? 0,
  );
  const recordType = selectAxis1RecordType({
    coverage,
    hasAccessIssue: options.hasAccessIssue,
  });

  return {
    coverage,
    recordType,
    meta: axis1RecordTypeMeta[recordType],
  };
}

function isAccessIssueData(data: Axis1PacketPreviewData) {
  return data.routeSegments.some(
    (segment) =>
      /access|duct/i.test(`${segment.code} ${segment.title}`) &&
      /blocked|inaccessible|not completed|open/i.test(segment.status),
  );
}

function replaceOrAppendRow(
  rows: readonly (readonly [string, string])[],
  label: string,
  value: string,
) {
  const next = rows.filter(([currentLabel]) => currentLabel !== label);

  return [...next.map(([rowLabel, rowValue]) => [rowLabel, rowValue] as [string, string]), [label, value] as [string, string]];
}

function appendUniquePolicyRows(
  rows: Axis1PacketPreviewData["proofPolicyRows"],
  meta: Axis1RecordTypeMeta,
  coverage: Axis1PhotoCoverageSummary,
): Axis1PacketPreviewData["proofPolicyRows"] {
  const coverageDescription =
    coverage.totalPhotos === 0
      ? "No field photos are attached to this customer link."
      : `${coverage.placedPhotos} field photo(s) attached${coverage.extraPhotos > 0 ? `; ${coverage.extraPhotos} extra photo(s) retained for review` : ""}.`;

  return [
    ...rows.filter(
      ([label]) => label !== "Record format" && label !== "Record basis",
    ),
    ["Record format", meta.label],
    ["Record basis", `${meta.recordBasis}. ${coverageDescription}`],
  ];
}

function adaptRowsForRecordType(
  data: Axis1PacketPreviewData,
  meta: Axis1RecordTypeMeta,
  coverage: Axis1PhotoCoverageSummary,
) {
  const basisNote = meta.customerCopy;
  const replacePhotoReferences = (value: string) =>
    value
      .replace(/Proof is tied to P-01 and P-02\./g, "Work is recorded in this service record.")
      .replace(/Linked to proof photos P-01 \/ P-02\./g, "Recorded in the service closeout.")
      .replace(/Before and after proof attached to HD-01\./g, basisNote)
      .replace(/proof photos P-01 \/ P-02/gi, "the service record")
      .replace(/proof photos/gi, "field photos")
      .replace(/proof is tied to/gi, "record is tied to");

  return {
    packetHeader: {
      ...data.packetHeader,
      copy:
        meta.type === "photo_proof_packet"
          ? data.packetHeader.copy
          : `${data.systemIdentityRows.find(([label]) => label === "Line served")?.[1] ?? "Kitchen exhaust system"}. ${meta.customerCopy} The service result, open items, and next action stay listed in one customer-ready record.`,
      quickFacts: replaceOrAppendRow(
        replaceOrAppendRow(data.packetHeader.quickFacts, "Record format", meta.label),
        "Record basis",
        coverage.totalPhotos > 0
          ? `${coverage.placedPhotos} attached field photo(s)`
          : "Written service closeout",
      ),
    },
    serviceRecordRows: replaceOrAppendRow(
      replaceOrAppendRow(data.serviceRecordRows, "Record format", meta.label),
      "Evidence basis",
      meta.recordBasis,
    ),
    proofPolicyRows: appendUniquePolicyRows(data.proofPolicyRows, meta, coverage),
    routeSegments: data.routeSegments.map((segment) => ({
      ...segment,
      note:
        meta.type === "photo_proof_packet"
          ? segment.note
          : replacePhotoReferences(segment.note),
    })),
    scopeRows: data.scopeRows.map(
      ([area, status, note]) =>
        [
          area,
          status,
          meta.type === "photo_proof_packet" ? note : replacePhotoReferences(note),
        ] as [string, string, string],
    ),
    componentStatusRows: data.componentStatusRows.map((row) => ({
      ...row,
      proof:
        meta.type === "service_closeout_record"
          ? "Service record"
          : row.proof,
      note:
        meta.type === "photo_proof_packet"
          ? row.note
          : replacePhotoReferences(row.note),
    })),
  };
}

export function buildAxis1PacketDataWithFieldPhotos(
  data: Axis1PacketPreviewData,
  uploadedFieldPhotos: Partial<Record<Axis1FieldPhotoSlotId, Axis1UploadedFieldPhoto | null>>,
  photoSlotResolutions: Partial<Record<Axis1FieldPhotoSlotId, Axis1PhotoSlotResolution>>,
): Axis1PacketPreviewData {
  const serviceLabelUpload = uploadedFieldPhotos["service-label"];
  const adaptiveRecord = getAxis1AdaptiveRecordMeta({
    uploadedFieldPhotos,
    photoSlotResolutions,
    hasAccessIssue: isAccessIssueData(data),
  });
  const rowAdaptations = adaptRowsForRecordType(
    data,
    adaptiveRecord.meta,
    adaptiveRecord.coverage,
  );

  return {
    ...data,
    packetHeader: rowAdaptations.packetHeader,
    serviceRecordRows: rowAdaptations.serviceRecordRows,
    proofPolicyRows: rowAdaptations.proofPolicyRows,
    routeSegments: rowAdaptations.routeSegments,
    scopeRows: rowAdaptations.scopeRows,
    componentStatusRows: rowAdaptations.componentStatusRows,
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
              proofRole: "Close-out label proof",
              tone: "record" as const,
              position: "50% 50%",
            },
          ]
        : []),
    ],
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
          status:
            adaptiveRecord.meta.type === "service_closeout_record"
              ? "Not photographed in this record"
              : "Not attached",
        };
      }

      return row;
    }),
  };
}
