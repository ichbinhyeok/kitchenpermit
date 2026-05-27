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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
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
                "Send hood cleaning reports your customers can actually save.",
                "customer-ready service records with service date",
                "View quick sample"
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
                "Send branded service records under your company name.",
                "Request 30-day pilot"
        );
    }

    @Test
    void axis1NestedLaunchPagesServeExportedFrontend() throws Exception {
        expectFrontendPage("/samples/axis-1");
        expectFrontendPage("/samples/axis-1.html");
        expectFrontendPage("/samples/quick-closeout");
        expectFrontendPage("/samples/quick-closeout.html");
        expectFrontendPage("/axis-1/tool");
        expectFrontendPage("/axis-1/tool.html");
        expectFrontendPage("/p/sample-blocked-access");
        expectFrontendPage("/p/sample-blocked-access.html");
        expectFrontendPage("/p/server");
        mockMvc.perform(get("/p/server"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Robots-Tag", "noindex, nofollow, noarchive"));
        mockMvc.perform(get("/reports/free-axis-1"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Robots-Tag", "noindex, nofollow, noarchive"));

        assertStaticResourceContains(
                "static/samples/axis-1.html",
                "See the report your customer opens.",
                "A quick preview before opening the full sample."
        );
        assertStaticResourceContains(
                "static/samples/quick-closeout.html",
                "Hood closeout record. Link + PDF.",
                "Service date",
                "Hood interior before service",
                "Hood interior after service",
                "The link is for review. The PDF is for customer files."
        );
        assertStaticResourceContains(
                "static/axis-1/tool.html",
                "What happened on this hood cleaning job?",
                "Free builder: no login required, creates a 7-day test link, watermarked PDF, and no saved report history."
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
                "Build a free test report",
                "FAQPage",
                "HowTo",
                "og:image"
        );
        assertStaticResourceDoesNotContain("static/hood-cleaning-service-report-template.html", "Cold-email bridge");
        assertStaticResourceContains(
                "static/restaurant-hood-cleaning-report.html",
                "Restaurant hood cleaning report",
                "Make the result visible first",
                "Keep service records easy to save"
        );
        assertStaticResourceDoesNotContain(
                "static/restaurant-hood-cleaning-report.html",
                "Questions this page should answer before the vendor clicks."
        );
        assertStaticResourceContains(
                "static/send-hood-cleaning-report-after-service.html",
                "Send a hood cleaning report after service",
                "After the job, send one report the restaurant can save",
                "Build a free after-service report"
        );
        assertStaticResourceDoesNotContain("static/send-hood-cleaning-report-after-service.html", "Use this page in cold email");
        assertStaticResourceDoesNotContain("static/send-hood-cleaning-report-after-service.html", "utm_source=cold_email");
        assertStaticResourceContains(
                "static/sitemap.xml",
                "https://kitchenpermit.com/samples/quick-closeout",
                "https://kitchenpermit.com/hood-cleaning-service-report-template",
                "https://kitchenpermit.com/restaurant-hood-cleaning-report",
                "https://kitchenpermit.com/send-hood-cleaning-report-after-service",
                "https://kitchenpermit.com/resources"
        );
        assertStaticResourceDoesNotContain("static/sitemap.xml", "/axis-2");
        assertStaticResourceContains(
                "static/robots.txt",
                "Sitemap: https://kitchenpermit.com/sitemap.xml",
                "Allow: /api/axis1/assets/",
                "Allow: /api/axis1/reports/public/",
                "Disallow: /api/"
        );
        assertStaticResourceDoesNotContain("static/robots.txt", "Disallow: /p/");
        assertStaticResourceDoesNotContain("static/robots.txt", "Disallow: /reports/");
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
                "Sample Service Report",
                "KitchenPermit sample service report for hood cleaning companies.",
                "NEXT_REDIRECT;replace;/samples/axis-1;307;",
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
