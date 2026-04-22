package owner.hood.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PublicSiteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void homePageRendersPacketLedValueProposition() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Sharpen Service Delivery.")))
                .andExpect(content().string(containsString("Axis 1")))
                .andExpect(content().string(containsString("Axis 2")));
    }

    @Test
    void pricingPageShowsStartingAtModel() throws Exception {
        mockMvc.perform(get("/pricing"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Starting at $149")))
                .andExpect(content().string(containsString("10 live opportunities")));
    }

    @Test
    void axis2SampleKeepsMaskedRowsAndProtectedFieldsVisible() throws Exception {
        mockMvc.perform(get("/samples/axis-2"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Masked sample")))
                .andExpect(content().string(containsString("Protected fields")))
                .andExpect(content().string(containsString("Masked Austin operator")))
                .andExpect(content().string(containsString("Masked Austin opening")))
                .andExpect(content().string(containsString("Masked Austin change-of-use")));
    }
}
