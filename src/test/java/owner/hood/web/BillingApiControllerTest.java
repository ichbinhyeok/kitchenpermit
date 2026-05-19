package owner.hood.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import owner.hood.domain.auth.AccountUser;
import owner.hood.infrastructure.persistence.AccountUserRepository;

import java.time.Instant;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "hood.auth.email-verification.required=true")
@AutoConfigureMockMvc
class BillingApiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AccountUserRepository accountUserRepository;

    @Test
    void paddleConfigDoesNotExposeServerApiKey() throws Exception {
        mockMvc.perform(get("/api/billing/paddle/config"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.provider").value("abstract"))
                .andExpect(jsonPath("$.ready").value(false))
                .andExpect(jsonPath("$.apiKey").doesNotExist())
                .andExpect(jsonPath("$.clientToken").doesNotExist());
    }

    @Test
    void paddleCheckoutRequiresLoginBeforePayment() throws Exception {
        mockMvc.perform(post("/api/billing/paddle/checkout"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.loginHref").value("/login?mode=signup&next=/company-version"));
    }

    @Test
    void paddleCheckoutRequiresVerifiedEmailBeforePayment() throws Exception {
        MvcResult signup = mockMvc.perform(post("/auth/signup")
                        .param("email", "checkout-" + UUID.randomUUID() + "@example.com")
                        .param("password", "correct-horse-1")
                        .param("confirmPassword", "correct-horse-1")
                        .param("next", "/company-version"))
                .andExpect(status().is3xxRedirection())
                .andReturn();

        mockMvc.perform(post("/api/billing/paddle/checkout")
                        .session((MockHttpSession) signup.getRequest().getSession(false)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("email_unverified"));
    }

    @Test
    void pilotAccessRequestRequiresLogin() throws Exception {
        mockMvc.perform(post("/api/billing/pilot/request"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.loginHref").value("/login?mode=signup&next=/company-version"));
    }

    @Test
    void pilotAccessRequestRequiresVerifiedEmail() throws Exception {
        MvcResult signup = mockMvc.perform(post("/auth/signup")
                        .param("email", "pilot-unverified-" + UUID.randomUUID() + "@example.com")
                        .param("password", "correct-horse-1")
                        .param("confirmPassword", "correct-horse-1")
                        .param("next", "/company-version"))
                .andExpect(status().is3xxRedirection())
                .andReturn();

        mockMvc.perform(post("/api/billing/pilot/request")
                        .session((MockHttpSession) signup.getRequest().getSession(false)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("email_unverified"));
    }

    @Test
    void pilotAccessRequestAcceptsVerifiedAccount() throws Exception {
        String email = "pilot-verified-" + UUID.randomUUID() + "@example.com";
        MvcResult signup = mockMvc.perform(post("/auth/signup")
                        .param("email", email)
                        .param("password", "correct-horse-1")
                        .param("confirmPassword", "correct-horse-1")
                        .param("next", "/company-version"))
                .andExpect(status().is3xxRedirection())
                .andReturn();

        AccountUser account = accountUserRepository.findByEmail(email).orElseThrow();
        account.setEmailVerified(true);
        account.setEmailVerifiedAt(Instant.now());
        accountUserRepository.saveAndFlush(account);

        mockMvc.perform(post("/api/billing/pilot/request")
                        .session((MockHttpSession) signup.getRequest().getSession(false)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true))
                .andExpect(jsonPath("$.accountEmail").value(email));
    }
}
