import {
  axis1PhotoAssistDefaultModel,
  axis1PhotoAssistMaxLivePhotos,
  buildMockAxis1PhotoAssistSuggestions,
  normalizeAxis1PhotoAssistSuggestions,
  type Axis1PhotoAssistInputPhoto,
  type Axis1PhotoAssistResponse,
} from "@/lib/axis1-photo-assist";

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

function readGeminiApiKey() {
  return process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY ?? "";
}

function readGeminiModel() {
  return (
    process.env.AXIS1_PHOTO_ASSIST_MODEL?.trim() ||
    process.env.GEMINI_MODEL?.trim() ||
    axis1PhotoAssistDefaultModel
  );
}

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;,]+);base64,(.+)$/);

  if (!match) {
    return null;
  }

  return {
    mimeType: match[1],
    data: match[2],
  };
}

function extractJsonObject(value: string) {
  const trimmed = value.trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  return trimmed.slice(start, end + 1);
}

function parseGeminiSuggestions(text: string) {
  const json = extractJsonObject(text);

  if (!json) {
    return null;
  }

  try {
    const parsed = JSON.parse(json) as { suggestions?: unknown } | unknown[];

    if (Array.isArray(parsed)) {
      return parsed;
    }

    return parsed.suggestions ?? null;
  } catch {
    return null;
  }
}

export async function requestGeminiAxis1PhotoAssist(
  photos: readonly Axis1PhotoAssistInputPhoto[],
): Promise<Axis1PhotoAssistResponse> {
  const apiKey = readGeminiApiKey();
  const model = readGeminiModel();
  const livePhotos = photos
    .filter((photo) => photo.dataUrl && parseDataUrl(photo.dataUrl))
    .slice(0, axis1PhotoAssistMaxLivePhotos);

  if (!apiKey || livePhotos.length === 0) {
    return {
      mode: "mock",
      provider: "mock",
      model: "mock-rule-fallback",
      suggestions: buildMockAxis1PhotoAssistSuggestions(photos),
      warning: !apiKey
        ? "GOOGLE_API_KEY is not configured; mock suggestions were used."
        : "No AI-readable photo previews were supplied; mock suggestions were used.",
    };
  }

  const prompt = [
    "You are Service Report Builder Photo Assist for a hood cleaning closeout builder.",
    "You only organize photos for a vendor. You do not judge completion, quality, compliance, or the service result.",
    "Return JSON only with a top-level suggestions array.",
    "For each photoId, return: photoId, suggestedSlotId, suggestedTone, confidence, needsVendorReview, reason.",
    "Allowed suggestedSlotId values: hood-before, hood-after, filter-bank, access-condition, rooftop-fan, grease-containment, service-label, or null.",
    "Allowed suggestedTone values: before, after, issue, record, unknown.",
    "Use visible image content first. Treat generic phone filenames like IMG_7421.jpg as weak or no evidence.",
    "Do not choose a photo slot from filename alone. If the visible content is unclear or unrelated, return suggestedSlotId null, suggestedTone unknown, confidence below 0.72, and needsVendorReview true.",
    "If the visible content clearly shows a hood, filter bank, access issue, rooftop fan, grease containment, or service label, suggest the closest slot even when the filename is generic.",
    "Be conservative. Before/dirty photos, duct or plenum interiors, grease buckets, access panels, blocked areas, low-quality images, duplicate-looking images, composite before/after images, and record-only condition photos must have needsVendorReview true.",
    "A generic phone filename by itself is not a review reason when the visible content unmistakably shows a single clean after-service filter bank, installed clean filters, or a clear routine after-service area with no dirty/before/composite/blocked/condition cue.",
    "For unmistakable clean after-service filter bank or installed clean-filter photos, use filter-bank, suggestedTone after, confidence at least 0.8, and needsVendorReview false.",
    "For unmistakable routine rooftop fan after-service photos with no access issue, condition, damage, before/after composite, or grease spill cue, use rooftop-fan and needsVendorReview false.",
    "Do not label a duct, plenum, fan, bucket, or access-panel image as hood-after unless the visible image clearly shows the cleaned hood canopy interior.",
    "Use filter-bank for visible baffle or mesh filters, even when the surrounding hood is visible.",
    "Use rooftop-fan only for rooftop fan units, fan housings, roof discharge, hinges, curbs, or fan cleaning activity.",
    "Use grease-containment for grease buckets, troughs, removed grease, containment paths, drip paths, or grease collection evidence; this is usually record tone and needs vendor review.",
    "Use access-condition for access panels, duct/plenum access, blocked access, or reachable-path condition notes; this usually needs vendor review.",
    "Return null for receipts, paperwork, unrelated kitchen equipment, walls, floors, people, vehicles, or photos that do not visibly show a hood-cleaning evidence area.",
    "Set needsVendorReview true whenever the image is generic-phone-named and the role is not unmistakable, whenever the role could affect customer claims, or whenever the photo is useful only as a record rather than direct before/after proof.",
    "Do not use NFPA, compliance, pass/fail, fire marshal, official, certificate, inspection, approval, repair, verified, proves, or guarantee language.",
    "Never say the image proves completion. The vendor must confirm or reject every suggestion.",
  ].join("\n");
  const parts: Array<
    | { text: string }
    | { inlineData: { mimeType: string; data: string } }
  > = [{ text: prompt }];

  livePhotos.forEach((photo, index) => {
    const inlineData = parseDataUrl(photo.dataUrl ?? "");

    if (!inlineData) {
      return;
    }

    parts.push({
      text: `Photo ${index + 1}: photoId=${photo.photoId}; filename=${photo.fileName}; currentSlot=${photo.currentSlotId ?? "none"}`,
    });
    parts.push({
      inlineData: {
        mimeType: inlineData.mimeType,
        data: inlineData.data,
      },
    });
  });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model,
    )}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts,
          },
        ],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 1800,
          thinkingConfig: {
            thinkingBudget: 0,
          },
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!response.ok) {
    return {
      mode: "mock",
      provider: "mock",
      model: "mock-rule-fallback",
      suggestions: buildMockAxis1PhotoAssistSuggestions(photos),
      warning: `Photo Assist failed with HTTP ${response.status}; mock suggestions were used.`,
    };
  }

  const data = (await response.json()) as GeminiGenerateContentResponse;
  const text =
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("\n") ?? "";
  const rawSuggestions = parseGeminiSuggestions(text);
  const usedRuleFallback = !Array.isArray(rawSuggestions);
  const suggestions = normalizeAxis1PhotoAssistSuggestions(
    rawSuggestions,
    photos,
    "gemini",
  );
  const warnings = [
    usedRuleFallback
      ? "Gemini did not return usable photo suggestions; review fallback suggestions were used."
      : "",
    livePhotos.length < photos.length
      ? `${photos.length - livePhotos.length} photo(s) were not sent to Gemini because of limits or missing previews.`
      : "",
  ].filter(Boolean);

  return {
    mode: "live",
    provider: "gemini",
    model,
    suggestions,
    warning: warnings.length > 0 ? warnings.join(" ") : undefined,
  };
}
