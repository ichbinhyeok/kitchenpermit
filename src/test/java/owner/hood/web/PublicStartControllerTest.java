package owner.hood.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PublicStartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void startPageShowsDirectEmailPath() throws Exception {
        mockMvc.perform(get("/start"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("compliance@kitchenpermit.com")))
                .andExpect(content().string(containsString("Prepare email draft")))
                .andExpect(content().string(containsString("mailto:compliance@kitchenpermit.com")));
    }

    @Test
    void startSubmissionRedirectsToSubmittedStep() throws Exception {
        mockMvc.perform(post("/start")
                        .param("companyName", "Austin Exhaust Co")
                        .param("contactName", "Jamie Rivera")
                        .param("email", "jamie@austinexhaust.example")
                        .param("serviceArea", "Austin metro")
                        .param("productInterest", "Axis 2"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/start/submitted"));
    }

    @Test
    void submittedPageBuildsMailDraftToKitchenPermitMailbox() throws Exception {
        mockMvc.perform(get("/start/submitted")
                        .flashAttr("submittedCompanyName", "Austin Exhaust Co")
                        .flashAttr("submittedContactName", "Jamie Rivera")
                        .flashAttr("submittedEmail", "jamie@austinexhaust.example")
                        .flashAttr("submittedProductInterest", "Axis 2")
                        .flashAttr("submittedServiceArea", "Austin metro"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Email draft ready.")))
                .andExpect(content().string(containsString("mailto:compliance@kitchenpermit.com")))
                .andExpect(content().string(containsString("Austin%20Exhaust%20Co")))
                .andExpect(content().string(containsString("Open email draft")));
    }
}
