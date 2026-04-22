package owner.hood.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import owner.hood.application.outbound.OutboundCampaignForm;
import owner.hood.application.outbound.OutboundOpsService;
import owner.hood.application.outbound.OutboundResultSnapshotForm;
import owner.hood.application.outbound.VendorProspectForm;

import java.time.LocalDate;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class OutboundOpsFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OutboundOpsService outboundOpsService;

    @Test
    void outboundCampaignPageShowsSmartleadAnalysisSnapshot() throws Exception {
        VendorProspectForm prospect = new VendorProspectForm();
        prospect.setDisplayName("North Austin Hood Cleaning");
        prospect.setWebsiteUrl("https://northaustinhood.example");
        prospect.setPrimaryMetro("Austin");
        prospect.setMetroScope("Austin + Round Rock");
        prospect.setServiceAreaText("Austin, Round Rock, and Pflugerville restaurant corridors.");
        prospect.setServiceAreaOverlapStatus("ACTIVE_OVERLAP");
        prospect.setSizeBand("SMALL_OFFICE");
        prospect.setOwnershipStyle("OWNER_LED");
        prospect.setDocumentationMaturity("LOW");
        prospect.setSegmentationLabel("growth_oriented");
        prospect.setPrimaryOfferAxis("AXIS_2");
        prospect.setAxis1AngleFit(72);
        prospect.setAxis2AngleFit(91);
        prospect.setOwnerContactStatus("DIRECT");
        prospect.setSourceUrl("https://northaustinhood.example/austin");
        prospect.setNotes("Austin overlap is active and owner path is visible.");
        prospect.setContactName("Jordan Wells");
        prospect.setRoleTitle("Owner");
        prospect.setEmail("jordan@northaustinhood.example");
        prospect.setPhone("512-555-0199");
        prospect.setContactConfidence(86);
        prospect.setContactSourceUrl("https://northaustinhood.example/contact");
        var prospectId = outboundOpsService.createProspect(prospect);

        OutboundCampaignForm campaign = new OutboundCampaignForm();
        campaign.setVendorProspectId(prospectId);
        campaign.setPrimaryOfferAxis("AXIS_2");
        campaign.setCampaignStage("LIVE");
        campaign.setProviderCampaignId("smartlead-hood-001");
        var campaignId = outboundOpsService.createCampaign(campaign);

        OutboundResultSnapshotForm snapshot = new OutboundResultSnapshotForm();
        snapshot.setAnalysisWindowStart(LocalDate.of(2026, 4, 15));
        snapshot.setAnalysisWindowEnd(LocalDate.of(2026, 4, 21));
        snapshot.setTotalSent(40);
        snapshot.setDeliveredCount(37);
        snapshot.setBouncedCount(1);
        snapshot.setPositiveReplyCount(4);
        snapshot.setSampleRequestCount(2);
        snapshot.setPaidBatchOrderCount(1);
        outboundOpsService.recordSnapshot(campaignId, snapshot);

        mockMvc.perform(get("/ops/outbound/campaigns"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Smartlead handoff")))
                .andExpect(content().string(containsString("North Austin Hood Cleaning")))
                .andExpect(content().string(containsString("smartlead-hood-001")))
                .andExpect(content().string(containsString("Paid orders")))
                .andExpect(content().string(containsString("Angle analysis")))
                .andExpect(content().string(containsString("growth_oriented")));
    }

    @Test
    void nonActiveOverlapProspectIsForcedBackToAxis1First() throws Exception {
        VendorProspectForm prospect = new VendorProspectForm();
        prospect.setDisplayName("San Antonio Hood Ops");
        prospect.setWebsiteUrl("https://satxhoodops.example");
        prospect.setPrimaryMetro("San Antonio");
        prospect.setMetroScope("San Antonio metro");
        prospect.setServiceAreaText("San Antonio restaurants and ghost kitchen corridors.");
        prospect.setServiceAreaOverlapStatus("NO_ACTIVE_AXIS2_OVERLAP");
        prospect.setSizeBand("SMALL_OFFICE");
        prospect.setOwnershipStyle("OWNER_LED");
        prospect.setDocumentationMaturity("LOW");
        prospect.setSegmentationLabel("mixed");
        prospect.setPrimaryOfferAxis("AXIS_2");
        prospect.setAxis1AngleFit(83);
        prospect.setAxis2AngleFit(88);
        prospect.setOwnerContactStatus("GENERIC");
        prospect.setSourceUrl("https://satxhoodops.example/service-area");
        prospect.setContactConfidence(52);
        var prospectId = outboundOpsService.createProspect(prospect);

        OutboundCampaignForm campaign = new OutboundCampaignForm();
        campaign.setVendorProspectId(prospectId);
        campaign.setPrimaryOfferAxis("AXIS_2");
        campaign.setCampaignStage("LIVE");
        campaign.setProviderCampaignId("smartlead-hood-002");
        outboundOpsService.createCampaign(campaign);

        mockMvc.perform(get("/ops/outbound/campaigns"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("San Antonio Hood Ops")))
                .andExpect(content().string(containsString("AXIS_1 / LIVE")));

        mockMvc.perform(get("/ops/outbound/prospects/export.csv"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/csv"))
                .andExpect(content().string(containsString("contact_source_url")))
                .andExpect(content().string(containsString("NO_ACTIVE_AXIS2_OVERLAP")));
    }
}
