package owner.hood.application.axis1;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.Normalizer;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
public class Axis1PdfExportService {

    private static final String PDF_FILE_NAME = "service-report.pdf";
    private static final String PDF_CONTENT_TYPE = "application/pdf";

    private final Axis1ReportAssetStorage assetStorage;

    public Axis1PdfExportService(Axis1ReportAssetStorage assetStorage) {
        this.assetStorage = assetStorage;
    }

    public Axis1PdfExportCapability generateAndAttach(
            String publicId,
            String productPlan,
            Map<String, Object> payload
    ) {
        String generatedAt = Instant.now().toString();
        byte[] pdf = renderPdf(publicId, productPlan, payload, generatedAt);
        String downloadHref = assetStorage.storeAsset(publicId, PDF_FILE_NAME, pdf, PDF_CONTENT_TYPE);
        Axis1PdfExportCapability capability = generatedCapability(downloadHref, generatedAt);

        payload.put("_pdfExport", capabilityMetadata(capability));
        attachPdfHref(payload, downloadHref);

        return capability;
    }

    public Axis1PdfExportCapability capability(String productPlan, Map<String, Object> payload) {
        Object metadata = payload.get("_pdfExport");

        if (metadata instanceof Map<?, ?> map) {
            String downloadHref = optionalString(map.get("downloadHref"));

            if (!downloadHref.isBlank()) {
                return new Axis1PdfExportCapability(
                        defaultString(map.get("driver"), "server-pdfbox"),
                        defaultString(map.get("mode"), "stored_asset"),
                        booleanValue(map.get("serverDownloadReady"), true),
                        defaultString(map.get("currentAction"), "Open the generated PDF copy."),
                        defaultString(map.get("externalProviderTarget"), "axis1_asset_storage"),
                        downloadHref,
                        defaultString(map.get("fileName"), PDF_FILE_NAME),
                        defaultString(map.get("contentType"), PDF_CONTENT_TYPE),
                        defaultString(map.get("generatedAt"), "")
                );
            }
        }

        return placeholderCapability(productPlan);
    }

    private Axis1PdfExportCapability generatedCapability(String downloadHref, String generatedAt) {
        return new Axis1PdfExportCapability(
                "server-pdfbox",
                "stored_asset",
                true,
                "Open the generated PDF copy.",
                "axis1_asset_storage",
                downloadHref,
                PDF_FILE_NAME,
                PDF_CONTENT_TYPE,
                generatedAt
        );
    }

    private Axis1PdfExportCapability placeholderCapability(String productPlan) {
        String action = "free".equals(productPlan)
                ? "Use browser print/save until the generated free PDF copy is available."
                : "Use browser print/save until the generated company PDF copy is available.";

        return new Axis1PdfExportCapability(
                "browser-print-placeholder",
                "client_print",
                false,
                action,
                "server_pdf_renderer",
                "",
                "",
                "",
                ""
        );
    }

    private Map<String, Object> capabilityMetadata(Axis1PdfExportCapability capability) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("driver", capability.driver());
        metadata.put("mode", capability.mode());
        metadata.put("serverDownloadReady", capability.serverDownloadReady());
        metadata.put("currentAction", capability.currentAction());
        metadata.put("externalProviderTarget", capability.externalProviderTarget());
        metadata.put("downloadHref", capability.downloadHref());
        metadata.put("fileName", capability.fileName());
        metadata.put("contentType", capability.contentType());
        metadata.put("generatedAt", capability.generatedAt());
        return metadata;
    }

    private void attachPdfHref(Map<String, Object> payload, String downloadHref) {
        Map<String, Object> links = mutableMap(payload.get("links"));
        links.put("pdfHref", downloadHref);
        payload.put("links", links);

        Map<String, Object> packetData = mutableMap(payload.get("packetData"));

        if (packetData.isEmpty()) {
            return;
        }

        Map<String, Object> closeout = mutableMap(packetData.get("closeout"));

        if (closeout.isEmpty()) {
            return;
        }

        List<Object> ctas = mutableList(closeout.get("ctas"));
        boolean updated = false;

        for (Object item : ctas) {
            if (!(item instanceof Map<?, ?> ctaMap) || !"download_pdf".equals(optionalString(ctaMap.get("kind")))) {
                continue;
            }

            Map<String, Object> cta = mutableMap(ctaMap);
            cta.put("href", downloadHref);
            cta.put("enabled", true);
            cta.put("label", defaultString(cta.get("label"), "Open PDF copy"));
            ctas.set(ctas.indexOf(item), cta);
            updated = true;
            break;
        }

        if (!updated) {
            Map<String, Object> pdfCta = new LinkedHashMap<>();
            pdfCta.put("kind", "download_pdf");
            pdfCta.put("label", "Open PDF copy");
            pdfCta.put("href", downloadHref);
            pdfCta.put("priority", "utility");
            pdfCta.put("enabled", true);
            ctas.add(pdfCta);
        }

        closeout.put("ctas", ctas);
        packetData.put("closeout", closeout);
        payload.put("packetData", packetData);
    }

    private byte[] renderPdf(
            String publicId,
            String productPlan,
            Map<String, Object> payload,
            String generatedAt
    ) {
        Map<String, Object> values = objectMap(payload.get("values"));
        Map<String, Object> companyProfile = objectMap(payload.get("companyProfile"));
        Map<String, Object> packetData = objectMap(payload.get("packetData"));
        Map<String, Object> vendor = objectMap(packetData.get("vendor"));
        Map<String, Object> packetHeader = objectMap(packetData.get("packetHeader"));
        Map<String, Object> customerClose = objectMap(packetData.get("customerClose"));
        Map<String, Object> callout = objectMap(packetData.get("callout"));
        String serviceDateRaw = firstNonBlank(
                optionalString(values.get("serviceDate")),
                rowValue(packetHeader.get("quickFacts"), "Service date")
        );
        String cadence = optionalString(values.get("cadence"));
        boolean packetMismatch = hasPacketDataMismatch(values, packetData);

        String companyName = firstNonBlank(
                optionalString(companyProfile.get("companyName")),
                optionalString(vendor.get("name")),
                "Hood Cleaning Service"
        );
        boolean freePlan = "free".equals(productPlan);
        String coverTitle = freePlan ? "Kitchen Exhaust Service Report" : companyName;
        String reportLabel = freePlan ? "Free test service report PDF" : "Kitchen exhaust service report PDF";
        String customerName = firstNonBlank(
                optionalString(values.get("propertyName")),
                optionalString(packetHeader.get("title")),
                "Restaurant customer"
        );
        String siteName = firstNonBlank(
                optionalString(values.get("systemName")),
                rowValue(packetHeader.get("quickFacts"), "System"),
                "Kitchen exhaust system"
        );
        String location = firstNonBlank(
                optionalString(values.get("siteCity")),
                rowValue(packetHeader.get("quickFacts"), "Location"),
                "Location not recorded"
        );
        String serviceDate = firstNonBlank(
                displayDate(serviceDateRaw),
                serviceDateRaw,
                "Service date not recorded"
        );
        String serviceResult = firstNonBlank(
                rowValue(packetData.get("serviceRecordRows"), "Today's result"),
                rowValue(packetHeader.get("quickFacts"), "Today's result"),
                optionalString(callout.get("title")),
                "Service result recorded"
        );
        String nextAction = firstNonBlank(
                optionalString(values.get("customerActionOverride")),
                optionalString(values.get("followUpOverride")),
                optionalString(values.get("followUpNote")),
                rowValue(customerClose.get("actionItems"), "Customer action"),
                optionalString(customerClose.get("title")),
                "Keep the PDF copy with kitchen exhaust service records."
        );
        String nextService = firstNonBlank(
                nextServiceWindow(serviceDateRaw, cadence),
                optionalString(values.get("nextServiceDate")),
                rowValue(packetData.get("frequencyRows"), "Next service window"),
                "Next service window not recorded"
        );
        Color brandColor = brandColor(
                firstNonBlank(
                        optionalString(companyProfile.get("brandColor")),
                        optionalString(vendor.get("brandColor"))
                )
        );
        Optional<ImageData> brandLogo = decodeInlineImage(firstNonBlank(
                optionalString(companyProfile.get("logoUrl")),
                optionalString(vendor.get("logoUrl"))
        ));

        try (PDDocument document = new PDDocument();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(
                    document,
                    freePlan ? "FREE TEST COPY" : "",
                    brandColor
            );

            writer.cover(
                    coverTitle,
                    reportLabel,
                    customerName,
                    siteName,
                    location,
                    serviceDate,
                    serviceResult,
                    nextAction,
                    nextService,
                    publicId,
                    displayGeneratedAt(generatedAt),
                    brandLogo.orElse(null)
            );

            if (freePlan) {
                writer.note("Free builder copy: company branding and contact are hidden, the PDF is watermarked, and the hosted link expires after 7 days. Company reports remove the watermark, keep links live, and save to account history.");
            }

            writer.section("Service Summary");
            writer.keyValue("Service date", serviceDate);
            writer.keyValue("Service window", firstNonBlank(optionalString(values.get("serviceWindow")), rowValue(packetData.get("serviceRecordRows"), "Service window"), serviceDate));
            writer.keyValue("Visit type", firstNonBlank(rowValue(packetData.get("serviceRecordRows"), "Today's visit"), "Kitchen exhaust cleaning service"));
            writer.keyValue("Technician / crew", firstNonBlank(rowValue(packetData.get("serviceRecordRows"), "Technician"), optionalString(companyProfile.get("technicianLabel")), "Technician / crew"));
            writer.keyValue("Service result", serviceResult);
            writer.keyValue("Service label", firstNonBlank(rowValue(packetData.get("serviceRecordRows"), "Service label"), "Service record posted with next due date"));
            writer.keyValue("Why this timing", firstNonBlank(rowValue(packetData.get("serviceRecordRows"), "Why this timing"), "Current grease load and service cadence were used for the next service window."));
            writer.keyValue("Separate scope note", firstNonBlank(rowValue(packetData.get("serviceRecordRows"), "Separate scope note"), "Separate corrective or follow-up work needs a separate go-ahead."));

            writer.section("Site And System");
            writer.keyValue("Property", customerName);
            writer.keyValue("Site", location);
            writer.keyValue("System", siteName);
            writer.keyValue("Line served", firstNonBlank(rowValue(packetData.get("systemIdentityRows"), "Line served"), siteName));
            writer.keyValue("Record coverage", firstNonBlank(rowValue(packetData.get("systemIdentityRows"), "Service record coverage"), "One service report for one kitchen exhaust system"));
            writer.keyValue("Reviewed on site", firstNonBlank(rowValue(packetData.get("systemIdentityRows"), "Reviewed on site"), rowValue(packetHeader.get("quickFacts"), "Reviewed"), "Site contact"));

            writer.section("Work Completed / Open Items");
            if (packetMismatch) {
                writeCanonicalCompletedAreas(writer);
            } else {
                writeComponentRows(writer, packetData.get("componentStatusRows"), 10);
                writeDeficiencyRows(writer, packetData.get("deficiencyRows"), 6);
            }

            writer.section("Restaurant Next Action");
            writer.paragraph(nextAction);
            writer.keyValue("Recommended service window", nextService);
            writer.keyValue("Customer action", nextAction);
            writer.keyValue("Record note", firstNonBlank(
                    rowValue(customerClose.get("actionItems"), "PDF copy note"),
                    rowValue(customerClose.get("actionItems"), "Evidence PDF note"),
                    "Keep this PDF with kitchen exhaust service files."
            ));

            writer.section("Photo Record");
            List<PhotoItem> photos = extractPhotoItems(publicId, payload);

            if (photos.isEmpty()) {
                writer.paragraph("No field photos were attached to this saved report.");
            } else {
                int count = 0;

                for (PhotoItem photo : photos) {
                    if (count >= 6) {
                        break;
                    }

                    Optional<Axis1StoredAsset> asset = assetStorage.loadAsset(publicId, photo.fileName());

                    if (asset.isEmpty()) {
                        continue;
                    }

                    if (writer.image(asset.get().bytes(), asset.get().contentType(), photo.caption())) {
                        count += 1;
                    }
                }

                if (count == 0) {
                    writer.paragraph("Attached photo files are stored with the report, but could not be embedded into this PDF copy.");
                }
            }

            writer.section("Provider Contact");
            if (freePlan) {
                writer.paragraph("Provider branding and contact are hidden in this free test copy. Company reports show the vendor logo, company name, direct line, dispatch email, after-hours phone, and credential on the retained PDF.");
                writer.keyValue("Company version includes", "Clean PDF without the free watermark, saved branding, live customer links, account history, and load-back into the builder.");
            } else {
                writer.keyValue("Company", companyName);
                writer.keyValue("Direct line", firstNonBlank(optionalString(companyProfile.get("directLine")), optionalString(vendor.get("directLine")), "Not recorded"));
                writer.keyValue("Dispatch", firstNonBlank(optionalString(companyProfile.get("dispatchEmail")), optionalString(vendor.get("dispatch")), "Not recorded"));
                writer.keyValue("After-hours", firstNonBlank(optionalString(companyProfile.get("afterHoursPhone")), optionalString(vendor.get("afterHours")), "Not recorded"));
                writer.keyValue("Credential", firstNonBlank(optionalString(companyProfile.get("certification")), optionalString(vendor.get("certification")), "Not recorded"));
            }
            writer.note("This PDF is the retained service report copy for this kitchen exhaust visit. Separate corrective or follow-up work needs a separate go-ahead.");
            writer.close();

            document.save(outputStream);
            return outputStream.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to generate Axis 1 service report PDF", exception);
        }
    }

    private void writeRows(PdfWriter writer, Object rowsValue, int limit) throws IOException {
        int count = 0;

        for (List<String> row : rowPairs(rowsValue)) {
            if (count >= limit) {
                break;
            }

            writer.keyValue(row.get(0), row.get(1));
            count += 1;
        }

        if (count == 0) {
            writer.paragraph("No rows recorded.");
        }
    }

    private void writeComponentRows(PdfWriter writer, Object rowsValue, int limit) throws IOException {
        int count = 0;

        for (Map<String, Object> row : objectList(rowsValue)) {
            if (count >= limit) {
                break;
            }

            String component = firstNonBlank(optionalString(row.get("component")), "Area");
            String status = firstNonBlank(optionalString(row.get("status")), "Recorded");
            String note = firstNonBlank(optionalString(row.get("note")), optionalString(row.get("proof")), "No note recorded");
            writer.keyValue(component + " - " + status, note);
            count += 1;
        }

        if (count == 0) {
            writer.paragraph("Completed areas were not listed separately in this saved report.");
        }
    }

    private void writeDeficiencyRows(PdfWriter writer, Object rowsValue, int limit) throws IOException {
        int count = 0;

        for (Map<String, Object> row : objectList(rowsValue)) {
            if (count >= limit) {
                break;
            }

            String location = firstNonBlank(optionalString(row.get("location")), "Open item");
            String issue = firstNonBlank(optionalString(row.get("issue")), "Issue recorded");
            String ownerAction = firstNonBlank(optionalString(row.get("ownerAction")), optionalString(row.get("notice")), "Next action recorded");
            writer.keyValue(location + " - " + issue, ownerAction);
            count += 1;
        }

        if (count == 0) {
            writer.keyValue("Open items", "No open items were listed in this saved report.");
        }
    }

    private void writeCanonicalCompletedAreas(PdfWriter writer) throws IOException {
        writer.keyValue(
                "Hood canopy and filters - Covered",
                "The report covers the reachable hood body, filter bank, and nearby grease collection points described in service notes."
        );
        writer.keyValue(
                "Reachable plenum and duct path - Covered",
                "The service path follows the reachable exhaust line instead of stopping at the visible hood face."
        );
        writer.keyValue(
                "Fan, roof discharge, and grease path - Recorded",
                "Visible fan, roof-discharge, and grease-containment conditions stay in the record for service history and follow-up conversation."
        );
        writer.keyValue(
                "Documentation - Written service record",
                "This visit is documented from written service notes. Attached field photos appear in the photo section when present."
        );
    }

    private List<PhotoItem> extractPhotoItems(String publicId, Map<String, Object> payload) {
        Map<String, PhotoItem> photos = new LinkedHashMap<>();
        Map<String, Object> packetData = objectMap(payload.get("packetData"));

        for (Map<String, Object> proofPhoto : objectList(packetData.get("proofPhotos"))) {
            addPhotoItem(publicId, photos, proofPhoto.get("src"), firstNonBlank(
                    optionalString(proofPhoto.get("title")),
                    optionalString(proofPhoto.get("caption")),
                    optionalString(proofPhoto.get("label")),
                    "Attached service photo"
            ));
        }

        if (!photos.isEmpty()) {
            return new ArrayList<>(photos.values());
        }

        Map<String, Object> uploadedFieldPhotos = objectMap(payload.get("uploadedFieldPhotos"));

        for (Object value : uploadedFieldPhotos.values()) {
            Map<String, Object> photo = objectMap(value);
            addPhotoItem(publicId, photos, photo.get("src"), firstNonBlank(
                    optionalString(photo.get("matchLabel")),
                    optionalString(photo.get("name")),
                    "Attached field photo"
            ));
        }

        return new ArrayList<>(photos.values());
    }

    private void addPhotoItem(
            String publicId,
            Map<String, PhotoItem> photos,
            Object srcValue,
            String caption
    ) {
        String src = optionalString(srcValue);
        String prefix = "/api/axis1/assets/" + publicId + "/";

        if (!src.startsWith(prefix)) {
            return;
        }

        String fileName = src.substring(prefix.length());

        if (!fileName.matches("[A-Za-z0-9._-]+") || photos.containsKey(fileName)) {
            return;
        }

        photos.put(fileName, new PhotoItem(fileName, caption));
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> objectMap(Object value) {
        if (value instanceof Map<?, ?> source) {
            Map<String, Object> result = new LinkedHashMap<>();

            for (Map.Entry<?, ?> entry : source.entrySet()) {
                if (entry.getKey() instanceof String key) {
                    result.put(key, entry.getValue());
                }
            }

            return result;
        }

        return new LinkedHashMap<>();
    }

    private static Map<String, Object> mutableMap(Object value) {
        return objectMap(value);
    }

    private static List<Object> mutableList(Object value) {
        if (value instanceof List<?> source) {
            return new ArrayList<>(source);
        }

        return new ArrayList<>();
    }

    private static List<Map<String, Object>> objectList(Object value) {
        List<Map<String, Object>> rows = new ArrayList<>();

        if (!(value instanceof List<?> source)) {
            return rows;
        }

        for (Object item : source) {
            Map<String, Object> map = objectMap(item);

            if (!map.isEmpty()) {
                rows.add(map);
            }
        }

        return rows;
    }

    private static List<List<String>> rowPairs(Object value) {
        List<List<String>> rows = new ArrayList<>();

        if (!(value instanceof List<?> source)) {
            return rows;
        }

        for (Object item : source) {
            if (item instanceof List<?> row && row.size() >= 2) {
                rows.add(List.of(optionalString(row.get(0)), optionalString(row.get(1))));
            }
        }

        return rows;
    }

    private static String rowValue(Object rowsValue, String label) {
        for (List<String> row : rowPairs(rowsValue)) {
            if (row.get(0).equalsIgnoreCase(label)) {
                return row.get(1);
            }
        }

        return "";
    }

    private static boolean hasPacketDataMismatch(Map<String, Object> values, Map<String, Object> packetData) {
        Map<String, Object> packetHeader = objectMap(packetData.get("packetHeader"));

        return mismatched(values.get("propertyName"), packetHeader.get("title"))
                || mismatched(values.get("siteCity"), rowValue(packetHeader.get("quickFacts"), "Location"))
                || mismatched(values.get("systemName"), rowValue(packetHeader.get("quickFacts"), "System"));
    }

    private static boolean mismatched(Object expected, Object actual) {
        String expectedValue = comparableText(expected);
        String actualValue = comparableText(actual);

        return !expectedValue.isBlank() && !actualValue.isBlank() && !expectedValue.equals(actualValue);
    }

    private static String comparableText(Object value) {
        return optionalString(value).replaceAll("\\s+", " ").trim().toLowerCase(Locale.ROOT);
    }

    private static String displayDate(String value) {
        LocalDate date = parseDate(value);

        if (date == null) {
            return "";
        }

        return DateTimeFormatter.ofPattern("MMM d, yyyy", Locale.US).format(date);
    }

    private static String displayGeneratedAt(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }

        try {
            return DateTimeFormatter.ofPattern("MMM d, yyyy 'at' HH:mm 'UTC'", Locale.US)
                    .withZone(ZoneOffset.UTC)
                    .format(Instant.parse(value));
        } catch (DateTimeParseException ignored) {
            return value;
        }
    }

    private static String nextServiceWindow(String serviceDate, String cadence) {
        LocalDate date = parseDate(serviceDate);

        if (date == null || cadence == null || cadence.isBlank()) {
            return "";
        }

        try {
            LocalDate dueDate = date.plusDays(Integer.parseInt(cadence));
            LocalDate startDate = dueDate.minusDays(5);
            return formatDateRange(startDate, dueDate);
        } catch (NumberFormatException ignored) {
            return "";
        }
    }

    private static LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return LocalDate.parse(value.trim());
        } catch (DateTimeParseException ignored) {
            return null;
        }
    }

    private static String formatDateRange(LocalDate startDate, LocalDate endDate) {
        String startMonth = DateTimeFormatter.ofPattern("MMM", Locale.US).format(startDate);
        String endMonth = DateTimeFormatter.ofPattern("MMM", Locale.US).format(endDate);

        if (startMonth.equals(endMonth)) {
            return "%s %d-%d, %d".formatted(
                    startMonth,
                    startDate.getDayOfMonth(),
                    endDate.getDayOfMonth(),
                    endDate.getYear()
            );
        }

        return "%s %d - %s %d, %d".formatted(
                startMonth,
                startDate.getDayOfMonth(),
                endMonth,
                endDate.getDayOfMonth(),
                endDate.getYear()
        );
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }

        return "";
    }

    private static String optionalString(Object value) {
        return value instanceof String stringValue ? stringValue.trim() : "";
    }

    private static String defaultString(Object value, String fallback) {
        String stringValue = optionalString(value);
        return stringValue.isBlank() ? fallback : stringValue;
    }

    private static boolean booleanValue(Object value, boolean fallback) {
        return value instanceof Boolean booleanValue ? booleanValue : fallback;
    }

    private static Color brandColor(String value) {
        if (value == null || !value.matches("^#[0-9A-Fa-f]{6}$")) {
            return new Color(210, 86, 28);
        }

        return new Color(
                Integer.parseInt(value.substring(1, 3), 16),
                Integer.parseInt(value.substring(3, 5), 16),
                Integer.parseInt(value.substring(5, 7), 16)
        );
    }

    private static Optional<ImageData> decodeInlineImage(String dataUrl) {
        if (dataUrl == null || dataUrl.isBlank() || !dataUrl.startsWith("data:")) {
            return Optional.empty();
        }

        int commaIndex = dataUrl.indexOf(',');

        if (commaIndex < 0) {
            return Optional.empty();
        }

        String metadata = dataUrl.substring(5, commaIndex).toLowerCase(Locale.ROOT);

        if (!metadata.contains(";base64")) {
            return Optional.empty();
        }

        String contentType = metadata.split(";")[0];

        if (!(contentType.equals("image/png") || contentType.equals("image/jpeg") || contentType.equals("image/jpg"))) {
            return Optional.empty();
        }

        try {
            return Optional.of(new ImageData(Base64.getDecoder().decode(dataUrl.substring(commaIndex + 1)), contentType));
        } catch (IllegalArgumentException ignored) {
            return Optional.empty();
        }
    }

    private record PhotoItem(String fileName, String caption) {
    }

    private record ImageData(byte[] bytes, String contentType) {
    }

    private static class PdfWriter implements AutoCloseable {
        private static final float MARGIN = 54;
        private static final float MAX_WIDTH = PDRectangle.LETTER.getWidth() - (MARGIN * 2);
        private static final float BOTTOM_MARGIN = 54;
        private static final Color TEXT = new Color(28, 28, 28);
        private static final Color MUTED = new Color(92, 84, 76);
        private static final Color SUBTLE = new Color(248, 244, 239);
        private static final Color CALLOUT = new Color(239, 248, 244);
        private static final Color ORANGE = new Color(210, 86, 28);
        private static final Color RULE = new Color(216, 205, 193);

        private final PDDocument document;
        private final PDFont regular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
        private final PDFont bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
        private final String watermarkLabel;
        private final Color accent;
        private PDPageContentStream content;
        private float y;

        PdfWriter(PDDocument document, String watermarkLabel, Color accent) throws IOException {
            this.document = document;
            this.watermarkLabel = watermarkLabel == null ? "" : watermarkLabel;
            this.accent = accent == null ? ORANGE : accent;
            newPage();
        }

        void title(String text) throws IOException {
            ensureSpace(58);
            lines(text, bold, 20, TEXT, 25);
            rule();
        }

        void cover(
                String companyName,
                String reportLabel,
                String customerName,
                String siteName,
                String location,
                String serviceDate,
                String serviceResult,
                String nextAction,
                String nextService,
                String publicId,
                String generatedAt,
                ImageData brandLogo
        ) throws IOException {
            ensureSpace(294);
            float headerTop = y;
            float titleWidth = brandLogo == null ? MAX_WIDTH : MAX_WIDTH - 88;
            drawCoverLogo(brandLogo, headerTop);
            lines(companyName, bold, 20, TEXT, 25, titleWidth);
            line(reportLabel, bold, 11, accent, 15);
            lines("Retained customer copy for restaurant files, manager review, insurance, landlord, or inspection documentation requests.", regular, 9, MUTED, 13);
            spacer(7);

            float tileGap = 8;
            float tileHeight = 54;
            float tileWidth = (MAX_WIDTH - tileGap) / 2;
            float tileTop = y;
            summaryTile(MARGIN, tileTop, tileWidth, tileHeight, "Restaurant", customerName);
            summaryTile(MARGIN + tileWidth + tileGap, tileTop, tileWidth, tileHeight, "Service date", serviceDate);
            float secondTileTop = tileTop - tileHeight - tileGap;
            summaryTile(MARGIN, secondTileTop, tileWidth, tileHeight, "Result", serviceResult);
            summaryTile(MARGIN + tileWidth + tileGap, secondTileTop, tileWidth, tileHeight, "Next service", nextService);
            y = secondTileTop - tileHeight - 14;

            List<String> actionLines = wrap(nextAction, bold, 9.3f, MAX_WIDTH - 24);
            float actionHeight = Math.max(58, 30 + (actionLines.size() * 12));
            drawBox(MARGIN, y, MAX_WIDTH, actionHeight, CALLOUT, new Color(181, 216, 198));
            textBlock("Next action", bold, 7.2f, accent, 10, MARGIN + 12, y - 15, MAX_WIDTH - 24);
            textBlock(nextAction, bold, 9.3f, TEXT, 12, MARGIN + 12, y - 29, MAX_WIDTH - 24);
            y -= actionHeight + 12;

            keyValue("System", siteName);
            keyValue("Location", location);
            keyValue("Report link ID", publicId);
            keyValue("PDF generated", generatedAt);
            rule();
        }

        void section(String text) throws IOException {
            spacer(14);
            ensureSpace(92);
            line(text.toUpperCase(Locale.ROOT), bold, 10, accent, 15);
            rule();
        }

        void paragraph(String text) throws IOException {
            lines(text, regular, 10, TEXT, 15);
        }

        void keyValue(String label, String value) throws IOException {
            float labelWidth = 176;
            float valueX = MARGIN + labelWidth + 16;
            float valueWidth = MAX_WIDTH - labelWidth - 16;
            List<String> labelLines = wrap(label, bold, 8, labelWidth);
            List<String> valueLines = wrap(value, regular, 9.4f, valueWidth);
            float leading = 13;
            float rowHeight = Math.max(18, Math.max(labelLines.size(), valueLines.size()) * leading + 3);

            ensureSpace(rowHeight);

            float labelY = y;
            for (String line : labelLines) {
                drawText(line, bold, 8, MUTED, MARGIN, labelY);
                labelY -= leading;
            }

            float valueY = y;
            for (String line : valueLines) {
                drawText(line, regular, 9.4f, TEXT, valueX, valueY);
                valueY -= leading;
            }

            y -= rowHeight;
        }

        void note(String text) throws IOException {
            spacer(8);
            lines(text, regular, 9, MUTED, 13);
        }

        boolean image(byte[] bytes, String contentType, String caption) throws IOException {
            if (contentType == null || !(contentType.equals("image/png") || contentType.equals("image/jpeg") || contentType.equals("image/jpg"))) {
                return false;
            }

            PDImageXObject image;

            try {
                image = PDImageXObject.createFromByteArray(document, bytes, "axis1-report-photo");
            } catch (IOException exception) {
                return false;
            }

            float maxImageWidth = MAX_WIDTH - 24;
            float maxImageHeight = 245;
            float imageWidth = image.getWidth();
            float imageHeight = image.getHeight();
            float scale = Math.min(maxImageWidth / imageWidth, maxImageHeight / imageHeight);
            scale = Math.min(scale, 1.0f);
            float drawWidth = imageWidth * scale;
            float drawHeight = imageHeight * scale;
            String photoCaption = firstNonBlank(caption, "Attached service photo");
            List<String> captionLines = wrap(photoCaption, regular, 8.5f, MAX_WIDTH - 24);
            float captionHeight = Math.max(14, captionLines.size() * 11);
            float cardHeight = drawHeight + captionHeight + 34;

            ensureSpace(cardHeight + 10);
            drawBox(MARGIN, y, MAX_WIDTH, cardHeight, Color.WHITE, RULE);

            float imageX = MARGIN + 12 + ((MAX_WIDTH - 24 - drawWidth) / 2);
            float imageY = y - 12 - drawHeight;
            content.drawImage(image, imageX, imageY, drawWidth, drawHeight);

            float captionY = imageY - 14;
            for (String line : captionLines) {
                drawText(line, regular, 8.5f, MUTED, MARGIN + 12, captionY);
                captionY -= 11;
            }

            y -= cardHeight + 10;
            return true;
        }

        void spacer(float amount) throws IOException {
            ensureSpace(amount);
            y -= amount;
        }

        private void lines(String text, PDFont font, float size, Color color, float leading) throws IOException {
            lines(text, font, size, color, leading, MAX_WIDTH);
        }

        private void lines(String text, PDFont font, float size, Color color, float leading, float maxWidth) throws IOException {
            for (String line : wrap(text, font, size, maxWidth)) {
                line(line, font, size, color, leading);
            }
        }

        private void line(String text, PDFont font, float size, Color color, float leading) throws IOException {
            ensureSpace(leading + 2);
            content.beginText();
            content.setNonStrokingColor(color);
            content.setFont(font, size);
            content.newLineAtOffset(MARGIN, y);
            content.showText(pdfText(text));
            content.endText();
            y -= leading;
        }

        private void drawCoverLogo(ImageData logo, float top) throws IOException {
            if (logo == null || logo.contentType() == null || !(logo.contentType().equals("image/png") || logo.contentType().equals("image/jpeg") || logo.contentType().equals("image/jpg"))) {
                return;
            }

            PDImageXObject image;

            try {
                image = PDImageXObject.createFromByteArray(document, logo.bytes(), "axis1-report-logo");
            } catch (IOException exception) {
                return;
            }

            float maxWidth = 64;
            float maxHeight = 44;
            float scale = Math.min(maxWidth / image.getWidth(), maxHeight / image.getHeight());
            float drawWidth = image.getWidth() * scale;
            float drawHeight = image.getHeight() * scale;
            float x = PDRectangle.LETTER.getWidth() - MARGIN - drawWidth;
            float yPosition = top - 8 - drawHeight;
            content.drawImage(image, x, yPosition, drawWidth, drawHeight);
        }

        private void summaryTile(
                float x,
                float top,
                float width,
                float height,
                String label,
                String value
        ) throws IOException {
            drawBox(x, top, width, height, SUBTLE, RULE);
            textBlock(label.toUpperCase(Locale.ROOT), bold, 6.8f, MUTED, 9, x + 9, top - 15, width - 18);
            textBlock(value, bold, 8.7f, TEXT, 11, x + 9, top - 29, width - 18);
        }

        private void drawBox(float x, float top, float width, float height, Color fill, Color border) throws IOException {
            content.setNonStrokingColor(fill);
            content.addRect(x, top - height, width, height);
            content.fill();
            content.setStrokingColor(border);
            content.setLineWidth(0.7f);
            content.addRect(x, top - height, width, height);
            content.stroke();
        }

        private float textBlock(
                String text,
                PDFont font,
                float size,
                Color color,
                float leading,
                float x,
                float baseline,
                float maxWidth
        ) throws IOException {
            float current = baseline;

            for (String line : wrap(text, font, size, maxWidth)) {
                drawText(line, font, size, color, x, current);
                current -= leading;
            }

            return current;
        }

        private void drawText(String text, PDFont font, float size, Color color, float x, float baseline) throws IOException {
            content.beginText();
            content.setNonStrokingColor(color);
            content.setFont(font, size);
            content.newLineAtOffset(x, baseline);
            content.showText(pdfText(text));
            content.endText();
        }

        private void rule() throws IOException {
            ensureSpace(11);
            content.setStrokingColor(RULE);
            content.setLineWidth(0.7f);
            content.moveTo(MARGIN, y);
            content.lineTo(PDRectangle.LETTER.getWidth() - MARGIN, y);
            content.stroke();
            y -= 11;
        }

        private void ensureSpace(float needed) throws IOException {
            if (y - needed < BOTTOM_MARGIN) {
                newPage();
            }
        }

        private void newPage() throws IOException {
            if (content != null) {
                content.close();
            }

            PDPage page = new PDPage(PDRectangle.LETTER);
            document.addPage(page);
            content = new PDPageContentStream(document, page);
            y = PDRectangle.LETTER.getHeight() - MARGIN;
            drawAccentRule();
            drawWatermark();
            drawFooter(document.getNumberOfPages());
        }

        private void drawAccentRule() throws IOException {
            content.setStrokingColor(accent);
            content.setLineWidth(3f);
            float top = PDRectangle.LETTER.getHeight() - 28;
            content.moveTo(MARGIN, top);
            content.lineTo(PDRectangle.LETTER.getWidth() - MARGIN, top);
            content.stroke();
        }

        private void drawWatermark() throws IOException {
            if (watermarkLabel.isBlank()) {
                return;
            }

            String text = pdfText(watermarkLabel);
            float size = 24;
            float textWidth = bold.getStringWidth(text) / 1000 * size;
            content.beginText();
            content.setNonStrokingColor(new Color(238, 119, 64));
            content.setFont(bold, size);
            content.newLineAtOffset(PDRectangle.LETTER.getWidth() - MARGIN - textWidth, PDRectangle.LETTER.getHeight() - 36);
            content.showText(text);
            content.endText();
        }

        private void drawFooter(int pageNumber) throws IOException {
            if (watermarkLabel.isBlank()) {
                return;
            }

            String text = pdfText(watermarkLabel + " - Free builder output - Page " + pageNumber);
            float size = 7.4f;
            float textWidth = regular.getStringWidth(text) / 1000 * size;
            float pageWidth = PDRectangle.LETTER.getWidth();
            float x = Math.max(MARGIN, (pageWidth - textWidth) / 2);

            content.setStrokingColor(new Color(229, 214, 202));
            content.setLineWidth(0.45f);
            content.moveTo(MARGIN, 42);
            content.lineTo(pageWidth - MARGIN, 42);
            content.stroke();

            content.beginText();
            content.setNonStrokingColor(new Color(154, 91, 62));
            content.setFont(regular, size);
            content.newLineAtOffset(x, 28);
            content.showText(text);
            content.endText();
        }

        private List<String> wrap(String text, PDFont font, float size, float maxWidth) throws IOException {
            String cleaned = pdfText(text);
            List<String> lines = new ArrayList<>();

            for (String paragraph : cleaned.split("\\R")) {
                String[] words = paragraph.trim().split("\\s+");
                StringBuilder line = new StringBuilder();

                for (String word : words) {
                    if (word.isBlank()) {
                        continue;
                    }

                    String candidate = line.isEmpty() ? word : line + " " + word;
                    float width = font.getStringWidth(candidate) / 1000 * size;

                    if (width > maxWidth && !line.isEmpty()) {
                        lines.add(line.toString());
                        line = new StringBuilder(word);
                    } else {
                        line = new StringBuilder(candidate);
                    }
                }

                if (!line.isEmpty()) {
                    lines.add(line.toString());
                }
            }

            return lines.isEmpty() ? List.of("") : lines;
        }

        private static String pdfText(String value) {
            if (value == null) {
                return "";
            }

            String normalized = Normalizer.normalize(value, Normalizer.Form.NFKD)
                    .replaceAll("\\p{M}", "")
                    .replace('\u2018', '\'')
                    .replace('\u2019', '\'')
                    .replace('\u201c', '"')
                    .replace('\u201d', '"')
                    .replace('\u2013', '-')
                    .replace('\u2014', '-')
                    .replace('\u2022', '-');
            normalized = normalized
                    .replaceAll("(?i)\\bClaim level\\b", "Documentation support")
                    .replaceAll("(?i)\\bRecord type\\b", "Report type")
                    .replaceAll("(?i)\\bRecord support\\b", "Documentation support")
                    .replaceAll("(?i)\\bRecord basis\\b", "Documentation")
                    .replaceAll("(?i)\\bVendor action\\b", "Service team follow-up")
                    .replaceAll("(?i)\\bP-0*(\\d+)\\b", "Photo $1")
                    .replaceAll("(?i)\\bLBL-\\d+-SYS\\d+\\b", "system label photo")
                    .replaceAll("(?i)\\bEXC-\\d+-[A-Z]{2}\\d+\\b", "open item photo")
                    .replaceAll("(?i)\\b(?:HD|FL|DK|RF|GC)-\\d+\\b", "service area")
                    .replace("; ", ", ");
            StringBuilder builder = new StringBuilder();

            for (int index = 0; index < normalized.length(); index += 1) {
                char character = normalized.charAt(index);

                if (character == '\n' || character == '\r' || character == '\t') {
                    builder.append(' ');
                    continue;
                }

                if (character >= 32 && character <= 126) {
                    builder.append(character);
                }
            }

            return builder.toString().replaceAll("\\s+", " ").trim();
        }

        @Override
        public void close() throws IOException {
            if (content != null) {
                content.close();
                content = null;
            }
        }
    }
}
