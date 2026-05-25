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
class PublicStartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void startPageServesExportedFrontend() throws Exception {
        expectFrontendPage("/start");

        assertStaticResourceContains(
                "static/start.html",
                "Optional setup help.",
                "No payment is taken on this request.",
                "Open email request"
        );
    }

    @Test
    void submittedPageServesStaticShellWithoutLeadId() throws Exception {
        expectFrontendPage("/start/submitted");

        assertStaticResourceContains(
                "static/start/submitted.html",
                "No inquiry id was provided.",
                "Go to inquiry",
                "Review pricing"
        );
    }

    @Test
    void submittedPageServesStaticShellWithLeadId() throws Exception {
        mockMvc.perform(get("/start/submitted").queryParam("leadId", "test-lead"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML));

        assertStaticResourceContains(
                "static/start/submitted.html",
                "START // SUBMITTED",
                "No inquiry id was provided."
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
