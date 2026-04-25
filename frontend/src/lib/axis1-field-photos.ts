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
          status: "Not attached",
        };
      }

      return row;
    }),
  };
}
