import type {
  Axis1BuilderExceptionKind,
  Axis1BuilderFormValues,
  Axis1BuilderFollowUpMode,
} from "@/lib/axis1-packet-builder";
import type { Axis1PacketPreviewData } from "@/lib/axis1-packet-preview";
import {
  axis1RecordTypeMeta,
  axis1FieldPhotoSlots,
  selectAxis1RecordType,
  summarizeAxis1PhotoCoverage,
  type Axis1RecordType,
  type Axis1FieldPhotoSlotId,
  type Axis1PhotoSlotResolution,
  type Axis1UploadedFieldPhoto,
} from "@/lib/axis1-field-photos";
import {
  buildAxis1JobTruthRecord,
  type Axis1JobTruthArea,
  type Axis1JobTruthOutput,
  type Axis1JobTruthOutputKind,
  type Axis1JobTruthPhotoEvidence,
  type Axis1JobTruthRecord,
} from "@/lib/axis1-job-truth";

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

export type Axis1CloseoutCustomerActionType =
  | "confirm_next_service"
  | "clear_access_then_revisit"
  | "approve_access_correction"
  | "make_access_safe"
  | "approve_open_section_revisit"
  | "review_condition_quote"
  | "monitor_condition"
  | "record_only";

export type Axis1CloseoutCtaPriority =
  | "primary"
  | "secondary"
  | "tertiary"
  | "utility";

export type Axis1CloseoutCtaKind =
  | "schedule_next_cleaning"
  | "reply_after_clearing_access"
  | "request_revisit"
  | "request_quote"
  | "confirm_next_service"
  | "confirm_received"
  | "reply_with_questions"
  | "download_pdf"
  | "send_follow_up_quote"
  | "mark_customer_action_needed";

export type Axis1CloseoutCta = {
  kind: Axis1CloseoutCtaKind;
  label: string;
  href?: string;
  priority: Axis1CloseoutCtaPriority;
  enabled: boolean;
  reason?: string;
};

export type Axis1CloseoutLinks = {
  nextServiceRequestUrl?: string;
  followUpQuoteUrl?: string;
  replyUrl?: string;
  pdfHref?: string;
};

export type Axis1GeneratedOutputKind =
  | "customer_link"
  | "evidence_pdf"
  | "follow_up_quote_copy"
  | "revisit_copy"
  | "next_service_copy"
  | "internal_risk_summary";

export type Axis1GeneratedOutputReadiness =
  | "ready"
  | "needs_review"
  | "not_applicable";

export type Axis1GeneratedOutput = {
  kind: Axis1GeneratedOutputKind;
  label: string;
  readiness: Axis1GeneratedOutputReadiness;
  reason?: string;
  copy?: string;
  ctaKind?: Axis1CloseoutCtaKind;
};

export type Axis1CloseoutAreaId =
  | "hood_filters"
  | "duct_access"
  | "rooftop_fan"
  | "grease_path"
  | "label_notice";

export type Axis1CloseoutAreaState =
  | "completed_with_photo"
  | "completed_from_notes"
  | "blocked_no_access"
  | "not_completed"
  | "condition_noted"
  | "separate_not_this_visit"
  | "unclear_needs_review";

export type Axis1CloseoutAreaProofBasis =
  | "photo"
  | "written"
  | "none"
  | "unclear";

export type Axis1CloseoutAreaLedgerItem = {
  area: Axis1CloseoutAreaId;
  label: string;
  state: Axis1CloseoutAreaState;
  proofBasis: Axis1CloseoutAreaProofBasis;
  photoCount: number;
  customerVisible: boolean;
  vendorOnlyReason?: string;
};

export type Axis1CloseoutSourceOfTruth = {
  jobTruthRecord: Axis1JobTruthRecord;
  jobResult: {
    outcomeType: Axis1OutcomeType | null;
    caseType: Axis1CloseoutCase;
    confirmedByVendor: boolean;
    statusLabel: string;
  };
  areaCoverageLedger: Axis1CloseoutAreaLedgerItem[];
  proofBasis: {
    type: Axis1CloseoutEvidenceBasis;
    claimLevel: Axis1CloseoutClaimLevel;
    photosAttached: number;
    missingProofWarnings: string[];
  };
  customerSafeSummary: {
    result: string;
    action: string;
    claimLimit: string;
  };
  vendorOnlyWarnings: Axis1VendorSendReadinessWarning[];
  outputReadiness: Axis1GeneratedOutput[];
  nextAction: {
    type: Axis1CloseoutCustomerActionType;
    title: string;
    copy: string;
  };
};

export type Axis1VendorSendReadinessWarningKind =
  | "result_required"
  | "no_photos"
  | "partial_photo_set"
  | "missing_before_photo"
  | "missing_after_photo"
  | "missing_fan_photo"
  | "missing_duct_access_photo"
  | "blocked_access_written_only"
  | "condition_record_written_only"
  | "service_label_missing";

export type Axis1VendorSendReadinessSeverity =
  | "blocker"
  | "review"
  | "note";

export type Axis1VendorSendReadinessWarning = {
  kind: Axis1VendorSendReadinessWarningKind;
  severity: Axis1VendorSendReadinessSeverity;
  title: string;
  copy: string;
  customerCopy: string;
  proofAreaId?: Axis1FieldPhotoSlotId;
};

export type Axis1Acknowledgement = {
  enabled?: boolean;
  label?: string;
};

export type Axis1OutcomeType =
  | "clean"
  | "blocked_access"
  | "condition_review"
  | "partial"
  | "follow_up_required";

export type Axis1ProofCoverageState =
  | "captured"
  | "not_captured"
  | "not_applicable"
  | "open";

export type Axis1ProofCoverageItem = {
  id: Axis1FieldPhotoSlotId;
  label: string;
  state: Axis1ProofCoverageState;
  required: boolean;
  proofId?: string;
  customerCopy: string;
  vendorReviewCopy: string;
};

export type Axis1ProofCoverageSummary = {
  capturedCount: number;
  recommendedCount: number;
  requiredOpenCount: number;
  label: string;
  shortLabel: string;
  items: Axis1ProofCoverageItem[];
};

export type Axis1CloseoutRecordFormat = {
  type: Axis1RecordType;
  label: string;
  builderTitle: string;
  builderCopy: string;
  customerCopy: string;
  recordBasis: string;
  reason: string;
};

export type Axis1CoverageEducationState =
  | "covered"
  | "recorded"
  | "action_required"
  | "not_claimed";

export type Axis1CoverageEducationItem = {
  label: string;
  copy: string;
  state: Axis1CoverageEducationState;
};

export type Axis1CoverageEducation = {
  title: string;
  summary: string;
  items: readonly Axis1CoverageEducationItem[];
  boundaryCopy: string;
};

export type Axis1CloseoutEngineInput = {
  values: Axis1BuilderFormValues;
  outcomeSelected: boolean;
  uploadedFieldPhotos: Record<Axis1FieldPhotoSlotId, Axis1UploadedFieldPhoto | null>;
  unplacedPhotoCount: number;
  photoSlotResolutions: Record<Axis1FieldPhotoSlotId, Axis1PhotoSlotResolution>;
  areaLedger?: Axis1CloseoutAreaLedgerItem[];
  links?: Axis1CloseoutLinks;
  acknowledgement?: Axis1Acknowledgement;
};

export type Axis1CloseoutEngineResult = {
  caseType: Axis1CloseoutCase;
  outcomeType: Axis1OutcomeType | null;
  canGeneratePacket: boolean;
  canUsePhotoProofLanguage: boolean;
  evidenceBasis: Axis1CloseoutEvidenceBasis;
  claimLevel: Axis1CloseoutClaimLevel;
  recordFormat: Axis1CloseoutRecordFormat;
  proofCoverage: Axis1ProofCoverageSummary;
  coverageEducation: Axis1CoverageEducation;
  ctas: Axis1CloseoutCta[];
  primaryCta: Axis1CloseoutCta | null;
  generatedOutputs: Axis1GeneratedOutput[];
  vendorSendReadinessWarnings: Axis1VendorSendReadinessWarning[];
  primaryStatusLabel: string;
  basisLabel: string;
  customerResultCopy: string;
  customerActionType: Axis1CloseoutCustomerActionType;
  customerActionTitle: string;
  customerActionCopy: string;
  responsibilityCopy: string;
  evidenceCopy: string;
  claimLimitCopy: string;
  blockingReason: string | null;
  warnings: string[];
  sourceOfTruth: Axis1CloseoutSourceOfTruth;
};

const requiredCorePhotoSlots: Axis1FieldPhotoSlotId[] = [
  "hood-before",
  "hood-after",
];

const accessExceptionKinds = [
  "blocked-storage",
  "sealed-panel",
  "panel-signage",
  "unsafe-access",
  "not-cleaned",
] as const satisfies readonly Axis1BuilderExceptionKind[];

const conditionExceptionKinds = [
  "rooftop-hinge-curb",
  "fan-belt-drive",
  "liquid-tight",
  "grease-containment",
] as const satisfies readonly Axis1BuilderExceptionKind[];

type CloseoutIssuePolicy = {
  actionType: Axis1CloseoutCustomerActionType;
  actionTitle: string;
  actionCopy: string;
  responsibilityCopy: string;
};

const accessIssuePolicies: Record<(typeof accessExceptionKinds)[number], CloseoutIssuePolicy> = {
  "blocked-storage": {
    actionType: "clear_access_then_revisit",
    actionTitle: "Clear access, then schedule revisit",
    actionCopy:
      "Move the stored equipment or obstruction away from the access point, then reply so a revisit can be scheduled.",
    responsibilityCopy:
      "Reachable sections were completed. The blocked section stays listed separately until access is cleared.",
  },
  "sealed-panel": {
    actionType: "approve_access_correction",
    actionTitle: "Open or approve access correction",
    actionCopy:
      "Make the access panel serviceable or approve access correction, then reply when the area can be opened safely.",
    responsibilityCopy:
      "The sealed panel is outside the completed cleaning claim; the service record must not imply the concealed path was cleaned.",
  },
  "panel-signage": {
    actionType: "approve_access_correction",
    actionTitle: "Correct access panel or signage",
    actionCopy:
      "Correct the access-panel or signage issue before the next normal service cycle, or reply if you want it reviewed sooner.",
    responsibilityCopy:
      "The vendor is recording the access condition for visibility; correcting the panel or signage is separate from this cleaning closeout.",
  },
  "unsafe-access": {
    actionType: "make_access_safe",
    actionTitle: "Make access safe before revisit",
    actionCopy:
      "Correct the unsafe condition or provide safe access, then reply so the open section can be scheduled for completion.",
    responsibilityCopy:
      "The vendor should not be positioned as responsible for cleaning an area that could not be safely accessed during the visit.",
  },
  "not-cleaned": {
    actionType: "approve_open_section_revisit",
    actionTitle: "Approve revisit for open section",
    actionCopy:
      "Reply to approve a revisit once access or service conditions allow the open section to be completed.",
    responsibilityCopy:
      "The open section remains excluded from the completed-work claim until a revisit or separate service closes it.",
  },
};

function buildConditionIssuePolicy(
  mode: Axis1BuilderFollowUpMode,
): CloseoutIssuePolicy {
  if (mode === "quote") {
    return {
      actionType: "review_condition_quote",
      actionTitle: "Review condition for quote",
      actionCopy:
        "Review the noted condition and reply if you want a follow-up quote before the next service window.",
      responsibilityCopy:
        "This note keeps a follow-up item visible. Any follow-up work needs a separate customer go-ahead before the next service.",
    };
  }

  if (mode === "monitor") {
    return {
      actionType: "monitor_condition",
      actionTitle: "Monitor recorded condition",
      actionCopy:
        "Keep this condition visible and reply if it changes before the next service window.",
      responsibilityCopy:
        "This condition stays on the record for customer visibility. It is not represented as corrected by this cleaning closeout.",
    };
  }

  return {
    actionType: "record_only",
    actionTitle: "Keep condition on record",
    actionCopy:
      "No customer action is needed now. Keep this condition with the service record.",
    responsibilityCopy:
      "This condition is record-only. It is not a request for separate corrective work unless the customer asks for follow-up.",
  };
}

function proofCoverageStateLabel(state: Axis1ProofCoverageState) {
  switch (state) {
    case "captured":
      return "Captured";
    case "not_captured":
      return "Not captured";
    case "not_applicable":
      return "Not applicable";
    case "open":
    default:
      return "Open";
  }
}

function proofAreaCustomerCopy(
  slotId: Axis1FieldPhotoSlotId,
  state: Axis1ProofCoverageState,
) {
  if (state === "captured") {
    return "Attached field photo is included in this record.";
  }

  if (state === "not_applicable") {
    return "This area is not represented as part of this visit.";
  }

  switch (slotId) {
    case "hood-before":
      return "Before hood photo is not attached to this record.";
    case "hood-after":
      return "After hood photo is not attached to this record.";
    case "filter-bank":
      return "Filter bank / tracks photo is not attached to this record.";
    case "access-condition":
      return "Duct/access coverage is recorded by service note only.";
    case "rooftop-fan":
      return "Rooftop fan photo is not attached to this record.";
    case "grease-containment":
      return "Grease path / containment photo is not attached to this record.";
    case "service-label":
      return "Service label / notice photo is not attached to this record.";
  }
}

function proofAreaVendorReviewCopy(
  slotId: Axis1FieldPhotoSlotId,
  state: Axis1ProofCoverageState,
) {
  if (state === "captured") {
    return "Photo attached and available for the generated record.";
  }

  if (state === "not_applicable") {
    return "Vendor marked this area as not part of this visit.";
  }

  switch (slotId) {
    case "hood-before":
      return "Before photo missing. Avoid before/after comparison language.";
    case "hood-after":
      return "After photo missing. Do not present the job as photo-confirmed completion.";
    case "filter-bank":
      return "Filter bank proof missing. Confirm whether filters/tracks were completed, written only, or not part of this visit.";
    case "access-condition":
      return "Duct/access proof missing. Do not imply concealed path photo coverage.";
    case "rooftop-fan":
      return "Fan proof missing. Confirm fan work was completed, not part of this visit, or blocked.";
    case "grease-containment":
      return "Grease path proof missing. Confirm cleanup/containment status before using price-defense copy.";
    case "service-label":
      return "Service label / notice proof missing. Confirm it was posted, not captured, or not part of this visit.";
  }
}

function isMissingProof(item: Axis1ProofCoverageItem | undefined) {
  return item?.state === "open" || item?.state === "not_captured";
}

function findCoverageItem(
  proofCoverage: Axis1ProofCoverageSummary,
  id: Axis1FieldPhotoSlotId,
) {
  return proofCoverage.items.find((item) => item.id === id);
}

function buildProofCoverageSummary(
  input: Axis1CloseoutEngineInput,
  caseType: Axis1CloseoutCase = "needs_outcome",
): Axis1ProofCoverageSummary {
  const items = axis1FieldPhotoSlots.map((slot): Axis1ProofCoverageItem => {
    const uploaded = input.uploadedFieldPhotos[slot.id];
    const resolution = input.photoSlotResolutions[slot.id] ?? "open";
    const state: Axis1ProofCoverageState = uploaded
      ? "captured"
      : resolution === "not-captured"
        ? "not_captured"
        : resolution === "not-applicable"
          ? "not_applicable"
          : "open";

    return {
      id: slot.id,
      label: slot.label,
      state,
      required: slot.required,
      proofId: slot.proofId,
      customerCopy: proofAreaCustomerCopy(slot.id, state),
      vendorReviewCopy: proofAreaVendorReviewCopy(slot.id, state),
    };
  });
  const capturedCount = items.filter((item) => item.state === "captured").length;
  const recommendedCount = items.length;
  const requiredOpenCount = items.filter(
    (item) => item.required && item.state === "open",
  ).length;
  const totalAttached =
    capturedCount + input.unplacedPhotoCount;
  const label =
    totalAttached === 0
      ? caseType === "access_exception"
        ? "Written access record"
        : caseType === "condition_review"
          ? "Written condition record"
          : "Written service record"
      : `${capturedCount} photo area${capturedCount === 1 ? "" : "s"} attached`;
  const shortLabel =
    totalAttached === 0
      ? caseType === "access_exception"
        ? "Access record"
        : caseType === "condition_review"
          ? "Condition record"
          : "Written record"
      : `${capturedCount} photo${capturedCount === 1 ? "" : "s"}`;

  return {
    capturedCount,
    recommendedCount,
    requiredOpenCount,
    label,
    shortLabel,
    items,
  };
}

function buildRecordFormat(
  input: Axis1CloseoutEngineInput,
  caseType: Axis1CloseoutCase,
): Axis1CloseoutRecordFormat {
  const photoCoverage = summarizeAxis1PhotoCoverage(
    input.uploadedFieldPhotos,
    input.photoSlotResolutions,
    input.unplacedPhotoCount,
  );
  const type = selectAxis1RecordType({
    coverage: photoCoverage,
    hasAccessIssue: caseType === "access_exception",
  });
  const meta = axis1RecordTypeMeta[type];
  const reason =
    caseType === "needs_outcome"
      ? "Result selection is required before the final output format is used."
      : type === "access_issue_record"
        ? "The selected result includes a blocked or inaccessible area, so the customer action stays primary."
      : type === "service_closeout_record"
          ? "The visit is documented as a written closeout record."
          : type === "after_cleaning_record"
            ? "After-cleaning photos are attached without a reliable before-photo comparison."
            : type === "photo_proof_packet"
              ? "Before/after and multiple supporting photo areas are represented."
              : "Attached photos show only part of the service record, so missing areas stay separate.";

  return {
    type,
    label: meta.label,
    builderTitle: meta.builderTitle,
    builderCopy: meta.builderCopy,
    customerCopy: meta.customerCopy,
    recordBasis: meta.recordBasis,
    reason,
  };
}

function buildCta(options: {
  kind: Axis1CloseoutCtaKind;
  label: string;
  priority: Axis1CloseoutCtaPriority;
  href?: string;
  enabled?: boolean;
  reason?: string;
}): Axis1CloseoutCta {
  const href = options.href?.trim();
  const enabled = options.enabled ?? Boolean(href);

  return {
    kind: options.kind,
    label: options.label,
    href: href || undefined,
    priority: options.priority,
    enabled,
    reason:
      options.reason ??
      (enabled ? undefined : "Use the company phone or reply email shown on the service report."),
  };
}

function deriveOutcomeType(caseType: Axis1CloseoutCase): Axis1OutcomeType | null {
  if (caseType === "clean_closeout") {
    return "clean";
  }

  if (caseType === "access_exception") {
    return "blocked_access";
  }

  if (caseType === "condition_review") {
    return "condition_review";
  }

  return null;
}

function buildCloseoutCtas(options: {
  caseType: Axis1CloseoutCase;
  links?: Axis1CloseoutLinks;
  acknowledgement?: Axis1Acknowledgement;
  followUpMode?: Axis1BuilderFollowUpMode;
}): Axis1CloseoutCta[] {
  const links = options.links ?? {};
  const pdfCta = buildCta({
    kind: "download_pdf",
    label: "Download PDF copy",
    href: links.pdfHref,
    priority: "utility",
    enabled: true,
    reason: "The PDF copy is the archive, submission, or print copy.",
  });

  if (options.caseType === "clean_closeout") {
    return [
      buildCta({
        kind: "confirm_next_service",
        label: "Confirm next service",
        href: links.nextServiceRequestUrl ?? links.replyUrl,
        priority: "primary",
      }),
      pdfCta,
    ];
  }

  if (options.caseType === "access_exception") {
    return [
      buildCta({
        kind: "reply_after_clearing_access",
        label: "Reply after clearing access",
        href: links.replyUrl,
        priority: "primary",
      }),
      buildCta({
        kind: "request_revisit",
        label: "Schedule revisit after access is clear",
        href: links.nextServiceRequestUrl ?? links.replyUrl,
        priority: "secondary",
      }),
      pdfCta,
    ];
  }

  if (options.caseType === "condition_review") {
    if (options.followUpMode === "monitor") {
      return [
        buildCta({
          kind: "confirm_next_service",
          label: "Confirm next service",
          href: links.nextServiceRequestUrl ?? links.replyUrl,
          priority: "primary",
        }),
        buildCta({
          kind: "reply_with_questions",
          label: "Reply if condition changes",
          href: links.replyUrl,
          priority: "secondary",
        }),
        pdfCta,
      ];
    }

    if (options.followUpMode === "none") {
      return [
        buildCta({
          kind: "confirm_received",
          label: "Confirm received",
          href: links.replyUrl,
          priority: "primary",
        }),
        buildCta({
          kind: "confirm_next_service",
          label: "Confirm next service",
          href: links.nextServiceRequestUrl ?? links.replyUrl,
          priority: "secondary",
        }),
        pdfCta,
      ];
    }

    return [
      buildCta({
        kind: "request_quote",
        label: "Request follow-up quote",
        href: links.followUpQuoteUrl ?? links.replyUrl,
        priority: "primary",
      }),
      buildCta({
        kind: "confirm_next_service",
        label: "Confirm next service",
        href: links.nextServiceRequestUrl ?? links.replyUrl,
        priority: "secondary",
      }),
      pdfCta,
    ];
  }

  return [
    buildCta({
      kind: "confirm_received",
      label: options.acknowledgement?.label ?? "Confirm received",
      href: links.replyUrl,
      priority: "primary",
      enabled: options.acknowledgement?.enabled ?? Boolean(links.replyUrl),
    }),
    buildCta({
      kind: "reply_with_questions",
      label: "Reply with questions",
      href: links.replyUrl,
      priority: "secondary",
    }),
    pdfCta,
  ];
}

function buildVendorWarning(options: {
  kind: Axis1VendorSendReadinessWarningKind;
  severity: Axis1VendorSendReadinessSeverity;
  title: string;
  copy: string;
  customerCopy: string;
  proofAreaId?: Axis1FieldPhotoSlotId;
}): Axis1VendorSendReadinessWarning {
  return options;
}

function buildVendorSendReadinessWarnings(options: {
  caseType: Axis1CloseoutCase;
  evidenceBasis: Axis1CloseoutEvidenceBasis;
  proofCoverage: Axis1ProofCoverageSummary;
  canUsePhotoProofLanguage: boolean;
  areaSummary?: Axis1AreaLedgerStateSummary;
}): Axis1VendorSendReadinessWarning[] {
  const warnings: Axis1VendorSendReadinessWarning[] = [];
  const before = findCoverageItem(options.proofCoverage, "hood-before");
  const after = findCoverageItem(options.proofCoverage, "hood-after");
  const access = findCoverageItem(options.proofCoverage, "access-condition");
  const fan = findCoverageItem(options.proofCoverage, "rooftop-fan");
  const label = findCoverageItem(options.proofCoverage, "service-label");
  const shouldWarnForSlot = (slotId: Axis1FieldPhotoSlotId) =>
    shouldWarnForMissingProofSlot(slotId, options.areaSummary);

  if (options.caseType === "needs_outcome") {
    return [
      buildVendorWarning({
        kind: "result_required",
        severity: "blocker",
        title: "Result required",
        copy:
          "Pick the service result before Axis 1 generates the customer report link, PDF, follow-up, revisit, or next-service output.",
        customerCopy:
          "No customer-facing service result is generated until the service result is selected.",
      }),
    ];
  }

  if (options.evidenceBasis === "no_photos") {
    warnings.push(
      buildVendorWarning({
        kind: "no_photos",
        severity: "review",
        title: "Written record only",
        copy:
          "No field photos attached. This will generate a written service record, not photo-supported completion language.",
        customerCopy: "Written service record; no field photos attached.",
      }),
    );
  } else if (options.evidenceBasis === "partial_photos") {
    warnings.push(
      buildVendorWarning({
        kind: "partial_photo_set",
        severity: "review",
        title: "Partial photo set",
        copy:
          "Attached photos support only the areas shown. Keep missing-photo and service-note language visible.",
        customerCopy:
          "Attached photos represent only the areas shown in this record.",
      }),
    );
  }

  if (shouldWarnForSlot("hood-before") && isMissingProof(before)) {
    warnings.push(
      buildVendorWarning({
        kind: "missing_before_photo",
        severity: "review",
        title: "Before photo missing",
        copy: before?.vendorReviewCopy ?? "Before photo missing.",
        customerCopy:
          before?.customerCopy ?? "Before hood photo is not attached to this record.",
        proofAreaId: "hood-before",
      }),
    );
  }

  if (shouldWarnForSlot("hood-after") && isMissingProof(after)) {
    warnings.push(
      buildVendorWarning({
        kind: "missing_after_photo",
        severity: "review",
        title: "After photo missing",
        copy: after?.vendorReviewCopy ?? "After photo missing.",
        customerCopy:
          after?.customerCopy ?? "After hood photo is not attached to this record.",
        proofAreaId: "hood-after",
      }),
    );
  }

  if (
    options.caseType === "clean_closeout" &&
    shouldWarnForSlot("access-condition") &&
    isMissingProof(access)
  ) {
    warnings.push(
      buildVendorWarning({
        kind: "missing_duct_access_photo",
        severity: "review",
        title: "Duct/access proof missing",
        copy:
          access?.vendorReviewCopy ??
          "Duct/access proof missing. Do not imply concealed path photo coverage.",
        customerCopy:
          access?.customerCopy ??
          "Duct/access coverage is recorded by service note only.",
        proofAreaId: "access-condition",
      }),
    );
  }

  if (
    options.caseType === "clean_closeout" &&
    shouldWarnForSlot("rooftop-fan") &&
    isMissingProof(fan)
  ) {
    warnings.push(
      buildVendorWarning({
        kind: "missing_fan_photo",
        severity: "review",
        title: "Fan proof missing",
        copy:
          fan?.vendorReviewCopy ??
          "Fan proof missing. Confirm fan work was completed, not part of this visit, or blocked.",
        customerCopy:
          fan?.customerCopy ??
          "Rooftop fan photo is not attached to this record.",
        proofAreaId: "rooftop-fan",
      }),
    );
  }

  if (
    options.caseType === "access_exception" &&
    shouldWarnForSlot("access-condition") &&
    isMissingProof(access)
  ) {
    warnings.push(
      buildVendorWarning({
        kind: "blocked_access_written_only",
        severity: "review",
        title: "Blocked access written only",
        copy: "Blocked access is written only. Add a photo if one is available.",
        customerCopy: "Access remained blocked per service record.",
        proofAreaId: "access-condition",
      }),
    );
  }

  if (
    options.caseType === "condition_review" &&
    options.evidenceBasis === "no_photos"
  ) {
    warnings.push(
      buildVendorWarning({
        kind: "condition_record_written_only",
        severity: "review",
        title: "Condition record written only",
        copy:
          "Condition review is written only. Confirm the note should be customer-visible without a photo.",
        customerCopy:
          "Recorded condition is documented by service note only.",
      }),
    );
  }

  if (shouldWarnForSlot("service-label") && isMissingProof(label)) {
    warnings.push(
      buildVendorWarning({
        kind: "service_label_missing",
        severity: "note",
        title: "Service label / notice photo missing",
        copy:
          label?.vendorReviewCopy ??
          "Service label / notice proof missing. Confirm it was posted, not captured, or not part of this visit.",
        customerCopy:
          label?.customerCopy ??
          "Service label / notice photo is not attached to this record.",
        proofAreaId: "service-label",
      }),
    );
  }

  if (options.canUsePhotoProofLanguage) {
    return warnings.filter(
      (warning) =>
        warning.kind !== "missing_before_photo" &&
        warning.kind !== "missing_after_photo",
    );
  }

  return warnings;
}

function areaForProofSlot(slotId: Axis1FieldPhotoSlotId): Axis1CloseoutAreaId {
  switch (slotId) {
    case "hood-before":
    case "hood-after":
    case "filter-bank":
      return "hood_filters";
    case "access-condition":
      return "duct_access";
    case "rooftop-fan":
      return "rooftop_fan";
    case "grease-containment":
      return "grease_path";
    case "service-label":
      return "label_notice";
  }
}

function shouldWarnForMissingProofSlot(
  slotId: Axis1FieldPhotoSlotId,
  areaSummary?: Axis1AreaLedgerStateSummary,
) {
  if (!areaSummary) {
    return true;
  }

  const area = areaSummary.areaCoverageLedger.find(
    (item) => item.area === areaForProofSlot(slotId),
  );

  if (!area) {
    return true;
  }

  if (!area.customerVisible || area.state === "separate_not_this_visit") {
    return false;
  }

  if (area.state === "condition_noted") {
    return false;
  }

  return area.state !== "blocked_no_access" || slotId === "access-condition";
}

function buildGeneratedOutput(options: {
  kind: Axis1GeneratedOutputKind;
  label: string;
  readiness: Axis1GeneratedOutputReadiness;
  reason?: string;
  copy?: string;
  ctaKind?: Axis1CloseoutCtaKind;
}): Axis1GeneratedOutput {
  return options;
}

type Axis1GeneratedOutputTruthOverride = Partial<
  Record<
    Axis1GeneratedOutputKind,
    Pick<Axis1JobTruthOutput, "readiness" | "reason" | "statementIds">
  >
>;

function generatedOutputKindForTruthKind(
  kind: Axis1JobTruthOutputKind,
): Axis1GeneratedOutputKind {
  switch (kind) {
    case "customer_link":
      return "customer_link";
    case "evidence_pdf":
      return "evidence_pdf";
    case "quote_followup":
      return "follow_up_quote_copy";
    case "revisit_message":
      return "revisit_copy";
    case "next_cleaning_reminder":
      return "next_service_copy";
  }
}

function mapJobTruthOutputReadiness(
  outputs: readonly Axis1JobTruthOutput[],
): Axis1GeneratedOutputTruthOverride {
  return outputs.reduce<Axis1GeneratedOutputTruthOverride>((accumulator, output) => {
    accumulator[generatedOutputKindForTruthKind(output.kind)] = {
      readiness: output.readiness,
      reason: output.reason,
      statementIds: output.statementIds,
    };
    return accumulator;
  }, {});
}

function truthDrivenOutput(options: {
  truthOverrides?: Axis1GeneratedOutputTruthOverride;
  output: Axis1GeneratedOutput;
}): Axis1GeneratedOutput {
  const truth = options.truthOverrides?.[options.output.kind];

  if (!truth) {
    return options.output;
  }

  return {
    ...options.output,
    readiness: truth.readiness,
    reason: truth.reason ?? options.output.reason,
  };
}

type Axis1AreaLedgerStateSummary = {
  areaCoverageLedger: Axis1CloseoutAreaLedgerItem[];
  blockedOrIncompleteAreas: Axis1CloseoutAreaLedgerItem[];
  conditionAreas: Axis1CloseoutAreaLedgerItem[];
  notesOnlyCompletedAreas: Axis1CloseoutAreaLedgerItem[];
  photoSupportedAreas: Axis1CloseoutAreaLedgerItem[];
  unclearAreas: Axis1CloseoutAreaLedgerItem[];
};

function isCustomerRelevantArea(item: Axis1CloseoutAreaLedgerItem) {
  return item.customerVisible && item.state !== "separate_not_this_visit";
}

function summarizeAreaLedger(
  areaCoverageLedger: Axis1CloseoutAreaLedgerItem[],
  options: { notesOnlyCompletedIsWeak?: boolean } = {},
): Axis1AreaLedgerStateSummary {
  const customerRelevantAreas = areaCoverageLedger.filter(isCustomerRelevantArea);

  return {
    areaCoverageLedger,
    blockedOrIncompleteAreas: customerRelevantAreas.filter(
      (item) => item.state === "blocked_no_access" || item.state === "not_completed",
    ),
    conditionAreas: customerRelevantAreas.filter(
      (item) => item.state === "condition_noted",
    ),
    notesOnlyCompletedAreas: options.notesOnlyCompletedIsWeak
      ? customerRelevantAreas.filter((item) => item.state === "completed_from_notes")
      : [],
    photoSupportedAreas: customerRelevantAreas.filter(
      (item) => item.state === "completed_with_photo",
    ),
    unclearAreas: customerRelevantAreas.filter(
      (item) => item.state === "unclear_needs_review",
    ),
  };
}

function formatAreaList(areas: readonly Axis1CloseoutAreaLedgerItem[]) {
  if (areas.length === 0) {
    return "";
  }

  if (areas.length === 1) {
    return areas[0].label;
  }

  return areas.map((area) => area.label).join(", ");
}

function sentenceForAreaList(
  prefix: string,
  areas: readonly Axis1CloseoutAreaLedgerItem[],
) {
  const areaList = formatAreaList(areas);

  return areaList ? `${prefix}: ${areaList}.` : "";
}

function buildGeneratedOutputs(options: {
  caseType: Axis1CloseoutCase;
  evidenceBasis: Axis1CloseoutEvidenceBasis;
  claimLevel: Axis1CloseoutClaimLevel;
  followUpMode: Axis1BuilderFollowUpMode;
  customerActionCopy: string;
  claimLimitCopy: string;
  vendorWarnings: readonly Axis1VendorSendReadinessWarning[];
  areaSummary: Axis1AreaLedgerStateSummary;
  truthOverrides?: Axis1GeneratedOutputTruthOverride;
}): Axis1GeneratedOutput[] {
  const resultMissing = options.caseType === "needs_outcome";
  const hasReviewWarnings = options.vendorWarnings.some(
    (warning) => warning.severity !== "note",
  );
  const hasBlockedOrIncompleteAreas =
    options.areaSummary.blockedOrIncompleteAreas.length > 0;
  const hasConditionAreas = options.areaSummary.conditionAreas.length > 0;
  const hasUnclearAreas = options.areaSummary.unclearAreas.length > 0;
  const blockedAccessAreas = options.areaSummary.blockedOrIncompleteAreas.filter(
    (area) => area.state === "blocked_no_access",
  );
  const incompleteAreas = options.areaSummary.blockedOrIncompleteAreas.filter(
    (area) => area.state === "not_completed",
  );
  const blockedAreaList = formatAreaList(options.areaSummary.blockedOrIncompleteAreas);
  const blockedAccessAreaList = formatAreaList(blockedAccessAreas);
  const incompleteAreaList = formatAreaList(incompleteAreas);
  const conditionAreaList = formatAreaList(options.areaSummary.conditionAreas);
  const outputBlockReason =
    "Select the service result before outputs are created.";
  const nextServiceReviewReason =
    blockedAccessAreas.length > 0 && incompleteAreas.length > 0
      ? `Clear blocked/no-access areas and review incomplete areas before normal rebook language is used: ${blockedAreaList}.`
      : blockedAccessAreas.length > 0
        ? `Clear blocked/no-access area before normal rebook language is used: ${blockedAccessAreaList}.`
        : incompleteAreas.length > 0
          ? `Review incomplete area before normal rebook language is used: ${incompleteAreaList}.`
          : null;
  const areaEvidenceSummary = [
    sentenceForAreaList("Photo-supported completed areas", options.areaSummary.photoSupportedAreas),
    sentenceForAreaList("Written completed areas", options.areaSummary.notesOnlyCompletedAreas),
    sentenceForAreaList("Blocked/no-access areas", blockedAccessAreas),
    sentenceForAreaList("Not-completed areas", incompleteAreas),
    sentenceForAreaList("Condition areas", options.areaSummary.conditionAreas),
    sentenceForAreaList("Unclear areas", options.areaSummary.unclearAreas),
  ]
    .filter(Boolean)
    .join(" ");
  const customerOutputCopy =
    areaEvidenceSummary ||
      "Service report link is generated from the selected result, record basis, and next action.";
  const quoteCopy = hasConditionAreas
    ? `${conditionAreaList} was recorded as a condition area, separate from the completed cleaning closeout. Use this note for quote follow-up before adding separate corrective work.`
    : undefined;
  const revisitCopy = hasBlockedOrIncompleteAreas
    ? [
          blockedAccessAreaList
          ? `Access needs to be cleared for ${blockedAccessAreaList} before a completion revisit.`
          : "",
        incompleteAreaList
          ? `Completion needs review for ${incompleteAreaList} before it is represented as completed.`
          : "",
        "Completed areas stay separate from this action item.",
      ]
        .filter(Boolean)
        .join(" ")
    : undefined;
  const nextServiceCopy =
    hasBlockedOrIncompleteAreas || hasUnclearAreas
      ? [
          nextServiceReviewReason ??
            `Review unclear area status before normal rebook language is used: ${formatAreaList(options.areaSummary.unclearAreas)}.`,
          "Hold the normal next-cleaning reminder until the unresolved area is cleared or explicitly left separate.",
        ].join(" ")
      : options.customerActionCopy;

  if (resultMissing) {
    return [
      buildGeneratedOutput({
        kind: "customer_link",
    label: "Service report link",
        readiness: "needs_review",
        reason: outputBlockReason,
      }),
      buildGeneratedOutput({
        kind: "evidence_pdf",
        label: "PDF copy",
        readiness: "needs_review",
        reason: outputBlockReason,
      }),
      buildGeneratedOutput({
        kind: "follow_up_quote_copy",
        label: "Follow-up quote copy",
        readiness: "not_applicable",
        reason: outputBlockReason,
      }),
      buildGeneratedOutput({
        kind: "revisit_copy",
        label: "Revisit copy",
        readiness: "not_applicable",
        reason: outputBlockReason,
      }),
      buildGeneratedOutput({
        kind: "next_service_copy",
        label: "Next-service copy",
        readiness: "not_applicable",
        reason: outputBlockReason,
      }),
      buildGeneratedOutput({
        kind: "internal_risk_summary",
        label: "Vendor send check",
        readiness: "needs_review",
        reason: outputBlockReason,
      }),
    ].map((output) =>
      truthDrivenOutput({
        truthOverrides: options.truthOverrides,
        output,
      }),
    );
  }

  return [
    buildGeneratedOutput({
      kind: "customer_link",
    label: "Service report link",
      readiness: "ready",
      reason:
        "Generated from the vendor-confirmed result, record basis, proof coverage, and next action.",
      copy: customerOutputCopy,
    }),
    buildGeneratedOutput({
      kind: "evidence_pdf",
      label: "PDF copy",
      readiness: "ready",
      reason:
    "Uses the same service record as the service report link in a retained document layout.",
      copy: areaEvidenceSummary
        ? `${areaEvidenceSummary} ${options.claimLimitCopy}`
        : options.claimLimitCopy,
      ctaKind: "download_pdf",
    }),
    buildGeneratedOutput({
      kind: "follow_up_quote_copy",
      label: "Follow-up quote copy",
      readiness:
        hasConditionAreas && options.followUpMode === "quote"
          ? "ready"
          : hasConditionAreas
            ? "needs_review"
            : "not_applicable",
      reason:
        hasConditionAreas && options.followUpMode === "quote"
          ? `Condition area ready for quote follow-up: ${conditionAreaList}.`
          : hasConditionAreas
            ? `Condition area recorded, but quote follow-up is not the selected action: ${conditionAreaList}.`
            : "No quote follow-up is needed for this selected result.",
      copy: quoteCopy,
      ctaKind: "send_follow_up_quote",
    }),
    buildGeneratedOutput({
      kind: "revisit_copy",
      label: "Revisit copy",
      readiness: hasBlockedOrIncompleteAreas ? "ready" : "not_applicable",
      reason: hasBlockedOrIncompleteAreas
        ? `Blocked or incomplete area selected; revisit copy can be generated for ${blockedAreaList}.`
        : "No blocked or inaccessible revisit is selected.",
      copy: revisitCopy,
      ctaKind: "request_revisit",
    }),
    buildGeneratedOutput({
      kind: "next_service_copy",
      label: "Next-service copy",
      readiness: hasBlockedOrIncompleteAreas || hasUnclearAreas ? "needs_review" : "ready",
      reason: hasBlockedOrIncompleteAreas
        ? nextServiceReviewReason ?? "Review incomplete area status before normal rebook language is used."
        : hasUnclearAreas
          ? `Review unclear area status before normal rebook language is used: ${formatAreaList(options.areaSummary.unclearAreas)}.`
        : "Next service copy follows the selected cadence and customer action.",
      copy: nextServiceCopy,
      ctaKind: "confirm_next_service",
    }),
    buildGeneratedOutput({
      kind: "internal_risk_summary",
      label: "Vendor send check",
      readiness: hasReviewWarnings || hasUnclearAreas ? "needs_review" : "ready",
      reason: hasReviewWarnings || hasUnclearAreas
        ? `${options.vendorWarnings.length} send check(s) remain before using this as a completed record.`
        : "No private send check for the current result and proof basis.",
      copy:
        options.vendorWarnings[0]?.copy ??
        "Result, proof coverage, and customer action are aligned.",
      ctaKind: "mark_customer_action_needed",
    }),
  ].map((output) =>
    truthDrivenOutput({
      truthOverrides: options.truthOverrides,
      output,
    }),
  );
}

function buildCoverageEducation(
  result: Pick<
    Axis1CloseoutEngineResult,
    | "caseType"
    | "recordFormat"
    | "proofCoverage"
    | "evidenceBasis"
    | "responsibilityCopy"
  >,
): Axis1CoverageEducation {
  const title = "What this service covered";
  const proofBoundary =
    result.evidenceBasis === "no_photos"
      ? "This record is based on written service notes, so photos are not implied."
      : result.evidenceBasis === "partial_photos"
        ? "Only the attached field photos are represented as areas shown in photos."
        : "Before/after and supporting field photos are represented only for the areas shown.";
  const baseItems: Axis1CoverageEducationItem[] = [
    {
      label: "Hood canopy and filters",
      copy:
        "The record covers the hood body, filter bank, and nearby grease collection points that were reachable during this visit.",
      state: "covered",
    },
    {
      label: "Reachable plenum and duct path",
      copy:
        "The service path follows the reachable exhaust line instead of stopping at the visible hood face.",
      state: "covered",
    },
    {
      label: "Fan, roof discharge, and grease path",
      copy:
        "Visible fan, roof discharge, and grease-path conditions stay in the record for service history and follow-up conversations.",
      state: "recorded",
    },
  ];

  if (result.caseType === "access_exception") {
    return {
      title,
      summary:
        "Completed work and blocked access stay separated, so the customer can see what was reachable and what still needs action.",
      items: [
        ...baseItems,
        {
          label: "Blocked or inaccessible area",
          copy:
            "The blocked area is not presented as cleaned. It stays listed until access is cleared and a revisit or later service closes it.",
          state: "action_required",
        },
      ],
      boundaryCopy: `${result.recordFormat.label}. ${result.proofCoverage.label}. ${proofBoundary} ${result.responsibilityCopy}`,
    };
  }

  if (result.caseType === "condition_review") {
    return {
      title,
      summary:
        "The service was closed with a recorded condition, keeping the follow-up path visible without expanding completed-work wording.",
      items: [
        ...baseItems,
        {
          label: "Recorded condition",
          copy:
            "The condition is visible for quote or monitoring decisions, but this record does not present it as completed follow-up work.",
          state: "recorded",
        },
      ],
      boundaryCopy: `${result.recordFormat.label}. ${result.proofCoverage.label}. ${proofBoundary} ${result.responsibilityCopy}`,
    };
  }

  if (result.caseType === "needs_outcome") {
    return {
      title,
      summary:
        "Coverage language is held until the crew selects what happened during the visit.",
      items: [
        {
          label: "Result required",
          copy:
            "Pick the service result before outputs describe completed work, open access, or recorded conditions.",
          state: "not_claimed",
        },
      ],
      boundaryCopy:
        "No customer-facing coverage claim is generated until the selected result is available.",
    };
  }

  return {
    title,
    summary:
      result.evidenceBasis === "no_photos"
        ? "The record covers the reachable exhaust path described in service notes and the next action in one clear page."
        : "The record covers the reachable exhaust path, the field photos attached to this visit, and the next action in one clear page.",
    items: baseItems,
    boundaryCopy: `${result.recordFormat.label}. ${result.proofCoverage.label}. ${proofBoundary}`,
  };
}

function buildFallbackAreaLedger(
  proofCoverage: Axis1ProofCoverageSummary,
  caseType: Axis1CloseoutCase,
): Axis1CloseoutAreaLedgerItem[] {
  const coverageById = new Map(proofCoverage.items.map((item) => [item.id, item]));
  const areaDefinitions: Array<{
    area: Axis1CloseoutAreaId;
    label: string;
    slots: Axis1FieldPhotoSlotId[];
  }> = [
    {
      area: "hood_filters",
      label: "Hood / filters",
      slots: ["hood-before", "hood-after", "filter-bank"],
    },
    {
      area: "duct_access",
      label: "Duct / access",
      slots: ["access-condition"],
    },
    {
      area: "rooftop_fan",
      label: "Rooftop fan",
      slots: ["rooftop-fan"],
    },
    {
      area: "grease_path",
      label: "Grease path / containment",
      slots: ["grease-containment"],
    },
    {
      area: "label_notice",
      label: "Label / notice",
      slots: ["service-label"],
    },
  ];

  return areaDefinitions.map((definition) => {
    const matchingItems = definition.slots.flatMap((slotId) => {
      const item = coverageById.get(slotId);
      return item ? [item] : [];
    });
    const photoCount = matchingItems.filter((item) => item.state === "captured").length;
    const hasOpenProof =
      caseType === "needs_outcome" &&
      matchingItems.some((item) => item.state === "open");
    const inferredState: Axis1CloseoutAreaState =
      definition.area === "label_notice" && photoCount === 0
        ? "separate_not_this_visit"
        : caseType === "access_exception" && definition.area === "duct_access"
          ? "blocked_no_access"
          : caseType === "condition_review" && definition.area === "rooftop_fan"
            ? "condition_noted"
            : "completed_from_notes";
    const hasCaseSpecificExceptionState =
      inferredState === "blocked_no_access" || inferredState === "condition_noted";
    const state: Axis1CloseoutAreaState = hasCaseSpecificExceptionState
      ? inferredState
      : photoCount > 0
        ? "completed_with_photo"
        : hasOpenProof
          ? "unclear_needs_review"
          : inferredState;

    return {
      area: definition.area,
      label: definition.label,
      state,
      proofBasis:
        photoCount > 0
          ? "photo"
          : hasOpenProof
            ? "unclear"
            : inferredState === "separate_not_this_visit"
              ? "none"
              : "written",
      photoCount,
      customerVisible:
        definition.area !== "label_notice" ||
        photoCount > 0 ||
        inferredState !== "separate_not_this_visit",
      vendorOnlyReason: hasOpenProof
        ? "Proof status is open until the vendor confirms whether this area was completed, blocked, or outside this visit."
        : undefined,
    };
  });
}

function jobTruthAreaForPhotoSlot(
  slotId: Axis1FieldPhotoSlotId,
): Axis1CloseoutAreaId {
  switch (slotId) {
    case "hood-before":
    case "hood-after":
    case "filter-bank":
      return "hood_filters";
    case "access-condition":
      return "duct_access";
    case "rooftop-fan":
      return "rooftop_fan";
    case "grease-containment":
      return "grease_path";
    case "service-label":
      return "label_notice";
  }
}

function buildJobTruthPhotoEvidence(options: {
  input: Axis1CloseoutEngineInput;
  proofCoverage: Axis1ProofCoverageSummary;
  areaCoverageLedger: readonly Axis1CloseoutAreaLedgerItem[];
}): Axis1JobTruthPhotoEvidence[] {
  const areaById = new Map(
    options.areaCoverageLedger.map((area) => [area.area, area]),
  );
  const capturedSlotEvidence = options.proofCoverage.items.flatMap((item) => {
    const uploaded = options.input.uploadedFieldPhotos[item.id];

    if (!uploaded || item.state !== "captured") {
      return [];
    }

    const areaId = jobTruthAreaForPhotoSlot(item.id);
    const area = areaById.get(areaId);
    const attachedToCompletedClaim =
      area?.state === "completed_with_photo" && area.proofBasis === "photo";

    return [
      {
        id: item.proofId ?? `slot:${item.id}`,
        area: areaId,
        status: attachedToCompletedClaim
          ? "attached_to_claim"
          : "saved_not_claimed",
        customerVisible: attachedToCompletedClaim,
        reason: attachedToCompletedClaim
          ? "Vendor-confirmed slot photo is attached to this area claim."
          : "Photo is retained in the packet without strengthening a completion claim.",
      } satisfies Axis1JobTruthPhotoEvidence,
    ];
  });
  const extraEvidence = Array.from(
    { length: Math.max(0, options.input.unplacedPhotoCount) },
    (_, index): Axis1JobTruthPhotoEvidence => ({
      id: `extra:${index + 1}`,
      status: "saved_not_claimed",
      customerVisible: false,
      reason: "Extra uploaded photo is saved in the packet without being claimed.",
    }),
  );

  return [...capturedSlotEvidence, ...extraEvidence];
}

function buildJobTruthRecordFromEngine(options: {
  input: Axis1CloseoutEngineInput;
  caseType: Axis1CloseoutCase;
  outcomeType: Axis1OutcomeType | null;
  confirmedByVendor: boolean;
  statusLabel: string;
  proofCoverage: Axis1ProofCoverageSummary;
  areaCoverageLedger: Axis1CloseoutAreaLedgerItem[];
  vendorWarnings: Axis1VendorSendReadinessWarning[];
  customerResultCopy: string;
  customerActionType: Axis1CloseoutCustomerActionType;
  customerActionTitle: string;
  customerActionCopy: string;
  claimLimitCopy: string;
}): Axis1JobTruthRecord {
  const outcomeType = (() => {
    if (!options.confirmedByVendor || options.caseType === "needs_outcome") {
      return "needs_result";
    }

    if (options.outcomeType === "clean") {
      return "completed";
    }

    if (options.outcomeType === "blocked_access") {
      return "blocked_access";
    }

    if (options.outcomeType === "condition_review") {
      return "condition_noted";
    }

    return "partial";
  })();
  const areaLedger: Axis1JobTruthArea[] = options.areaCoverageLedger.map(
    (area) => ({
      area: area.area,
      label: area.label,
      state: area.state,
      proofBasis: area.proofBasis,
      photoCount: area.photoCount,
      customerVisible: area.customerVisible,
      vendorConfirmedPhotoSupport:
        area.state === "completed_with_photo" && area.photoCount > 0,
      vendorConfirmedBeforeAfterPair: false,
      vendorOnlyReason: area.vendorOnlyReason,
    }),
  );

  return buildAxis1JobTruthRecord({
    outcome: {
      type: outcomeType,
      confirmedByVendor: options.confirmedByVendor,
      label: options.statusLabel,
    },
    areaLedger,
    photoEvidence: buildJobTruthPhotoEvidence({
      input: options.input,
      proofCoverage: options.proofCoverage,
      areaCoverageLedger: options.areaCoverageLedger,
    }),
    customerSafeSummary: {
      result: options.customerResultCopy,
      action: options.customerActionCopy,
      claimLimit: options.claimLimitCopy,
    },
    vendorOnlyWarnings: options.vendorWarnings.map((warning, index) => ({
      id: `${warning.kind}:${index}`,
      area:
        warning.proofAreaId === "access-condition"
          ? "duct_access"
          : warning.proofAreaId
            ? jobTruthAreaForPhotoSlot(warning.proofAreaId)
            : undefined,
      severity: warning.severity,
      message: warning.copy,
    })),
    nextAction: {
      type: options.customerActionType,
      title: options.customerActionTitle,
      copy: options.customerActionCopy,
    },
  });
}

function buildCloseoutSourceOfTruth(options: {
  input: Axis1CloseoutEngineInput;
  caseType: Axis1CloseoutCase;
  outcomeType: Axis1OutcomeType | null;
  confirmedByVendor: boolean;
  statusLabel: string;
  evidenceBasis: Axis1CloseoutEvidenceBasis;
  claimLevel: Axis1CloseoutClaimLevel;
  proofCoverage: Axis1ProofCoverageSummary;
  areaCoverageLedger: Axis1CloseoutAreaLedgerItem[];
  vendorWarnings: Axis1VendorSendReadinessWarning[];
  generatedOutputs: Axis1GeneratedOutput[];
  customerResultCopy: string;
  customerActionType: Axis1CloseoutCustomerActionType;
  customerActionTitle: string;
  customerActionCopy: string;
  claimLimitCopy: string;
  jobTruthRecord: Axis1JobTruthRecord;
}): Axis1CloseoutSourceOfTruth {
  const photosAttached =
    Object.values(options.input.uploadedFieldPhotos).filter(Boolean).length +
    options.input.unplacedPhotoCount;

  return {
    jobTruthRecord: options.jobTruthRecord,
    jobResult: {
      outcomeType: options.outcomeType,
      caseType: options.caseType,
      confirmedByVendor: options.confirmedByVendor,
      statusLabel: options.statusLabel,
    },
    areaCoverageLedger: options.areaCoverageLedger,
    proofBasis: {
      type: options.evidenceBasis,
      claimLevel: options.claimLevel,
      photosAttached,
      missingProofWarnings: options.vendorWarnings
        .filter((warning) => warning.proofAreaId)
        .map((warning) => warning.copy),
    },
    customerSafeSummary: {
      result: options.customerResultCopy,
      action: options.customerActionCopy,
      claimLimit: options.claimLimitCopy,
    },
    vendorOnlyWarnings: options.vendorWarnings,
    outputReadiness: options.generatedOutputs,
    nextAction: {
      type: options.customerActionType,
      title: options.customerActionTitle,
      copy: options.customerActionCopy,
    },
  };
}

export function evaluateAxis1Closeout(
  input: Axis1CloseoutEngineInput,
): Axis1CloseoutEngineResult {
  const uploadedCount =
    Object.values(input.uploadedFieldPhotos).filter(Boolean).length +
    input.unplacedPhotoCount;
  const requiredCapturedCount = requiredCorePhotoSlots.filter(
    (slot) => input.uploadedFieldPhotos[slot],
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
    const proofCoverage = buildProofCoverageSummary(input);
    const recordFormat = buildRecordFormat(input, "needs_outcome");
    const ctas = buildCloseoutCtas({
      caseType: "needs_outcome",
      links: input.links,
      acknowledgement: input.acknowledgement,
    });
    const areaCoverageLedger =
      input.areaLedger ?? buildFallbackAreaLedger(proofCoverage, "needs_outcome");
    const areaSummary = summarizeAreaLedger(areaCoverageLedger, {
      notesOnlyCompletedIsWeak: Boolean(input.areaLedger),
    });
    const vendorSendReadinessWarnings = buildVendorSendReadinessWarnings({
      caseType: "needs_outcome",
      evidenceBasis,
      proofCoverage,
      canUsePhotoProofLanguage: false,
      areaSummary,
    });
    const warnings = vendorSendReadinessWarnings.map((warning) => warning.copy);
    const jobTruthRecord = buildJobTruthRecordFromEngine({
      input,
      caseType: "needs_outcome",
      outcomeType: null,
      confirmedByVendor: false,
      statusLabel: "Pick result",
      proofCoverage,
      areaCoverageLedger,
      vendorWarnings: vendorSendReadinessWarnings,
      customerResultCopy:
        "No customer-facing result has been generated because the crew has not selected what happened today.",
      customerActionType: "record_only",
      customerActionTitle: "Pick result first",
      customerActionCopy:
        "Select what happened today before the tool writes a customer next action.",
      claimLimitCopy:
        "Do not show completed, blocked, or evidence language until a result is selected.",
    });
    const generatedOutputs = buildGeneratedOutputs({
      caseType: "needs_outcome",
      evidenceBasis,
      claimLevel,
      followUpMode: input.values.followUpMode,
      customerActionCopy:
        "Select what happened today before the tool writes a customer next action.",
      claimLimitCopy:
        "Do not show completed, blocked, or evidence language until a result is selected.",
      vendorWarnings: vendorSendReadinessWarnings,
      areaSummary,
      truthOverrides: mapJobTruthOutputReadiness(jobTruthRecord.outputReadiness),
    });
    const coverageEducation = buildCoverageEducation({
      caseType: "needs_outcome",
      recordFormat,
      proofCoverage,
      evidenceBasis,
      responsibilityCopy:
        "No responsibility boundary can be shown until the visit outcome is selected.",
    });
    const sourceOfTruth = buildCloseoutSourceOfTruth({
      input,
      caseType: "needs_outcome",
      outcomeType: null,
      confirmedByVendor: false,
      statusLabel: "Pick result",
      evidenceBasis,
      claimLevel,
      proofCoverage,
      areaCoverageLedger,
      vendorWarnings: vendorSendReadinessWarnings,
      generatedOutputs,
      customerResultCopy:
        "No customer-facing result has been generated because the crew has not selected what happened today.",
      customerActionType: "record_only",
      customerActionTitle: "Pick result first",
      customerActionCopy:
        "Select what happened today before the tool writes a customer next action.",
      claimLimitCopy:
        "Do not show completed, blocked, or evidence language until a result is selected.",
      jobTruthRecord,
    });

    return {
      caseType: "needs_outcome",
      outcomeType: null,
      canGeneratePacket: false,
      canUsePhotoProofLanguage: false,
      evidenceBasis,
      claimLevel,
      recordFormat,
      proofCoverage,
      coverageEducation,
      ctas,
      primaryCta: ctas.find((cta) => cta.priority === "primary") ?? null,
      generatedOutputs,
      vendorSendReadinessWarnings,
      primaryStatusLabel: "Pick result",
      basisLabel:
        evidenceBasis === "no_photos"
          ? "Written record"
          : "Photos waiting for result",
      customerResultCopy:
        "No customer-facing result has been generated because the crew has not selected what happened today.",
      customerActionType: "record_only",
      customerActionTitle: "Pick result first",
      customerActionCopy:
        "Select what happened today before the tool writes a customer next action.",
      responsibilityCopy:
        "No responsibility boundary can be shown until the visit outcome is selected.",
      evidenceCopy:
        "The tool is waiting for a selected service outcome before it can describe the record basis.",
      claimLimitCopy:
        "Do not show completed, blocked, or evidence language until a result is selected.",
      blockingReason: "Select today's service result before generating a link or PDF.",
      warnings,
      sourceOfTruth,
    };
  }

  const hasAccessException =
    input.values.scenario === "exception" &&
    input.values.exceptionKinds.some((kind) =>
      accessExceptionKinds.includes(kind as (typeof accessExceptionKinds)[number]),
    );
  const selectedAccessKinds = input.values.exceptionKinds.filter(
    (kind): kind is (typeof accessExceptionKinds)[number] =>
      accessExceptionKinds.includes(kind as (typeof accessExceptionKinds)[number]),
  );
  const selectedConditionKinds = input.values.exceptionKinds.filter((kind) =>
    conditionExceptionKinds.includes(kind as (typeof conditionExceptionKinds)[number]),
  );
  const caseType: Axis1CloseoutCase =
    input.values.scenario === "clean"
      ? "clean_closeout"
        : hasAccessException
        ? "access_exception"
        : "condition_review";
  const proofCoverage = buildProofCoverageSummary(input, caseType);
  const recordFormat = buildRecordFormat(input, caseType);
  const ctas = buildCloseoutCtas({
    caseType,
    links: input.links,
    acknowledgement: input.acknowledgement,
    followUpMode: input.values.followUpMode,
  });
  const issuePolicy = buildCustomerActionPolicy({
    caseType,
    links: input.links,
    followUpMode: input.values.followUpMode,
    selectedAccessKinds,
    selectedConditionKinds,
  });
  const customerResultCopy =
    buildManualCustomerCopy(input.values.summaryOverride) ??
    buildCustomerResultCopy(caseType, evidenceBasis);
  const customerActionCopy =
    buildManualCustomerCopy(input.values.customerActionOverride) ??
    issuePolicy.actionCopy;
  const claimLimitCopy = buildClaimLimitCopy(caseType, evidenceBasis);
  const areaCoverageLedger = input.areaLedger ?? buildFallbackAreaLedger(proofCoverage, caseType);
  const areaSummary = summarizeAreaLedger(areaCoverageLedger, {
    notesOnlyCompletedIsWeak: Boolean(input.areaLedger),
  });
  const vendorSendReadinessWarnings = buildVendorSendReadinessWarnings({
    caseType,
    evidenceBasis,
    proofCoverage,
    canUsePhotoProofLanguage,
    areaSummary,
  });
  const warnings = vendorSendReadinessWarnings.map((warning) => warning.copy);
  const outcomeType = deriveOutcomeType(caseType);
  const primaryStatusLabel =
    caseType === "clean_closeout"
      ? "Closed"
      : caseType === "access_exception"
        ? "Action needed"
        : "Review item";
  const jobTruthRecord = buildJobTruthRecordFromEngine({
    input,
    caseType,
    outcomeType,
    confirmedByVendor: true,
    statusLabel: primaryStatusLabel,
    proofCoverage,
    areaCoverageLedger,
    vendorWarnings: vendorSendReadinessWarnings,
    customerResultCopy,
    customerActionType: issuePolicy.actionType,
    customerActionTitle: issuePolicy.actionTitle,
    customerActionCopy,
    claimLimitCopy,
  });
  const generatedOutputs = buildGeneratedOutputs({
    caseType,
    evidenceBasis,
    claimLevel,
    followUpMode: input.values.followUpMode,
    customerActionCopy,
    claimLimitCopy,
    vendorWarnings: vendorSendReadinessWarnings,
    areaSummary,
    truthOverrides: mapJobTruthOutputReadiness(jobTruthRecord.outputReadiness),
  });
  const coverageEducation = buildCoverageEducation({
    caseType,
    recordFormat,
    proofCoverage,
    evidenceBasis,
    responsibilityCopy: issuePolicy.responsibilityCopy,
  });
  const sourceOfTruth = buildCloseoutSourceOfTruth({
    input,
    caseType,
    outcomeType,
    confirmedByVendor: true,
    statusLabel: primaryStatusLabel,
    evidenceBasis,
    claimLevel,
    proofCoverage,
    areaCoverageLedger,
    vendorWarnings: vendorSendReadinessWarnings,
    generatedOutputs,
    customerResultCopy,
    customerActionType: issuePolicy.actionType,
    customerActionTitle: issuePolicy.actionTitle,
    customerActionCopy,
    claimLimitCopy,
    jobTruthRecord,
  });

  return {
    caseType,
    outcomeType,
    canGeneratePacket: true,
    canUsePhotoProofLanguage,
    evidenceBasis,
    claimLevel,
    recordFormat,
    proofCoverage,
    coverageEducation,
    ctas,
    primaryCta: ctas.find((cta) => cta.priority === "primary") ?? null,
    generatedOutputs,
    vendorSendReadinessWarnings,
    primaryStatusLabel,
    basisLabel:
      evidenceBasis === "photo_record"
        ? "Photo record"
        : evidenceBasis === "partial_photos"
          ? "Partial photos"
          : "Written record",
    customerResultCopy,
    customerActionType: issuePolicy.actionType,
    customerActionTitle: issuePolicy.actionTitle,
    customerActionCopy,
    responsibilityCopy: issuePolicy.responsibilityCopy,
    evidenceCopy: buildEvidenceCopy(evidenceBasis),
    claimLimitCopy,
    blockingReason: null,
    warnings,
    sourceOfTruth,
  };
}

function buildManualCustomerCopy(value: string | undefined) {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    return null;
  }

  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function buildCustomerActionPolicy(options: {
  caseType: Axis1CloseoutCase;
  links?: Axis1CloseoutLinks;
  followUpMode: Axis1BuilderFollowUpMode;
  selectedAccessKinds: readonly (typeof accessExceptionKinds)[number][];
  selectedConditionKinds: readonly Axis1BuilderExceptionKind[];
}): CloseoutIssuePolicy {
  if (options.caseType === "clean_closeout") {
    return {
      actionType: "confirm_next_service",
      actionTitle: "Confirm next service",
      actionCopy:
        "Keep this service record, then reply to confirm the next service window or request a different date.",
      responsibilityCopy:
        "No blocked or incomplete area is being listed for customer action.",
    };
  }

  const primaryAccessKind = options.selectedAccessKinds[0];
  if (options.caseType === "access_exception" && primaryAccessKind) {
    return accessIssuePolicies[primaryAccessKind];
  }

  if (options.selectedConditionKinds.length > 0) {
    return buildConditionIssuePolicy(options.followUpMode);
  }

  return buildConditionIssuePolicy(options.followUpMode);
}

function buildCustomerResultCopy(
  caseType: Axis1CloseoutCase,
  evidenceBasis: Axis1CloseoutEvidenceBasis,
) {
  if (caseType === "access_exception") {
    return evidenceBasis === "photo_record"
      ? "Reachable work was completed and an access exception remains open. Attached field photos support only the completed areas shown and the recorded access issue."
      : evidenceBasis === "partial_photos"
        ? "Reachable work was completed and an access exception remains open. Attached photos support only the areas shown."
        : "Reachable work was completed and an access exception remains open. This record is based on service notes; photos are not attached to this visit.";
  }

  if (caseType === "condition_review") {
    return evidenceBasis === "photo_record"
      ? "The visit was completed and one condition was noted for follow-up. Attached field photos support the service record."
      : evidenceBasis === "partial_photos"
        ? "The visit was completed and one condition was noted for follow-up. Attached photos support only the areas shown."
        : "The visit was completed and one condition was noted for follow-up. This record is based on service notes; photos are not attached to this visit.";
  }

  return evidenceBasis === "photo_record"
    ? "The accessible kitchen exhaust service path was completed and supported by attached before/after field photos."
    : evidenceBasis === "partial_photos"
      ? "The accessible kitchen exhaust service path was completed. Attached photos support only the areas shown."
      : "The accessible kitchen exhaust service path was completed. This record is based on service notes; photos are not attached to this visit.";
}

function buildEvidenceCopy(evidenceBasis: Axis1CloseoutEvidenceBasis) {
  if (evidenceBasis === "photo_record") {
    return "Before/after core photos are attached, and supporting areas are listed where available.";
  }

  if (evidenceBasis === "partial_photos") {
    return "Attached photos support only the areas shown. Other service areas remain documented by written service notes.";
  }

  return "This record is based on written service notes. Photos are not attached to this visit.";
}

function buildClaimLimitCopy(
  caseType: Axis1CloseoutCase,
  evidenceBasis: Axis1CloseoutEvidenceBasis,
) {
  const proofLimit =
    evidenceBasis === "photo_record"
      ? "Photo coverage is limited to the attached field photos and service areas shown."
      : evidenceBasis === "partial_photos"
        ? "Attached photos support part of the record; areas not photographed stay listed by record basis."
        : "This is a written service record; photo evidence is not attached to this visit.";

  if (caseType === "access_exception") {
    return `${proofLimit} Inaccessible areas are listed separately and are not presented as cleaned.`;
  }

  if (caseType === "clean_closeout") {
    return `${proofLimit} The next-service step stays separate from the completed service result.`;
  }

  return `${proofLimit} Recorded conditions and follow-up paths are separate from this cleaning record.`;
}

function buildPacketHeaderCopy(result: Axis1CloseoutEngineResult) {
  const photoSentence =
    result.evidenceBasis === "photo_record"
      ? "Attached photos support the service areas shown."
      : result.evidenceBasis === "partial_photos"
        ? "Attached photos support only the areas shown."
        : "This is a written service record based on service notes.";

  if (result.caseType === "access_exception") {
    return `Reachable work was completed. The blocked area is listed separately and is not presented as cleaned. ${photoSentence}`;
  }

  if (result.caseType === "condition_review") {
    return `Service was completed. The recorded condition is listed separately for follow-up or next-service planning. ${photoSentence}`;
  }

  return `${result.customerResultCopy} ${photoSentence}`;
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
    .replace(/proof\s+photos P-01 \/ P-02/gi, "the service record")
    .replace(/field photos P-01 \/ P-02/gi, "the service record")
    .replace(/Proof is tied to P-01 and P-02\./g, "Record is tied to the selected service result.")
    .replace(/Linked to proof\s+photos P-01 \/ P-02\./g, "Recorded in the service closeout.")
    .replace(/Linked to field photos P-01 \/ P-02\./g, "Recorded in the service closeout.")
    .replace(/blocked access photo/gi, "recorded access item")
    .replace(/proof\s+photos/gi, "field photos")
    .replace(/proof link/gi, "service record");
}

function buildProofPolicyRows(
  result: Axis1CloseoutEngineResult,
  primaryCtaLabel: string,
): readonly [string, string][] {
  const photoCoverageLabel =
    result.evidenceBasis === "no_photos" ? "Photo status" : "Photo coverage";
  const photoCoverageValue =
    result.evidenceBasis === "no_photos"
      ? "No photos attached"
      : result.proofCoverage.label;
  const seeingCopy =
    result.evidenceBasis === "no_photos"
      ? "This record summarizes the selected service result, written notes, record basis, and next action."
      : result.evidenceBasis === "partial_photos"
        ? "This record shows the selected service result and only the attached field photos. Uncaptured areas stay listed as not captured or record-only."
        : "This record shows the selected service result with attached before/after and supporting field photos.";

  const retainedCopy =
    result.evidenceBasis === "no_photos"
      ? "Vendor job notes and the PDF copy stay available for archive, submission, or print copy."
      : "Raw field photos, technician notes, and the PDF copy stay available for archive, submission, or print copy.";
  const calmCoverageNotes = result.proofCoverage.items
    .filter((item) => item.state !== "captured" && item.state !== "not_applicable")
    .map((item): [string, string] => [item.label, item.customerCopy]);

  return [
    ["What you are seeing", seeingCopy],
    ["What stays in service records", retainedCopy],
    ["Action items", result.responsibilityCopy],
    ["Record type", result.recordFormat.label],
    ["Record source", `${result.recordFormat.recordBasis}. ${result.recordFormat.reason}`],
    ["Evidence note", result.evidenceCopy],
    ["Claim limits", result.claimLimitCopy],
    ["Action boundary", result.responsibilityCopy],
    [photoCoverageLabel, photoCoverageValue],
    [result.coverageEducation.title, result.coverageEducation.summary],
    ["Customer next step", primaryCtaLabel],
    ...calmCoverageNotes,
  ];
}

export function applyAxis1CloseoutEngineToPacket(
  data: Axis1PacketPreviewData,
  result: Axis1CloseoutEngineResult,
): Axis1PacketPreviewData {
  const resultTitle =
    result.caseType === "clean_closeout"
      ? "Completed service record"
      : result.caseType === "access_exception"
        ? "Reachable areas completed"
        : "Completed with recorded condition";

  const proofLabel =
    result.claimLevel === "photo_supported_record"
      ? "Photo service record"
      : result.claimLevel === "partial_photo_record"
        ? "Partial photo record"
        : "Written service record";
  const primaryCta =
    result.primaryCta ?? result.ctas.find((cta) => cta.priority === "primary");
  const primaryCtaLabel = primaryCta?.label ?? result.customerActionTitle;
  const photoCoverageLabel =
    result.evidenceBasis === "no_photos" ? "Photo status" : "Photo coverage";
  const photoCoverageValue =
    result.evidenceBasis === "no_photos"
      ? "No photos attached"
      : result.proofCoverage.label;

  return {
    ...data,
    closeout: {
      outcomeType: result.outcomeType ?? "partial",
      evidenceBasis: result.evidenceBasis,
      claimLevel: result.claimLevel,
      recordFormat: result.recordFormat,
      primaryStatusLabel: result.primaryStatusLabel,
      basisLabel: result.basisLabel,
      customerActionTitle: result.customerActionTitle,
      customerActionCopy: result.customerActionCopy,
      claimLimitCopy: result.claimLimitCopy,
      responsibilityCopy: result.responsibilityCopy,
      warnings: result.warnings,
      generatedOutputs: result.generatedOutputs,
      vendorSendReadinessWarnings: result.vendorSendReadinessWarnings,
      ctas: result.ctas,
      primaryCta: primaryCta ?? undefined,
      proofCoverage: result.proofCoverage,
      coverageEducation: result.coverageEducation,
    },
    packetHeader: {
      ...data.packetHeader,
      copy: buildPacketHeaderCopy(result),
      quickFacts: upsertRows(data.packetHeader.quickFacts, [
        ["Record basis", result.basisLabel],
        ["Record type", result.recordFormat.label],
        ["Record support", proofLabel],
        [photoCoverageLabel, photoCoverageValue],
        [result.coverageEducation.title, result.coverageEducation.summary],
        ["Customer next step", primaryCtaLabel],
      ]),
    },
    summaryCards: data.summaryCards.map((card, index) =>
      index === 0
        ? {
            ...card,
            title: resultTitle,
            copy: result.customerResultCopy,
          }
        : index === 1
          ? {
              ...card,
              title: result.customerActionTitle,
              copy: result.customerActionCopy,
            }
          : card,
    ),
    serviceRecordRows: upsertRows(data.serviceRecordRows, [
      ["Record type", result.recordFormat.label],
      ["Record source", result.recordFormat.recordBasis],
      ["Evidence note", result.evidenceCopy],
      ["Claim limits", result.claimLimitCopy],
      [photoCoverageLabel, photoCoverageValue],
      [result.coverageEducation.title, result.coverageEducation.summary],
      ["Customer next step", primaryCtaLabel],
    ]),
    proofPolicyRows: buildProofPolicyRows(result, primaryCtaLabel),
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
      proof: result.evidenceBasis === "no_photos" ? "Service record" : row.proof,
      note: replacePhotoProofLanguage(row.note, result),
    })),
    photoCoverageRows: result.proofCoverage.items.map((item) => ({
      item: item.label,
      proof: item.proofId ?? "Service record",
      status: proofCoverageStateLabel(item.state),
    })),
    customerClose: {
      ...data.customerClose,
      title: result.customerActionTitle,
      copy: `${result.customerActionCopy} ${result.claimLimitCopy}`,
      actionItems: upsertRows(data.customerClose.actionItems, [
        ["Reply or action", result.customerActionCopy],
        ["Next action", result.customerActionCopy],
        ["Customer next step", primaryCtaLabel],
        ["Record type", result.recordFormat.label],
        [photoCoverageLabel, photoCoverageValue],
        [result.coverageEducation.title, result.coverageEducation.summary],
        ["PDF copy", "Archive, submission, or print copy"],
        ["Action boundary", result.responsibilityCopy],
      ]),
    },
    closeoutRows: upsertRows(data.closeoutRows, [
      ["Record type", result.recordFormat.label],
      ["Record source", result.recordFormat.recordBasis],
      ["Evidence note", result.evidenceCopy],
      ["Claim limits", result.claimLimitCopy],
      ["Customer next action", result.customerActionCopy],
      ["Customer next step", primaryCtaLabel],
      [photoCoverageLabel, photoCoverageValue],
      [result.coverageEducation.title, result.coverageEducation.summary],
      ["Action boundary", result.responsibilityCopy],
    ]),
    scopeNote: `${data.scopeNote} ${result.claimLimitCopy}`,
  };
}
