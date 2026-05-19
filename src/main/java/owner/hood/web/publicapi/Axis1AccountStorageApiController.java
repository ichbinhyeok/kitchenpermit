package owner.hood.web.publicapi;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import owner.hood.application.auth.AccountUserDetailsService;
import owner.hood.application.axis1.Axis1AccountEntitlement;
import owner.hood.application.axis1.Axis1EntitlementService;
import owner.hood.application.axis1.Axis1PdfExportService;
import owner.hood.application.axis1.Axis1ReportAssetStorage;
import owner.hood.application.axis1.Axis1ReportAssetStorageResult;
import owner.hood.domain.axis1.Axis1CompanyProfile;
import owner.hood.domain.axis1.Axis1ReportRecord;
import owner.hood.infrastructure.persistence.Axis1CompanyProfileRepository;
import owner.hood.infrastructure.persistence.Axis1ReportRecordRepository;
import owner.hood.web.common.RobotsHeaders;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
public class Axis1AccountStorageApiController {

    private static final TypeReference<Map<String, Object>> JSON_MAP =
            new TypeReference<>() {
            };
    private static final int FREE_LINK_DAYS = 7;
    private static final String DEFAULT_BRAND_COLOR = "#0F172A";
    private static final int MAX_LOGO_DATA_URL_LENGTH = 700_000;
    private static final List<String> ACCESS_EXCEPTION_KINDS = List.of(
            "blocked-storage",
            "sealed-panel",
            "panel-signage",
            "unsafe-access",
            "not-cleaned"
    );

    private final Axis1CompanyProfileRepository companyProfiles;
    private final Axis1ReportRecordRepository reportRecords;
    private final Axis1EntitlementService entitlementService;
    private final Axis1ReportAssetStorage assetStorage;
    private final Axis1PdfExportService pdfExportService;
    private final ObjectMapper objectMapper;

    public Axis1AccountStorageApiController(
            Axis1CompanyProfileRepository companyProfiles,
            Axis1ReportRecordRepository reportRecords,
            Axis1EntitlementService entitlementService,
            Axis1ReportAssetStorage assetStorage,
            Axis1PdfExportService pdfExportService
    ) {
        this.companyProfiles = companyProfiles;
        this.reportRecords = reportRecords;
        this.entitlementService = entitlementService;
        this.assetStorage = assetStorage;
        this.pdfExportService = pdfExportService;
        this.objectMapper = new ObjectMapper();
    }

    @GetMapping("/api/account/entitlements")
    public ResponseEntity<Map<String, Object>> getEntitlements(Authentication authentication) {
        Axis1AccountEntitlement entitlement = entitlementService.resolve(authenticatedEmail(authentication));
        return ResponseEntity.ok(entitlementResponse(entitlement));
    }

    @GetMapping("/api/account/company-profile")
    public ResponseEntity<Map<String, Object>> getCompanyProfile(Authentication authentication) {
        Optional<String> accountEmail = authenticatedEmail(authentication);

        if (accountEmail.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Axis1AccountEntitlement entitlement = entitlementService.resolve(accountEmail);
        if (!entitlement.companyAccess()) {
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED)
                    .body(companyAccessRequiredResponse(entitlement));
        }

        return companyProfiles.findByAccountEmail(accountEmail.get())
                .map(profile -> ResponseEntity.ok(companyProfileResponse(profile)))
                .orElseGet(() -> ResponseEntity.ok(defaultCompanyProfileResponse(accountEmail.get())));
    }

    @PutMapping("/api/account/company-profile")
    @Transactional
    public ResponseEntity<Map<String, Object>> saveCompanyProfile(
            @RequestBody Map<String, Object> body,
            Authentication authentication
    ) {
        Optional<String> accountEmail = authenticatedEmail(authentication);

        if (accountEmail.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Axis1AccountEntitlement entitlement = entitlementService.resolve(accountEmail);
        if (!entitlement.companyAccess()) {
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED)
                    .body(companyAccessRequiredResponse(entitlement));
        }

        Axis1CompanyProfile profile = companyProfiles.findByAccountEmail(accountEmail.get())
                .orElseGet(Axis1CompanyProfile::new);
        profile.setAccountEmail(accountEmail.get());
        profile.setCompanyName(clean(body.get("companyName"), "Acme Hood Cleaning", 90));
        profile.setServiceArea(clean(body.get("serviceArea"), "Austin, TX | kitchen exhaust service", 120));
        profile.setDirectLine(clean(body.get("directLine"), "(555) 014-2201", 40));
        profile.setDispatchEmail(clean(body.get("dispatchEmail"), "dispatch@acmehood.example", 120));
        profile.setAfterHoursPhone(clean(body.get("afterHoursPhone"), "(555) 014-2209", 40));
        profile.setCertification(clean(body.get("certification"), "Service license / certification", 90));
        profile.setTechnicianLabel(clean(body.get("technicianLabel"), "Technician / crew", 72));
        profile.setBrandInitials(cleanBrandInitials(body.get("brandInitials"), profile.getCompanyName()));
        profile.setLogoUrl(cleanLogoUrl(body.get("logoUrl")));
        profile.setBrandColor(cleanBrandColor(body.get("brandColor")));

        Axis1CompanyProfile saved = companyProfiles.save(profile);
        return ResponseEntity.ok(companyProfileResponse(saved));
    }

    @PostMapping("/api/axis1/reports")
    @Transactional
    public ResponseEntity<Map<String, Object>> saveReport(
            @RequestBody Map<String, Object> payload,
            Authentication authentication
    ) {
        Optional<String> accountEmail = authenticatedEmail(authentication);
        Axis1AccountEntitlement entitlement = entitlementService.resolve(accountEmail);
        Map<String, Object> values = objectMap(payload.get("values"));
        String requestedPlan = clean(payload.get("productPlan"), "free", 32).toLowerCase(Locale.ROOT);
        String productPlan = entitlement.effectivePlan(requestedPlan);
        String customerName = clean(values.get("propertyName"), "Restaurant customer", 120);
        String siteName = clean(values.get("systemName"), clean(values.get("siteCity"), "Kitchen exhaust system", 120), 120);
        String serviceDate = optionalClean(values.get("serviceDate"), 32);
        String nextServiceDate = nextServiceDate(serviceDate, optionalClean(values.get("cadence"), 8));
        String publicId = createPublicId();
        Axis1ReportAssetStorageResult storageResult = assetStorage.preparePayload(publicId, payload);
        Map<String, Object> preparedPayload = new LinkedHashMap<>(storageResult.payload());
        preparedPayload.put("productPlan", productPlan);

        if ("company".equals(productPlan) && accountEmail.isPresent()) {
            applyAccountCompanyProfile(preparedPayload, accountEmail.get());
        } else {
            applyFreeReportPolicy(preparedPayload);
        }

        pdfExportService.generateAndAttach(publicId, productPlan, preparedPayload);

        Axis1ReportRecord record = new Axis1ReportRecord();
        record.setPublicId(publicId);
        record.setAccountEmail("company".equals(productPlan) ? accountEmail.orElse(null) : null);
        record.setProductPlan(productPlan);
        record.setCustomerName(customerName);
        record.setSiteName(siteName);
        record.setServiceDate(serviceDate);
        record.setNextServiceDate(nextServiceDate);
        record.setTitle(cleanTitle(customerName, siteName));
        record.setPayloadJson(toJson(preparedPayload));
        record.setExpiresAt("free".equals(productPlan) ? Instant.now().plusSeconds(FREE_LINK_DAYS * 24L * 60L * 60L) : null);

        Axis1ReportRecord saved = reportRecords.save(record);
        return ResponseEntity.status(HttpStatus.CREATED).body(reportResponse(saved, true));
    }

    @GetMapping("/api/axis1/reports/history")
    public ResponseEntity<List<Map<String, Object>>> reportHistory(Authentication authentication) {
        Optional<String> accountEmail = authenticatedEmail(authentication);

        if (accountEmail.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Axis1AccountEntitlement entitlement = entitlementService.resolve(accountEmail);
        if (!entitlement.companyAccess()) {
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED)
                    .body(List.of(companyAccessRequiredResponse(entitlement)));
        }

        List<Axis1ReportRecord> records = new ArrayList<>(
                reportRecords.findTop50ByAccountEmailOrderByCreatedAtDesc(accountEmail.get())
        );
        records.sort(Comparator
                .comparing(Axis1AccountStorageApiController::historySortDate)
                .thenComparing(Axis1ReportRecord::getCreatedAt, Comparator.reverseOrder()));

        return ResponseEntity.ok(records.stream()
                .map(record -> reportResponse(record, false))
                .toList());
    }

    @GetMapping("/api/axis1/reports/{publicId}/builder")
    public ResponseEntity<Map<String, Object>> builderReport(
            @PathVariable String publicId,
            Authentication authentication
    ) {
        Optional<String> accountEmail = authenticatedEmail(authentication);

        if (accountEmail.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Axis1AccountEntitlement entitlement = entitlementService.resolve(accountEmail);
        if (!entitlement.companyAccess()) {
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED)
                    .body(companyAccessRequiredResponse(entitlement));
        }

        return reportRecords.findByPublicIdAndAccountEmail(publicId, accountEmail.get())
                .map(record -> {
                    if (isExpired(record)) {
                        return ResponseEntity.status(HttpStatus.GONE)
                                .body(expiredReportResponse(record));
                    }

                    Map<String, Object> response = reportResponse(record, true);
                    response.put("access", "owner_builder");
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/api/axis1/reports/{publicId}")
    @Transactional
    public ResponseEntity<Void> deleteReport(
            @PathVariable String publicId,
            Authentication authentication
    ) {
        Optional<String> accountEmail = authenticatedEmail(authentication);

        if (accountEmail.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<Axis1ReportRecord> record = reportRecords.findByPublicIdAndAccountEmail(publicId, accountEmail.get());

        if (record.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        assetStorage.deleteReportAssets(record.get().getPublicId());
        reportRecords.delete(record.get());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/axis1/reports/public/{publicId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> publicReport(
            @PathVariable String publicId,
            @RequestParam(name = "preview", defaultValue = "false") boolean preview,
            Authentication authentication
    ) {
        return reportRecords.findByPublicId(publicId)
                .map(record -> {
                    if (isExpired(record)) {
                        return publicNoIndex(HttpStatus.GONE)
                                .body(expiredReportResponse(record));
                    }

                    boolean ownerPreview = preview || isOwnerRequest(record, authentication);
                    if (!ownerPreview) {
                        recordPublicView(record);
                    }
                    return publicNoIndex(HttpStatus.OK).body(reportResponse(record, true, ownerPreview));
                })
                .orElseGet(() -> publicNoIndex(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping("/api/axis1/reports/public/{publicId}/events/pdf-save")
    @Transactional
    public ResponseEntity<Map<String, Object>> recordPublicReportPdfSave(
            @PathVariable String publicId,
            @RequestParam(name = "preview", defaultValue = "false") boolean preview,
            Authentication authentication
    ) {
        return reportRecords.findByPublicId(publicId)
                .map(record -> {
                    if (isExpired(record)) {
                        return publicNoIndex(HttpStatus.GONE)
                                .body(expiredReportResponse(record));
                    }

                    if (!preview && !isOwnerRequest(record, authentication)) {
                        Instant now = Instant.now();
                        record.setPdfSaveClickCount(record.getPdfSaveClickCount() + 1);
                        record.setLastPdfSaveClickedAt(now);
                    }
                    return publicNoIndex(HttpStatus.OK).body(engagementResponse(record));
                })
                .orElseGet(() -> publicNoIndex(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping("/api/axis1/reports/public/{publicId}/confirm")
    @Transactional
    public ResponseEntity<Map<String, Object>> confirmPublicReportReceived(
            @PathVariable String publicId,
            Authentication authentication,
            @RequestParam(name = "preview", defaultValue = "false") boolean preview,
            @RequestBody(required = false) Map<String, Object> body
    ) {
        return reportRecords.findByPublicId(publicId)
                .map(record -> {
                    if (isExpired(record)) {
                        return publicNoIndex(HttpStatus.GONE)
                                .body(expiredReportResponse(record));
                    }

                    if (preview || isOwnerRequest(record, authentication)) {
                        return publicNoIndex(HttpStatus.CONFLICT)
                                .body(Map.of(
                                        "ownerPreview", true,
                                        "message", "Preview mode cannot confirm customer receipt.",
                                        "engagement", engagementResponse(record)
                                ));
                    }

                    if (record.getCustomerConfirmedAt() == null) {
                        record.setCustomerConfirmedAt(Instant.now());
                    }

                    String confirmedBy = clean(
                            body == null ? null : body.get("confirmedBy"),
                            "Customer",
                            120
                    );
                    record.setCustomerConfirmedBy(confirmedBy);
                    return publicNoIndex(HttpStatus.OK).body(engagementResponse(record));
                })
                .orElseGet(() -> publicNoIndex(HttpStatus.NOT_FOUND).build());
    }

    @GetMapping("/api/axis1/reports/public/{publicId}/pdf-manifest")
    public ResponseEntity<Map<String, Object>> publicReportPdfManifest(@PathVariable String publicId) {
        return reportRecords.findByPublicId(publicId)
                .map(record -> {
                    if (isExpired(record)) {
                        return publicNoIndex(HttpStatus.GONE)
                                .body(expiredReportResponse(record));
                    }

                    return publicNoIndex(HttpStatus.OK).body(Map.of(
                            "publicId", record.getPublicId(),
                            "productPlan", record.getProductPlan(),
                            "pdfExport", pdfExportService.capability(record.getProductPlan(), fromJson(record.getPayloadJson()))
                    ));
                })
                .orElseGet(() -> publicNoIndex(HttpStatus.NOT_FOUND).build());
    }

    private ResponseEntity.BodyBuilder publicNoIndex(HttpStatus status) {
        return ResponseEntity.status(status)
                .header(RobotsHeaders.X_ROBOTS_TAG, RobotsHeaders.NO_INDEX_PRIVATE_CONTENT);
    }

    private Optional<String> authenticatedEmail(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return Optional.empty();
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof OAuth2User oauth2User) {
            Object email = oauth2User.getAttributes().get("email");

            if (email instanceof String emailString) {
                String normalized = AccountUserDetailsService.normalizeEmail(emailString);
                return normalized.isBlank() ? Optional.empty() : Optional.of(normalized);
            }
        }

        String normalized = AccountUserDetailsService.normalizeEmail(authentication.getName());
        return normalized.isBlank() ? Optional.empty() : Optional.of(normalized);
    }

    private Map<String, Object> companyProfileResponse(Axis1CompanyProfile profile) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("companyName", profile.getCompanyName());
        response.put("serviceArea", profile.getServiceArea());
        response.put("directLine", profile.getDirectLine());
        response.put("dispatchEmail", profile.getDispatchEmail());
        response.put("afterHoursPhone", profile.getAfterHoursPhone());
        response.put("certification", profile.getCertification());
        response.put("technicianLabel", profile.getTechnicianLabel());
        response.put("brandInitials", profile.getBrandInitials());
        response.put("logoUrl", profile.getLogoUrl());
        response.put("brandColor", profile.getBrandColor());
        response.put("updatedAt", profile.getUpdatedAt().toString());
        return response;
    }

    private Map<String, Object> defaultCompanyProfileResponse(String accountEmail) {
        String prefix = accountEmail.contains("@") ? accountEmail.substring(0, accountEmail.indexOf('@')) : accountEmail;
        String companyName = titleCase(prefix.replaceAll("[^A-Za-z0-9]+", " ")) + " Hood Cleaning";
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("companyName", companyName);
        response.put("serviceArea", "Service area / kitchen exhaust service");
        response.put("directLine", "");
        response.put("dispatchEmail", accountEmail);
        response.put("afterHoursPhone", "");
        response.put("certification", "Service license / certification");
        response.put("technicianLabel", "Technician / crew");
        response.put("brandInitials", cleanBrandInitials("", companyName));
        response.put("logoUrl", "");
        response.put("brandColor", DEFAULT_BRAND_COLOR);
        response.put("updatedAt", Instant.now().toString());
        return response;
    }

    private void applyAccountCompanyProfile(Map<String, Object> payload, String accountEmail) {
        Map<String, Object> profile = companyProfiles.findByAccountEmail(accountEmail)
                .map(this::companyProfileResponse)
                .orElseGet(() -> defaultCompanyProfileResponse(accountEmail));
        payload.put("companyProfile", profile);

        Map<String, Object> packetData = mutableMap(payload.get("packetData"));

        if (packetData.isEmpty()) {
            return;
        }

        String companyName = stringValue(profile.get("companyName"));
        String technicianLabel = stringValue(profile.get("technicianLabel"));
        String preparedBy = companyName + " | " + technicianLabel;
        Map<String, String> rowReplacements = Map.of(
                "Technician", technicianLabel,
                "Credential", stringValue(profile.get("certification")),
                "Dispatch", stringValue(profile.get("dispatchEmail")),
                "After-hours", stringValue(profile.get("afterHoursPhone")),
                "Follow-up contact", stringValue(profile.get("dispatchEmail")),
                "Prepared by technician", preparedBy,
                "Technician credential", stringValue(profile.get("certification")),
                "Servicing company", companyName,
                "Service provider", companyName
        );

        Map<String, Object> vendor = mutableMap(packetData.get("vendor"));
        vendor.put("name", companyName);
        vendor.put("initials", stringValue(profile.get("brandInitials")));
        vendor.put("logoUrl", stringValue(profile.get("logoUrl")));
        vendor.put("brandColor", stringValue(profile.get("brandColor")));
        vendor.put("office", stringValue(profile.get("serviceArea")));
        vendor.put("directLine", stringValue(profile.get("directLine")));
        vendor.put("dispatch", stringValue(profile.get("dispatchEmail")));
        vendor.put("certification", stringValue(profile.get("certification")));
        vendor.put("technician", technicianLabel);
        vendor.put("afterHours", stringValue(profile.get("afterHoursPhone")));
        vendor.put("reviewPrompt", stringValue(profile.get("dispatchEmail")));
        vendor.put("preparedBy", preparedBy);
        vendor.put("previewBlurb", "Saved company profile applied: customer sees the vendor name, service area, phone, dispatch email, and credential in the report.");
        vendor.put("brandingApplied", true);

        packetData.put("branding", "applied");
        packetData.put("vendor", vendor);

        Map<String, Object> packetHeader = mutableMap(packetData.get("packetHeader"));
        if (!packetHeader.isEmpty()) {
            packetHeader.put(
                    "archiveNote",
                    "Customer receives the branded service report link/PDF. Full image archive and raw technician detail stay retained in the company record."
            );
            packetData.put("packetHeader", packetHeader);
        }

        replaceRows(packetData, "serviceRecordRows", rowReplacements);
        replaceRows(packetData, "closeoutRows", rowReplacements);
        payload.put("packetData", packetData);
    }

    private void applyFreeReportPolicy(Map<String, Object> payload) {
        payload.remove("companyProfile");

        Map<String, Object> packetData = mutableMap(payload.get("packetData"));

        if (packetData.isEmpty()) {
            return;
        }

        Map<String, Object> vendor = mutableMap(packetData.get("vendor"));
        vendor.put("name", "Service report");
        vendor.put("initials", "SR");
        vendor.put("logoUrl", "");
        vendor.put("brandColor", DEFAULT_BRAND_COLOR);
        vendor.put("office", "");
        vendor.put("directLine", "");
        vendor.put("dispatch", "");
        vendor.put("certification", "");
        vendor.put("technician", "Technician / crew");
        vendor.put("afterHours", "");
        vendor.put("reviewPrompt", "");
        vendor.put("preparedBy", "Technician / crew");
        vendor.put("previewBlurb", "Free test reports are unbranded. Company reports add vendor logo, contact details, clean PDF, and history.");
        vendor.put("brandingApplied", false);
        packetData.put("branding", "neutral");
        packetData.put("vendor", vendor);

        Map<String, Object> packetHeader = mutableMap(packetData.get("packetHeader"));
        if (!packetHeader.isEmpty()) {
            packetHeader.put(
                    "archiveNote",
                    "Free test report link/PDF. Company reports add vendor branding, live links, and account history."
            );
            packetData.put("packetHeader", packetHeader);
        }

        replaceRows(packetData, "serviceRecordRows", Map.of(
                "Technician", "Technician / crew",
                "Credential", "Service record",
                "Prepared by technician", "Technician / crew",
                "Technician credential", "Service record",
                "Servicing company", "Service provider",
                "Service provider", "Service provider"
        ));
        replaceRows(packetData, "closeoutRows", Map.of(
                "Dispatch", "Reply to service provider",
                "After-hours", "Contact service provider",
                "Follow-up contact", "Reply to service provider"
        ));
        payload.put("packetData", packetData);
    }

    private Map<String, Object> reportResponse(Axis1ReportRecord record, boolean includePayload) {
        return reportResponse(record, includePayload, false);
    }

    private Map<String, Object> reportResponse(
            Axis1ReportRecord record,
            boolean includePayload,
            boolean ownerPreview
    ) {
        Map<String, Object> response = new LinkedHashMap<>();
        Map<String, Object> payload = fromJson(record.getPayloadJson());
        response.put("id", record.getId().toString());
        response.put("publicId", record.getPublicId());
        response.put("href", "/p/server?reportId=" + record.getPublicId());
        response.put("toolHref", "/axis-1/tool?step=outputs&account=" + record.getProductPlan() + "&loadReport=" + record.getPublicId());
        response.put("productPlan", record.getProductPlan());
        response.put("title", record.getTitle());
        response.put("customerName", record.getCustomerName());
        response.put("siteName", record.getSiteName());
        response.put("serviceDate", record.getServiceDate());
        response.put("nextServiceDate", record.getNextServiceDate());
        response.put("expiresAt", record.getExpiresAt() == null ? null : record.getExpiresAt().toString());
        response.put("createdAt", record.getCreatedAt().toString());
        response.put("updatedAt", record.getUpdatedAt().toString());
        response.put("assetStorage", assetStorageMetadata(payload));
        response.put("pdfExport", pdfExportService.capability(record.getProductPlan(), payload));
        response.put("retention", retentionResponse(record));
        response.put("hasOpenItems", hasOpenItems(payload));
        response.put("historyStatus", historyStatusResponse(record, payload));
        response.put("customerAction", customerActionSummary(payload));
        response.put("engagement", engagementResponse(record));
        response.put("viewer", Map.of("ownerPreview", ownerPreview));

        if (includePayload) {
            response.put("payload", payload);
        }

        return response;
    }

    private static void recordPublicView(Axis1ReportRecord record) {
        Instant now = Instant.now();

        if (record.getFirstViewedAt() == null) {
            record.setFirstViewedAt(now);
        }

        record.setLastViewedAt(now);
        record.setPublicViewCount(record.getPublicViewCount() + 1);
    }

    private static Map<String, Object> engagementResponse(Axis1ReportRecord record) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("publicViewCount", record.getPublicViewCount());
        response.put("firstViewedAt", instantString(record.getFirstViewedAt()));
        response.put("lastViewedAt", instantString(record.getLastViewedAt()));
        response.put("pdfSaveClickCount", record.getPdfSaveClickCount());
        response.put("lastPdfSaveClickedAt", instantString(record.getLastPdfSaveClickedAt()));
        response.put("customerConfirmedAt", instantString(record.getCustomerConfirmedAt()));
        response.put("customerConfirmedBy", record.getCustomerConfirmedBy() == null ? "" : record.getCustomerConfirmedBy());
        response.put("customerConfirmed", record.getCustomerConfirmedAt() != null);
        return response;
    }

    private static String instantString(Instant value) {
        return value == null ? "" : value.toString();
    }

    private boolean isOwnerRequest(Axis1ReportRecord record, Authentication authentication) {
        String ownerEmail = record.getAccountEmail();

        if (ownerEmail == null || ownerEmail.isBlank()) {
            return false;
        }

        return authenticatedEmail(authentication)
                .map(email -> ownerEmail.equalsIgnoreCase(email))
                .orElse(false);
    }

    private Map<String, Object> entitlementResponse(Axis1AccountEntitlement entitlement) {
        return Map.of(
                "authenticated", entitlement.authenticated(),
                "companyAccess", entitlement.companyAccess(),
                "billingProvider", entitlement.billingProvider(),
                "billingStatus", entitlement.billingStatus(),
                "accessSource", entitlement.accessSource(),
                "enabledFeatures", entitlement.enabledFeatures()
        );
    }

    private Map<String, Object> companyAccessRequiredResponse(Axis1AccountEntitlement entitlement) {
        return Map.of(
                "companyAccessRequired", true,
                "billingProvider", entitlement.billingProvider(),
                "billingStatus", entitlement.billingStatus(),
                "message", "Company branding, report history, and builder reload require an active company subscription."
        );
    }

    private Map<String, Object> expiredReportResponse(Axis1ReportRecord record) {
        return Map.of(
                "publicId", record.getPublicId(),
                "expired", true,
                "productPlan", record.getProductPlan(),
                "expiresAt", record.getExpiresAt() == null ? "" : record.getExpiresAt().toString(),
                "message", "Free builder links last 7 days. Create a fresh report or use the company version for live links."
        );
    }

    private Map<String, Object> retentionResponse(Axis1ReportRecord record) {
        return Map.of(
                "expiresAt", record.getExpiresAt() == null ? "" : record.getExpiresAt().toString(),
                "status", isExpired(record) ? "expired" : "active",
                "policy", "free".equals(record.getProductPlan()) ? "free_7_day_link" : "company_retained_link"
        );
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> assetStorageMetadata(Map<String, Object> payload) {
        Object metadata = payload.get("_assetStorage");

        if (metadata instanceof Map<?, ?> map) {
            return (Map<String, Object>) map;
        }

        return Map.of(
                 "driver", "inline-db-placeholder",
                 "mode", "database_payload",
                 "externalObjectStorageReady", false,
                 "target", "external_object_storage",
                 "inlinePhotoCount", 0
         );
    }

    private String createPublicId() {
        String publicId;

        do {
            publicId = UUID.randomUUID().toString().replace("-", "").substring(0, 18);
        } while (reportRecords.existsByPublicId(publicId));

        return publicId;
    }

    private String toJson(Map<String, Object> payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException exception) {
            throw new IllegalArgumentException("Report payload could not be serialized", exception);
        }
    }

    private Map<String, Object> fromJson(String payloadJson) {
        try {
            return objectMapper.readValue(payloadJson, JSON_MAP);
        } catch (JsonProcessingException exception) {
            return Map.of();
        }
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> objectMap(Object value) {
        return value instanceof Map<?, ?> map ? (Map<String, Object>) map : Map.of();
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> mutableMap(Object value) {
        if (value instanceof Map<?, ?> map) {
            return new LinkedHashMap<>((Map<String, Object>) map);
        }

        return new LinkedHashMap<>();
    }

    private static void replaceRows(
            Map<String, Object> packetData,
            String key,
            Map<String, String> replacements
    ) {
        Object rowsValue = packetData.get(key);

        if (!(rowsValue instanceof List<?> rows)) {
            return;
        }

        List<Object> nextRows = new ArrayList<>();

        for (Object item : rows) {
            if (item instanceof List<?> row && row.size() >= 2) {
                String label = stringValue(row.get(0));
                String replacement = replacements.get(label);

                if (replacement != null) {
                    List<Object> nextRow = new ArrayList<>(row);
                    nextRow.set(1, replacement);
                    nextRows.add(nextRow);
                    continue;
                }
            }

            nextRows.add(item);
        }

        packetData.put(key, nextRows);
    }

    private static String stringValue(Object value) {
        return value instanceof String stringValue ? stringValue.trim() : "";
    }

    private static boolean hasOpenItems(Map<String, Object> payload) {
        Map<String, Object> values = objectMap(payload.get("values"));

        return isAccessException(values);
    }

    private static boolean hasListValue(Object value) {
        return value instanceof List<?> list && !list.isEmpty();
    }

    private static Map<String, Object> historyStatusResponse(Axis1ReportRecord record, Map<String, Object> payload) {
        Map<String, Object> values = objectMap(payload.get("values"));
        String scenario = stringValue(values.get("scenario"));
        String followUpMode = stringValue(values.get("followUpMode"));
        String action = firstNonBlank(
                stringValue(values.get("customerActionOverride")),
                stringValue(values.get("followUpOverride")),
                stringValue(values.get("followUpNote"))
        ).toLowerCase(Locale.ROOT);
        int photoCount = inlinePhotoCount(payload);

        if (isAccessException(values)) {
            return historyStatus("open_access", "Open access item", "action");
        }

        if ("exception".equals(scenario)) {
            if ("quote".equals(followUpMode)) {
                return historyStatus("quote_review", "Quote review", "review");
            }

            return historyStatus("monitor_condition", "Monitor / review", "review");
        }

        if (photoCount <= 0) {
            return historyStatus("written_record", "Written record", "record");
        }

        if (isNextServiceAction(action, record.getNextServiceDate())) {
            return historyStatus("next_service", "Next service", "scheduled");
        }

        return historyStatus("record_only", "Record only", "record");
    }

    private static Map<String, Object> historyStatus(String code, String label, String tone) {
        return Map.of(
                "code", code,
                "label", label,
                "tone", tone
        );
    }

    private static boolean isAccessException(Map<String, Object> values) {
        if (!"exception".equals(stringValue(values.get("scenario")))) {
            return false;
        }

        Object exceptionKinds = values.get("exceptionKinds");

        if (!(exceptionKinds instanceof List<?> kinds)) {
            return false;
        }

        return kinds.stream()
                .map(Axis1AccountStorageApiController::stringValue)
                .anyMatch(ACCESS_EXCEPTION_KINDS::contains);
    }

    private static boolean isNextServiceAction(String action, String nextServiceDate) {
        if (nextServiceDate == null && action.isBlank()) {
            return false;
        }

        return action.contains("next")
                || action.contains("service window")
                || action.contains("schedule")
                || action.contains("rebook")
                || action.contains("confirm");
    }

    private static int inlinePhotoCount(Map<String, Object> payload) {
        Map<String, Object> metadata = assetStorageMetadataStatic(payload);
        Object value = metadata.get("inlinePhotoCount");

        if (value instanceof Number number) {
            return number.intValue();
        }

        return countUploadedPhotos(objectMap(payload.get("uploadedFieldPhotos")));
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> assetStorageMetadataStatic(Map<String, Object> payload) {
        Object metadata = payload.get("_assetStorage");

        if (metadata instanceof Map<?, ?> map) {
            return (Map<String, Object>) map;
        }

        return Map.of();
    }

    private static int countUploadedPhotos(Map<String, Object> uploadedFieldPhotos) {
        int count = 0;

        for (Object value : uploadedFieldPhotos.values()) {
            if (value instanceof Map<?, ?>) {
                count += 1;
            }
        }

        return count;
    }

    private static String customerActionSummary(Map<String, Object> payload) {
        Map<String, Object> values = objectMap(payload.get("values"));
        String override = firstNonBlank(
                stringValue(values.get("customerActionOverride")),
                stringValue(values.get("followUpOverride")),
                stringValue(values.get("followUpNote"))
        );

        if (!override.isBlank()) {
            return override;
        }

        Map<String, Object> packetData = objectMap(payload.get("packetData"));
        Map<String, Object> customerClose = objectMap(packetData.get("customerClose"));

        return firstNonBlank(
                rowValue(customerClose.get("actionItems"), "Customer action"),
                stringValue(customerClose.get("title"))
        );
    }

    private static String rowValue(Object rowsValue, String wantedLabel) {
        if (!(rowsValue instanceof List<?> rows)) {
            return "";
        }

        for (Object item : rows) {
            if (item instanceof Map<?, ?> map) {
                String label = stringValue(map.get("label"));

                if (wantedLabel.equalsIgnoreCase(label)) {
                    return stringValue(map.get("value"));
                }
            }

            if (item instanceof List<?> row && row.size() >= 2) {
                String label = stringValue(row.get(0));

                if (wantedLabel.equalsIgnoreCase(label)) {
                    return stringValue(row.get(1));
                }
            }
        }

        return "";
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }

        return "";
    }

    private static boolean isExpired(Axis1ReportRecord record) {
        return record.getExpiresAt() != null && record.getExpiresAt().isBefore(Instant.now());
    }

    private static LocalDate historySortDate(Axis1ReportRecord record) {
        if (record.getNextServiceDate() != null) {
            try {
                return LocalDate.parse(record.getNextServiceDate());
            } catch (DateTimeParseException ignored) {
                // Fall through to the created-at date.
            }
        }

        return LocalDate.ofInstant(record.getCreatedAt(), java.time.ZoneOffset.UTC);
    }

    private static String nextServiceDate(String serviceDate, String cadence) {
        if (serviceDate == null || cadence == null) {
            return null;
        }

        try {
            return LocalDate.parse(serviceDate).plusDays(Integer.parseInt(cadence)).toString();
        } catch (DateTimeParseException | NumberFormatException ignored) {
            return null;
        }
    }

    private static String clean(Object value, String fallback, int maxLength) {
        if (!(value instanceof String stringValue)) {
            return fallback;
        }

        String cleaned = stringValue.trim().replaceAll("\\s+", " ");
        return cleaned.isBlank() ? fallback : cleaned.substring(0, Math.min(cleaned.length(), maxLength));
    }

    private static String optionalClean(Object value, int maxLength) {
        if (!(value instanceof String stringValue)) {
            return null;
        }

        String cleaned = stringValue.trim().replaceAll("\\s+", " ");
        return cleaned.isBlank() ? null : cleaned.substring(0, Math.min(cleaned.length(), maxLength));
    }

    private static String cleanBrandColor(Object value) {
        if (!(value instanceof String stringValue)) {
            return DEFAULT_BRAND_COLOR;
        }

        String cleaned = stringValue.trim();
        if (!cleaned.matches("#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?")) {
            return DEFAULT_BRAND_COLOR;
        }

        if (cleaned.length() == 4) {
            return ("#" + cleaned.charAt(1) + cleaned.charAt(1)
                    + cleaned.charAt(2) + cleaned.charAt(2)
                    + cleaned.charAt(3) + cleaned.charAt(3))
                    .toUpperCase(Locale.ROOT);
        }

        return cleaned.toUpperCase(Locale.ROOT);
    }

    private static String cleanLogoUrl(Object value) {
        if (!(value instanceof String stringValue)) {
            return "";
        }

        String cleaned = stringValue.trim();
        if (cleaned.isBlank()) {
            return "";
        }

        if (cleaned.length() > MAX_LOGO_DATA_URL_LENGTH) {
            return "";
        }

        if (!cleaned.matches("^data:image/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=\\r\\n]+$")) {
            return "";
        }

        return cleaned.replaceAll("[\\r\\n]", "");
    }

    private static String cleanBrandInitials(Object value, String companyName) {
        String initials = value instanceof String stringValue ? stringValue : "";
        initials = initials.replaceAll("[^A-Za-z0-9]", "").toUpperCase(Locale.ROOT);

        if (!initials.isBlank()) {
            return initials.substring(0, Math.min(initials.length(), 4));
        }

        return titleCase(companyName)
                .chars()
                .filter(Character::isUpperCase)
                .limit(3)
                .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
                .toString();
    }

    private static String cleanTitle(String customerName, String siteName) {
        return clean(customerName + " / " + siteName, "Kitchen exhaust service report", 180);
    }

    private static String titleCase(String value) {
        StringBuilder builder = new StringBuilder();

        for (String part : value.trim().split("\\s+")) {
            if (part.isBlank()) {
                continue;
            }

            if (!builder.isEmpty()) {
                builder.append(' ');
            }

            builder.append(part.substring(0, 1).toUpperCase(Locale.ROOT));

            if (part.length() > 1) {
                builder.append(part.substring(1).toLowerCase(Locale.ROOT));
            }
        }

        return builder.isEmpty() ? "Company" : builder.toString();
    }
}
