package owner.hood.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.util.StreamUtils;
import org.springframework.test.web.servlet.MockMvc;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PublicSiteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void homePageServesExportedFrontend() throws Exception {
        expectFrontendPage("/");

        assertStaticResourceContains(
                "static/index.html",
                "Send a restaurant-ready service report after every hood cleaning job.",
                "Turn job photos, blocked access notes, and next actions into one",
                "A report they can save, not another login."
        );
    }

    @Test
    void pricingPageServesExportedFrontend() throws Exception {
        expectFrontendPage("/pricing");

        assertStaticResourceContains(
                "static/pricing.html",
                "Free builder. $79/mo company version.",
                "Company version",
                "Free builder: no login, no company logo/contact, 7-day link, watermarked PDF."
        );
    }

    @Test
    void companyVersionPageServesExportedFrontend() throws Exception {
        expectFrontendPage("/company-version");

        assertStaticResourceContains(
                "static/company-version.html",
                "Save your company info once. Send every report under your name.",
                "Start $79 checkout"
        );
    }

    @Test
    void axis1NestedLaunchPagesServeExportedFrontend() throws Exception {
        expectFrontendPage("/samples/axis-1");
        expectFrontendPage("/samples/axis-1.html");
        expectFrontendPage("/axis-1/tool");
        expectFrontendPage("/axis-1/tool.html");
        expectFrontendPage("/p/sample-blocked-access");
        expectFrontendPage("/p/sample-blocked-access.html");
        expectFrontendPage("/p/server");

        assertStaticResourceContains(
                "static/samples/axis-1.html",
                "See the branded service report a restaurant receives.",
                "Below is the sample report a restaurant would receive"
        );
        assertStaticResourceContains(
                "static/axis-1/tool.html",
                "Add photos and notes",
                "Free builder: no login, no company logo/contact, 7-day test link"
        );
    }

    @Test
    void legalPagesServeExportedFrontend() throws Exception {
        expectFrontendPage("/terms");
        expectFrontendPage("/privacy");
        expectFrontendPage("/refund-policy");
    }

    @Test
    void manifestServesWithWebManifestContentType() throws Exception {
        mockMvc.perform(get("/manifest.webmanifest"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.parseMediaType("application/manifest+json")));

        assertStaticResourceContains(
                "static/manifest.webmanifest",
                "hood service report builder",
                "Create service report"
        );
    }

    @Test
    void axis2SampleServesExportedFrontend() throws Exception {
        expectFrontendPage("/samples/axis-2");

        assertStaticResourceContains(
                "static/samples/axis-2.html",
                "3 masked rows from a 10-opportunity batch",
                "Protected fields in the paid version include direct contact paths",
                "The list is the hook. The packet sharpens the motion."
        );
    }

    private void expectFrontendPage(String path) throws Exception {
        mockMvc.perform(get(path))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML));
    }

    private void assertStaticResourceContains(String resourcePath, String... fragments) throws IOException {
        ClassPathResource resource = new ClassPathResource(resourcePath);
        assertThat(resource.exists()).isTrue();

        String body = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
        for (String fragment : List.of(fragments)) {
            assertThat(body).contains(fragment);
        }
    }
}
