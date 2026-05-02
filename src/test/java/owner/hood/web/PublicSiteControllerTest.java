package owner.hood.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.core.io.ClassPathResource;
import org.springframework.util.StreamUtils;
import org.springframework.test.web.servlet.MockMvc;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PublicSiteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void homePageServesExportedFrontend() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/index.html"));

        assertStaticResourceContains(
                "static/index.html",
                "Proof after service. Leads before sales.",
                "A customer-ready proof link replaces the explanation call.",
                "The product earns money where vendors lose time."
        );
    }

    @Test
    void pricingPageServesExportedFrontend() throws Exception {
        mockMvc.perform(get("/pricing"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/pricing.html"));

        assertStaticResourceContains(
                "static/pricing.html",
                "Pricing for proof links and sales lists.",
                "Most efficient paid setup for a two-motion operator",
                "Repeat usage comes before any recurring quote."
        );
    }

    @Test
    void axis2SampleServesExportedFrontend() throws Exception {
        mockMvc.perform(get("/samples/axis-2"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/samples/axis-2.html"));

        assertStaticResourceContains(
                "static/samples/axis-2.html",
                "3 masked rows from a 10-opportunity batch",
                "Protected fields in the paid version include direct contact paths",
                "The list is the hook. The packet sharpens the motion."
        );
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
