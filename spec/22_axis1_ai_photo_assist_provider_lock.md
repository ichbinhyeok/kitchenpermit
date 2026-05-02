# 22 Axis 1 AI Photo Assist Provider Lock

## 1. Decision

Axis 1 AI Photo Assist should use Gemini as the default live vision provider.

Locked default:

```text
Provider: Gemini API
Model: gemini-2.5-flash
Mode before paid launch: mock/rule fallback first, live Gemini behind adapter
```

Reason:
Axis 1 AI Photo Assist is not a closeout judge. It is a photo organizing
assistant for a minimal-input vendor proof packet. The workload is mostly image
classification, proof-slot suggestion, tone hinting, confidence scoring, missing
proof hints, and vendor review flagging. That favors a fast, low-cost multimodal
model over a frontier reasoning model.

Do not use Gemini image generation models for this feature. Photo Assist reads
uploaded field photos and returns structured suggestions only.

---

## 2. Provider Boundary

The implementation must keep a provider-neutral adapter boundary.

Recommended config:

```text
AXIS1_PHOTO_ASSIST_MODE=mock | live
AXIS1_PHOTO_ASSIST_PROVIDER=gemini
AXIS1_PHOTO_ASSIST_MODEL=gemini-2.5-flash
GOOGLE_API_KEY=...
```

Rules:

- no hardcoded model name inside UI components
- no direct Gemini SDK call from `packet-builder.tsx`
- no AI output written into confirmed packet state before vendor review
- no customer link or PDF generation triggered by AI suggestions
- no provider-specific fields leaked into the closeout engine
- mock/rule fallback must remain available for tests and local development

Allowed output shape:

```ts
type Axis1PhotoAssistSuggestion = {
  suggestedSlotId?: string;
  suggestedTone: "before" | "after" | "issue" | "record" | "unknown";
  confidence: number;
  reason: string;
  needsVendorReview: boolean;
  source: "mock" | "gemini";
  vendorDecision: "confirmed" | "edited" | "rejected" | "pending";
};
```

---

## 3. Product Boundary

Gemini may suggest:

- likely proof slot
- likely before / after / issue / record tone
- confidence
- short vendor-facing reason
- low-confidence or unclear-photo review flag
- missing proof areas that may need vendor confirmation

Gemini must not:

- select the final job result
- decide clean / blocked access / condition review
- decide claim level
- decide proof coverage
- decide customer CTA
- write customer-facing copy
- write invoice, quote, revisit, or rebook copy outside template boundaries
- claim completion, compliance, pass/fail, inspection, approval, or repair
- cause a proof link or PDF to be generated before vendor result selection

The rule-based Axis 1 closeout engine remains the authority for outcome,
evidence basis, claim level, proof coverage, generated output readiness, CTA,
vendor warning state, and customer copy boundary.

---

## 4. Pricing Check

As of 2026-04-30, official Gemini API pricing lists `gemini-2.5-flash` paid
standard pricing at:

- input: `$0.30 / 1M tokens` for text, image, and video
- output: `$2.50 / 1M tokens`
- batch input: `$0.15 / 1M tokens`
- batch output: `$1.25 / 1M tokens`

Source:
https://ai.google.dev/gemini-api/docs/pricing

Cost judgment:
This is acceptable for Axis 1 Photo Assist.

Planning estimate:

- a normal closeout set of 15-30 compressed field photos should usually be in
  the low cents per packet
- a heavier 50-photo packet should still usually be below ten cents before any
  storage, bandwidth, or retry overhead
- exact billing depends on image dimensions, tiling, prompt length, output size,
  retries, and whether batch processing is used

The feature should still include a per-packet guardrail:

```text
max photos sent to AI
max image dimension after browser/server normalization
max retry count
max output tokens
```

Current local guardrails:

- builder bulk upload intake caps one batch at 16 image files
- Photo Assist API rejects requests over 16 photos
- Gemini live adapter sends at most 12 photos per request
- Photo Assist API rejects oversized AI preview data URLs before provider work
- unrecognized or unrelated images must return `suggestedSlotId: null`,
  low confidence, and `needsVendorReview: true`

Do not use Search grounding or Maps grounding for Photo Assist. Those are not
needed for proof-slot organization and add unnecessary cost and risk.

---

## 5. Data and Privacy Posture

Use the paid Gemini API tier for production use because the pricing page states
that paid-tier content is not used to improve Google's products.

Source:
https://ai.google.dev/gemini-api/docs/pricing

Before paid launch, add explicit vendor-facing language that uploaded photos may
be processed by a third-party AI provider for photo organization suggestions.

Image handling rules:

- send AI-specific browser/server-normalized copies, not raw originals, by default
- cap AI request images to a small longest-edge target, currently 896px JPEG at
  roughly 0.72 quality, while keeping proof-link/PDF preview images separate
- strip or avoid EXIF metadata where practical
- keep live AI processing server-side
- do not expose `GOOGLE_API_KEY` to browser code
- keep mock mode available when third-party AI processing is disabled

---

## 6. Fallback and Evaluation

Fallback options:

- `mock`: deterministic local suggestions for tests and demos
- `gemini-2.5-flash-lite`: only after evaluation shows slot accuracy remains
  good enough
- OpenAI `gpt-5.4-mini`: comparison/fallback if Gemini accuracy or structured
  output reliability is not good enough on real hood-cleaning photo sets

Evaluation set before live default:

- clean closeout photos
- blocked access photos
- condition review photos
- after-only photos
- no-photo flow
- low-light / blurry photos
- duplicate or irrelevant photos

Pass condition:
Gemini suggestions can speed up vendor organization, but vendor confirmation
must remain the only path into confirmed packet state.
