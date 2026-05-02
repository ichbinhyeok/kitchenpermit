import { describe, expect, it } from "vitest";
import {
  applyAxis1CloseoutEngineToPacket,
  evaluateAxis1Closeout,
  type Axis1CloseoutCase,
  type Axis1CloseoutEngineResult,
  type Axis1CloseoutClaimLevel,
  type Axis1CloseoutCtaKind,
  type Axis1CloseoutEvidenceBasis,
  type Axis1CloseoutLinks,
} from "@/lib/axis1-closeout-engine";
import {
  axis1ExceptionOptions,
  axis1FollowUpOptions,
  axis1BuilderDefaults,
  buildAxis1NeutralPacketData,
  type Axis1BuilderFormValues,
} from "@/lib/axis1-packet-builder";
import type { Axis1PacketPreviewData } from "@/lib/axis1-packet-preview";
import { buildAxis1SampleProofData } from "@/lib/axis1-sample-packets";
import {
  axis1FieldPhotoSlots,
  buildAxis1PacketDataWithFieldPhotos,
  emptyAxis1FieldPhotoState,
  emptyAxis1PhotoSlotResolutions,
  type Axis1FieldPhotoSlotId,
  type Axis1PhotoSlotResolutionState,
  type Axis1UploadedFieldPhotoState,
} from "@/lib/axis1-field-photos";

const forbiddenOverclaimPattern =
  /NFPA|compliance|pass\/fail|fire marshal|official|certificate|inspection|approval|repair/i;
const forbiddenCustomerFacingContentPattern =
  /NFPA|compliance|pass\/fail|pass-fail|fire marshal|official|certificate|inspection|inspected|approval|repair|proof packet|weak photo packet|customer packet|\bpacket\b/i;
const internalPacketDataKeys = new Set([
  "generatedOutputs",
  "vendorSendReadinessWarnings",
  "branding",
  "scenario",
  "reportUrl",
  "src",
  "href",
  "type",
  "kind",
  "priority",
  "outcomeType",
  "evidenceBasis",
  "claimLevel",
  "state",
  "id",
  "proofId",
  "position",
  "tone",
]);

function values(
  overrides: Partial<Axis1BuilderFormValues> = {},
): Axis1BuilderFormValues {
  return {
    ...axis1BuilderDefaults,
    scenario: "clean",
    exceptionKinds: [],
    followUpMode: "none",
    ...overrides,
  };
}

function photo(slotId: Axis1FieldPhotoSlotId) {
  return {
    src: `/test/${slotId}.jpg`,
    name: `${slotId}.jpg`,
    source: "manual",
    confidence: "manual",
    matchLabel: "Manual test placement",
  } as const;
}

function photos(
  slotIds: Axis1FieldPhotoSlotId[],
): Axis1UploadedFieldPhotoState {
  const state = emptyAxis1FieldPhotoState();

  slotIds.forEach((slotId) => {
    state[slotId] = photo(slotId);
  });

  return state;
}

function resolutions(
  overrides: Partial<Axis1PhotoSlotResolutionState> = {},
): Axis1PhotoSlotResolutionState {
  return {
    ...emptyAxis1PhotoSlotResolutions(),
    ...overrides,
  };
}

function evaluate(options: {
  values?: Axis1BuilderFormValues;
  outcomeSelected?: boolean;
  photoSlots?: Axis1FieldPhotoSlotId[];
  unplacedPhotoCount?: number;
  photoSlotResolutions?: Axis1PhotoSlotResolutionState;
  links?: Axis1CloseoutLinks;
}) {
  return evaluateAxis1Closeout({
    values: options.values ?? values(),
    outcomeSelected: options.outcomeSelected ?? true,
    uploadedFieldPhotos: photos(options.photoSlots ?? []),
    unplacedPhotoCount: options.unplacedPhotoCount ?? 0,
    photoSlotResolutions: options.photoSlotResolutions ?? resolutions(),
    links: options.links,
  });
}

function allResultText(result: Axis1CloseoutEngineResult) {
  return [
    result.primaryStatusLabel,
    result.basisLabel,
    result.customerResultCopy,
    result.customerActionTitle,
    result.customerActionCopy,
    result.responsibilityCopy,
    result.evidenceCopy,
    result.claimLimitCopy,
    result.recordFormat.label,
    result.recordFormat.recordBasis,
    result.recordFormat.reason,
    result.coverageEducation.title,
    result.coverageEducation.summary,
    result.coverageEducation.boundaryCopy,
    ...result.coverageEducation.items.map(
      (item) => `${item.label} ${item.copy} ${item.state}`,
    ),
    ...result.warnings,
    ...result.vendorSendReadinessWarnings.map(
      (warning) =>
        `${warning.kind} ${warning.severity} ${warning.title} ${warning.copy} ${warning.customerCopy}`,
    ),
    ...result.generatedOutputs.map(
      (output) =>
        `${output.kind} ${output.label} ${output.readiness} ${output.reason ?? ""} ${output.copy ?? ""}`,
    ),
    ...result.ctas.map((cta) => `${cta.kind} ${cta.label} ${cta.reason ?? ""}`),
    result.proofCoverage.label,
    ...result.proofCoverage.items.map(
      (item) => `${item.label} ${item.state} ${item.proofId ?? ""}`,
    ),
  ].join("\n");
}

function expectNoOverclaim(result: Axis1CloseoutEngineResult) {
  expect(allResultText(result)).not.toMatch(forbiddenOverclaimPattern);
}

function collectCustomerFacingStrings(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectCustomerFacingStrings);
  }

  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, entry]) =>
      internalPacketDataKeys.has(key) ? [] : collectCustomerFacingStrings(entry),
    );
  }

  return [];
}

function allPacketCustomerText(packet: Axis1PacketPreviewData) {
  return collectCustomerFacingStrings(packet).join("\n");
}

type EngineMatrixCase = {
  name: string;
  options: Parameters<typeof evaluate>[0];
  expected: {
    canGeneratePacket: boolean;
    caseType: Axis1CloseoutCase;
    evidenceBasis: Axis1CloseoutEvidenceBasis;
    claimLevel: Axis1CloseoutClaimLevel;
    primaryCtaKind: Axis1CloseoutCtaKind;
    proofCoverage: RegExp;
    claimLimit: RegExp;
    responsibility: RegExp;
  };
};

const photoSlotPowerSet = Array.from(
  { length: 2 ** axis1FieldPhotoSlots.length },
  (_, mask) =>
    axis1FieldPhotoSlots
      .filter((_, index) => (mask & (1 << index)) !== 0)
      .map((slot) => slot.id),
);

const accessExceptionKinds = axis1ExceptionOptions
  .filter((option) => option.group === "access")
  .map((option) => option.value);
const conditionExceptionKinds = axis1ExceptionOptions
  .filter((option) => option.group === "condition")
  .map((option) => option.value);

const generatedServiceCases = [
  {
    name: "clean",
    formValues: values({ scenario: "clean", exceptionKinds: [] }),
    expectedCaseType: "clean_closeout" as const,
  },
  ...[
    [],
    ...accessExceptionKinds.map((kind) => [kind]),
    ...conditionExceptionKinds.map((kind) => [kind]),
    ...accessExceptionKinds.flatMap((accessKind) =>
      conditionExceptionKinds.map((conditionKind) => [accessKind, conditionKind]),
    ),
  ].flatMap((exceptionKinds) =>
    axis1FollowUpOptions.map((followUp) => {
      const hasAccessException = exceptionKinds.some((kind) =>
        accessExceptionKinds.includes(kind),
      );

      return {
        name: `exception:${exceptionKinds.join("+") || "none"}:${followUp.value}`,
        formValues: values({
          scenario: "exception",
          exceptionKinds,
          followUpMode: followUp.value,
        }),
        expectedCaseType: hasAccessException
          ? ("access_exception" as const)
          : ("condition_review" as const),
      };
    }),
  ),
];

function buildPacketForResult(
  formValues: Axis1BuilderFormValues,
  result: Axis1CloseoutEngineResult,
) {
  return applyAxis1CloseoutEngineToPacket(
    buildAxis1NeutralPacketData(formValues),
    result,
  );
}

describe("evaluateAxis1Closeout", () => {
  it.each([
    {
      name: "no input",
      options: { outcomeSelected: false },
      expected: {
        canGeneratePacket: false,
        caseType: "needs_outcome",
        evidenceBasis: "no_photos",
        claimLevel: "written_record",
        primaryCtaKind: "confirm_received",
        proofCoverage: /Written service record/,
        claimLimit: /Do not show completed, blocked, or evidence language/,
        responsibility: /No responsibility boundary/,
      },
    },
    {
      name: "clean + no photos",
      options: { values: values({ scenario: "clean" }) },
      expected: {
        canGeneratePacket: true,
        caseType: "clean_closeout",
        evidenceBasis: "no_photos",
        claimLevel: "written_record",
        primaryCtaKind: "confirm_next_service",
        proofCoverage: /Written service record/,
        claimLimit: /written service record/,
        responsibility: /No blocked or incomplete area/,
      },
    },
    {
      name: "clean + after only",
      options: {
        values: values({ scenario: "clean" }),
        photoSlots: ["hood-after"],
      },
      expected: {
        canGeneratePacket: true,
        caseType: "clean_closeout",
        evidenceBasis: "partial_photos",
        claimLevel: "partial_photo_record",
        primaryCtaKind: "confirm_next_service",
        proofCoverage: /1 \/ 7 recommended photo areas captured/,
        claimLimit: /Attached photos support part of the record/,
        responsibility: /No blocked or incomplete area/,
      },
    },
    {
      name: "clean + before/after",
      options: {
        values: values({ scenario: "clean" }),
        photoSlots: ["hood-before", "hood-after"],
      },
      expected: {
        canGeneratePacket: true,
        caseType: "clean_closeout",
        evidenceBasis: "photo_record",
        claimLevel: "photo_supported_record",
        primaryCtaKind: "confirm_next_service",
        proofCoverage: /2 \/ 7 recommended photo areas captured/,
        claimLimit: /Photo coverage is limited/,
        responsibility: /No blocked or incomplete area/,
      },
    },
    {
      name: "clean + all recommended photos",
      options: {
        values: values({ scenario: "clean" }),
        photoSlots: axis1FieldPhotoSlots.map((slot) => slot.id),
      },
      expected: {
        canGeneratePacket: true,
        caseType: "clean_closeout",
        evidenceBasis: "photo_record",
        claimLevel: "photo_supported_record",
        primaryCtaKind: "confirm_next_service",
        proofCoverage: /7 \/ 7 recommended photo areas captured/,
        claimLimit: /Photo coverage is limited/,
        responsibility: /No blocked or incomplete area/,
      },
    },
    {
      name: "blocked-storage + no photos",
      options: {
        values: values({
          scenario: "exception",
          exceptionKinds: ["blocked-storage"],
          followUpMode: "monitor",
        }),
      },
      expected: {
        canGeneratePacket: true,
        caseType: "access_exception",
        evidenceBasis: "no_photos",
        claimLevel: "written_record",
        primaryCtaKind: "reply_after_clearing_access",
        proofCoverage: /Written access record/,
        claimLimit: /not presented as cleaned/,
        responsibility: /blocked section stays listed separately/,
      },
    },
    {
      name: "blocked-storage + access photo only",
      options: {
        values: values({
          scenario: "exception",
          exceptionKinds: ["blocked-storage"],
          followUpMode: "monitor",
        }),
        photoSlots: ["access-condition"],
      },
      expected: {
        canGeneratePacket: true,
        caseType: "access_exception",
        evidenceBasis: "partial_photos",
        claimLevel: "partial_photo_record",
        primaryCtaKind: "reply_after_clearing_access",
        proofCoverage: /1 \/ 7 recommended photo areas captured/,
        claimLimit: /not presented as cleaned/,
        responsibility: /blocked section stays listed separately/,
      },
    },
    {
      name: "sealed-panel + partial photos",
      options: {
        values: values({
          scenario: "exception",
          exceptionKinds: ["sealed-panel"],
          followUpMode: "monitor",
        }),
        photoSlots: ["hood-after", "access-condition"],
      },
      expected: {
        canGeneratePacket: true,
        caseType: "access_exception",
        evidenceBasis: "partial_photos",
        claimLevel: "partial_photo_record",
        primaryCtaKind: "reply_after_clearing_access",
        proofCoverage: /2 \/ 7 recommended photo areas captured/,
        claimLimit: /not presented as cleaned/,
        responsibility: /concealed path was cleaned/,
      },
    },
    {
      name: "unsafe-access + no photos",
      options: {
        values: values({
          scenario: "exception",
          exceptionKinds: ["unsafe-access"],
          followUpMode: "monitor",
        }),
      },
      expected: {
        canGeneratePacket: true,
        caseType: "access_exception",
        evidenceBasis: "no_photos",
        claimLevel: "written_record",
        primaryCtaKind: "reply_after_clearing_access",
        proofCoverage: /Written access record/,
        claimLimit: /not presented as cleaned/,
        responsibility: /safely accessed/,
      },
    },
    {
      name: "not-cleaned + partial photos",
      options: {
        values: values({
          scenario: "exception",
          exceptionKinds: ["not-cleaned"],
          followUpMode: "monitor",
        }),
        photoSlots: ["access-condition", "service-label"],
      },
      expected: {
        canGeneratePacket: true,
        caseType: "access_exception",
        evidenceBasis: "partial_photos",
        claimLevel: "partial_photo_record",
        primaryCtaKind: "reply_after_clearing_access",
        proofCoverage: /2 \/ 7 recommended photo areas captured/,
        claimLimit: /not presented as cleaned/,
        responsibility: /excluded from the completed-work claim/,
      },
    },
    {
      name: "panel-signage + no photos",
      options: {
        values: values({
          scenario: "exception",
          exceptionKinds: ["panel-signage"],
          followUpMode: "monitor",
        }),
      },
      expected: {
        canGeneratePacket: true,
        caseType: "access_exception",
        evidenceBasis: "no_photos",
        claimLevel: "written_record",
        primaryCtaKind: "reply_after_clearing_access",
        proofCoverage: /Written access record/,
        claimLimit: /not presented as cleaned/,
        responsibility: /separate from this cleaning closeout/,
      },
    },
    {
      name: "condition + quote",
      options: {
        values: values({
          scenario: "exception",
          exceptionKinds: ["rooftop-hinge-curb"],
          followUpMode: "quote",
        }),
      },
      expected: {
        canGeneratePacket: true,
        caseType: "condition_review",
        evidenceBasis: "no_photos",
        claimLevel: "written_record",
        primaryCtaKind: "request_quote",
        proofCoverage: /Written condition record/,
        claimLimit: /Recorded conditions and follow-up paths are separate/,
        responsibility: /follow-up item visible/,
      },
    },
    {
      name: "condition + monitor",
      options: {
        values: values({
          scenario: "exception",
          exceptionKinds: ["fan-belt-drive"],
          followUpMode: "monitor",
        }),
      },
      expected: {
        canGeneratePacket: true,
        caseType: "condition_review",
        evidenceBasis: "no_photos",
        claimLevel: "written_record",
        primaryCtaKind: "confirm_next_service",
        proofCoverage: /Written condition record/,
        claimLimit: /Recorded conditions and follow-up paths are separate/,
        responsibility: /not represented as corrected/,
      },
    },
    {
      name: "condition + record-only",
      options: {
        values: values({
          scenario: "exception",
          exceptionKinds: ["liquid-tight"],
          followUpMode: "none",
        }),
      },
      expected: {
        canGeneratePacket: true,
        caseType: "condition_review",
        evidenceBasis: "no_photos",
        claimLevel: "written_record",
        primaryCtaKind: "confirm_received",
        proofCoverage: /Written condition record/,
        claimLimit: /Recorded conditions and follow-up paths are separate/,
        responsibility: /record-only/,
      },
    },
    {
      name: "condition + no photos",
      options: {
        values: values({
          scenario: "exception",
          exceptionKinds: ["grease-containment"],
          followUpMode: "quote",
        }),
      },
      expected: {
        canGeneratePacket: true,
        caseType: "condition_review",
        evidenceBasis: "no_photos",
        claimLevel: "written_record",
        primaryCtaKind: "request_quote",
        proofCoverage: /Written condition record/,
        claimLimit: /Recorded conditions and follow-up paths are separate/,
        responsibility: /follow-up item visible/,
      },
    },
    {
      name: "access + condition mixed",
      options: {
        values: values({
          scenario: "exception",
          exceptionKinds: ["blocked-storage", "rooftop-hinge-curb"],
          followUpMode: "quote",
        }),
        photoSlots: ["access-condition", "rooftop-fan"],
      },
      expected: {
        canGeneratePacket: true,
        caseType: "access_exception",
        evidenceBasis: "partial_photos",
        claimLevel: "partial_photo_record",
        primaryCtaKind: "reply_after_clearing_access",
        proofCoverage: /2 \/ 7 recommended photo areas captured/,
        claimLimit: /not presented as cleaned/,
        responsibility: /blocked section stays listed separately/,
      },
    },
    {
      name: "missing before",
      options: {
        values: values({ scenario: "clean" }),
        photoSlots: ["hood-after", "filter-bank"],
      },
      expected: {
        canGeneratePacket: true,
        caseType: "clean_closeout",
        evidenceBasis: "partial_photos",
        claimLevel: "partial_photo_record",
        primaryCtaKind: "confirm_next_service",
        proofCoverage: /2 \/ 7 recommended photo areas captured/,
        claimLimit: /Attached photos support part of the record/,
        responsibility: /No blocked or incomplete area/,
      },
    },
    {
      name: "missing after",
      options: {
        values: values({ scenario: "clean" }),
        photoSlots: ["hood-before", "filter-bank"],
      },
      expected: {
        canGeneratePacket: true,
        caseType: "clean_closeout",
        evidenceBasis: "partial_photos",
        claimLevel: "partial_photo_record",
        primaryCtaKind: "confirm_next_service",
        proofCoverage: /2 \/ 7 recommended photo areas captured/,
        claimLimit: /Attached photos support part of the record/,
        responsibility: /No blocked or incomplete area/,
      },
    },
    {
      name: "all optional marked not applicable",
      options: {
        values: values({ scenario: "clean" }),
        photoSlotResolutions: resolutions({
          "filter-bank": "not-applicable",
          "access-condition": "not-applicable",
          "rooftop-fan": "not-applicable",
          "grease-containment": "not-applicable",
          "service-label": "not-applicable",
        }),
      },
      expected: {
        canGeneratePacket: true,
        caseType: "clean_closeout",
        evidenceBasis: "no_photos",
        claimLevel: "written_record",
        primaryCtaKind: "confirm_next_service",
        proofCoverage: /Written service record/,
        claimLimit: /written service record/,
        responsibility: /No blocked or incomplete area/,
      },
    },
    {
      name: "service label not captured",
      options: {
        values: values({ scenario: "clean" }),
        photoSlotResolutions: resolutions({
          "service-label": "not-captured",
        }),
      },
      expected: {
        canGeneratePacket: true,
        caseType: "clean_closeout",
        evidenceBasis: "no_photos",
        claimLevel: "written_record",
        primaryCtaKind: "confirm_next_service",
        proofCoverage: /Written service record/,
        claimLimit: /written service record/,
        responsibility: /No blocked or incomplete area/,
      },
    },
  ] satisfies EngineMatrixCase[])(
    "locks P0 engine matrix case: $name",
    ({ options, expected }) => {
      const result = evaluate(options);

      expect(result.canGeneratePacket).toBe(expected.canGeneratePacket);
      expect(result.caseType).toBe(expected.caseType);
      expect(result.evidenceBasis).toBe(expected.evidenceBasis);
      expect(result.claimLevel).toBe(expected.claimLevel);
      expect(result.primaryCta?.kind).toBe(expected.primaryCtaKind);
      expect(result.proofCoverage.label).toMatch(expected.proofCoverage);
      expect(result.claimLimitCopy).toMatch(expected.claimLimit);
      expect(result.responsibilityCopy).toMatch(expected.responsibility);
      expect(result.recordFormat.label).not.toMatch(/packet/i);
      expectNoOverclaim(result);
    },
  );

  it("sweeps generated service, exception, follow-up, and photo combinations for customer-safe contracts", () => {
    let checked = 0;

    generatedServiceCases.forEach((serviceCase) => {
      photoSlotPowerSet.forEach((photoSlots) => {
        [0, 1].forEach((unplacedPhotoCount) => {
          const result = evaluate({
            values: serviceCase.formValues,
            photoSlots,
            unplacedPhotoCount,
          });
          const hasBefore = photoSlots.includes("hood-before");
          const hasAfter = photoSlots.includes("hood-after");
          const attachedCount = photoSlots.length + unplacedPhotoCount;
          const shouldCheckPacketText =
            unplacedPhotoCount === 0 &&
            (photoSlots.length === 0 ||
              photoSlots.length === 1 ||
              (hasBefore && hasAfter && photoSlots.length === 2) ||
              photoSlots.length === axis1FieldPhotoSlots.length);

          checked += 1;
          expect(result.canGeneratePacket).toBe(true);
          expect(result.caseType).toBe(serviceCase.expectedCaseType);
          expect(result.blockingReason).toBeNull();
          expect(result.recordFormat.label).not.toMatch(/packet/i);
          expectNoOverclaim(result);

          if (shouldCheckPacketText) {
            const packet = buildPacketForResult(serviceCase.formValues, result);

            expect(allPacketCustomerText(packet)).not.toMatch(
              forbiddenCustomerFacingContentPattern,
            );
          }

          if (attachedCount === 0) {
            expect(result.evidenceBasis).toBe("no_photos");
            expect(result.claimLevel).toBe("written_record");
            expect(result.canUsePhotoProofLanguage).toBe(false);
            expect(result.proofCoverage.capturedCount).toBe(0);
            expect(result.proofCoverage.shortLabel).toMatch(/record/i);
          } else if (hasBefore && hasAfter) {
            expect(result.evidenceBasis).toBe("photo_record");
            expect(result.claimLevel).toBe("photo_supported_record");
            expect(result.canUsePhotoProofLanguage).toBe(true);
          } else {
            expect(result.evidenceBasis).toBe("partial_photos");
            expect(result.claimLevel).toBe("partial_photo_record");
            expect(result.canUsePhotoProofLanguage).toBe(false);
          }

          if (serviceCase.expectedCaseType === "access_exception") {
            expect(result.outcomeType).toBe("blocked_access");
            expect(result.recordFormat.type).toBe("access_issue_record");
            expect(result.primaryCta?.kind).toBe("reply_after_clearing_access");
            expect(result.claimLimitCopy).toMatch(/not presented as cleaned/i);
            expect(result.coverageEducation.items).toContainEqual(
              expect.objectContaining({
                state: "action_required",
              }),
            );
          }

          if (serviceCase.expectedCaseType === "condition_review") {
            expect(result.outcomeType).toBe("condition_review");
            expect(result.recordFormat.type).not.toBe("access_issue_record");
            expect(result.claimLimitCopy).toMatch(
              /Recorded conditions and follow-up paths are separate/i,
            );
            expect(result.coverageEducation.items).toContainEqual(
              expect.objectContaining({
                label: "Recorded condition",
                state: "recorded",
              }),
            );
          }

          if (serviceCase.expectedCaseType === "clean_closeout") {
            expect(result.outcomeType).toBe("clean");
            expect(result.recordFormat.type).not.toBe("access_issue_record");
            expect(result.primaryCta?.kind).toBe("confirm_next_service");
            expect(result.claimLimitCopy).toMatch(/next-service step stays separate/i);
          }
        });
      });
    });

    expect(checked).toBe(generatedServiceCases.length * photoSlotPowerSet.length * 2);
  });

  it("sweeps unselected result states so photos alone never create a customer output", () => {
    photoSlotPowerSet.forEach((photoSlots) => {
      [0, 1].forEach((unplacedPhotoCount) => {
        const result = evaluate({
          values: values({ scenario: "clean" }),
          outcomeSelected: false,
          photoSlots,
          unplacedPhotoCount,
        });

        expect(result.canGeneratePacket).toBe(false);
        expect(result.caseType).toBe("needs_outcome");
        expect(result.outcomeType).toBeNull();
        expect(result.primaryStatusLabel).toBe("Pick result");
        expect(result.customerActionTitle).toBe("Pick result first");
        expect(result.claimLimitCopy).toMatch(
          /Do not show completed, blocked, or evidence language/i,
        );
        expectNoOverclaim(result);
      });
    });
  });

  it("blocks packet generation until a result is selected", () => {
    const result = evaluate({ outcomeSelected: false });

    expect(result.canGeneratePacket).toBe(false);
    expect(result.caseType).toBe("needs_outcome");
    expect(result.blockingReason).toMatch(/Select today's service result/);
    expect(result.primaryStatusLabel).toBe("Pick result");
  });

  it("downgrades a no-photo clean closeout to a written service record", () => {
    const result = evaluate({ values: values({ scenario: "clean" }) });

    expect(result.caseType).toBe("clean_closeout");
    expect(result.outcomeType).toBe("clean");
    expect(result.evidenceBasis).toBe("no_photos");
    expect(result.claimLevel).toBe("written_record");
    expect(result.recordFormat.type).toBe("service_closeout_record");
    expect(result.primaryCta?.kind).toBe("confirm_next_service");
    expect(result.customerActionType).toBe("confirm_next_service");
    expect(result.customerActionTitle).toBe("Confirm next service");
    expect(result.proofCoverage.label).toBe(
      "Written service record",
    );
    expect(result.vendorSendReadinessWarnings).toContainEqual(
      expect.objectContaining({
        kind: "no_photos",
        copy: expect.stringContaining("written service record"),
      }),
    );
    expect(result.claimLimitCopy).toBe(
      "This is a written service record; photo evidence is not attached to this visit. The next-service step stays separate from the completed service result.",
    );
    expectNoOverclaim(result);
  });

  it("keeps after-only clean work as partial photo support", () => {
    const result = evaluate({
      values: values({ scenario: "clean" }),
      photoSlots: ["hood-after"],
    });

    expect(result.evidenceBasis).toBe("partial_photos");
    expect(result.claimLevel).toBe("partial_photo_record");
    expect(result.recordFormat.type).toBe("after_cleaning_record");
    expect(result.proofCoverage.shortLabel).toBe("1/7 captured");
    expect(result.canUsePhotoProofLanguage).toBe(false);
  });

  it("allows photo-supported language only when before and after core photos are attached", () => {
    const result = evaluate({
      values: values({ scenario: "clean" }),
      photoSlots: ["hood-before", "hood-after"],
    });

    expect(result.evidenceBasis).toBe("photo_record");
    expect(result.claimLevel).toBe("photo_supported_record");
    expect(result.recordFormat.type).toBe("photo_supported_service_record");
    expect(result.canUsePhotoProofLanguage).toBe(true);
    expect(result.proofCoverage.shortLabel).toBe("2/7 captured");
  });

  it("summarizes all recommended proof slots when the full photo set is captured", () => {
    const result = evaluate({
      values: values({ scenario: "clean" }),
      photoSlots: axis1FieldPhotoSlots.map((slot) => slot.id),
    });

    expect(result.proofCoverage.capturedCount).toBe(7);
    expect(result.recordFormat.type).toBe("photo_proof_packet");
    expect(result.proofCoverage.recommendedCount).toBe(7);
    expect(result.proofCoverage.label).toBe(
      "7 / 7 recommended photo areas captured",
    );
  });

  it("keeps generated outputs locked before the result is selected", () => {
    const result = evaluate({
      outcomeSelected: false,
      photoSlots: ["hood-after"],
    });

    expect(result.canGeneratePacket).toBe(false);
    expect(result.generatedOutputs.find((output) => output.kind === "customer_link")?.readiness).toBe(
      "needs_review",
    );
    expect(result.generatedOutputs.find((output) => output.kind === "invoice_proof_summary")?.readiness).toBe(
      "not_applicable",
    );
    expect(result.generatedOutputs.find((output) => output.kind === "payment_support_copy")?.readiness).toBe(
      "not_applicable",
    );
    expect(result.vendorSendReadinessWarnings).toContainEqual(
      expect.objectContaining({
        kind: "result_required",
        severity: "blocker",
      }),
    );
  });

  it("marks clean no-photo output as written record with internal review warnings", () => {
    const result = evaluate({
      values: values({ scenario: "clean" }),
    });

    expect(result.generatedOutputs.find((output) => output.kind === "customer_link")?.readiness).toBe(
      "ready",
    );
    expect(result.generatedOutputs.find((output) => output.kind === "invoice_proof_summary")?.readiness).toBe(
      "needs_review",
    );
    expect(result.generatedOutputs.find((output) => output.kind === "payment_support_copy")?.readiness).toBe(
      "needs_review",
    );
    expect(result.generatedOutputs.find((output) => output.kind === "internal_risk_summary")?.readiness).toBe(
      "needs_review",
    );
    expect(result.vendorSendReadinessWarnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "no_photos" }),
        expect.objectContaining({ kind: "missing_fan_photo" }),
        expect.objectContaining({ kind: "missing_duct_access_photo" }),
      ]),
    );
  });

  it("marks invoice proof ready only when clean photo coverage is strong", () => {
    const partial = evaluate({
      values: values({ scenario: "clean" }),
      photoSlots: ["hood-after"],
    });
    const strong = evaluate({
      values: values({ scenario: "clean" }),
      photoSlots: ["hood-before", "hood-after", "filter-bank", "access-condition", "rooftop-fan"],
    });

    expect(partial.recordFormat.type).toBe("after_cleaning_record");
    expect(partial.generatedOutputs.find((output) => output.kind === "invoice_proof_summary")?.readiness).toBe(
      "needs_review",
    );
    expect(strong.generatedOutputs.find((output) => output.kind === "invoice_proof_summary")?.readiness).toBe(
      "ready",
    );
    expect(strong.generatedOutputs.find((output) => output.kind === "payment_support_copy")?.readiness).toBe(
      "ready",
    );
    expect(strong.vendorSendReadinessWarnings.map((warning) => warning.kind)).not.toContain(
      "missing_fan_photo",
    );
    expect(strong.vendorSendReadinessWarnings.map((warning) => warning.kind)).not.toContain(
      "missing_duct_access_photo",
    );
  });

  it("separates revisit and quote generated outputs by selected result", () => {
    const blocked = evaluate({
      values: values({
        scenario: "exception",
        exceptionKinds: ["blocked-storage"],
        followUpMode: "monitor",
      }),
      photoSlots: ["access-condition"],
    });
    const condition = evaluate({
      values: values({
        scenario: "exception",
        exceptionKinds: ["rooftop-hinge-curb"],
        followUpMode: "quote",
      }),
      photoSlots: ["rooftop-fan"],
    });

    expect(blocked.generatedOutputs.find((output) => output.kind === "revisit_copy")?.readiness).toBe(
      "ready",
    );
    expect(blocked.generatedOutputs.find((output) => output.kind === "follow_up_quote_copy")?.readiness).toBe(
      "not_applicable",
    );
    expect(condition.generatedOutputs.find((output) => output.kind === "follow_up_quote_copy")?.readiness).toBe(
      "ready",
    );
    expect(condition.generatedOutputs.find((output) => output.kind === "revisit_copy")?.readiness).toBe(
      "not_applicable",
    );
  });

  it("maps clean closeout CTA links without requiring payment integration", () => {
    const result = evaluate({
      values: values({ scenario: "clean" }),
      links: {
        invoiceUrl: "https://pay.example/inv-100",
        paymentDueLabel: "$1,250 due",
        reviewUrl: "https://reviews.example/hood",
        nextServiceRequestUrl: "https://schedule.example/next",
        replyUrl: "mailto:dispatch@example.com",
      },
    });

    expect(result.primaryCta).toMatchObject({
      kind: "pay_invoice",
      label: "Pay invoice - $1,250 due",
      href: "https://pay.example/inv-100",
      enabled: true,
    });
    expect(result.customerActionType).toBe("pay_invoice");
    expect(result.customerActionTitle).toBe("Pay invoice");
    expect(result.customerActionCopy).toMatch(/Pay the invoice/);
    expect(result.ctas.find((cta) => cta.kind === "schedule_next_cleaning")?.href).toBe(
      "https://schedule.example/next",
    );
    expect(result.ctas.find((cta) => cta.kind === "leave_review")?.href).toBe(
      "https://reviews.example/hood",
    );
  });

  it.each([
    ["blocked-storage", "clear_access_then_revisit"],
    ["sealed-panel", "approve_access_correction"],
    ["panel-signage", "approve_access_correction"],
    ["unsafe-access", "make_access_safe"],
    ["not-cleaned", "approve_open_section_revisit"],
  ] as const)(
    "keeps %s blocked access separate from completed work",
    (exceptionKind, actionType) => {
      const result = evaluate({
        values: values({
          scenario: "exception",
          exceptionKinds: [exceptionKind],
          followUpMode: "monitor",
        }),
      });

      expect(result.caseType).toBe("access_exception");
      expect(result.outcomeType).toBe("blocked_access");
      expect(result.customerActionType).toBe(actionType);
      expect(result.primaryCta?.kind).toBe("reply_after_clearing_access");
      expect(result.claimLimitCopy).toMatch(/not presented as cleaned/);
      expectNoOverclaim(result);
    },
  );

  it("uses access issue CTA and partial coverage when only the access photo is attached", () => {
    const result = evaluate({
      values: values({
        scenario: "exception",
        exceptionKinds: ["blocked-storage"],
        followUpMode: "monitor",
      }),
      photoSlots: ["access-condition"],
    });

    expect(result.caseType).toBe("access_exception");
    expect(result.recordFormat.type).toBe("access_issue_record");
    expect(result.evidenceBasis).toBe("partial_photos");
    expect(result.primaryCta?.kind).toBe("reply_after_clearing_access");
    expect(result.proofCoverage.items.find((item) => item.id === "access-condition")?.state).toBe(
      "captured",
    );
  });

  it("maps blocked access CTA links to reply and revisit actions", () => {
    const result = evaluate({
      values: values({
        scenario: "exception",
        exceptionKinds: ["blocked-storage"],
        followUpMode: "monitor",
      }),
      links: {
        replyUrl: "mailto:dispatch@example.com",
        nextServiceRequestUrl: "https://schedule.example/revisit",
      },
    });

    expect(result.primaryCta).toMatchObject({
      kind: "reply_after_clearing_access",
      href: "mailto:dispatch@example.com",
      enabled: true,
    });
    expect(result.ctas.find((cta) => cta.kind === "request_revisit")?.href).toBe(
      "https://schedule.example/revisit",
    );
  });

  it.each([
    ["quote", "review_condition_quote", "request_quote", "Request follow-up quote"],
    ["monitor", "monitor_condition", "confirm_next_service", "Confirm next service"],
    ["none", "record_only", "confirm_received", "Confirm received"],
  ] as const)(
    "keeps condition review as recorded condition language in %s mode",
    (followUpMode, actionType, ctaKind, ctaLabel) => {
      const result = evaluate({
        values: values({
          scenario: "exception",
          exceptionKinds: ["rooftop-hinge-curb"],
          followUpMode,
        }),
      });

      expect(result.caseType).toBe("condition_review");
      expect(result.outcomeType).toBe("condition_review");
      expect(result.customerActionType).toBe(actionType);
      expect(result.primaryCta?.kind).toBe(ctaKind);
      expect(result.primaryCta?.label).toBe(ctaLabel);
      expect(result.responsibilityCopy).toMatch(/not/i);
      expectNoOverclaim(result);
    },
  );

  it("records intentionally unresolved proof slots without treating them as captured", () => {
    const result = evaluate({
      values: values({ scenario: "clean" }),
      photoSlotResolutions: resolutions({
        "hood-before": "not-captured",
        "hood-after": "not-applicable",
      }),
    });

    expect(result.proofCoverage.items.find((item) => item.id === "hood-before")?.state).toBe(
      "not_captured",
    );
    expect(result.proofCoverage.items.find((item) => item.id === "hood-after")?.state).toBe(
      "not_applicable",
    );
    expect(result.proofCoverage.capturedCount).toBe(0);
    expect(result.proofCoverage.requiredOpenCount).toBe(0);
  });

  it("uses photo-supported service record for hood-before-only photos", () => {
    const result = evaluate({
      values: values({ scenario: "clean" }),
      photoSlots: ["hood-before"],
    });

    expect(result.recordFormat.type).toBe("photo_supported_service_record");
    expect(result.evidenceBasis).toBe("partial_photos");
    expect(result.canUsePhotoProofLanguage).toBe(false);
    expectNoOverclaim(result);
  });

  it.each([
    ["sealed-panel", ["hood-after", "access-condition"]],
    ["unsafe-access", []],
    ["not-cleaned", ["access-condition", "service-label"]],
    ["panel-signage", []],
  ] as const)(
    "keeps %s as access issue format across sparse proof coverage",
    (exceptionKind, photoSlots) => {
      const result = evaluate({
        values: values({
          scenario: "exception",
          exceptionKinds: [exceptionKind],
          followUpMode: "monitor",
        }),
        photoSlots: [...photoSlots],
      });

      expect(result.caseType).toBe("access_exception");
      expect(result.recordFormat.type).toBe("access_issue_record");
      expect(result.primaryCta?.kind).toBe("reply_after_clearing_access");
      expect(result.claimLimitCopy).toContain("not presented as cleaned");
      expectNoOverclaim(result);
    },
  );

  it("prioritizes access issue format when access and condition items are mixed", () => {
    const result = evaluate({
      values: values({
        scenario: "exception",
        exceptionKinds: ["blocked-storage", "rooftop-hinge-curb"],
        followUpMode: "quote",
      }),
      photoSlots: ["access-condition", "rooftop-fan"],
    });

    expect(result.caseType).toBe("access_exception");
    expect(result.outcomeType).toBe("blocked_access");
    expect(result.recordFormat.type).toBe("access_issue_record");
    expect(result.primaryCta?.kind).toBe("reply_after_clearing_access");
    expectNoOverclaim(result);
  });

  it("keeps service label not captured as explicit coverage state", () => {
    const result = evaluate({
      values: values({ scenario: "clean" }),
      photoSlotResolutions: resolutions({
        "service-label": "not-captured",
      }),
    });

    expect(result.proofCoverage.items.find((item) => item.id === "service-label")?.state).toBe(
      "not_captured",
    );
    expect(result.proofCoverage.capturedCount).toBe(0);
    expectNoOverclaim(result);
  });

  it("does not count optional not-applicable proof slots as captured", () => {
    const result = evaluate({
      values: values({ scenario: "clean" }),
      photoSlotResolutions: resolutions({
        "filter-bank": "not-applicable",
        "access-condition": "not-applicable",
        "rooftop-fan": "not-applicable",
        "grease-containment": "not-applicable",
        "service-label": "not-applicable",
      }),
    });

    expect(result.proofCoverage.capturedCount).toBe(0);
    expect(result.proofCoverage.items.filter((item) => item.state === "not_applicable")).toHaveLength(5);
    expectNoOverclaim(result);
  });

  it("maps condition review CTA links to quote and next-service actions", () => {
    const result = evaluate({
      values: values({
        scenario: "exception",
        exceptionKinds: ["rooftop-hinge-curb"],
        followUpMode: "quote",
      }),
      links: {
        followUpQuoteUrl: "https://quotes.example/follow-up",
        nextServiceRequestUrl: "https://schedule.example/next",
        replyUrl: "mailto:dispatch@example.com",
      },
    });

    expect(result.primaryCta).toMatchObject({
      kind: "request_quote",
      href: "https://quotes.example/follow-up",
      enabled: true,
    });
    expect(result.ctas.find((cta) => cta.kind === "confirm_next_service")?.href).toBe(
      "https://schedule.example/next",
    );
  });

  it("maps monitor condition edits to next-service primary CTA", () => {
    const result = evaluate({
      values: values({
        scenario: "exception",
        exceptionKinds: ["fan-belt-drive"],
        followUpMode: "monitor",
      }),
      links: {
        nextServiceRequestUrl: "https://schedule.example/next",
        replyUrl: "mailto:dispatch@example.com",
      },
    });

    expect(result.customerActionType).toBe("monitor_condition");
    expect(result.primaryCta).toMatchObject({
      kind: "confirm_next_service",
      label: "Confirm next service",
      href: "https://schedule.example/next",
      enabled: true,
    });
    expect(result.ctas.find((cta) => cta.kind === "reply_with_questions")?.label).toBe(
      "Reply if condition changes",
    );
  });

  it("maps record-only condition edits to acknowledgement primary CTA", () => {
    const result = evaluate({
      values: values({
        scenario: "exception",
        exceptionKinds: ["liquid-tight"],
        followUpMode: "none",
      }),
      links: {
        nextServiceRequestUrl: "https://schedule.example/next",
        replyUrl: "mailto:dispatch@example.com",
      },
    });

    expect(result.customerActionType).toBe("record_only");
    expect(result.primaryCta).toMatchObject({
      kind: "confirm_received",
      label: "Confirm received",
      href: "mailto:dispatch@example.com",
      enabled: true,
    });
    expect(result.ctas.find((cta) => cta.kind === "confirm_next_service")?.href).toBe(
      "https://schedule.example/next",
    );
  });

  it("injects CTA and proof coverage into packet data through the adapter", () => {
    const result = evaluate({
      values: values({
        scenario: "exception",
        exceptionKinds: ["blocked-storage"],
        followUpMode: "monitor",
      }),
      photoSlots: ["access-condition"],
    });
    const packet = applyAxis1CloseoutEngineToPacket(
      buildAxis1NeutralPacketData(
        values({
          scenario: "exception",
          exceptionKinds: ["blocked-storage"],
          followUpMode: "monitor",
        }),
      ),
      result,
    );

    expect(packet.closeout?.primaryCta?.kind).toBe("reply_after_clearing_access");
    expect(packet.closeout?.recordFormat.type).toBe("access_issue_record");
    expect(packet.closeout?.proofCoverage.shortLabel).toBe("1/7 captured");
    expect(packet.packetHeader.quickFacts).toContainEqual([
      "Customer next step",
      "Reply after clearing access",
    ]);
    expect(packet.customerClose.actionItems).toContainEqual([
      "Record type",
      "Access Issue Record",
    ]);
    expect(packet.customerClose.actionItems).toContainEqual([
      "Reply or action",
      result.customerActionCopy,
    ]);
    expect(packet.customerClose.actionItems).toContainEqual([
      "Evidence PDF",
      "Evidence, archive, submission, or print copy",
    ]);
    expect(packet.photoCoverageRows.find((row) => row.item === "Access condition")?.status).toBe(
      "Captured",
    );
  });

  it("keeps vendor-edited customer copy while retaining engine claim limits", () => {
    const editedValues = values({
      scenario: "clean",
      summaryOverride:
        "Reachable hood areas were serviced today. No field photos were captured for this visit",
      customerActionOverride:
        "Please pay the invoice and reply if the next service window needs to move",
    });
    const result = evaluate({
      values: editedValues,
      photoSlots: [],
    });
    const packet = applyAxis1CloseoutEngineToPacket(
      buildAxis1NeutralPacketData(editedValues),
      result,
    );

    expect(result.customerResultCopy).toBe(
      "Reachable hood areas were serviced today. No field photos were captured for this visit.",
    );
    expect(result.customerActionCopy).toBe(
      "Please pay the invoice and reply if the next service window needs to move.",
    );
    expect(packet.packetHeader.copy).toContain(
      "Reachable hood areas were serviced today.",
    );
    expect(packet.packetHeader.copy).toContain("written service record");
    expect(packet.summaryCards[0]).toMatchObject({
      copy:
        "Reachable hood areas were serviced today. No field photos were captured for this visit.",
    });
    expect(packet.customerClose.actionItems).toContainEqual([
      "Reply or action",
      "Please pay the invoice and reply if the next service window needs to move.",
    ]);
    expect(packet.closeout?.claimLevel).toBe("written_record");
    expect(packet.closeout?.proofCoverage.shortLabel).toBe("Written record");
  });

  it("keeps field-photo attachment separate from engine-owned record format", () => {
    const basePacket = buildAxis1NeutralPacketData(values({ scenario: "clean" }));
    const photoPacket = buildAxis1PacketDataWithFieldPhotos(
      basePacket,
      photos(["hood-after"]),
      resolutions(),
    );

    expect(photoPacket.packetHeader.quickFacts.map(([label]) => label)).not.toContain(
      "Record type",
    );
    expect(photoPacket.proofPolicyRows.map(([label]) => label)).not.toContain(
      "Record type",
    );
    expect(photoPacket.proofPhotos).toHaveLength(1);

    const enginePacket = applyAxis1CloseoutEngineToPacket(
      photoPacket,
      evaluate({
        values: values({ scenario: "clean" }),
        photoSlots: ["hood-after"],
      }),
    );

    expect(enginePacket.closeout?.recordFormat.type).toBe(
      "after_cleaning_record",
    );
    expect(enginePacket.packetHeader.quickFacts).toContainEqual([
      "Record type",
      "After-Cleaning Service Record",
    ]);
  });

  it("replaces stale photo policy rows for no-photo clean packets", () => {
    const result = evaluate({
      values: values({ scenario: "clean" }),
      photoSlots: [],
    });
    const packet = applyAxis1CloseoutEngineToPacket(
      buildAxis1NeutralPacketData(values({ scenario: "clean" })),
      result,
    );

    expect(packet.proofPolicyRows[0]).toEqual([
      "What you are seeing",
      expect.stringContaining("record basis"),
    ]);
    expect(packet.proofPolicyRows[1]).toEqual([
      "What stays in service records",
      expect.not.stringMatching(/raw field photos/i),
    ]);
    expect(
      packet.proofPolicyRows.flatMap((row) => row).join(" "),
    ).not.toMatch(/not every raw image|photo archive/i);
    expect(packet.customerClose.actionItems).toContainEqual([
      "Reply or action",
      expect.stringContaining("confirm the next service window"),
    ]);
    expect(
      packet.customerClose.actionItems.flatMap((row) => row).join(" "),
    ).not.toMatch(/Pay the invoice/i);
  });

  it("keeps no-photo proof coverage outcome-specific", () => {
    const clean = evaluate({
      values: values({ scenario: "clean" }),
      photoSlots: [],
    });
    const blocked = evaluate({
      values: values({
        scenario: "exception",
        exceptionKinds: ["blocked-storage"],
      }),
      photoSlots: [],
    });
    const condition = evaluate({
      values: values({
        scenario: "exception",
        exceptionKinds: ["rooftop-hinge-curb"],
        followUpMode: "quote",
      }),
      photoSlots: [],
    });

    expect(clean.proofCoverage.shortLabel).toBe("Written record");
    expect(blocked.proofCoverage.shortLabel).toBe("Access record");
    expect(condition.proofCoverage.shortLabel).toBe("Condition record");
    expect(blocked.proofCoverage.label).toContain("access");
    expect(condition.proofCoverage.label).toContain("condition");
  });

  it("builds case-specific service coverage education", () => {
    const clean = evaluate({
      values: values({ scenario: "clean" }),
      photoSlots: ["hood-before", "hood-after", "filter-bank"],
    });
    const blocked = evaluate({
      values: values({
        scenario: "exception",
        exceptionKinds: ["blocked-storage"],
      }),
      photoSlots: ["access-condition"],
    });
    const condition = evaluate({
      values: values({
        scenario: "exception",
        exceptionKinds: ["rooftop-hinge-curb"],
        followUpMode: "quote",
      }),
      photoSlots: ["rooftop-fan"],
    });

    expect(clean.coverageEducation.title).toBe(
      "What this service covered",
    );
    expect(blocked.coverageEducation.items).toContainEqual(
      expect.objectContaining({
        label: "Blocked or inaccessible area",
        state: "action_required",
      }),
    );
    expect(condition.coverageEducation.items).toContainEqual(
      expect.objectContaining({
        label: "Recorded condition",
        state: "recorded",
      }),
    );
    expectNoOverclaim(clean);
    expectNoOverclaim(blocked);
    expectNoOverclaim(condition);
  });

  it("builds engine-backed clean, blocked, and condition sample variants", () => {
    const clean = buildAxis1SampleProofData("clean");
    const blocked = buildAxis1SampleProofData("blocked_access");
    const condition = buildAxis1SampleProofData("condition_review");

    expect(clean.closeout?.outcomeType).toBe("clean");
    expect(clean.closeout?.primaryCta?.kind).toBe("pay_invoice");
    expect(clean.closeout?.proofCoverage.shortLabel).toBe("5/7 captured");

    expect(blocked.closeout?.outcomeType).toBe("blocked_access");
    expect(blocked.closeout?.primaryCta?.kind).toBe("reply_after_clearing_access");
    expect(blocked.closeout?.proofCoverage.shortLabel).toBe("3/7 captured");
    expect(
      blocked.closeout?.coverageEducation.items.find(
        (item) => item.state === "action_required",
      )?.copy,
    ).toMatch(/not presented as cleaned/i);

    expect(condition.closeout?.outcomeType).toBe("condition_review");
    expect(condition.closeout?.primaryCta?.kind).toBe("request_quote");
    expect(condition.closeout?.proofCoverage.shortLabel).toBe("4/7 captured");
    expect(condition.closeout?.coverageEducation.summary).toMatch(
      /recorded condition/i,
    );
  });

  it("keeps sample customer-facing content locked to customer link and evidence PDF language", () => {
    (["clean", "blocked_access", "condition_review"] as const).forEach((variant) => {
      const packet = buildAxis1SampleProofData(variant);
      const customerText = allPacketCustomerText(packet);

      expect(customerText).not.toMatch(forbiddenCustomerFacingContentPattern);
      expect(customerText).toMatch(/customer link/i);
      expect(customerText).toMatch(/evidence PDF/i);
      expect(packet.closeout?.recordFormat.label).not.toMatch(/packet/i);
    });
  });
});

