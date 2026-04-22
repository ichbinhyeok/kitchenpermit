package owner.hood.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import owner.hood.application.axis2.Axis2Service;
import owner.hood.application.axis2.Axis2SignalImportForm;
import owner.hood.application.vendor.VendorSetupForm;
import owner.hood.application.vendor.VendorSetupService;
import owner.hood.domain.axis2.TriggerType;

import java.time.LocalDate;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrlPattern;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class Axis2FlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private VendorSetupService vendorSetupService;

    @Autowired
    private Axis2Service axis2Service;

    @Test
    void axis2BatchCanBeBuiltAndDeliveredWithoutLogin() throws Exception {
        VendorSetupForm vendor = new VendorSetupForm();
        vendor.setDisplayName("Capital Hood Partners");
        vendor.setLegalName("Capital Hood Partners LLC");
        vendor.setWebsiteUrl("https://capitalhood.example");
        vendor.setPrimaryMetro("Austin");
        vendor.setPrimaryContactName("Rae Castillo");
        vendor.setPrimaryContactTitle("Owner");
        vendor.setReplyEmail("rae@capitalhood.example");
        vendor.setPhone("512-555-0177");
        vendor.setServiceAreaText("Austin commercial kitchen corridors.");
        vendor.setServiceOfferings("Kitchen exhaust cleaning, documentation, and compliance support.");
        vendor.setEmergencyAvailabilityText("After-hours service available.");
        vendor.setCtaText("Reply to review the next live opportunity batch.");
        vendor.setCertificationsBlurb("Vendor certifications available on request.");
        vendor.setInsuranceBlurb("Insurance certificates available on request.");
        var vendorId = vendorSetupService.createVendor(vendor);

        for (int index = 1; index <= 10; index++) {
            Axis2SignalImportForm signal = new Axis2SignalImportForm();
            signal.setMetroKey("Austin");
            signal.setCityName("Austin");
            signal.setCanonicalBusinessName("Austin Trigger Kitchen " + index);
            signal.setCanonicalStreetAddress(index + "01 South Lamar Blvd, Austin, TX");
            signal.setTriggerType(index % 2 == 0 ? TriggerType.REMODEL : TriggerType.FINISH_OUT);
            signal.setTriggerDate(LocalDate.of(2026, 4, 20).minusDays(index));
            signal.setSourceKey("permit-feed");
            signal.setSourceUrl("https://signals.example/" + index);
            signal.setSourceExcerpt("Commercial kitchen remodel permit filed for build-out phase " + index + ".");
            signal.setFoodServiceCertaintyScore(88);
            signal.setHoodRelevanceScore(84);
            signal.setFreshnessScore(88);
            signal.setBuyerAuthorityScore(72);
            signal.setContactabilityScore(68);
            signal.setContactLevel("owner");
            signal.setContactFullName("Jordan " + index);
            signal.setContactRoleTitle("Owner");
            signal.setContactEmail("owner" + index + "@triggerkitchen.example");
            signal.setContactPhone("512-555-01" + String.format("%02d", index));
            signal.setContactConfidenceScore(78);
            axis2Service.importSignal(signal);
        }

        MvcResult createBatchResult = mockMvc.perform(post("/ops/axis-2/batches/new")
                        .param("vendorId", vendorId.toString())
                        .param("batchType", "PAID_BATCH")
                        .param("targetMetroScope", "Austin")
                        .param("intendedSize", "10"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrlPattern("/deliver/axis-2/*"))
                .andReturn();

        String packetUrl = createBatchResult.getResponse().getRedirectedUrl();

        mockMvc.perform(get(packetUrl))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Paid batch of 10 live opportunities")))
                .andExpect(content().string(containsString("Austin Trigger Kitchen 1")))
                .andExpect(content().string(containsString("Smartlead")))
                .andExpect(content().string(containsString("Export CSV")))
                .andExpect(content().string(containsString("Suggested first email opener")));

        String token = packetUrl.substring(packetUrl.lastIndexOf('/') + 1);
        mockMvc.perform(get("/deliver/axis-2/" + token + "/list.csv"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/csv"))
                .andExpect(content().string(containsString("source_name")))
                .andExpect(content().string(containsString("permit-feed")));

        mockMvc.perform(get("/deliver/packet/" + token + "/pdf"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/pdf"));
    }

    @Test
    void unsupportedMetroCannotBeSoldAsActiveAxis2Inventory() throws Exception {
        VendorSetupForm vendor = new VendorSetupForm();
        vendor.setDisplayName("Texas Hood Route");
        vendor.setLegalName("Texas Hood Route LLC");
        vendor.setWebsiteUrl("https://texashoodroute.example");
        vendor.setPrimaryMetro("San Antonio");
        vendor.setPrimaryContactName("Avery Soto");
        vendor.setPrimaryContactTitle("Owner");
        vendor.setReplyEmail("avery@texashoodroute.example");
        vendor.setPhone("210-555-0100");
        vendor.setServiceAreaText("San Antonio metro restaurants and commissaries.");
        vendor.setServiceOfferings("Kitchen exhaust cleaning and inspection preparation.");
        vendor.setEmergencyAvailabilityText("After-hours support on request.");
        vendor.setCtaText("Reply to review your next route window.");
        vendor.setCertificationsBlurb("Commercial documentation available on request.");
        vendor.setInsuranceBlurb("Insurance certificates available on request.");
        var vendorId = vendorSetupService.createVendor(vendor);

        Axis2SignalImportForm signal = new Axis2SignalImportForm();
        signal.setMetroKey("San Antonio");
        signal.setCityName("San Antonio");
        signal.setCanonicalBusinessName("Southtown Kitchen Build");
        signal.setCanonicalStreetAddress("410 South Alamo St, San Antonio, TX");
        signal.setTriggerType(TriggerType.REMODEL);
        signal.setTriggerDate(LocalDate.of(2026, 4, 18));
        signal.setSourceKey("permit-feed");
        signal.setSourceUrl("https://signals.example/satx-1");
        signal.setSourceExcerpt("Restaurant remodel permit filed in San Antonio.");
        signal.setFoodServiceCertaintyScore(91);
        signal.setHoodRelevanceScore(87);
        signal.setFreshnessScore(92);
        signal.setBuyerAuthorityScore(74);
        signal.setContactabilityScore(70);
        axis2Service.importSignal(signal);

        mockMvc.perform(post("/ops/axis-2/batches/new")
                        .param("vendorId", vendorId.toString())
                        .param("batchType", "PAID_BATCH")
                        .param("targetMetroScope", "San Antonio")
                        .param("intendedSize", "10"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("No commercially usable San Antonio inventory is ready yet.")));
    }
}
