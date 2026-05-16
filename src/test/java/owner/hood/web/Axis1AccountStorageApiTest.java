package owner.hood.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class Axis1AccountStorageApiTest {

    private static final String SAFE_LOGO_DATA_URL =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lz8p4wAAAABJRU5ErkJggg==";

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void companyProfilePersistsThroughAccountSession() throws Exception {
        MockHttpSession session = signupSession();
        String profileJson = objectMapper.writeValueAsString(Map.of(
                "companyName", "Metro Hood Pros",
                "serviceArea", "Austin and Round Rock",
                "directLine", "(512) 555-0199",
                "dispatchEmail", "dispatch@metrohood.example",
                "afterHoursPhone", "(512) 555-0111",
                "certification", "NFPA 96 service record",
                "technicianLabel", "Night crew",
                "brandInitials", "MH",
                "logoUrl", SAFE_LOGO_DATA_URL,
                "brandColor", "#16a34a"
        ));

        mockMvc.perform(put("/api/account/company-profile")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(profileJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName").value("Metro Hood Pros"))
                .andExpect(jsonPath("$.dispatchEmail").value("dispatch@metrohood.example"))
                .andExpect(jsonPath("$.logoUrl").value(SAFE_LOGO_DATA_URL))
                .andExpect(jsonPath("$.brandColor").value("#16A34A"));

        mockMvc.perform(get("/api/account/company-profile").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName").value("Metro Hood Pros"))
                .andExpect(jsonPath("$.brandInitials").value("MH"))
                .andExpect(jsonPath("$.logoUrl").value(SAFE_LOGO_DATA_URL))
                .andExpect(jsonPath("$.brandColor").value("#16A34A"));
    }

    @Test
    void companyProfileRejectsUnsafeBrandingValues() throws Exception {
        MockHttpSession session = signupSession();
        String profileJson = objectMapper.writeValueAsString(Map.of(
                "companyName", "Metro Hood Pros",
                "serviceArea", "Austin and Round Rock",
                "directLine", "(512) 555-0199",
                "dispatchEmail", "dispatch@metrohood.example",
                "afterHoursPhone", "(512) 555-0111",
                "certification", "NFPA 96 service record",
                "technicianLabel", "Night crew",
                "brandInitials", "MH",
                "logoUrl", "data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+PC9zdmc+",
                "brandColor", "url(javascript:alert(1))"
        ));

        mockMvc.perform(put("/api/account/company-profile")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(profileJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.logoUrl").value(""))
                .andExpect(jsonPath("$.brandColor").value("#0F172A"));
    }

    @Test
    void companyReportUsesSavedAccountBrandingEvenIfClientPayloadIsGeneric() throws Exception {
        MockHttpSession session = signupSession();
        String profileJson = objectMapper.writeValueAsString(Map.of(
                "companyName", "Metro Hood Pros",
                "serviceArea", "Austin and Round Rock",
                "directLine", "(512) 555-0199",
                "dispatchEmail", "dispatch@metrohood.example",
                "afterHoursPhone", "(512) 555-0111",
                "certification", "NFPA 96 service record",
                "technicianLabel", "Night crew",
                "brandInitials", "MH",
                "logoUrl", SAFE_LOGO_DATA_URL,
                "brandColor", "#16a34a"
        ));

        mockMvc.perform(put("/api/account/company-profile")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(profileJson))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/axis1/reports")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reportPayloadWithGenericPacketData("company")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.productPlan").value("company"))
                .andExpect(jsonPath("$.payload.companyProfile.companyName").value("Metro Hood Pros"))
                .andExpect(jsonPath("$.payload.companyProfile.directLine").value("(512) 555-0199"))
                .andExpect(jsonPath("$.payload.companyProfile.logoUrl").value(SAFE_LOGO_DATA_URL))
                .andExpect(jsonPath("$.payload.companyProfile.brandColor").value("#16A34A"))
                .andExpect(jsonPath("$.payload.packetData.branding").value("applied"))
                .andExpect(jsonPath("$.payload.packetData.vendor.name").value("Metro Hood Pros"))
                .andExpect(jsonPath("$.payload.packetData.vendor.initials").value("MH"))
                .andExpect(jsonPath("$.payload.packetData.vendor.logoUrl").value(SAFE_LOGO_DATA_URL))
                .andExpect(jsonPath("$.payload.packetData.vendor.brandColor").value("#16A34A"))
                .andExpect(jsonPath("$.payload.packetData.vendor.directLine").value("(512) 555-0199"))
                .andExpect(jsonPath("$.payload.packetData.serviceRecordRows[0][1]").value("Metro Hood Pros"))
                .andExpect(jsonPath("$.payload.packetData.closeoutRows[0][1]").value("dispatch@metrohood.example"))
                .andExpect(jsonPath("$.pdfExport.serverDownloadReady").value(true));
    }

    @Test
    void anonymousReportIsSavedAsFreeSevenDayHostedLink() throws Exception {
        mockMvc.perform(post("/api/axis1/reports")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reportPayload("company")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.productPlan").value("free"))
                .andExpect(jsonPath("$.payload.productPlan").value("free"))
                .andExpect(jsonPath("$.href", startsWith("/p/server?reportId=")))
                .andExpect(jsonPath("$.toolHref", startsWith("/axis-1/tool?step=outputs")))
                .andExpect(jsonPath("$.assetStorage.driver").value("filesystem"))
                .andExpect(jsonPath("$.assetStorage.databaseInlinePhotos").value(false))
                .andExpect(jsonPath("$.pdfExport.driver").value("server-pdfbox"))
                .andExpect(jsonPath("$.pdfExport.serverDownloadReady").value(true))
                .andExpect(jsonPath("$.pdfExport.downloadHref", startsWith("/api/axis1/assets/")))
                .andExpect(jsonPath("$.payload.links.pdfHref", startsWith("/api/axis1/assets/")))
                .andExpect(jsonPath("$.retention.policy").value("free_7_day_link"))
                .andExpect(jsonPath("$.expiresAt", notNullValue()));
    }

    @Test
    void anonymousFreeReportCannotSpoofCompanyBranding() throws Exception {
        mockMvc.perform(post("/api/axis1/reports")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reportPayloadWithSpoofedBranding()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.productPlan").value("free"))
                .andExpect(jsonPath("$.payload.productPlan").value("free"))
                .andExpect(jsonPath("$.payload.companyProfile").doesNotExist())
                .andExpect(jsonPath("$.payload.packetData.branding").value("neutral"))
                .andExpect(jsonPath("$.payload.packetData.vendor.name").value("Service report"))
                .andExpect(jsonPath("$.payload.packetData.vendor.initials").value("SR"))
                .andExpect(jsonPath("$.payload.packetData.vendor.logoUrl").value(""))
                .andExpect(jsonPath("$.payload.packetData.vendor.brandColor").value("#0F172A"))
                .andExpect(jsonPath("$.payload.packetData.vendor.directLine").value(""))
                .andExpect(jsonPath("$.payload.packetData.vendor.dispatch").value(""))
                .andExpect(jsonPath("$.payload.packetData.vendor.brandingApplied").value(false))
                .andExpect(jsonPath("$.payload.packetData.serviceRecordRows[0][1]").value("Service provider"))
                .andExpect(jsonPath("$.payload.packetData.closeoutRows[0][1]").value("Reply to service provider"));
    }

    @Test
    void reportPhotosAreStoredAsAssetsInsteadOfInlinePayload() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/axis1/reports")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reportPayloadWithPhoto("free")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.assetStorage.driver").value("filesystem"))
                .andExpect(jsonPath("$.assetStorage.inlinePhotoCount").value(2))
                .andExpect(jsonPath("$.payload.uploadedFieldPhotos['hood-before'].src", startsWith("/api/axis1/assets/")))
                .andExpect(jsonPath("$.payload.packetData.proofPhotos[0].src", startsWith("/api/axis1/assets/")))
                .andReturn();

        JsonNode saved = objectMapper.readTree(result.getResponse().getContentAsString());
        String assetHref = saved.at("/payload/uploadedFieldPhotos/hood-before/src").asText();

        mockMvc.perform(get(assetHref))
                .andExpect(status().isOk())
                .andExpect(resultMatcher -> {
                    String contentType = resultMatcher.getResponse().getContentType();
                    if (!MediaType.IMAGE_PNG_VALUE.equals(contentType)) {
                        throw new AssertionError("Expected image/png asset response, got " + contentType);
                    }
                });
    }

    @Test
    void reportStatusSeparatesAccessItemsFromRoutineAndWrittenRecords() throws Exception {
        MockHttpSession session = signupSession();

        mockMvc.perform(post("/api/axis1/reports")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reportPayloadForStatus(
                                Map.of(
                                        "propertyName", "Routine Grill",
                                        "systemName", "Main hood",
                                        "siteCity", "Austin, TX",
                                        "serviceDate", "2026-05-01",
                                        "cadence", "90",
                                        "scenario", "clean",
                                        "followUpMode", "none",
                                        "customerActionOverride", "Reply to confirm the next 90-day service window."
                                ),
                                true
                        )))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.hasOpenItems").value(false))
                .andExpect(jsonPath("$.historyStatus.code").value("next_service"))
                .andExpect(jsonPath("$.historyStatus.label").value("Next service"));

        mockMvc.perform(post("/api/axis1/reports")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reportPayloadForStatus(
                                Map.of(
                                        "propertyName", "Written Cafe",
                                        "systemName", "Prep hood",
                                        "siteCity", "Austin, TX",
                                        "serviceDate", "2026-05-02",
                                        "cadence", "90",
                                        "scenario", "clean",
                                        "followUpMode", "none",
                                        "customerActionOverride", "Keep the PDF copy with the service record."
                                ),
                                false
                        )))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.hasOpenItems").value(false))
                .andExpect(jsonPath("$.historyStatus.code").value("written_record"))
                .andExpect(jsonPath("$.historyStatus.label").value("Written record"));

        mockMvc.perform(post("/api/axis1/reports")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reportPayloadForStatus(
                                Map.of(
                                        "propertyName", "Access Tacos",
                                        "systemName", "Tortilla line",
                                        "siteCity", "Austin, TX",
                                        "serviceDate", "2026-05-03",
                                        "cadence", "90",
                                        "scenario", "exception",
                                        "exceptionKinds", List.of("blocked-storage"),
                                        "exceptionNote", "Stored racks blocked the rear access panel.",
                                        "followUpMode", "monitor",
                                        "customerActionOverride", "Clear the access path and reply for the revisit."
                                ),
                                true
                        )))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.hasOpenItems").value(true))
                .andExpect(jsonPath("$.historyStatus.code").value("open_access"))
                .andExpect(jsonPath("$.historyStatus.label").value("Open access item"));
    }

    @Test
    void authenticatedCompanyReportAppearsInAccountHistoryAndPublicLink() throws Exception {
        MockHttpSession session = signupSession();

        MvcResult result = mockMvc.perform(post("/api/axis1/reports")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reportPayload("company")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.productPlan").value("company"))
                .andExpect(jsonPath("$.toolHref", startsWith("/axis-1/tool?step=outputs&account=company")))
                .andExpect(jsonPath("$.retention.policy").value("live_while_subscribed"))
                .andExpect(jsonPath("$.expiresAt").isEmpty())
                .andReturn();

        JsonNode saved = objectMapper.readTree(result.getResponse().getContentAsString());
        String publicId = saved.get("publicId").asText();

        mockMvc.perform(get("/api/axis1/reports/history").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].productPlan").value("company"))
                .andExpect(jsonPath("$[0].pdfExport.serverDownloadReady").value(true))
                .andExpect(jsonPath("$[0].title").value("Metro Diner / Main cookline hood"));

        mockMvc.perform(get("/api/axis1/reports/public/{publicId}", publicId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.payload.values.propertyName").value("Metro Diner"));

        mockMvc.perform(get("/api/axis1/reports/{publicId}/builder", publicId))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/axis1/reports/{publicId}/builder", publicId).session(signupSession()))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/axis1/reports/{publicId}/builder", publicId).session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access").value("owner_builder"))
                .andExpect(jsonPath("$.payload.values.propertyName").value("Metro Diner"));

        mockMvc.perform(get("/api/axis1/reports/public/{publicId}/pdf-manifest", publicId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pdfExport.serverDownloadReady").value(true))
                .andExpect(jsonPath("$.pdfExport.downloadHref", startsWith("/api/axis1/assets/")));

        String pdfHref = saved.at("/pdfExport/downloadHref").asText();

        mockMvc.perform(get(pdfHref))
                .andExpect(status().isOk())
                .andExpect(resultMatcher -> {
                    String contentType = resultMatcher.getResponse().getContentType();
                    if (!MediaType.APPLICATION_PDF_VALUE.equals(contentType)) {
                        throw new AssertionError("Expected application/pdf asset response, got " + contentType);
                    }

                    byte[] bytes = resultMatcher.getResponse().getContentAsByteArray();
                    String header = new String(bytes, 0, Math.min(bytes.length, 4));
                    if (!"%PDF".equals(header)) {
                        throw new AssertionError("Expected generated PDF bytes to start with %PDF");
                    }
                });
    }

    @Test
    void ownerCanDeleteReportAndPublicLinkStopsResolving() throws Exception {
        MockHttpSession session = signupSession();

        MvcResult result = mockMvc.perform(post("/api/axis1/reports")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reportPayload("company")))
                .andExpect(status().isCreated())
                .andReturn();

        String publicId = objectMapper.readTree(result.getResponse().getContentAsString())
                .get("publicId")
                .asText();

        mockMvc.perform(delete("/api/axis1/reports/{publicId}", publicId))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(delete("/api/axis1/reports/{publicId}", publicId).session(signupSession()))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/axis1/reports/{publicId}", publicId).session(session))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/axis1/reports/public/{publicId}", publicId))
                .andExpect(status().isNotFound());
    }

    @Test
    void entitlementsExposeBillingAbstractionWithoutExternalProvider() throws Exception {
        mockMvc.perform(get("/api/account/entitlements"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(false))
                .andExpect(jsonPath("$.companyAccess").value(false))
                .andExpect(jsonPath("$.billingProvider").value("abstract"));

        mockMvc.perform(get("/api/account/entitlements").session(signupSession()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true))
                .andExpect(jsonPath("$.companyAccess").value(true))
                .andExpect(jsonPath("$.billingStatus").value("launch_access"));
    }

    private MockHttpSession signupSession() throws Exception {
        String email = "owner-" + UUID.randomUUID() + "@example.com";

        MvcResult signup = mockMvc.perform(post("/auth/signup")
                        .param("email", email)
                        .param("password", "correct-horse-1")
                        .param("confirmPassword", "correct-horse-1")
                        .param("next", "/dashboard"))
                .andExpect(status().is3xxRedirection())
                .andReturn();

        return (MockHttpSession) signup.getRequest().getSession(false);
    }

    private String reportPayload(String productPlan) throws Exception {
        return objectMapper.writeValueAsString(Map.of(
                "productPlan", productPlan,
                "values", Map.of(
                        "propertyName", "Metro Diner",
                        "systemName", "Main cookline hood",
                        "siteCity", "Austin, TX",
                        "serviceDate", "2026-04-24",
                        "cadence", "90"
                ),
                "uploadedFieldPhotos", Map.of(),
                "photoSlotResolutions", Map.of(),
                "links", Map.of(),
                "presentationMode", "standard",
                "visibleSections", Map.of(
                        "photos", true,
                        "checklist", true,
                        "routeDetail", true,
                        "nextService", true
                )
        ));
    }

    private String reportPayloadWithPhoto(String productPlan) throws Exception {
        String onePixelPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lz8p4wAAAABJRU5ErkJggg==";

        return objectMapper.writeValueAsString(Map.of(
                "productPlan", productPlan,
                "values", Map.of(
                        "propertyName", "Metro Diner",
                        "systemName", "Main cookline hood",
                        "siteCity", "Austin, TX",
                        "serviceDate", "2026-04-24",
                        "cadence", "90"
                ),
                "uploadedFieldPhotos", Map.of(
                        "hood-before", Map.of(
                                "src", onePixelPng,
                                "name", "hood-before.png",
                                "source", "manual",
                                "confidence", "high",
                                "matchLabel", "Hood before"
                        )
                ),
                "photoSlotResolutions", Map.of(),
                "links", Map.of(),
                "presentationMode", "standard",
                "visibleSections", Map.of(
                        "photos", true,
                        "checklist", true,
                        "routeDetail", true,
                        "nextService", true
                ),
                "packetData", Map.of(
                        "proofPhotos", List.of(Map.of(
                                "src", onePixelPng,
                                "label", "Before",
                                "title", "Before photo"
                        ))
                )
        ));
    }

    private String reportPayloadForStatus(Map<String, Object> values, boolean includePhoto) throws Exception {
        String onePixelPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lz8p4wAAAABJRU5ErkJggg==";
        Map<String, Object> payload = new java.util.LinkedHashMap<>();
        payload.put("productPlan", "company");
        payload.put("values", values);
        payload.put(
                "uploadedFieldPhotos",
                includePhoto
                        ? Map.of(
                        "hood-after", Map.of(
                                "src", onePixelPng,
                                "name", "hood-after.png",
                                "source", "manual",
                                "confidence", "manual",
                                "matchLabel", "Hood after"
                        )
                )
                        : Map.of()
        );
        payload.put("photoSlotResolutions", Map.of());
        payload.put("links", Map.of());
        payload.put("presentationMode", "standard");
        payload.put("visibleSections", Map.of(
                "photos", true,
                "checklist", true,
                "routeDetail", true,
                "nextService", true
        ));

        return objectMapper.writeValueAsString(payload);
    }

    private String reportPayloadWithGenericPacketData(String productPlan) throws Exception {
        Map<String, Object> payload = new java.util.LinkedHashMap<>();
        payload.put("productPlan", productPlan);
        payload.put("values", Map.of(
                "propertyName", "Metro Diner",
                "systemName", "Main cookline hood",
                "siteCity", "Austin, TX",
                "serviceDate", "2026-04-24",
                "cadence", "90"
        ));
        payload.put("uploadedFieldPhotos", Map.of());
        payload.put("photoSlotResolutions", Map.of());
        payload.put("links", Map.of());
        payload.put("presentationMode", "standard");
        payload.put("visibleSections", Map.of(
                "photos", true,
                "checklist", true,
                "routeDetail", true,
                "nextService", true
        ));
        payload.put("packetData", Map.of(
                "branding", "neutral",
                "vendor", Map.of(
                        "name", "Service report",
                        "initials", "SR",
                        "directLine", "",
                        "dispatch", ""
                ),
                "packetHeader", Map.of(
                        "archiveNote", "Generic report copy"
                ),
                "serviceRecordRows", List.of(List.of("Service provider", "Service report")),
                "closeoutRows", List.of(List.of("Follow-up contact", "reply@example.com"))
        ));

        return objectMapper.writeValueAsString(payload);
    }

    private String reportPayloadWithSpoofedBranding() throws Exception {
        Map<String, Object> payload = new java.util.LinkedHashMap<>();
        payload.put("productPlan", "company");
        payload.put("companyProfile", Map.of(
                "companyName", "Spoofed Free Brand",
                "directLine", "(512) 555-0999",
                "dispatchEmail", "dispatch@spoofed.example",
                "logoUrl", SAFE_LOGO_DATA_URL,
                "brandColor", "#16a34a"
        ));
        payload.put("values", Map.of(
                "propertyName", "Metro Diner",
                "systemName", "Main cookline hood",
                "siteCity", "Austin, TX",
                "serviceDate", "2026-04-24",
                "cadence", "90"
        ));
        payload.put("uploadedFieldPhotos", Map.of());
        payload.put("photoSlotResolutions", Map.of());
        payload.put("links", Map.of());
        payload.put("presentationMode", "standard");
        payload.put("visibleSections", Map.of(
                "photos", true,
                "checklist", true,
                "routeDetail", true,
                "nextService", true
        ));
        payload.put("packetData", Map.of(
                "branding", "applied",
                "vendor", Map.of(
                        "name", "Spoofed Free Brand",
                        "initials", "SF",
                        "logoUrl", SAFE_LOGO_DATA_URL,
                        "brandColor", "#16a34a",
                        "directLine", "(512) 555-0999",
                        "dispatch", "dispatch@spoofed.example",
                        "brandingApplied", true
                ),
                "packetHeader", Map.of(
                        "archiveNote", "Spoofed brand archive note"
                ),
                "serviceRecordRows", List.of(List.of("Service provider", "Spoofed Free Brand")),
                "closeoutRows", List.of(List.of("Follow-up contact", "dispatch@spoofed.example"))
        ));

        return objectMapper.writeValueAsString(payload);
    }
}
