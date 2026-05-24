import {
  axis1FieldPhotoSlots,
  emptyAxis1FieldPhotoState,
  type Axis1FieldPhotoSlot,
  type Axis1FieldPhotoSlotId,
  type Axis1UploadedFieldPhoto,
  type Axis1UploadedFieldPhotoState,
} from "@/lib/axis1-field-photos";

// Service Report Builder Photo Assist is a company-side organizer only. Suggestions stay
// separate from confirmed photo state until the vendor confirms, edits, or
// rejects them; the closeout engine must continue to read confirmed inputs.
export type Axis1PhotoAssistSuggestedTone =
  | "before"
  | "after"
  | "issue"
  | "record"
  | "unknown";

export type Axis1PhotoAssistSource = "mock" | "gemini";

export type Axis1PhotoAssistVendorDecision =
  | "confirmed"
  | "edited"
  | "rejected"
  | "pending";

export type Axis1PhotoAssistSuggestion = {
  id: string;
  photoId: string;
  fileName: string;
  suggestedSlotId: Axis1FieldPhotoSlotId | null;
  suggestedTone: Axis1PhotoAssistSuggestedTone;
  confidence: number;
  needsVendorReview: boolean;
  reason: string;
  source: Axis1PhotoAssistSource;
  vendorDecision: Axis1PhotoAssistVendorDecision;
  confirmedSlotId?: Axis1FieldPhotoSlotId;
};

export type Axis1PhotoAssistInputPhoto = {
  photoId: string;
  fileName: string;
  dataUrl?: string;
  currentSlotId?: Axis1FieldPhotoSlotId | null;
};

export type Axis1PhotoAssistRequest = {
  photos: Axis1PhotoAssistInputPhoto[];
};

export type Axis1PhotoAssistResponse = {
  mode: "mock" | "live";
  provider: "mock" | "gemini";
  model: string;
  suggestions: Axis1PhotoAssistSuggestion[];
  warning?: string;
};

export const axis1PhotoAssistDefaultModel = "gemini-2.5-flash";
export const axis1PhotoAssistLowConfidenceThreshold = 0.8;
export const axis1PhotoAssistMaxRequestPhotos = 16;
export const axis1PhotoAssistMaxLivePhotos = 12;
export const axis1PhotoAssistMaxDataUrlLength = 1_800_000;

const genericPhotoKeywords = new Set([
  "hood",
  "before",
  "pre",
  "dirty",
  "start",
  "after",
  "clean",
  "final",
  "done",
  "complete",
]);

const genericPhonePhotoNamePatterns = [
  /(^|[-_\s])(img|image|photo|pic|snap|screenshot)[-_\s]?\d{2,}/,
  /(^|[-_\s])(pxl|dsc|dscn)[-_\s]?\d{2,}/,
  /^img_\d{2,}/,
  /^pxl_\d{6,}/,
  /^dsc\d{2,}/,
  /^dscn\d{2,}/,
  /^whatsapp image \d{4}/,
];

const vendorReviewCueKeywords = [
  "access",
  "before",
  "block",
  "blocked",
  "bucket",
  "dirty",
  "duct",
  "exception",
  "grease",
  "maybe",
  "not-sure",
  "panel",
  "pre",
  "question",
  "unclear",
];

const unsafeMockNonEvidenceFileNameTerms =
  /\bkitchen[-_\s]?exhaust[-_\s]?fan\b|\bunrelated\b|\breceipt\b/i;
const ambiguousMockReviewFileNameTerms =
  /\bfinal[-_\s]?final\b|\boverexposed\b|\blow[-_\s]?light\b|\bblurry\b|\bdark\b|\bcrop\b/i;
const forbiddenReasonTerms =
  /\b(NFPA|compliance|pass\/fail|pass-fail|fire marshal|official|certificate|inspection|approval|repair|verified|proves|guarantee)\b/gi;
const riskyReviewTerms =
  /\b(access|block|blocked|cleaned_question|questionmark|question|unclear|maybe|not-sure|not sure|wrong|unrelated|receipt|not a hood)\b/i;
const modelForcedReviewTerms =
  /\b(access|ambiguous|before|both|bucket|composite|dirty|duct|grease|low quality|plenum|record|unclear|unrelated)\b/i;
const ductAccessPathTerms =
  /\b(duct|ductwork|duct-side plenum|exhaust plenum|access panel|access opening|access path|exhaust path|exhaust duct|vertical shaft)\b/i;
const accessIssueToneTerms =
  /\b(blocked|inaccessible|sealed|unsafe|dirty|grease|buildup|before|not accessible|no access)\b/i;
const lowRiskAfterServiceTerms =
  /\b(clean|cleaned|after-service|after service|installed|reinstalled|returned to service)\b/i;
const lowRiskAutoConfirmBlockTerms =
  /\b(access|ambiguous|before|blocked|bucket|composite|condition|dirty|duct|grease|issue|leak|low quality|maybe|plenum|record|review|unclear|unrelated)\b/i;

function normalizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[()[\]]/g, " ");
}

function isGenericPhonePhotoName(fileName: string) {
  const normalized = normalizeFileName(fileName);
  return genericPhonePhotoNamePatterns.some((pattern) => pattern.test(normalized));
}

function hasVendorReviewCue(fileName: string) {
  const normalized = normalizeFileName(fileName);

  return (
    vendorReviewCueKeywords.some((keyword) => normalized.includes(keyword)) ||
    ambiguousMockReviewFileNameTerms.test(normalized)
  );
}

function shouldKeepMockPhotoOutOfProofSlots(fileName: string) {
  return unsafeMockNonEvidenceFileNameTerms.test(normalizeFileName(fileName));
}

function photoKeywordScore(slot: Axis1FieldPhotoSlot, normalizedFileName: string) {
  return slot.keywords.reduce((score, keyword) => {
    if (!normalizedFileName.includes(keyword)) {
      return score;
    }

    const specificity = genericPhotoKeywords.has(keyword) ? 1 : 4;
    const lengthBonus = keyword.length >= 5 ? 1 : 0;

    return score + specificity + lengthBonus;
  }, 0);
}

function findBestSlot(fileName: string) {
  const normalized = normalizeFileName(fileName);
  const [bestMatch] = axis1FieldPhotoSlots
    .map((slot, index) => ({
      slot,
      index,
      score: photoKeywordScore(slot, normalized),
    }))
    .filter((match) => match.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index);

  return bestMatch ?? null;
}

function clampConfidence(value: number) {
  if (!Number.isFinite(value)) {
    return 0.35;
  }

  return Math.min(0.99, Math.max(0.01, Number(value.toFixed(2))));
}

export function sanitizeAxis1PhotoAssistReason(reason: string) {
  const cleaned = reason
    .replace(forbiddenReasonTerms, "field record")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || "Photo needs vendor review before it can support a slot.";
}

export function shouldKeepAxis1PhotoAssistSuggestionInReview(
  suggestion: Axis1PhotoAssistSuggestion,
) {
  if (!suggestion.suggestedSlotId || suggestion.confidence < axis1PhotoAssistLowConfidenceThreshold) {
    return true;
  }

  if (!suggestion.needsVendorReview) {
    return false;
  }

  const riskText = `${suggestion.fileName} ${suggestion.reason}`;

  return riskyReviewTerms.test(riskText);
}

function shouldForceModelSuggestionVendorReview(options: {
  fileName: string;
  suggestedSlotId: Axis1FieldPhotoSlotId | null;
  suggestedTone: Axis1PhotoAssistSuggestedTone;
  confidence: number;
  reason: string;
}) {
  if (isLowRiskModelAutoConfirmSuggestion(options)) {
    return false;
  }

  if (
    !options.suggestedSlotId ||
    options.confidence < axis1PhotoAssistLowConfidenceThreshold
  ) {
    return true;
  }

  if (isGenericPhonePhotoName(options.fileName)) {
    return true;
  }

  if (options.suggestedTone !== "after") {
    return true;
  }

  const riskText = `${options.fileName} ${options.reason}`;

  return riskyReviewTerms.test(riskText) || modelForcedReviewTerms.test(riskText);
}

function isLowRiskModelAutoConfirmSuggestion(options: {
  fileName: string;
  suggestedSlotId: Axis1FieldPhotoSlotId | null;
  suggestedTone: Axis1PhotoAssistSuggestedTone;
  confidence: number;
  reason: string;
}) {
  if (
    options.confidence < axis1PhotoAssistLowConfidenceThreshold ||
    options.suggestedTone !== "after" ||
    options.suggestedSlotId !== "filter-bank"
  ) {
    return false;
  }

  const riskText = `${options.fileName} ${options.reason}`;

  return (
    lowRiskAfterServiceTerms.test(options.reason) &&
    !lowRiskAutoConfirmBlockTerms.test(riskText)
  );
}

function coerceModelSuggestedSlot(options: {
  fileName: string;
  reason: string;
  suggestedSlotId: Axis1FieldPhotoSlotId | null;
}) {
  if (!options.suggestedSlotId || options.suggestedSlotId === "access-condition") {
    return options.suggestedSlotId;
  }

  if (
    options.suggestedSlotId !== "hood-before" &&
    options.suggestedSlotId !== "hood-after"
  ) {
    return options.suggestedSlotId;
  }

  const evidenceText = `${options.fileName} ${options.reason}`;

  if (ductAccessPathTerms.test(evidenceText)) {
    return "access-condition";
  }

  return options.suggestedSlotId;
}

function coercedAccessTone(options: {
  fileName: string;
  reason: string;
}): Axis1PhotoAssistSuggestedTone {
  const evidenceText = `${options.fileName} ${options.reason}`;

  return accessIssueToneTerms.test(evidenceText) ? "issue" : "record";
}

export function buildMockAxis1PhotoAssistSuggestions(
  photos: readonly Axis1PhotoAssistInputPhoto[],
  source: Axis1PhotoAssistSource = "mock",
): Axis1PhotoAssistSuggestion[] {
  return photos.map((photo, index) => {
    const match = findBestSlot(photo.fileName);
    const genericName = isGenericPhonePhotoName(photo.fileName);
    const keepOutOfProofSlots = shouldKeepMockPhotoOutOfProofSlots(photo.fileName);
    const suggestedSlot = keepOutOfProofSlots ? null : (match?.slot ?? null);
    const reviewCue = hasVendorReviewCue(photo.fileName);
    const confidence = clampConfidence(
      keepOutOfProofSlots
        ? 0.34
        : match
        ? genericName
          ? 0.58
          : match.score >= 4
            ? 0.86
            : 0.7
        : 0.34,
    );
    const needsVendorReview =
      confidence < axis1PhotoAssistLowConfidenceThreshold ||
      !suggestedSlot ||
      reviewCue;
    const reason = suggestedSlot
      ? genericName
        ? `${suggestedSlot.shortLabel} is a possible role, but the phone-style filename needs vendor review.`
        : reviewCue
      ? `${suggestedSlot.shortLabel} is suggested from filename cues, but this photo needs vendor review before it can appear in the service report link or PDF.`
          : `${suggestedSlot.shortLabel} is suggested from filename cues. Vendor must confirm the role.`
      : "No reliable photo role was found. Vendor must choose a role or leave this photo out.";

    return {
      id: `${source}:${photo.photoId}:${index}`,
      photoId: photo.photoId,
      fileName: photo.fileName,
      suggestedSlotId: suggestedSlot?.id ?? null,
      suggestedTone:
        (suggestedSlot?.tone as Axis1PhotoAssistSuggestedTone | undefined) ??
        "unknown",
      confidence,
      needsVendorReview,
      reason: sanitizeAxis1PhotoAssistReason(reason),
      source,
      vendorDecision: "pending",
    };
  });
}

export function normalizeAxis1PhotoAssistSuggestions(
  rawSuggestions: unknown,
  photos: readonly Axis1PhotoAssistInputPhoto[],
  source: Axis1PhotoAssistSource,
): Axis1PhotoAssistSuggestion[] {
  const fallback = buildMockAxis1PhotoAssistSuggestions(photos, source);

  if (!Array.isArray(rawSuggestions)) {
    return fallback;
  }

  const photoIds = new Set(photos.map((photo) => photo.photoId));
  const byPhotoId = new Map(
    fallback.map((suggestion) => [suggestion.photoId, suggestion]),
  );

  rawSuggestions.forEach((candidate, index) => {
    if (!candidate || typeof candidate !== "object") {
      return;
    }

    const item = candidate as Record<string, unknown>;
    const photoId = typeof item.photoId === "string" ? item.photoId : "";

    if (!photoIds.has(photoId)) {
      return;
    }

    const fileName =
      typeof item.fileName === "string"
        ? item.fileName
        : photos.find((photo) => photo.photoId === photoId)?.fileName ?? photoId;
    const rawSuggestedSlotId =
      typeof item.suggestedSlotId === "string" &&
      axis1FieldPhotoSlots.some((slot) => slot.id === item.suggestedSlotId)
        ? (item.suggestedSlotId as Axis1FieldPhotoSlotId)
        : null;
    const reason = sanitizeAxis1PhotoAssistReason(
      typeof item.reason === "string" ? item.reason : "",
    );
    const suggestedSlotId =
      source === "gemini"
        ? coerceModelSuggestedSlot({
            fileName,
            reason,
            suggestedSlotId: rawSuggestedSlotId,
          })
        : rawSuggestedSlotId;
    const slot = axis1FieldPhotoSlots.find((entry) => entry.id === suggestedSlotId);
    const rawSuggestedTone =
      item.suggestedTone === "before" ||
      item.suggestedTone === "after" ||
      item.suggestedTone === "issue" ||
      item.suggestedTone === "record"
        ? item.suggestedTone
        : ((slot?.tone as Axis1PhotoAssistSuggestedTone | undefined) ?? "unknown");
    const suggestedTone =
      source === "gemini" &&
      suggestedSlotId === "access-condition" &&
      (rawSuggestedSlotId !== suggestedSlotId ||
        rawSuggestedTone === "before" ||
        rawSuggestedTone === "after")
        ? coercedAccessTone({ fileName, reason })
        : rawSuggestedTone;
    const confidence = clampConfidence(
      typeof item.confidence === "number"
        ? item.confidence
        : Number(item.confidence),
    );
    const forcedVendorReview =
      source === "gemini"
        ? shouldForceModelSuggestionVendorReview({
            fileName,
            suggestedSlotId,
            suggestedTone,
            confidence,
            reason,
          })
        : confidence < axis1PhotoAssistLowConfidenceThreshold || !suggestedSlotId;
    const lowRiskModelAutoConfirm =
      source === "gemini" &&
      isLowRiskModelAutoConfirmSuggestion({
        fileName,
        suggestedSlotId,
        suggestedTone,
        confidence,
        reason,
      });

    byPhotoId.set(photoId, {
      id:
        typeof item.id === "string" && item.id.trim()
          ? item.id
          : `${source}:${photoId}:${index}`,
      photoId,
      fileName,
      suggestedSlotId,
      suggestedTone,
      confidence,
      needsVendorReview:
        lowRiskModelAutoConfirm
          ? false
          : typeof item.needsVendorReview === "boolean"
          ? item.needsVendorReview || forcedVendorReview
          : forcedVendorReview,
      reason,
      source,
      vendorDecision: "pending",
    });
  });

  return photos.flatMap((photo, index) => {
    const suggestion = byPhotoId.get(photo.photoId) ?? fallback[index];
    return suggestion ? [suggestion] : [];
  });
}

export function setAxis1PhotoAssistDecision(
  suggestion: Axis1PhotoAssistSuggestion,
  vendorDecision: Axis1PhotoAssistVendorDecision,
  confirmedSlotId?: Axis1FieldPhotoSlotId,
): Axis1PhotoAssistSuggestion {
  return {
    ...suggestion,
    vendorDecision,
    confirmedSlotId:
      vendorDecision === "confirmed" || vendorDecision === "edited"
        ? confirmedSlotId ?? suggestion.suggestedSlotId ?? undefined
        : undefined,
  };
}

export function applyConfirmedAxis1PhotoAssistSuggestions(options: {
  suggestions: readonly Axis1PhotoAssistSuggestion[];
  photosById: ReadonlyMap<string, Axis1UploadedFieldPhoto>;
  initialState?: Axis1UploadedFieldPhotoState;
}): Axis1UploadedFieldPhotoState {
  const next = options.initialState
    ? { ...options.initialState }
    : emptyAxis1FieldPhotoState();

  options.suggestions.forEach((suggestion) => {
    if (
      suggestion.vendorDecision !== "confirmed" &&
      suggestion.vendorDecision !== "edited"
    ) {
      return;
    }

    const targetSlot = suggestion.confirmedSlotId ?? suggestion.suggestedSlotId;
    const photo = options.photosById.get(suggestion.photoId);

    if (!targetSlot || !photo) {
      return;
    }

    next[targetSlot] = {
      ...photo,
      confidence: "manual",
      matchLabel:
        suggestion.vendorDecision === "edited"
          ? "Photo role edited"
          : "Photo role confirmed",
      vendorDecision: suggestion.vendorDecision,
      assistSuggestionId: suggestion.id,
      assistSource: suggestion.source,
      assistConfidence: suggestion.confidence,
      assistReason: suggestion.reason,
      assistSuggestedSlotId: suggestion.suggestedSlotId,
      needsVendorReview: false,
    };
  });

  return next;
}
