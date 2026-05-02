package owner.hood.application.axis1;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.env.Environment;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class Axis1PhotoAssistService {

    public static final int MAX_REQUEST_PHOTOS = 16;
    public static final int MAX_LIVE_PHOTOS = 12;
    public static final int MAX_DATA_URL_LENGTH = 1_800_000;

    private static final String DEFAULT_MODEL = "gemini-2.5-flash";
    private static final double LOW_CONFIDENCE_THRESHOLD = 0.8;
    private static final Pattern DATA_URL_PATTERN = Pattern.compile("^data:([^;,]+);base64,(.+)$");
    private static final Pattern FORBIDDEN_REASON_TERMS = Pattern.compile(
            "\\b(NFPA|compliance|pass/fail|pass-fail|fire marshal|official|certificate|inspection|approval|repair|verified|proves|guarantee)\\b",
            Pattern.CASE_INSENSITIVE
    );
    private static final Pattern RISKY_REVIEW_TERMS = Pattern.compile(
            "\\b(access|block|blocked|cleaned_question|questionmark|question|unclear|maybe|not-sure|not sure|wrong|unrelated|receipt|not a hood)\\b",
            Pattern.CASE_INSENSITIVE
    );
    private static final List<Pattern> GENERIC_PHONE_PHOTO_NAME_PATTERNS = List.of(
            Pattern.compile("(^|[-_\\s])(img|image|photo|pic|snap|screenshot)[-_\\s]?\\d{2,}"),
            Pattern.compile("(^|[-_\\s])(pxl|dsc|dscn)[-_\\s]?\\d{2,}"),
            Pattern.compile("^img_\\d{2,}"),
            Pattern.compile("^pxl_\\d{6,}"),
            Pattern.compile("^dsc\\d{2,}"),
            Pattern.compile("^dscn\\d{2,}"),
            Pattern.compile("^whatsapp image \\d{4}")
    );
    private static final Set<String> GENERIC_PHOTO_KEYWORDS = Set.of(
            "hood",
            "before",
            "pre",
            "dirty",
            "start",
            "after",
            "clean",
            "final",
            "done",
            "complete"
    );
    private static final List<String> VENDOR_REVIEW_CUE_KEYWORDS = List.of(
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
            "unclear"
    );
    private static final List<Slot> SLOTS = List.of(
            new Slot("hood-before", "Before", "before", List.of("before", "pre", "dirty", "start", "hood")),
            new Slot("hood-after", "After", "after", List.of("after", "clean", "final", "done", "complete")),
            new Slot("filter-bank", "Filters", "after", List.of("filter", "baffle", "filters", "fl")),
            new Slot("access-condition", "Access", "issue", List.of("access", "duct", "panel", "block", "blocked", "exception", "dk")),
            new Slot("rooftop-fan", "Fan", "record", List.of("roof", "rooftop", "fan", "hinge", "curb", "rf")),
            new Slot("grease-containment", "Grease", "record", List.of("grease", "contain", "drip", "scrape", "residue", "gc")),
            new Slot("service-label", "Label", "record", List.of("label", "sticker", "notice", "tag", "next", "due", "lbl"))
    );
    private static final Set<String> SLOT_IDS = Set.of(
            "hood-before",
            "hood-after",
            "filter-bank",
            "access-condition",
            "rooftop-fan",
            "grease-containment",
            "service-label"
    );
    private static final Set<String> TONES = Set.of("before", "after", "issue", "record", "unknown");

    private final RestClient restClient;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Environment environment;

    public Axis1PhotoAssistService(
            RestClient.Builder restClientBuilder,
            Environment environment
    ) {
        this.restClient = restClientBuilder.build();
        this.environment = environment;
    }

    public Axis1PhotoAssistResponse suggest(List<Axis1PhotoAssistInputPhoto> rawPhotos) {
        int rawPhotoCount = rawPhotos == null ? 0 : rawPhotos.size();
        List<Axis1PhotoAssistInputPhoto> photos = normalizePhotos(rawPhotos);

        if (photos.isEmpty()) {
            throw new Axis1PhotoAssistValidationException(400, "At least one photo is required.");
        }

        if (rawPhotoCount > MAX_REQUEST_PHOTOS) {
            throw new Axis1PhotoAssistValidationException(
                    413,
                    "Photo Assist accepts up to " + MAX_REQUEST_PHOTOS + " photos per request. Remove extras and run it again."
            );
        }

        boolean oversizedPreview = photos.stream()
                .map(Axis1PhotoAssistInputPhoto::dataUrl)
                .anyMatch(dataUrl -> dataUrl != null && dataUrl.length() > MAX_DATA_URL_LENGTH);

        if (oversizedPreview) {
            throw new Axis1PhotoAssistValidationException(
                    413,
                    "One Photo Assist preview is too large. Recompress photos before sending them for AI suggestions."
            );
        }

        String mode = environment.getProperty("AXIS1_PHOTO_ASSIST_MODE", "mock");

        if (!"live".equalsIgnoreCase(mode)) {
            return mockResponse(photos, "Photo Assist is running in mock mode.");
        }

        return requestGeminiSuggestions(photos);
    }

    private Axis1PhotoAssistResponse mockResponse(
            List<Axis1PhotoAssistInputPhoto> photos,
            String warning
    ) {
        return new Axis1PhotoAssistResponse(
                "mock",
                "mock",
                "mock-rule-fallback",
                buildMockSuggestions(photos, "mock"),
                warning
        );
    }

    private Axis1PhotoAssistResponse requestGeminiSuggestions(List<Axis1PhotoAssistInputPhoto> photos) {
        String apiKey = readGeminiApiKey();
        String model = readGeminiModel();
        List<InlinePhoto> livePhotos = photos.stream()
                .map(this::toInlinePhoto)
                .filter(inlinePhoto -> inlinePhoto != null)
                .limit(MAX_LIVE_PHOTOS)
                .toList();

        if (apiKey.isBlank() || livePhotos.isEmpty()) {
            return mockResponse(
                    photos,
                    apiKey.isBlank()
                            ? "GOOGLE_API_KEY is not configured; mock suggestions were used."
                            : "No AI-readable photo previews were supplied; mock suggestions were used."
            );
        }

        String prompt = String.join("\n",
                "You are Axis 1 AI Photo Assist for a hood cleaning closeout builder.",
                "You only organize photos for a vendor. You do not judge the service result.",
                "Return JSON only with a top-level suggestions array.",
                "For each photoId, return: photoId, suggestedSlotId, suggestedTone, confidence, needsVendorReview, reason.",
                "Allowed suggestedSlotId values: hood-before, hood-after, filter-bank, access-condition, rooftop-fan, grease-containment, service-label, or null.",
                "Allowed suggestedTone values: before, after, issue, record, unknown.",
                "Use visible image content first. Treat generic phone filenames like IMG_7421.jpg as weak or no evidence.",
                "Do not choose a proof slot from filename alone. If the visible content is unclear or unrelated, return suggestedSlotId null, suggestedTone unknown, confidence below 0.72, and needsVendorReview true.",
                "If the visible content clearly shows a hood, filter bank, access issue, rooftop fan, grease containment, or service label, suggest the closest slot even when the filename is generic.",
                "Do not use NFPA, compliance, pass/fail, fire marshal, official, certificate, inspection, approval, repair, verified, proves, or guarantee language.",
                "Never say the image proves completion. The vendor must confirm or reject every suggestion."
        );

        List<Object> parts = new ArrayList<>();
        parts.add(Map.of("text", prompt));

        for (int index = 0; index < livePhotos.size(); index++) {
            InlinePhoto photo = livePhotos.get(index);
            parts.add(Map.of(
                    "text",
                    "Photo " + (index + 1)
                            + ": photoId=" + photo.photoId()
                            + "; filename=" + photo.fileName()
                            + "; currentSlot=" + (photo.currentSlotId() == null || photo.currentSlotId().isBlank()
                            ? "none"
                            : photo.currentSlotId())
            ));
            parts.add(Map.of(
                    "inlineData",
                    Map.of(
                            "mimeType", photo.mimeType(),
                            "data", photo.data()
                    )
            ));
        }

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("contents", List.of(Map.of(
                "role", "user",
                "parts", parts
        )));
        requestBody.put("generationConfig", Map.of(
                "temperature", 0,
                "maxOutputTokens", 1800,
                "thinkingConfig", Map.of("thinkingBudget", 0),
                "responseMimeType", "application/json"
        ));

        String rawResponse;

        try {
            rawResponse = restClient.post()
                    .uri(
                            "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}",
                            model,
                            apiKey
                    )
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);
        } catch (RestClientResponseException exception) {
            return mockResponse(
                    photos,
                    "Photo Assist failed with HTTP " + exception.getStatusCode().value() + "; mock suggestions were used."
            );
        } catch (RestClientException exception) {
            return mockResponse(
                    photos,
                    "Photo Assist could not reach Gemini; mock suggestions were used."
            );
        }

        JsonNode rawSuggestions = null;
        boolean usedRuleFallback = false;

        try {
            JsonNode responseNode = objectMapper.readTree(rawResponse);
            String text = extractGeminiText(responseNode);
            rawSuggestions = parseGeminiSuggestions(text);
            usedRuleFallback = rawSuggestions == null || !rawSuggestions.isArray();
        } catch (Exception exception) {
            usedRuleFallback = true;
        }

        List<Axis1PhotoAssistSuggestion> suggestions = normalizeSuggestions(
                rawSuggestions,
                photos,
                "gemini"
        );

        List<String> warnings = new ArrayList<>();

        if (usedRuleFallback) {
            warnings.add("Gemini did not return usable photo suggestions; filename fallback suggestions were used.");
        }

        if (livePhotos.size() < photos.size()) {
            warnings.add((photos.size() - livePhotos.size()) + " photo(s) were not sent to Gemini because of limits or missing previews.");
        }

        return new Axis1PhotoAssistResponse(
                "live",
                "gemini",
                model,
                suggestions,
                warnings.isEmpty() ? null : String.join(" ", warnings)
        );
    }

    private String readGeminiApiKey() {
        return firstNonBlank(
                environment.getProperty("GOOGLE_API_KEY"),
                environment.getProperty("GEMINI_API_KEY")
        );
    }

    private String readGeminiModel() {
        return firstNonBlank(
                environment.getProperty("AXIS1_PHOTO_ASSIST_MODEL"),
                environment.getProperty("GEMINI_MODEL"),
                DEFAULT_MODEL
        );
    }

    private List<Axis1PhotoAssistInputPhoto> normalizePhotos(List<Axis1PhotoAssistInputPhoto> rawPhotos) {
        if (rawPhotos == null) {
            return List.of();
        }

        List<Axis1PhotoAssistInputPhoto> normalized = new ArrayList<>();

        for (Axis1PhotoAssistInputPhoto photo : rawPhotos) {
            if (photo == null) {
                continue;
            }

            String photoId = safeTrim(photo.photoId());
            String fileName = safeTrim(photo.fileName());

            if (photoId.isBlank() || fileName.isBlank()) {
                continue;
            }

            normalized.add(new Axis1PhotoAssistInputPhoto(
                    photoId,
                    fileName,
                    safeTrimToNull(photo.dataUrl()),
                    safeTrimToNull(photo.currentSlotId())
            ));
        }

        return normalized;
    }

    private InlinePhoto toInlinePhoto(Axis1PhotoAssistInputPhoto photo) {
        if (photo.dataUrl() == null) {
            return null;
        }

        Matcher matcher = DATA_URL_PATTERN.matcher(photo.dataUrl());

        if (!matcher.matches()) {
            return null;
        }

        return new InlinePhoto(
                photo.photoId(),
                photo.fileName(),
                photo.currentSlotId(),
                matcher.group(1),
                matcher.group(2)
        );
    }

    private List<Axis1PhotoAssistSuggestion> buildMockSuggestions(
            List<Axis1PhotoAssistInputPhoto> photos,
            String source
    ) {
        List<Axis1PhotoAssistSuggestion> suggestions = new ArrayList<>();

        for (int index = 0; index < photos.size(); index++) {
            Axis1PhotoAssistInputPhoto photo = photos.get(index);
            Match bestMatch = findBestSlot(photo.fileName());
            boolean genericName = isGenericPhonePhotoName(photo.fileName());
            Slot suggestedSlot = bestMatch == null ? null : bestMatch.slot();
            boolean reviewCue = hasVendorReviewCue(photo.fileName());
            double confidence = clampConfidence(
                    bestMatch == null
                            ? 0.34
                            : genericName
                            ? 0.58
                            : bestMatch.score() >= 4
                            ? 0.86
                            : 0.7
            );
            boolean needsVendorReview = confidence < LOW_CONFIDENCE_THRESHOLD || suggestedSlot == null || reviewCue;
            String reason;

            if (suggestedSlot == null) {
                reason = "No reliable proof slot was found from filename cues. Vendor must choose or reject this photo.";
            } else if (genericName) {
                reason = suggestedSlot.shortLabel() + " is a possible role, but the phone-style filename needs vendor review.";
            } else if (reviewCue) {
                reason = suggestedSlot.shortLabel() + " is suggested from filename cues, but this photo needs vendor review before it can support proof coverage.";
            } else {
                reason = suggestedSlot.shortLabel() + " is suggested from filename cues. Vendor must confirm the role.";
            }

            suggestions.add(new Axis1PhotoAssistSuggestion(
                    source + ":" + photo.photoId() + ":" + index,
                    photo.photoId(),
                    photo.fileName(),
                    suggestedSlot == null ? null : suggestedSlot.id(),
                    suggestedSlot == null ? "unknown" : suggestedSlot.tone(),
                    confidence,
                    needsVendorReview,
                    sanitizeReason(reason),
                    source,
                    "pending",
                    null
            ));
        }

        return suggestions;
    }

    private List<Axis1PhotoAssistSuggestion> normalizeSuggestions(
            JsonNode rawSuggestions,
            List<Axis1PhotoAssistInputPhoto> photos,
            String source
    ) {
        List<Axis1PhotoAssistSuggestion> fallback = buildMockSuggestions(photos, source);
        Map<String, Axis1PhotoAssistSuggestion> byPhotoId = new HashMap<>();

        for (Axis1PhotoAssistSuggestion suggestion : fallback) {
            byPhotoId.put(suggestion.photoId(), suggestion);
        }

        if (rawSuggestions == null || !rawSuggestions.isArray()) {
            return fallback;
        }

        Set<String> photoIds = new HashSet<>();
        for (Axis1PhotoAssistInputPhoto photo : photos) {
            photoIds.add(photo.photoId());
        }

        int index = 0;
        for (JsonNode node : rawSuggestions) {
            if (!node.isObject()) {
                index++;
                continue;
            }

            String photoId = safeTrim(node.path("photoId").asText(""));

            if (!photoIds.contains(photoId)) {
                index++;
                continue;
            }

            String fileName = safeTrim(node.path("fileName").asText(""));
            if (fileName.isBlank()) {
                fileName = photos.stream()
                        .filter(photo -> photo.photoId().equals(photoId))
                        .map(Axis1PhotoAssistInputPhoto::fileName)
                        .findFirst()
                        .orElse(photoId);
            }

            String suggestedSlotId = safeTrimToNull(node.path("suggestedSlotId").asText(""));
            if (suggestedSlotId != null && !SLOT_IDS.contains(suggestedSlotId)) {
                suggestedSlotId = null;
            }

            Slot slot = findSlot(suggestedSlotId);
            String suggestedTone = safeTrim(node.path("suggestedTone").asText(""));
            if (!TONES.contains(suggestedTone)) {
                suggestedTone = slot == null ? "unknown" : slot.tone();
            }

            double confidence = clampConfidence(node.path("confidence").asDouble(0.35));
            boolean forcedVendorReview = confidence < LOW_CONFIDENCE_THRESHOLD || suggestedSlotId == null;
            boolean needsVendorReview = node.has("needsVendorReview")
                    ? node.path("needsVendorReview").asBoolean() || forcedVendorReview
                    : forcedVendorReview;
            String id = safeTrim(node.path("id").asText(""));
            if (id.isBlank()) {
                id = source + ":" + photoId + ":" + index;
            }

            byPhotoId.put(photoId, new Axis1PhotoAssistSuggestion(
                    id,
                    photoId,
                    fileName,
                    suggestedSlotId,
                    suggestedTone,
                    confidence,
                    needsVendorReview,
                    sanitizeReason(node.path("reason").asText("")),
                    source,
                    "pending",
                    null
            ));
            index++;
        }

        List<Axis1PhotoAssistSuggestion> ordered = new ArrayList<>();
        for (Axis1PhotoAssistInputPhoto photo : photos) {
            Axis1PhotoAssistSuggestion suggestion = byPhotoId.get(photo.photoId());
            if (suggestion != null) {
                ordered.add(suggestion);
            }
        }

        return ordered;
    }

    private String extractGeminiText(JsonNode responseNode) {
        JsonNode candidates = responseNode.path("candidates");
        if (!candidates.isArray() || candidates.isEmpty()) {
            return "";
        }

        StringBuilder builder = new StringBuilder();
        JsonNode parts = candidates.get(0).path("content").path("parts");

        if (!parts.isArray()) {
            return "";
        }

        for (JsonNode part : parts) {
            String text = part.path("text").asText("");
            if (!text.isBlank()) {
                if (!builder.isEmpty()) {
                    builder.append('\n');
                }
                builder.append(text);
            }
        }

        return builder.toString();
    }

    private JsonNode parseGeminiSuggestions(String text) throws Exception {
        String json = extractJsonObject(text);

        if (json == null) {
            return null;
        }

        JsonNode parsed = objectMapper.readTree(json);
        if (parsed.isArray()) {
            return parsed;
        }

        JsonNode suggestions = parsed.path("suggestions");
        return suggestions.isMissingNode() ? null : suggestions;
    }

    private String extractJsonObject(String value) {
        String trimmed = value == null ? "" : value.trim();
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            return trimmed;
        }

        int start = trimmed.indexOf('{');
        int end = trimmed.lastIndexOf('}');

        if (start == -1 || end == -1 || end <= start) {
            return null;
        }

        return trimmed.substring(start, end + 1);
    }

    private Match findBestSlot(String fileName) {
        String normalized = normalizeFileName(fileName);
        Match bestMatch = null;

        for (int index = 0; index < SLOTS.size(); index++) {
            Slot slot = SLOTS.get(index);
            int score = photoKeywordScore(slot, normalized);
            if (score <= 0) {
                continue;
            }

            Match candidate = new Match(slot, score, index);
            if (bestMatch == null
                    || candidate.score() > bestMatch.score()
                    || (candidate.score() == bestMatch.score() && candidate.index() < bestMatch.index())) {
                bestMatch = candidate;
            }
        }

        return bestMatch;
    }

    private int photoKeywordScore(Slot slot, String normalizedFileName) {
        int score = 0;

        for (String keyword : slot.keywords()) {
            if (!normalizedFileName.contains(keyword)) {
                continue;
            }

            int specificity = GENERIC_PHOTO_KEYWORDS.contains(keyword) ? 1 : 4;
            int lengthBonus = keyword.length() >= 5 ? 1 : 0;
            score += specificity + lengthBonus;
        }

        return score;
    }

    private boolean isGenericPhonePhotoName(String fileName) {
        String normalized = normalizeFileName(fileName);
        return GENERIC_PHONE_PHOTO_NAME_PATTERNS.stream().anyMatch(pattern -> pattern.matcher(normalized).find());
    }

    private boolean hasVendorReviewCue(String fileName) {
        String normalized = normalizeFileName(fileName);
        return VENDOR_REVIEW_CUE_KEYWORDS.stream().anyMatch(normalized::contains);
    }

    private String normalizeFileName(String fileName) {
        return safeTrim(fileName)
                .toLowerCase(Locale.US)
                .replaceAll("\\.[^.]+$", "")
                .replace('(', ' ')
                .replace(')', ' ')
                .replace('[', ' ')
                .replace(']', ' ');
    }

    private String sanitizeReason(String reason) {
        String cleaned = FORBIDDEN_REASON_TERMS.matcher(safeTrim(reason)).replaceAll("field record");
        cleaned = cleaned.replaceAll("\\s+", " ").trim();
        return cleaned.isBlank() ? "Photo needs vendor review before it can support a slot." : cleaned;
    }

    public boolean shouldKeepSuggestionInReview(Axis1PhotoAssistSuggestion suggestion) {
        if (suggestion.suggestedSlotId() == null || suggestion.confidence() < LOW_CONFIDENCE_THRESHOLD) {
            return true;
        }

        if (!suggestion.needsVendorReview()) {
            return false;
        }

        return RISKY_REVIEW_TERMS.matcher(suggestion.fileName() + " " + suggestion.reason()).find();
    }

    private double clampConfidence(double value) {
        if (!Double.isFinite(value)) {
            return 0.35;
        }

        double clamped = Math.min(0.99, Math.max(0.01, value));
        return Math.round(clamped * 100.0) / 100.0;
    }

    private Slot findSlot(String slotId) {
        if (slotId == null) {
            return null;
        }

        return SLOTS.stream()
                .filter(slot -> slot.id().equals(slotId))
                .findFirst()
                .orElse(null);
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.trim().isBlank()) {
                return value.trim();
            }
        }

        return "";
    }

    private String safeTrim(String value) {
        return value == null ? "" : value.trim();
    }

    private String safeTrimToNull(String value) {
        String trimmed = safeTrim(value);
        return trimmed.isBlank() ? null : trimmed;
    }

    private record Slot(String id, String shortLabel, String tone, List<String> keywords) {
    }

    private record Match(Slot slot, int score, int index) {
    }

    private record InlinePhoto(
            String photoId,
            String fileName,
            String currentSlotId,
            String mimeType,
            String data
    ) {
    }

    public record Axis1PhotoAssistInputPhoto(
            String photoId,
            String fileName,
            String dataUrl,
            String currentSlotId
    ) {
    }

    public record Axis1PhotoAssistSuggestion(
            String id,
            String photoId,
            String fileName,
            String suggestedSlotId,
            String suggestedTone,
            double confidence,
            boolean needsVendorReview,
            String reason,
            String source,
            String vendorDecision,
            String confirmedSlotId
    ) {
    }

    public record Axis1PhotoAssistResponse(
            String mode,
            String provider,
            String model,
            List<Axis1PhotoAssistSuggestion> suggestions,
            String warning
    ) {
    }

    public static class Axis1PhotoAssistValidationException extends RuntimeException {
        private final int statusCode;

        public Axis1PhotoAssistValidationException(int statusCode, String message) {
            super(message);
            this.statusCode = statusCode;
        }

        public int statusCode() {
            return statusCode;
        }
    }
}
