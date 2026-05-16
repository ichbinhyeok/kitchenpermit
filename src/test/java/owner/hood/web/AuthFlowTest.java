package owner.hood.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "hood.site.base-url=http://127.0.0.1:8096",
        "hood.auth.password-reset.expose-dev-link=true",
        "hood.auth.password-reset.max-requests-per-hour=2",
        "hood.auth.password-reset.cooldown-seconds=0"
})
@AutoConfigureMockMvc
class AuthFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void loginPageServesExportedFrontend() throws Exception {
        expectFrontendPage("/login");
    }

    @Test
    void passwordResetPagesServeExportedFrontend() throws Exception {
        expectFrontendPage("/forgot-password");
        expectFrontendPage("/reset-password");
    }

    @Test
    void dashboardRequiresSpringSession() throws Exception {
        mockMvc.perform(get("/dashboard"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login?next=%2Fdashboard"));
    }

    @Test
    void companyToolModeRemainsPublicButLocksPaidFeaturesInClient() throws Exception {
        mockMvc.perform(get("/axis-1/tool")
                        .queryParam("step", "outputs")
                        .queryParam("account", "company"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML));
    }

    @Test
    void freeToolModeRemainsPublic() throws Exception {
        mockMvc.perform(get("/axis-1/tool").queryParam("account", "free"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML));
    }

    @Test
    void emailPasswordSignupCreatesSpringSession() throws Exception {
        String email = "owner-" + UUID.randomUUID() + "@example.com";

        MvcResult signup = mockMvc.perform(post("/auth/signup")
                        .param("email", email)
                        .param("password", "correct-horse-1")
                        .param("confirmPassword", "correct-horse-1")
                        .param("next", "/dashboard"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/dashboard"))
                .andReturn();

        mockMvc.perform(get("/dashboard").session((MockHttpSession) signup.getRequest().getSession(false)))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML));
    }

    @Test
    void emailPasswordSignupRejectsMismatch() throws Exception {
        mockMvc.perform(post("/auth/signup")
                        .param("email", "owner-" + UUID.randomUUID() + "@example.com")
                        .param("password", "correct-horse-1")
                        .param("confirmPassword", "wrong-horse-1")
                        .param("next", "/dashboard"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login?mode=signup&auth=password-mismatch"));
    }

    @Test
    void emailPasswordLoginUsesExistingAccount() throws Exception {
        String email = "owner-" + UUID.randomUUID() + "@example.com";

        mockMvc.perform(post("/auth/signup")
                        .param("email", email)
                        .param("password", "correct-horse-1")
                        .param("confirmPassword", "correct-horse-1")
                        .param("next", "/dashboard"))
                .andExpect(status().is3xxRedirection());

        mockMvc.perform(post("/auth/login")
                        .param("email", email)
                        .param("password", "correct-horse-1")
                        .param("next", "/dashboard"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/dashboard"));
    }

    @Test
    void passwordResetUsesOneTimeEmailLink() throws Exception {
        String email = "owner-" + UUID.randomUUID() + "@example.com";

        mockMvc.perform(post("/auth/signup")
                        .param("email", email)
                        .param("password", "correct-horse-1")
                        .param("confirmPassword", "correct-horse-1")
                        .param("next", "/dashboard"))
                .andExpect(status().is3xxRedirection());

        MvcResult resetRequest = mockMvc.perform(post("/auth/password-reset/request")
                        .param("email", email))
                .andExpect(status().is3xxRedirection())
                .andReturn();
        assertTrue(resetRequest.getResponse().getRedirectedUrl().startsWith("/forgot-password?sent=1&reset="));

        String token = resetTokenFromRedirect(resetRequest.getResponse().getRedirectedUrl());

        mockMvc.perform(post("/auth/password-reset/confirm")
                        .param("token", token)
                        .param("password", "new-correct-horse-1")
                        .param("confirmPassword", "new-correct-horse-1"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login?auth=password-reset"));

        mockMvc.perform(post("/auth/password-reset/confirm")
                        .param("token", token)
                        .param("password", "another-correct-horse-1")
                        .param("confirmPassword", "another-correct-horse-1"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/reset-password?auth=invalid-token"));

        mockMvc.perform(post("/auth/login")
                        .param("email", email)
                        .param("password", "correct-horse-1")
                        .param("next", "/dashboard"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login?auth=failed"));

        mockMvc.perform(post("/auth/login")
                        .param("email", email)
                        .param("password", "new-correct-horse-1")
                        .param("next", "/dashboard"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/dashboard"));
    }

    @Test
    void passwordResetRequestUsesUniformResponseForUnknownEmail() throws Exception {
        mockMvc.perform(post("/auth/password-reset/request")
                        .param("email", "missing-" + UUID.randomUUID() + "@example.com"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/forgot-password?sent=1"));
    }

    @Test
    void passwordResetRequestRateLimitKeepsUniformPublicResponse() throws Exception {
        String email = "owner-" + UUID.randomUUID() + "@example.com";

        mockMvc.perform(post("/auth/signup")
                        .param("email", email)
                        .param("password", "correct-horse-1")
                        .param("confirmPassword", "correct-horse-1")
                        .param("next", "/dashboard"))
                .andExpect(status().is3xxRedirection());

        for (int index = 0; index < 2; index++) {
            MvcResult allowed = mockMvc.perform(post("/auth/password-reset/request")
                            .param("email", email))
                    .andExpect(status().is3xxRedirection())
                    .andReturn();
            assertTrue(allowed.getResponse().getRedirectedUrl().startsWith("/forgot-password?sent=1&reset="));
        }

        mockMvc.perform(post("/auth/password-reset/request")
                        .param("email", email))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/forgot-password?sent=1"));
    }

    @Test
    void googleLoginExplainsMissingProviderWhenNotConfigured() throws Exception {
        mockMvc.perform(get("/auth/google").queryParam("next", "/dashboard"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login?auth=google-missing"));
    }

    private void expectFrontendPage(String path) throws Exception {
        mockMvc.perform(get(path))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML));
    }

    private String resetTokenFromRedirect(String redirectedUrl) {
        String resetParam = redirectedUrl.substring(redirectedUrl.indexOf("reset=") + "reset=".length());
        String resetHref = URLDecoder.decode(resetParam, StandardCharsets.UTF_8);

        return URI.create(resetHref).getQuery().replace("token=", "");
    }
}
