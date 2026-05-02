import { describe, expect, it } from "vitest";
import {
  applyAxis1CloseoutEngineToPacket,
  evaluateAxis1Closeout,
} from "@/lib/axis1-closeout-engine";
import {
  axis1BuilderDefaults,
  buildAxis1NeutralPacketData,
  type Axis1BuilderFormValues,
} from "@/lib/axis1-packet-builder";
import {
  applyConfirmedAxis1PhotoAssistSuggestions,
  axis1PhotoAssistLowConfidenceThreshold,
  buildMockAxis1PhotoAssistSuggestions,
  normalizeAxis1PhotoAssistSuggestions,
  setAxis1PhotoAssistDecision,
  shouldKeepAxis1PhotoAssistSuggestionInReview,
} from "@/lib/axis1-photo-assist";
import {
  buildAxis1PacketDataWithFieldPhotos,
  emptyAxis1FieldPhotoState,
  emptyAxis1PhotoSlotResolutions,
  type Axis1UploadedFieldPhoto,
  type Axis1UploadedFieldPhotoState,
} from "@/lib/axis1-field-photos";

const forbiddenOverclaimPattern =
  /NFPA|compliance|pass\/fail|pass-fail|fire marshal|official|certificate|inspection|approval|repair|AI-verified|verified cleaning/i;

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

function photo(name: string): Axis1UploadedFieldPhoto {
  return {
    src: `/test/${name}`,
    name,
    source: "bulk",
    confidence: "keyword",
    matchLabel: "AI suggested",
    vendorDecision: "pending",
  };
}

function evaluateWithPhotos(options: {
  values?: Axis1BuilderFormValues;
  outcomeSelected?: boolean;
  uploadedFieldPhotos?: Axis1UploadedFieldPhotoState;
}) {
  return evaluateAxis1Closeout({
    values: options.values ?? values(),
    outcomeSelected: options.outcomeSelected ?? true,
    uploadedFieldPhotos:
      options.uploadedFieldPhotos ?? emptyAxis1FieldPhotoState(),
    unplacedPhotoCount: 0,
    photoSlotResolutions: emptyAxis1PhotoSlotResolutions(),
  });
}

describe("Axis1 AI Photo Assist boundary", () => {
  it("does not generate output when AI suggests a clean candidate before vendor result selection", () => {
    const suggestions = buildMockAxis1PhotoAssistSuggestions([
      {
        photoId: "p1",
        fileName: "hood-after-clean.jpg",
      },
    ]);
    const result = evaluateWithPhotos({ outcomeSelected: false });

    expect(suggestions[0]?.suggestedSlotId).toBe("hood-after");
    expect(suggestions[0]?.vendorDecision).toBe("pending");
    expect(result.canGeneratePacket).toBe(false);
    expect(result.caseType).toBe("needs_outcome");
    expect(result.blockingReason).toMatch(/Select today's service result/);
  });

  it("does not raise proof coverage from AI suggestion alone", () => {
    const suggestions = buildMockAxis1PhotoAssistSuggestions([
      {
        photoId: "p1",
        fileName: "hood-before-dirty.jpg",
      },
      {
        photoId: "p2",
        fileName: "hood-after-clean.jpg",
      },
    ]);
    const result = evaluateWithPhotos({
      values: values({ scenario: "clean" }),
      uploadedFieldPhotos: emptyAxis1FieldPhotoState(),
    });

    expect(suggestions).toHaveLength(2);
    expect(result.evidenceBasis).toBe("no_photos");
    expect(result.claimLevel).toBe("written_record");
    expect(result.proofCoverage.shortLabel).toBe("Written record");
  });

  it("flags low-confidence generic phone photos for vendor review", () => {
    const [suggestion] = buildMockAxis1PhotoAssistSuggestions([
      {
        photoId: "phone-1",
        fileName: "IMG_2044.jpg",
      },
    ]);

    expect(suggestion.confidence).toBeLessThan(0.72);
    expect(suggestion.needsVendorReview).toBe(true);
    expect(suggestion.vendorDecision).toBe("pending");
  });

  it("flags high-risk filename cues for vendor review even when a slot matches", () => {
    const suggestions = buildMockAxis1PhotoAssistSuggestions([
      {
        photoId: "dirty-filter",
        fileName: "dirty-hood-filter-wide.jpg",
      },
      {
        photoId: "blocked-area",
        fileName: "blocked_area_cleaned_questionmark.jpg",
      },
    ]);

    expect(suggestions[0]?.suggestedSlotId).toBe("filter-bank");
    expect(suggestions[0]?.confidence).toBeGreaterThanOrEqual(0.72);
    expect(suggestions[0]?.needsVendorReview).toBe(true);
    expect(suggestions[1]?.suggestedSlotId).toBe("access-condition");
    expect(suggestions[1]?.needsVendorReview).toBe(true);
  });

  it("keeps unsafe fallback matches out of proof slots when filenames are commercially ambiguous", () => {
    const suggestions = buildMockAxis1PhotoAssistSuggestions([
      {
        photoId: "wall-fan",
        fileName: "kitchen-exhaust-fan.jpg",
      },
      {
        photoId: "roof-final",
        fileName: "roof-top-final-final.jpg",
      },
    ]);

    expect(suggestions[0]?.suggestedSlotId).toBeNull();
    expect(suggestions[0]?.needsVendorReview).toBe(true);
    expect(suggestions[0]?.confidence).toBeLessThan(axis1PhotoAssistLowConfidenceThreshold);
    expect(suggestions[1]?.suggestedSlotId).toBe("rooftop-fan");
    expect(suggestions[1]?.needsVendorReview).toBe(true);
    expect(suggestions[1]?.vendorDecision).toBe("pending");
  });

  it("keeps risky blocked or ambiguous suggestions in the review queue", () => {
    const riskyAfterSuggestion = normalizeAxis1PhotoAssistSuggestions(
      [
        {
          photoId: "blocked-area",
          fileName: "blocked_area_cleaned_questionmark.jpg",
          suggestedSlotId: "hood-after",
          suggestedTone: "after",
          confidence: 0.85,
          needsVendorReview: true,
          reason:
            "The image appears cleaned, but the blocked access filename needs review.",
        },
        {
          photoId: "phone-before",
          fileName: "IMG_7421.jpg",
          suggestedSlotId: "hood-before",
          suggestedTone: "before",
          confidence: 0.9,
          needsVendorReview: true,
          reason:
            "The image content clearly shows a greasy hood before service; filename is generic.",
        },
      ],
      [
        {
          photoId: "blocked-area",
          fileName: "blocked_area_cleaned_questionmark.jpg",
        },
        {
          photoId: "phone-before",
          fileName: "IMG_7421.jpg",
        },
      ],
      "gemini",
    );

    expect(
      shouldKeepAxis1PhotoAssistSuggestionInReview(riskyAfterSuggestion[0]),
    ).toBe(true);
    expect(
      shouldKeepAxis1PhotoAssistSuggestionInReview(riskyAfterSuggestion[1]),
    ).toBe(false);
  });

  it("forces vendor review when a model returns low confidence without review flag", () => {
    const [suggestion] = normalizeAxis1PhotoAssistSuggestions(
      [
        {
          photoId: "p1",
          fileName: "hood-after-clean.jpg",
          suggestedSlotId: "hood-after",
          suggestedTone: "after",
          confidence: 0.31,
          needsVendorReview: false,
          reason: "Possible after photo.",
        },
      ],
      [
        {
          photoId: "p1",
          fileName: "hood-after-clean.jpg",
        },
      ],
      "gemini",
    );

    expect(suggestion.needsVendorReview).toBe(true);
    expect(suggestion.vendorDecision).toBe("pending");
  });

  it("lets low-risk Gemini filter after-service phone photos skip the manual review queue", () => {
    const [suggestion] = normalizeAxis1PhotoAssistSuggestions(
      [
        {
          photoId: "phone-after",
          fileName: "IMG_7422.jpg",
          suggestedSlotId: "filter-bank",
          suggestedTone: "after",
          confidence: 0.92,
          needsVendorReview: false,
          reason: "Shows a cleaned metal mesh filter.",
        },
      ],
      [
        {
          photoId: "phone-after",
          fileName: "IMG_7422.jpg",
        },
      ],
      "gemini",
    );

    expect(suggestion.needsVendorReview).toBe(false);
    expect(suggestion.vendorDecision).toBe("pending");
    expect(shouldKeepAxis1PhotoAssistSuggestionInReview(suggestion)).toBe(false);
  });

  it("keeps high-confidence Gemini generic phone photos in review when the reason has risk cues", () => {
    const suggestions = normalizeAxis1PhotoAssistSuggestions(
      [
        {
          photoId: "phone-dirty-filter",
          fileName: "IMG_7423.jpg",
          suggestedSlotId: "filter-bank",
          suggestedTone: "after",
          confidence: 0.92,
          needsVendorReview: false,
          reason: "Shows a dirty mesh filter before cleaning.",
        },
        {
          photoId: "phone-clean-duct",
          fileName: "IMG_7424.jpg",
          suggestedSlotId: "hood-after",
          suggestedTone: "after",
          confidence: 0.92,
          needsVendorReview: false,
          reason: "Shows clean duct or plenum interior after service.",
        },
      ],
      [
        {
          photoId: "phone-dirty-filter",
          fileName: "IMG_7423.jpg",
        },
        {
          photoId: "phone-clean-duct",
          fileName: "IMG_7424.jpg",
        },
      ],
      "gemini",
    );

    expect(suggestions[0]?.suggestedSlotId).toBe("filter-bank");
    expect(suggestions[0]?.needsVendorReview).toBe(true);
    expect(suggestions[0]?.vendorDecision).toBe("pending");
    expect(suggestions[1]?.suggestedSlotId).toBe("access-condition");
    expect(suggestions[1]?.needsVendorReview).toBe(true);
    expect(suggestions[1]?.vendorDecision).toBe("pending");
  });

  it("keeps generic hood-after photos in review even when Gemini says they look clean", () => {
    const [suggestion] = normalizeAxis1PhotoAssistSuggestions(
      [
        {
          photoId: "phone-clean-hood",
          fileName: "IMG_6104.jpg",
          suggestedSlotId: "hood-after",
          suggestedTone: "after",
          confidence: 0.9,
          needsVendorReview: false,
          reason: "Visible content clearly shows a cleaned hood canopy interior.",
        },
      ],
      [
        {
          photoId: "phone-clean-hood",
          fileName: "IMG_6104.jpg",
        },
      ],
      "gemini",
    );

    expect(suggestion.suggestedSlotId).toBe("hood-after");
    expect(suggestion.needsVendorReview).toBe(true);
    expect(suggestion.vendorDecision).toBe("pending");
  });

  it("forces vendor review for Gemini before, grease, duct, and record-like photos", () => {
    const suggestions = normalizeAxis1PhotoAssistSuggestions(
      [
        {
          photoId: "grease-bucket",
          fileName: "grease-removed-bucket.jpg",
          suggestedSlotId: "grease-containment",
          suggestedTone: "record",
          confidence: 0.91,
          needsVendorReview: false,
          reason: "Shows removed grease being collected in a bucket.",
        },
        {
          photoId: "duct-before",
          fileName: "clean-exhaust-duct.jpg",
          suggestedSlotId: "hood-before",
          suggestedTone: "before",
          confidence: 0.9,
          needsVendorReview: false,
          reason: "Shows a visibly dirty duct or plenum before cleaning.",
        },
      ],
      [
        {
          photoId: "grease-bucket",
          fileName: "grease-removed-bucket.jpg",
        },
        {
          photoId: "duct-before",
          fileName: "clean-exhaust-duct.jpg",
        },
      ],
      "gemini",
    );

    expect(suggestions.map((suggestion) => suggestion.needsVendorReview)).toEqual([
      true,
      true,
    ]);
    expect(suggestions[1]?.suggestedSlotId).toBe("access-condition");
    expect(suggestions[1]?.suggestedTone).toBe("issue");
  });

  it("coerces Gemini duct or plenum images away from hood slots", () => {
    const suggestions = normalizeAxis1PhotoAssistSuggestions(
      [
        {
          photoId: "clean-duct",
          fileName: "IMG_123149.jpg",
          suggestedSlotId: "hood-after",
          suggestedTone: "after",
          confidence: 0.4,
          needsVendorReview: true,
          reason:
            "Blurry image of a duct interior, possibly after cleaning, but difficult to confirm due to low resolution.",
        },
      ],
      [
        {
          photoId: "clean-duct",
          fileName: "IMG_123149.jpg",
        },
      ],
      "gemini",
    );

    expect(suggestions[0]?.suggestedSlotId).toBe("access-condition");
    expect(suggestions[0]?.suggestedTone).toBe("record");
    expect(suggestions[0]?.needsVendorReview).toBe(true);
    expect(shouldKeepAxis1PhotoAssistSuggestionInReview(suggestions[0])).toBe(true);
  });

  it("keeps hood-side plenum suggestions in hood slots when duct or access is absent", () => {
    const [suggestion] = normalizeAxis1PhotoAssistSuggestions(
      [
        {
          photoId: "hood-plenum",
          fileName: "IMG_123152.jpg",
          suggestedSlotId: "hood-before",
          suggestedTone: "before",
          confidence: 0.88,
          needsVendorReview: true,
          reason: "Visible hood-side plenum before cleaning.",
        },
      ],
      [
        {
          photoId: "hood-plenum",
          fileName: "IMG_123152.jpg",
        },
      ],
      "gemini",
    );

    expect(suggestion.suggestedSlotId).toBe("hood-before");
    expect(suggestion.suggestedTone).toBe("before");
    expect(suggestion.needsVendorReview).toBe(true);
  });

  it("does not move clear rooftop fan suggestions just because ductwork is mentioned", () => {
    const [suggestion] = normalizeAxis1PhotoAssistSuggestions(
      [
        {
          photoId: "rooftop-fan",
          fileName: "IMG_123147.jpg",
          suggestedSlotId: "rooftop-fan",
          suggestedTone: "record",
          confidence: 0.9,
          needsVendorReview: true,
          reason: "Shows a rooftop exhaust fan and ductwork being cleaned.",
        },
      ],
      [
        {
          photoId: "rooftop-fan",
          fileName: "IMG_123147.jpg",
        },
      ],
      "gemini",
    );

    expect(suggestion.suggestedSlotId).toBe("rooftop-fan");
    expect(suggestion.suggestedTone).toBe("record");
    expect(suggestion.needsVendorReview).toBe(true);
  });

  it("keeps Gemini access-condition tones out of before or after proof states", () => {
    const suggestions = normalizeAxis1PhotoAssistSuggestions(
      [
        {
          photoId: "clean-duct",
          fileName: "IMG_123149.jpg",
          suggestedSlotId: "access-condition",
          suggestedTone: "after",
          confidence: 0.9,
          needsVendorReview: true,
          reason: "Cleaned duct interior or access opening.",
        },
        {
          photoId: "dirty-duct",
          fileName: "IMG_123150.jpg",
          suggestedSlotId: "access-condition",
          suggestedTone: "before",
          confidence: 0.9,
          needsVendorReview: true,
          reason: "Dirty duct interior or access opening with heavy grease buildup.",
        },
      ],
      [
        {
          photoId: "clean-duct",
          fileName: "IMG_123149.jpg",
        },
        {
          photoId: "dirty-duct",
          fileName: "IMG_123150.jpg",
        },
      ],
      "gemini",
    );

    expect(suggestions[0]?.suggestedTone).toBe("record");
    expect(suggestions[1]?.suggestedTone).toBe("issue");
  });

  it("keeps borderline field-photo confidence in the review queue", () => {
    const [suggestion] = normalizeAxis1PhotoAssistSuggestions(
      [
        {
          photoId: "duct-access",
          fileName: "IMG_0007.jpg",
          suggestedSlotId: "access-condition",
          suggestedTone: "record",
          confidence: 0.78,
          needsVendorReview: true,
          reason:
            "The image shows work in an access area, but the exact role is not fully clear.",
        },
      ],
      [
        {
          photoId: "duct-access",
          fileName: "IMG_0007.jpg",
        },
      ],
      "gemini",
    );

    expect(suggestion.needsVendorReview).toBe(true);
    expect(shouldKeepAxis1PhotoAssistSuggestionInReview(suggestion)).toBe(true);
  });

  it("does not reflect rejected suggestions in packet photo data", () => {
    const [pending] = buildMockAxis1PhotoAssistSuggestions([
      {
        photoId: "p1",
        fileName: "hood-after-clean.jpg",
      },
    ]);
    const rejected = setAxis1PhotoAssistDecision(pending, "rejected");
    const uploaded = applyConfirmedAxis1PhotoAssistSuggestions({
      suggestions: [rejected],
      photosById: new Map([["p1", photo("hood-after-clean.jpg")]]),
    });
    const packet = applyAxis1CloseoutEngineToPacket(
      buildAxis1PacketDataWithFieldPhotos(
        buildAxis1NeutralPacketData(values({ scenario: "clean" })),
        uploaded,
        emptyAxis1PhotoSlotResolutions(),
      ),
      evaluateWithPhotos({
        values: values({ scenario: "clean" }),
        uploadedFieldPhotos: uploaded,
      }),
    );

    expect(Object.values(uploaded).filter(Boolean)).toHaveLength(0);
    expect(packet.proofPhotos).toHaveLength(0);
    expect(packet.closeout?.evidenceBasis).toBe("no_photos");
  });

  it("only confirmed or edited suggestions can become confirmed photo input", () => {
    const [pendingBefore, pendingAfter] = buildMockAxis1PhotoAssistSuggestions([
      {
        photoId: "p1",
        fileName: "hood-before-dirty.jpg",
      },
      {
        photoId: "p2",
        fileName: "hood-after-clean.jpg",
      },
    ]);
    const uploaded = applyConfirmedAxis1PhotoAssistSuggestions({
      suggestions: [
        setAxis1PhotoAssistDecision(pendingBefore, "confirmed"),
        setAxis1PhotoAssistDecision(pendingAfter, "edited", "hood-after"),
      ],
      photosById: new Map([
        ["p1", photo("hood-before-dirty.jpg")],
        ["p2", photo("hood-after-clean.jpg")],
      ]),
    });
    const result = evaluateWithPhotos({
      values: values({ scenario: "clean" }),
      uploadedFieldPhotos: uploaded,
    });

    expect(uploaded["hood-before"]?.vendorDecision).toBe("confirmed");
    expect(uploaded["hood-after"]?.vendorDecision).toBe("edited");
    expect(uploaded["hood-after"]?.needsVendorReview).toBe(false);
    expect(result.evidenceBasis).toBe("photo_record");
    expect(result.claimLevel).toBe("photo_supported_record");
  });

  it("keeps no-photo clean as a written service record even when suggestions exist", () => {
    buildMockAxis1PhotoAssistSuggestions([
      {
        photoId: "p1",
        fileName: "hood-after-clean.jpg",
      },
    ]);
    const result = evaluateWithPhotos({
      values: values({ scenario: "clean" }),
    });

    expect(result.caseType).toBe("clean_closeout");
    expect(result.evidenceBasis).toBe("no_photos");
    expect(result.recordFormat.type).toBe("service_closeout_record");
    expect(result.primaryCta?.kind).toBe("confirm_next_service");
  });

  it("keeps blocked access from being represented as cleaned", () => {
    const result = evaluateWithPhotos({
      values: values({
        scenario: "exception",
        exceptionKinds: ["blocked-storage"],
        followUpMode: "monitor",
      }),
    });

    expect(result.caseType).toBe("access_exception");
    expect(result.claimLimitCopy).toMatch(/not presented as cleaned/);
    expect(result.responsibilityCopy).toMatch(/blocked section stays listed separately/);
    expect(JSON.stringify(result)).not.toMatch(forbiddenOverclaimPattern);
  });

  it("keeps condition review away from repair, compliance, and inspection claims", () => {
    const result = evaluateWithPhotos({
      values: values({
        scenario: "exception",
        exceptionKinds: ["rooftop-hinge-curb"],
        followUpMode: "quote",
      }),
    });

    expect(result.caseType).toBe("condition_review");
    expect(result.primaryCta?.kind).toBe("request_quote");
    expect(result.claimLimitCopy).toMatch(/Recorded conditions and follow-up paths are separate/);
    expect(JSON.stringify(result)).not.toMatch(forbiddenOverclaimPattern);
  });
});
