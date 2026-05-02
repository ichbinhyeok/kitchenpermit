export type Axis1JobTruthOutcomeType =
  | "needs_result"
  | "completed"
  | "blocked_access"
  | "condition_noted"
  | "partial";

export type Axis1JobTruthAreaId =
  | "hood_filters"
  | "duct_access"
  | "rooftop_fan"
  | "grease_path"
  | "label_notice";

export type Axis1JobTruthAreaState =
  | "completed_with_photo"
  | "completed_from_notes"
  | "blocked_no_access"
  | "not_completed"
  | "condition_noted"
  | "separate_not_this_visit"
  | "unclear_needs_review";

export type Axis1JobTruthProofBasis =
  | "none"
  | "written"
  | "photo"
  | "unclear";

export type Axis1JobTruthClaimStrength =
  | "no_claim"
  | "vendor_written_record"
  | "photo_attached_area_record"
  | "vendor_confirmed_photo_supported"
  | "vendor_confirmed_before_after_pair";

export type Axis1JobTruthPhotoStatus =
  | "attached_to_claim"
  | "saved_not_claimed"
  | "needs_one_decision";

export type Axis1JobTruthOutputKind =
  | "customer_link"
  | "evidence_pdf"
  | "invoice_proof"
  | "payment_message"
  | "revisit_message"
  | "quote_followup"
  | "next_cleaning_reminder";

export type Axis1JobTruthOutputReadiness =
  | "ready"
  | "needs_review"
  | "not_applicable";

export type Axis1JobTruthArea = {
  area: Axis1JobTruthAreaId;
  label: string;
  state: Axis1JobTruthAreaState;
  proofBasis: Axis1JobTruthProofBasis;
  photoCount: number;
  customerVisible: boolean;
  vendorConfirmedPhotoSupport?: boolean;
  vendorConfirmedBeforeAfterPair?: boolean;
  vendorOnlyReason?: string;
};

export type Axis1JobTruthPhotoEvidence = {
  id: string;
  area?: Axis1JobTruthAreaId;
  status: Axis1JobTruthPhotoStatus;
  customerVisible: boolean;
  reason?: string;
};

export type Axis1JobTruthClaimStatement = {
  id: string;
  area: Axis1JobTruthAreaId;
  label: string;
  state: Axis1JobTruthAreaState;
  claimStrength: Axis1JobTruthClaimStrength;
  customerVisible: boolean;
  proofBasis: Axis1JobTruthProofBasis;
  photoEvidenceIds: string[];
};

export type Axis1JobTruthWarning = {
  id: string;
  area?: Axis1JobTruthAreaId;
  severity: "blocker" | "review" | "note";
  message: string;
};

export type Axis1JobTruthOutput = {
  kind: Axis1JobTruthOutputKind;
  readiness: Axis1JobTruthOutputReadiness;
  reason?: string;
  statementIds: string[];
};

export type Axis1JobTruthRecord = {
  outcome: {
    type: Axis1JobTruthOutcomeType;
    confirmedByVendor: boolean;
    label: string;
  };
  areaLedger: Axis1JobTruthArea[];
  photoEvidence: Axis1JobTruthPhotoEvidence[];
  claimStatements: Axis1JobTruthClaimStatement[];
  customerSafeSummary: {
    result: string;
    action: string;
    claimLimit: string;
  };
  vendorOnlyWarnings: Axis1JobTruthWarning[];
  outputReadiness: Axis1JobTruthOutput[];
  nextAction: {
    type: string;
    title: string;
    copy: string;
  };
};

export type BuildAxis1JobTruthRecordInput = {
  outcome: Axis1JobTruthRecord["outcome"];
  areaLedger: Axis1JobTruthArea[];
  photoEvidence?: Axis1JobTruthPhotoEvidence[];
  customerSafeSummary: Axis1JobTruthRecord["customerSafeSummary"];
  vendorOnlyWarnings?: Axis1JobTruthWarning[];
  nextAction: Axis1JobTruthRecord["nextAction"];
};

function areaIsCustomerRelevant(area: Axis1JobTruthArea) {
  return area.customerVisible && area.state !== "separate_not_this_visit";
}

function isCompletionClaimArea(area: Axis1JobTruthArea) {
  return (
    area.state === "completed_with_photo" ||
    area.state === "completed_from_notes"
  );
}

export function deriveAxis1JobTruthClaimStrength(
  area: Axis1JobTruthArea,
): Axis1JobTruthClaimStrength {
  if (!areaIsCustomerRelevant(area) || !isCompletionClaimArea(area)) {
    return "no_claim";
  }

  if (area.state === "completed_from_notes" || area.photoCount === 0) {
    return "vendor_written_record";
  }

  if (area.vendorConfirmedBeforeAfterPair) {
    return "vendor_confirmed_before_after_pair";
  }

  if (area.vendorConfirmedPhotoSupport) {
    return "vendor_confirmed_photo_supported";
  }

  return "photo_attached_area_record";
}

function photoIdsForArea(
  photos: readonly Axis1JobTruthPhotoEvidence[],
  area: Axis1JobTruthArea,
) {
  return photos
    .filter(
      (photo) =>
        photo.area === area.area &&
        photo.status === "attached_to_claim" &&
        photo.customerVisible,
    )
    .map((photo) => photo.id);
}

function buildClaimStatements(options: {
  areaLedger: readonly Axis1JobTruthArea[];
  photoEvidence: readonly Axis1JobTruthPhotoEvidence[];
}) {
  return options.areaLedger.map((area): Axis1JobTruthClaimStatement => {
    const attachedPhotoIds = photoIdsForArea(options.photoEvidence, area);
    const inferredClaimStrength = deriveAxis1JobTruthClaimStrength(area);
    const claimStrength =
      inferredClaimStrength !== "no_claim" &&
      inferredClaimStrength !== "vendor_written_record" &&
      attachedPhotoIds.length === 0
        ? "vendor_written_record"
        : inferredClaimStrength;

    return {
      id: `area:${area.area}`,
      area: area.area,
      label: area.label,
      state: area.state,
      claimStrength,
      customerVisible: area.customerVisible,
      proofBasis: area.proofBasis,
      photoEvidenceIds:
        claimStrength === "no_claim"
          ? []
          : attachedPhotoIds,
    };
  });
}

function formatAreaList(areas: readonly Pick<Axis1JobTruthArea, "label">[]) {
  if (areas.length === 0) {
    return "";
  }

  return areas.map((area) => area.label).join(", ");
}

function statementIdsForAreas(
  statements: readonly Axis1JobTruthClaimStatement[],
  areas: readonly Axis1JobTruthArea[],
) {
  const areaIds = new Set(areas.map((area) => area.area));
  return statements
    .filter((statement) => areaIds.has(statement.area))
    .map((statement) => statement.id);
}

function buildOutput(options: {
  kind: Axis1JobTruthOutputKind;
  readiness: Axis1JobTruthOutputReadiness;
  reason?: string;
  statementIds: string[];
}): Axis1JobTruthOutput {
  return options;
}

export function deriveAxis1JobTruthOutputs(options: {
  outcome: Axis1JobTruthRecord["outcome"];
  areaLedger: readonly Axis1JobTruthArea[];
  claimStatements: readonly Axis1JobTruthClaimStatement[];
}): Axis1JobTruthOutput[] {
  const resultMissing =
    !options.outcome.confirmedByVendor ||
    options.outcome.type === "needs_result";
  const customerRelevantAreas = options.areaLedger.filter(areaIsCustomerRelevant);
  const blockedAreas = customerRelevantAreas.filter(
    (area) => area.state === "blocked_no_access",
  );
  const notCompletedAreas = customerRelevantAreas.filter(
    (area) => area.state === "not_completed",
  );
  const blockedOrNotCompletedAreas = [...blockedAreas, ...notCompletedAreas];
  const conditionAreas = customerRelevantAreas.filter(
    (area) => area.state === "condition_noted",
  );
  const notesOnlyCompletedAreas = customerRelevantAreas.filter(
    (area) => area.state === "completed_from_notes",
  );
  const unclearAreas = customerRelevantAreas.filter(
    (area) => area.state === "unclear_needs_review",
  );
  const hasBlockedOrIncomplete = blockedOrNotCompletedAreas.length > 0;
  const hasCondition = conditionAreas.length > 0;
  const hasUnclear = unclearAreas.length > 0;
  const hasNotesOnly = notesOnlyCompletedAreas.length > 0;
  const baseStatementIds = options.claimStatements
    .filter((statement) => statement.customerVisible)
    .map((statement) => statement.id);
  const blockedStatementIds = statementIdsForAreas(
    options.claimStatements,
    blockedOrNotCompletedAreas,
  );
  const conditionStatementIds = statementIdsForAreas(
    options.claimStatements,
    conditionAreas,
  );
  const unresolvedStatementIds = statementIdsForAreas(options.claimStatements, [
    ...blockedOrNotCompletedAreas,
    ...unclearAreas,
  ]);
  const blockedAreaList = formatAreaList(blockedOrNotCompletedAreas);
  const conditionAreaList = formatAreaList(conditionAreas);
  const unclearAreaList = formatAreaList(unclearAreas);
  const notesOnlyAreaList = formatAreaList(notesOnlyCompletedAreas);
  const resultMissingReason =
    "Vendor must declare the job result before customer or payment outputs are generated.";
  const unresolvedReason = (() => {
    if (blockedAreas.length > 0 && notCompletedAreas.length > 0) {
      return `Clear blocked/no-access areas and review incomplete areas before normal closeout language is used: ${blockedAreaList}.`;
    }

    if (blockedAreas.length > 0) {
      return `Clear blocked/no-access area before normal closeout language is used: ${formatAreaList(blockedAreas)}.`;
    }

    if (notCompletedAreas.length > 0) {
      return `Review incomplete area before normal closeout language is used: ${formatAreaList(notCompletedAreas)}.`;
    }

    if (unclearAreas.length > 0) {
      return `Review unclear area status before normal closeout language is used: ${unclearAreaList}.`;
    }

    return undefined;
  })();
  const weakInvoiceReason = [
    hasNotesOnly ? `Written-only completed areas: ${notesOnlyAreaList}.` : "",
    hasBlockedOrIncomplete
      ? `Blocked or not-completed areas: ${blockedAreaList}.`
      : "",
    hasCondition ? `Condition-only areas: ${conditionAreaList}.` : "",
    hasUnclear ? `Unclear areas: ${unclearAreaList}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (resultMissing) {
    return [
      buildOutput({
        kind: "customer_link",
        readiness: "needs_review",
        reason: resultMissingReason,
        statementIds: [],
      }),
      buildOutput({
        kind: "evidence_pdf",
        readiness: "needs_review",
        reason: resultMissingReason,
        statementIds: [],
      }),
      buildOutput({
        kind: "invoice_proof",
        readiness: "not_applicable",
        reason: resultMissingReason,
        statementIds: [],
      }),
      buildOutput({
        kind: "payment_message",
        readiness: "not_applicable",
        reason: resultMissingReason,
        statementIds: [],
      }),
      buildOutput({
        kind: "revisit_message",
        readiness: "not_applicable",
        reason: "No revisit action can be selected before the result is declared.",
        statementIds: [],
      }),
      buildOutput({
        kind: "quote_followup",
        readiness: "not_applicable",
        reason: "No condition follow-up can be selected before the result is declared.",
        statementIds: [],
      }),
      buildOutput({
        kind: "next_cleaning_reminder",
        readiness: "not_applicable",
        reason: resultMissingReason,
        statementIds: [],
      }),
    ];
  }

  return [
    buildOutput({
      kind: "customer_link",
      readiness: hasUnclear ? "needs_review" : "ready",
      reason: hasUnclear ? unresolvedReason : undefined,
      statementIds: baseStatementIds,
    }),
    buildOutput({
      kind: "evidence_pdf",
      readiness: hasUnclear ? "needs_review" : "ready",
      reason: hasUnclear ? unresolvedReason : undefined,
      statementIds: baseStatementIds,
    }),
    buildOutput({
      kind: "invoice_proof",
      readiness:
        hasNotesOnly || hasBlockedOrIncomplete || hasCondition || hasUnclear
          ? "needs_review"
          : "ready",
      reason: weakInvoiceReason || undefined,
      statementIds: baseStatementIds,
    }),
    buildOutput({
      kind: "payment_message",
      readiness:
        hasNotesOnly || hasBlockedOrIncomplete || hasCondition || hasUnclear
          ? "needs_review"
          : "ready",
      reason: weakInvoiceReason || undefined,
      statementIds: baseStatementIds,
    }),
    buildOutput({
      kind: "revisit_message",
      readiness: hasBlockedOrIncomplete ? "ready" : "not_applicable",
      reason: hasBlockedOrIncomplete
        ? `Use only for blocked or not-completed areas: ${blockedAreaList}.`
        : "No blocked or not-completed area is recorded.",
      statementIds: blockedStatementIds,
    }),
    buildOutput({
      kind: "quote_followup",
      readiness: hasCondition ? "ready" : "not_applicable",
      reason: hasCondition
        ? `Use only for recorded condition areas: ${conditionAreaList}.`
        : "No condition-only area is recorded.",
      statementIds: conditionStatementIds,
    }),
    buildOutput({
      kind: "next_cleaning_reminder",
      readiness: hasBlockedOrIncomplete || hasUnclear ? "needs_review" : "ready",
      reason:
        hasBlockedOrIncomplete || hasUnclear ? unresolvedReason : undefined,
      statementIds:
        hasBlockedOrIncomplete || hasUnclear
          ? unresolvedStatementIds
          : baseStatementIds,
    }),
  ];
}

export function buildAxis1JobTruthRecord(
  input: BuildAxis1JobTruthRecordInput,
): Axis1JobTruthRecord {
  const photoEvidence = input.photoEvidence ?? [];
  const claimStatements = buildClaimStatements({
    areaLedger: input.areaLedger,
    photoEvidence,
  });
  const outputReadiness = deriveAxis1JobTruthOutputs({
    outcome: input.outcome,
    areaLedger: input.areaLedger,
    claimStatements,
  });

  return {
    outcome: input.outcome,
    areaLedger: [...input.areaLedger],
    photoEvidence: [...photoEvidence],
    claimStatements,
    customerSafeSummary: input.customerSafeSummary,
    vendorOnlyWarnings: input.vendorOnlyWarnings ?? [],
    outputReadiness,
    nextAction: input.nextAction,
  };
}

export function validateAxis1JobTruthRecord(
  record: Axis1JobTruthRecord,
): string[] {
  const errors: string[] = [];
  const photoById = new Map(record.photoEvidence.map((photo) => [photo.id, photo]));
  const areaById = new Map(record.areaLedger.map((area) => [area.area, area]));
  const vendorWarningText = record.vendorOnlyWarnings
    .map((warning) => warning.message.trim())
    .filter(Boolean);
  const customerText = [
    record.customerSafeSummary.result,
    record.customerSafeSummary.action,
    record.customerSafeSummary.claimLimit,
    record.nextAction.title,
    record.nextAction.copy,
  ].join("\n");

  record.claimStatements.forEach((statement) => {
    const area = areaById.get(statement.area);

    if (!area) {
      errors.push(`Claim statement ${statement.id} has no area ledger row.`);
      return;
    }

    if (
      statement.claimStrength === "vendor_confirmed_before_after_pair" &&
      !area.vendorConfirmedBeforeAfterPair
    ) {
      errors.push(
        `Claim statement ${statement.id} claims before/after support without vendor confirmation.`,
      );
    }

    if (
      (statement.claimStrength === "photo_attached_area_record" ||
        statement.claimStrength === "vendor_confirmed_photo_supported" ||
        statement.claimStrength === "vendor_confirmed_before_after_pair") &&
      statement.photoEvidenceIds.length === 0
    ) {
      errors.push(
        `Claim statement ${statement.id} has photo claim strength without attached claim photos.`,
      );
    }

    statement.photoEvidenceIds.forEach((photoId) => {
      const photo = photoById.get(photoId);

      if (!photo) {
        errors.push(`Claim statement ${statement.id} references missing photo ${photoId}.`);
        return;
      }

      if (photo.status !== "attached_to_claim" || !photo.customerVisible) {
        errors.push(
          `Claim statement ${statement.id} references a photo that is not customer-visible claim support.`,
        );
      }
    });
  });

  vendorWarningText.forEach((warningText) => {
    if (warningText && customerText.includes(warningText)) {
      errors.push("Customer-safe copy contains a vendor-only warning verbatim.");
    }
  });

  return errors;
}
