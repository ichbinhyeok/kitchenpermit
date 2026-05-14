package owner.hood.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void loginPageServesExportedFrontend() throws Exception {
        expectFrontendPage("/login");
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
}
