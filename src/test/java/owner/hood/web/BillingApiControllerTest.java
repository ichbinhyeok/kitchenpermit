package owner.hood.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class BillingApiControllerTest {

    @Autowired
    private MockMvc mockMvc;

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
}
