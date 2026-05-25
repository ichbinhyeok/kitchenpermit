import {
  applyAxis1CloseoutEngineToPacket,
  evaluateAxis1Closeout,
  type Axis1CloseoutLinks,
} from "@/lib/axis1-closeout-engine";
import {
  axis1BuilderDefaults,
  buildAxis1NeutralPacketData,
  type Axis1BuilderFormValues,
} from "@/lib/axis1-packet-builder";
import type { Axis1PacketPreviewData } from "@/lib/axis1-packet-preview";
import {
  axis1FieldPhotoSlots,
  buildAxis1PacketDataWithFieldPhotos,
  emptyAxis1FieldPhotoState,
  emptyAxis1PhotoSlotResolutions,
  type Axis1FieldPhotoSlotId,
  type Axis1PhotoSlotResolution,
  type Axis1PhotoSlotResolutionState,
  type Axis1UploadedFieldPhotoState,
} from "@/lib/axis1-field-photos";

export type Axis1SampleProofVariant =
  | "clean"
  | "blocked_access"
  | "condition_review";

type Axis1SampleProofConfig = {
  variant: Axis1SampleProofVariant;
  path: string;
  label: string;
  title: string;
  copy: string;
  values: Axis1BuilderFormValues;
  photoSlots: readonly Axis1FieldPhotoSlotId[];
  slotResolutions?: Partial<Record<Axis1FieldPhotoSlotId, Axis1PhotoSlotResolution>>;
  links: Axis1CloseoutLinks;
};

export const AXIS1_BLOCKED_ACCESS_SAMPLE_PDF_HREF =
  "/downloads/kitchenpermit-sample-blocked-access-retained-pdf-copy.pdf";

const sampleVendor: Axis1PacketPreviewData["vendor"] = {
  name: "Sample Hood Cleaning Company",
  initials: "SH",
  logoUrl: "/images/sample-hood-service-logo.svg",
  office: "Austin, TX | 24/7 dispatch",
  directLine: "(512) 555-0148",
  dispatch: "dispatch@example.com",
  certification: "Sample service ID SH-2087",
  technician: "Sample technician / Tech ID SH-114",
  afterHours: "(512) 555-0192",
  reviewPrompt: "dispatch@example.com",
  preparedBy: "Sample Hood Cleaning Company | SH-114",
  previewBlurb:
    "Customer sees a same-day service report link with the company brand, service contact, service ID, and record references already in place.",
  brandingApplied: true,
};

const baseSampleValues: Axis1BuilderFormValues = {
  ...axis1BuilderDefaults,
  propertyName: "Sample Restaurant Group",
  siteCity: "Austin, TX",
  serviceDate: "2026-04-24",
  authorizedBy: "Store manager",
  cadence: "90",
  serviceWindow: "01:10-03:05",
  systemName: "Main cookline hood line",
  summaryOverride: "",
  customerActionOverride: "",
  followUpOverride: "",
};

const samplePhotoSources: Partial<Record<Axis1FieldPhotoSlotId, string>> = {
  "hood-before": "/images/packet-proof/ai-hood-before.jpg",
  "hood-after": "/images/packet-proof/ai-hood-after.jpg",
  "filter-bank": "/images/packet-proof/ai-baffle-filters.jpg",
  "access-condition": "/images/packet-proof/ai-duct-access-hd.jpg",
  "rooftop-fan": "/images/packet-proof/ai-rooftop-fan-base.jpg",
  "grease-containment": "/images/packet-proof/ai-grease-scraper.jpg",
};

export const axis1SampleProofVariants: readonly Axis1SampleProofConfig[] = [
  {
    variant: "clean",
    path: "/p/sample-clean-closeout",
    label: "Clean closeout",
    title: "Completed service with next-service action",
    copy:
      "A clean visit leads with the completed result, photo coverage, the PDF copy, and the next service timing.",
    values: {
      ...baseSampleValues,
      scenario: "clean",
      exceptionKinds: [],
      followUpMode: "none",
    },
    photoSlots: [
      "hood-before",
      "hood-after",
      "filter-bank",
      "rooftop-fan",
      "grease-containment",
    ],
    slotResolutions: {
      "access-condition": "not-applicable",
      "service-label": "not-captured",
    },
    links: {},
  },
  {
    variant: "blocked_access",
    path: "/p/sample-blocked-access",
    label: "Blocked access",
    title: "Completed reachable areas with access action",
    copy:
      "A blocked access visit keeps reachable completed work separate from the area that cannot be represented as cleaned.",
    values: {
      ...baseSampleValues,
      scenario: "exception",
      exceptionKinds: ["blocked-storage"],
      followUpMode: "monitor",
      exceptionNote:
        "Stored equipment blocked the rear duct access panel during service.",
    },
    photoSlots: ["hood-after", "filter-bank", "access-condition"],
    slotResolutions: {
      "hood-before": "not-captured",
      "rooftop-fan": "not-captured",
      "grease-containment": "not-captured",
      "service-label": "not-captured",
    },
    links: {
      pdfHref: AXIS1_BLOCKED_ACCESS_SAMPLE_PDF_HREF,
    },
  },
  {
    variant: "condition_review",
    path: "/p/sample-condition-review",
    label: "Condition review",
    title: "Completed service with recorded condition",
    copy:
      "A recorded condition stays visible as a quote or monitoring decision without turning the cleaning closeout into a correction claim.",
    values: {
      ...baseSampleValues,
      scenario: "exception",
      exceptionKinds: ["rooftop-hinge-curb"],
      followUpMode: "quote",
      followUpNote:
        "Fan hinge and curb-line condition recorded from the rooftop view.",
    },
    photoSlots: [
      "hood-before",
      "hood-after",
      "rooftop-fan",
      "grease-containment",
    ],
    slotResolutions: {
      "filter-bank": "not-captured",
      "access-condition": "not-applicable",
      "service-label": "not-captured",
    },
    links: {},
  },
] as const;

function configForVariant(variant: Axis1SampleProofVariant) {
  return (
    axis1SampleProofVariants.find((item) => item.variant === variant) ??
    axis1SampleProofVariants[0]
  );
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

function buildSamplePhotos(
  slotIds: readonly Axis1FieldPhotoSlotId[],
): Axis1UploadedFieldPhotoState {
  const uploadedPhotos = emptyAxis1FieldPhotoState();

  slotIds.forEach((slotId) => {
    const source = samplePhotoSources[slotId];

    if (!source) {
      return;
    }

    uploadedPhotos[slotId] = {
      src: source,
      name: `sample-${slotId}.jpg`,
      source: "manual",
      confidence: "manual",
      matchLabel: "Sample photo placement",
    };
  });

  return uploadedPhotos;
}

function buildSampleResolutions(
  capturedSlotIds: readonly Axis1FieldPhotoSlotId[],
  overrides: Partial<Record<Axis1FieldPhotoSlotId, Axis1PhotoSlotResolution>> = {},
): Axis1PhotoSlotResolutionState {
  const captured = new Set(capturedSlotIds);
  const resolutions = emptyAxis1PhotoSlotResolutions();

  axis1FieldPhotoSlots.forEach((slot) => {
    if (captured.has(slot.id)) {
      return;
    }

    resolutions[slot.id] = overrides[slot.id] ?? "not-captured";
  });

  return resolutions;
}

function applySampleBranding(
  data: Axis1PacketPreviewData,
  config: Axis1SampleProofConfig,
): Axis1PacketPreviewData {
  return {
    ...data,
    branding: "applied",
    reportUrl: `https://kitchenpermit.com${config.path}`,
    vendor: sampleVendor,
    packetHeader: {
      ...data.packetHeader,
      archiveNote:
        "Customer sees the service result, attached photos, next action, and a clear PDF copy in one branded service report link.",
    },
    serviceRecordRows: upsertRows(data.serviceRecordRows, [
      ["Technician", sampleVendor.technician],
      ["Service ID", sampleVendor.certification],
      ["Dispatch", sampleVendor.dispatch],
      ["Direct line", sampleVendor.directLine],
    ]),
    closeoutRows: upsertRows(data.closeoutRows, [
      ["Prepared by technician", sampleVendor.preparedBy],
      ["Technician/service ID", sampleVendor.certification],
      ["Dispatch", sampleVendor.dispatch],
      ["After-hours", sampleVendor.afterHours],
      ["Follow-up contact", sampleVendor.reviewPrompt],
      ["Service report link", `https://kitchenpermit.com${config.path}`],
      ["Delivery record", "Service report link sent; PDF copy available"],
    ]),
    sampleFooter: [
      [
        "Sample variant",
        `${config.label}: ${config.copy}`,
      ],
      [
        "Primary output",
        "Service report link for the customer. PDF copy remains the archive, submission, or print copy.",
      ],
      [
        "Actual company version",
        "Hosted report link, saved photos, branded delivery, and customer-specific service history.",
      ],
      [
        "Software boundary",
        "KitchenPermit is service report software. It does not perform inspections, issue permits or certificates, verify code compliance, or replace professional judgment.",
      ],
    ],
  };
}

export function buildAxis1SampleProofData(
  variant: Axis1SampleProofVariant,
): Axis1PacketPreviewData {
  const config = configForVariant(variant);
  const uploadedPhotos = buildSamplePhotos(config.photoSlots);
  const photoSlotResolutions = buildSampleResolutions(
    config.photoSlots,
    config.slotResolutions,
  );
  const basePacket = applySampleBranding(
    buildAxis1NeutralPacketData(config.values),
    config,
  );
  const photoPacket = buildAxis1PacketDataWithFieldPhotos(
    basePacket,
    uploadedPhotos,
    photoSlotResolutions,
  );
  const closeout = evaluateAxis1Closeout({
    values: config.values,
    outcomeSelected: true,
    uploadedFieldPhotos: uploadedPhotos,
    unplacedPhotoCount: 0,
    photoSlotResolutions,
    links: config.links,
  });

  return applyAxis1CloseoutEngineToPacket(photoPacket, closeout);
}
