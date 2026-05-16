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
    void seoResourcePagesServeExportedFrontendAndSitemap() throws Exception {
        expectFrontendPage("/resources");
        expectFrontendPage("/hood-cleaning-service-report-template");
        expectFrontendPage("/kitchen-exhaust-cleaning-report-sample");
        expectFrontendPage("/nfpa-96-hood-cleaning-photo-checklist");
        expectFrontendPage("/blocked-access-service-report-template");
        expectFrontendPage("/hood-cleaning-customer-closeout-email-template");
        expectFrontendPage("/restaurant-hood-cleaning-report");
        expectFrontendPage("/commercial-kitchen-exhaust-cleaning-report");
        expectFrontendPage("/hood-cleaning-certificate-vs-service-report");
        expectFrontendPage("/hood-cleaning-before-after-photo-report");
        expectFrontendPage("/send-hood-cleaning-report-after-service");

        assertStaticResourceContains(
                "static/hood-cleaning-service-report-template.html",
                "Hood cleaning service report template",
                "Minimum fields",
                "Build a free report",
                "FAQPage",
                "HowTo",
                "Cold-email bridge",
                "og:image"
        );
        assertStaticResourceContains(
                "static/restaurant-hood-cleaning-report.html",
                "Restaurant hood cleaning report",
                "restaurant hood cleaning report",
                "Questions this page should answer before the vendor clicks."
        );
        assertStaticResourceContains(
                "static/send-hood-cleaning-report-after-service.html",
                "Send a hood cleaning report after service",
                "Use this page in cold email",
                "utm_source=cold_email"
        );
        assertStaticResourceContains(
                "static/sitemap.xml",
                "https://kitchenpermit.com/hood-cleaning-service-report-template",
                "https://kitchenpermit.com/restaurant-hood-cleaning-report",
                "https://kitchenpermit.com/send-hood-cleaning-report-after-service",
                "https://kitchenpermit.com/resources"
        );
        assertStaticResourceDoesNotContain("static/sitemap.xml", "/axis-2");
        assertStaticResourceContains(
                "static/robots.txt",
                "Sitemap: https://kitchenpermit.com/sitemap.xml",
                "Disallow: /p/"
        );
    }

    @Test
    void manifestServesWithWebManifestContentType() throws Exception {
        mockMvc.perform(get("/manifest.webmanifest"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.parseMediaType("application/manifest+json")));

        assertStaticResourceContains(
                "static/manifest.webmanifest",
                "KitchenPermit service report builder",
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
                "The list is the hook. The packet sharpens the motion.",
                "noindex, nofollow"
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

    private void assertStaticResourceDoesNotContain(String resourcePath, String fragment) throws IOException {
        ClassPathResource resource = new ClassPathResource(resourcePath);
        assertThat(resource.exists()).isTrue();

        String body = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
        assertThat(body).doesNotContain(fragment);
    }
}
