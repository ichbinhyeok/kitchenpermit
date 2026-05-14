import { describe, expect, it } from "vitest";
import {
  buildAxis1JobTruthRecord,
  deriveAxis1JobTruthClaimStrength,
  validateAxis1JobTruthRecord,
  type Axis1JobTruthArea,
  type Axis1JobTruthOutputKind,
} from "@/lib/axis1-job-truth";

function area(
  overrides: Partial<Axis1JobTruthArea> & Pick<Axis1JobTruthArea, "area" | "label">,
): Axis1JobTruthArea {
  return {
    state: "completed_from_notes",
    proofBasis: "written",
    photoCount: 0,
    customerVisible: true,
    ...overrides,
  };
}

function completedRecord(overrides: {
  areaLedger?: Axis1JobTruthArea[];
  photoEvidence?: Parameters<typeof buildAxis1JobTruthRecord>[0]["photoEvidence"];
  vendorOnlyWarnings?: Parameters<typeof buildAxis1JobTruthRecord>[0]["vendorOnlyWarnings"];
} = {}) {
  return buildAxis1JobTruthRecord({
    outcome: {
      type: "completed",
      confirmedByVendor: true,
      label: "Completed",
    },
    areaLedger:
      overrides.areaLedger ??
      [
        area({ area: "hood_filters", label: "Hood / filters" }),
        area({ area: "duct_access", label: "Duct / access" }),
        area({ area: "rooftop_fan", label: "Rooftop fan" }),
        area({ area: "grease_path", label: "Grease path / containment" }),
        area({
          area: "label_notice",
          label: "Label / notice",
          state: "separate_not_this_visit",
          proofBasis: "none",
          customerVisible: false,
        }),
      ],
    photoEvidence: overrides.photoEvidence,
    customerSafeSummary: {
      result: "Service closeout recorded from vendor notes.",
      action: "Save the record and reply with questions.",
      claimLimit: "No photo proof is implied where photos are not attached.",
    },
    vendorOnlyWarnings: overrides.vendorOnlyWarnings,
    nextAction: {
      type: "confirm_received",
      title: "Send closeout",
      copy: "Send the written closeout record.",
    },
  });
}

function outputReadiness(
  record: ReturnType<typeof buildAxis1JobTruthRecord>,
  kind: Axis1JobTruthOutputKind,
) {
  return record.outputReadiness.find((output) => output.kind === kind);
}

describe("Axis1JobTruthRecord", () => {
  it("treats no-photo completed work as a valid written record without photo claims", () => {
    const record = completedRecord();

    expect(outputReadiness(record, "customer_link")?.readiness).toBe("ready");
    expect(outputReadiness(record, "evidence_pdf")?.readiness).toBe("ready");
    expect(record.outputReadiness.map((output) => output.kind).join(" ")).not.toMatch(
      /invoice|payment/i,
    );
    expect(record.claimStatements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          area: "hood_filters",
          claimStrength: "vendor_written_record",
          photoEvidenceIds: [],
        }),
      ]),
    );
    expect(validateAxis1JobTruthRecord(record)).toEqual([]);
  });

  it("keeps a rooftop fan blocked edit narrow and leaves duct/access completed from notes", () => {
    const record = completedRecord({
      areaLedger: [
        area({ area: "hood_filters", label: "Hood / filters" }),
        area({ area: "duct_access", label: "Duct / access" }),
        area({
          area: "rooftop_fan",
          label: "Rooftop fan",
          state: "blocked_no_access",
          proofBasis: "written",
        }),
        area({ area: "grease_path", label: "Grease path / containment" }),
      ],
    });

    expect(
      record.areaLedger.find((entry) => entry.area === "duct_access")?.state,
    ).toBe("completed_from_notes");
    expect(outputReadiness(record, "revisit_message")?.readiness).toBe("ready");
    expect(outputReadiness(record, "revisit_message")?.statementIds).toEqual([
      "area:rooftop_fan",
    ]);
    expect(outputReadiness(record, "next_cleaning_reminder")?.readiness).toBe(
      "needs_review",
    );
    expect(validateAxis1JobTruthRecord(record)).toEqual([]);
  });

  it("makes quote follow-up ready only for condition-only areas", () => {
    const clean = completedRecord();
    const condition = completedRecord({
      areaLedger: [
        area({ area: "hood_filters", label: "Hood / filters" }),
        area({
          area: "duct_access",
          label: "Duct / access",
          state: "condition_noted",
          proofBasis: "written",
        }),
        area({ area: "rooftop_fan", label: "Rooftop fan" }),
      ],
    });

    expect(outputReadiness(clean, "quote_followup")?.readiness).toBe(
      "not_applicable",
    );
    expect(outputReadiness(condition, "quote_followup")?.readiness).toBe(
      "ready",
    );
    expect(outputReadiness(condition, "quote_followup")?.statementIds).toEqual([
      "area:duct_access",
    ]);
  });

  it("does not treat narrow-scope exclusions as failed full-scope work", () => {
    const record = completedRecord({
      areaLedger: [
        area({
          area: "hood_filters",
          label: "Hood / filters",
          state: "completed_from_notes",
        }),
        area({
          area: "duct_access",
          label: "Duct / access",
          state: "separate_not_this_visit",
          proofBasis: "none",
        }),
        area({
          area: "rooftop_fan",
          label: "Rooftop fan",
          state: "separate_not_this_visit",
          proofBasis: "none",
        }),
        area({
          area: "grease_path",
          label: "Grease path / containment",
          state: "separate_not_this_visit",
          proofBasis: "none",
        }),
      ],
    });

    expect(outputReadiness(record, "revisit_message")?.readiness).toBe(
      "not_applicable",
    );
    expect(outputReadiness(record, "next_cleaning_reminder")?.readiness).toBe(
      "ready",
    );
    expect(
      record.claimStatements.filter(
        (statement) => statement.claimStrength !== "no_claim",
      ),
    ).toHaveLength(1);
  });

  it("keeps ambiguous saved photos out of claim strength", () => {
    const record = completedRecord({
      areaLedger: [
        area({
          area: "hood_filters",
          label: "Hood / filters",
          state: "completed_with_photo",
          proofBasis: "photo",
          photoCount: 1,
        }),
      ],
      photoEvidence: [
        {
          id: "photo:hood-ambiguous",
          area: "hood_filters",
          status: "saved_not_claimed",
          customerVisible: false,
        },
      ],
    });

    expect(record.claimStatements[0]).toMatchObject({
      claimStrength: "vendor_written_record",
      photoEvidenceIds: [],
    });
    expect(validateAxis1JobTruthRecord(record)).toEqual([]);
  });

  it("requires vendor confirmation before using before/after claim strength", () => {
    expect(
      deriveAxis1JobTruthClaimStrength(
        area({
          area: "hood_filters",
          label: "Hood / filters",
          state: "completed_with_photo",
          proofBasis: "photo",
          photoCount: 2,
          vendorConfirmedPhotoSupport: true,
        }),
      ),
    ).toBe("vendor_confirmed_photo_supported");

    expect(
      deriveAxis1JobTruthClaimStrength(
        area({
          area: "hood_filters",
          label: "Hood / filters",
          state: "completed_with_photo",
          proofBasis: "photo",
          photoCount: 2,
          vendorConfirmedBeforeAfterPair: true,
        }),
      ),
    ).toBe("vendor_confirmed_before_after_pair");
  });

  it("detects customer copy that leaks vendor-only warning language verbatim", () => {
    const record = completedRecord({
      vendorOnlyWarnings: [
        {
          id: "warning:fan",
          area: "rooftop_fan",
          severity: "review",
          message: "Fan proof missing; do not claim fan completion.",
        },
      ],
    });
    const leaking = {
      ...record,
      customerSafeSummary: {
        ...record.customerSafeSummary,
        result: "Fan proof missing; do not claim fan completion.",
      },
    };

    expect(validateAxis1JobTruthRecord(record)).toEqual([]);
    expect(validateAxis1JobTruthRecord(leaking)).toContain(
      "Customer-safe copy contains a vendor-only warning verbatim.",
    );
  });
});
