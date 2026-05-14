package owner.hood.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import owner.hood.application.axis1.Axis1ReportAssetStorage;
import owner.hood.application.axis1.R2Axis1ReportAssetStorage;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@EnabledIfEnvironmentVariable(named = "HOOD_AXIS1_ASSET_STORAGE_DRIVER", matches = "r2")
class Axis1R2StorageIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private Axis1ReportAssetStorage assetStorage;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void reportPhotosUploadToR2ServeThroughApiAndDeleteFromR2() throws Exception {
        assertThat(assetStorage).isInstanceOf(R2Axis1ReportAssetStorage.class);

        MockHttpSession session = signupSession();
        MvcResult result = mockMvc.perform(post("/api/axis1/reports")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reportPayloadWithPhoto()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.assetStorage.driver").value("r2"))
                .andExpect(jsonPath("$.assetStorage.externalObjectStorageReady").value(true))
                .andExpect(jsonPath("$.assetStorage.databaseInlinePhotos").value(false))
                .andExpect(jsonPath("$.payload.uploadedFieldPhotos['hood-before'].src", startsWith("/api/axis1/assets/")))
                .andExpect(jsonPath("$.pdfExport.serverDownloadReady").value(true))
                .andExpect(jsonPath("$.pdfExport.downloadHref", startsWith("/api/axis1/assets/")))
                .andReturn();

        JsonNode saved = objectMapper.readTree(result.getResponse().getContentAsString());
        String publicId = saved.get("publicId").asText();
        String assetHref = saved.at("/payload/uploadedFieldPhotos/hood-before/src").asText();
        String fileName = assetHref.substring(assetHref.lastIndexOf('/') + 1);
        String pdfHref = saved.at("/pdfExport/downloadHref").asText();

        mockMvc.perform(get(assetHref))
                .andExpect(status().isOk())
                .andExpect(resultMatcher -> assertThat(resultMatcher.getResponse().getContentType()).isEqualTo(MediaType.IMAGE_PNG_VALUE));

        mockMvc.perform(get(pdfHref))
                .andExpect(status().isOk())
                .andExpect(resultMatcher -> assertThat(resultMatcher.getResponse().getContentType()).isEqualTo(MediaType.APPLICATION_PDF_VALUE));

        assertThat(assetStorage.loadAsset(publicId, fileName)).isPresent();
        assertThat(assetStorage.loadAsset(publicId, "service-report.pdf")).isPresent();

        mockMvc.perform(delete("/api/axis1/reports/{publicId}", publicId).session(session))
                .andExpect(status().isNoContent());

        assertThat(assetStorage.loadAsset(publicId, fileName)).isEmpty();
        assertThat(assetStorage.loadAsset(publicId, "service-report.pdf")).isEmpty();
    }

    private MockHttpSession signupSession() throws Exception {
        String email = "r2-owner-" + UUID.randomUUID() + "@example.com";

        MvcResult signup = mockMvc.perform(post("/auth/signup")
                        .param("email", email)
                        .param("password", "correct-horse-1")
                        .param("confirmPassword", "correct-horse-1")
                        .param("next", "/dashboard"))
                .andExpect(status().is3xxRedirection())
                .andReturn();

        return (MockHttpSession) signup.getRequest().getSession(false);
    }

    private String reportPayloadWithPhoto() throws Exception {
        String onePixelPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lz8p4wAAAABJRU5ErkJggg==";

        return objectMapper.writeValueAsString(Map.of(
                "productPlan", "company",
                "values", Map.of(
                        "propertyName", "R2 Test Diner",
                        "systemName", "Main cookline hood",
                        "siteCity", "Austin, TX",
                        "serviceDate", "2026-05-13",
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
                )
        ));
    }
}
