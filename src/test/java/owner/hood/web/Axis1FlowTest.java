package owner.hood.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import owner.hood.application.vendor.VendorSetupForm;
import owner.hood.application.vendor.VendorSetupService;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrlPattern;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class Axis1FlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private VendorSetupService vendorSetupService;

    @Test
    void opsVendorAndAxis1JobProduceTokenizedPacketAndPdf() throws Exception {
        VendorSetupForm vendor = new VendorSetupForm();
        vendor.setDisplayName("Austin Hood Co");
        vendor.setLegalName("Austin Hood Co LLC");
        vendor.setWebsiteUrl("https://austinhood.example");
        vendor.setPrimaryMetro("Austin");
        vendor.setPrimaryContactName("Jamie Rivera");
        vendor.setPrimaryContactTitle("Owner");
        vendor.setReplyEmail("jamie@austinhood.example");
        vendor.setPhone("512-555-0134");
        vendor.setServiceAreaText("Austin metro and nearby restaurant corridors.");
        vendor.setServiceOfferings("Kitchen exhaust cleaning, inspection preparation, and scheduled service.");
        vendor.setEmergencyAvailabilityText("Emergency response available by request.");
        vendor.setCtaText("Reply to book the next service window.");
        vendor.setCertificationsBlurb("NFPA-aligned documentation available on request.");
        vendor.setInsuranceBlurb("Commercial liability coverage available on request.");
        var vendorId = vendorSetupService.createVendor(vendor);

        MvcResult createJobResult = mockMvc.perform(post("/ops/axis-1/jobs/new")
                        .param("vendorId", vendorId.toString())
                        .param("customerName", "Metro Diner")
                        .param("siteName", "Metro Diner South")
                        .param("siteAddress", "1201 Riverside Dr, Austin, TX")
                        .param("serviceDate", "2026-04-22")
                        .param("crewLabel", "Crew A")
                        .param("serviceSummary", "Completed hood and line cleaning and documented one access issue.")
                        .param("nextRecommendedServiceDate", "2026-07-21")
                        .param("findingSummary", "Rear access panel remains difficult to reach.")
                        .param("recommendedAction", "Correct access before the next service visit.")
                        .param("findingSeverity", "HIGH"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrlPattern("/deliver/axis-1/*"))
                .andReturn();

        String packetUrl = createJobResult.getResponse().getRedirectedUrl();

        mockMvc.perform(get(packetUrl))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Metro Diner")))
                .andExpect(content().string(containsString("Rear access panel remains difficult to reach.")));

        String token = packetUrl.substring(packetUrl.lastIndexOf('/') + 1);
        mockMvc.perform(get("/deliver/packet/" + token + "/pdf"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/pdf"));
    }
}
