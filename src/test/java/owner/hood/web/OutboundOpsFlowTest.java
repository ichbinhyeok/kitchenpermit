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
import owner.hood.domain.outbound.VendorProspect;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
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
                .andExpect(content().string(containsString("prospect_fit_score")))
                .andExpect(content().string(containsString("export_readiness_score")))
                .andExpect(content().string(containsString("vendor_quality_tier")))
                .andExpect(content().string(containsString("send_priority")))
                .andExpect(content().string(org.hamcrest.Matchers.not(containsString("San Antonio Hood Ops"))));
    }

    @Test
    void listProspectsKeepsHigherFitResearchVendorsAheadOfMoreReachableResearchVendors() {
        VendorProspectForm highFit = new VendorProspectForm();
        highFit.setDisplayName("High Fit Research Hood");
        highFit.setWebsiteUrl("https://highfitresearchhood.example");
        highFit.setPrimaryMetro("Tulsa");
        highFit.setMetroScope("Tulsa metro");
        highFit.setServiceAreaText("Tulsa restaurants and nearby commercial kitchens.");
        highFit.setServiceAreaOverlapStatus("NO_ACTIVE_AXIS2_OVERLAP");
        highFit.setSizeBand("MICRO_TEAM");
        highFit.setOwnershipStyle("OWNER_LED");
        highFit.setDocumentationMaturity("LOW");
        highFit.setSegmentationLabel("mixed");
        highFit.setPrimaryOfferAxis("AXIS_1");
        highFit.setAxis1AngleFit(94);
        highFit.setAxis2AngleFit(90);
        highFit.setOwnerContactStatus("GENERIC");
        highFit.setSourceUrl("https://highfitresearchhood.example/about");
        highFit.setPhone("918-555-0100");
        highFit.setContactConfidence(38);
        highFit.setContactSourceUrl("https://highfitresearchhood.example/contact");
        outboundOpsService.createProspect(highFit);

        VendorProspectForm lowerFit = new VendorProspectForm();
        lowerFit.setDisplayName("Lower Fit Reachable Research Hood");
        lowerFit.setWebsiteUrl("https://lowerfitresearchhood.example");
        lowerFit.setPrimaryMetro("Tulsa");
        lowerFit.setMetroScope("Tulsa metro");
        lowerFit.setServiceAreaText("Tulsa commercial kitchens and nearby accounts.");
        lowerFit.setServiceAreaOverlapStatus("NO_ACTIVE_AXIS2_OVERLAP");
        lowerFit.setSizeBand("REGIONAL");
        lowerFit.setOwnershipStyle("SMALL_OFFICE_LED");
        lowerFit.setDocumentationMaturity("MEDIUM");
        lowerFit.setSegmentationLabel("mixed");
        lowerFit.setPrimaryOfferAxis("AXIS_1");
        lowerFit.setAxis1AngleFit(76);
        lowerFit.setAxis2AngleFit(71);
        lowerFit.setOwnerContactStatus("GENERIC");
        lowerFit.setSourceUrl("https://lowerfitresearchhood.example/contact");
        lowerFit.setPhone("918-555-0110");
        lowerFit.setContactConfidence(82);
        lowerFit.setContactSourceUrl("https://lowerfitresearchhood.example/contact");
        outboundOpsService.createProspect(lowerFit);

        List<String> orderedNames = outboundOpsService.listProspects().stream()
                .filter(prospect -> prospect.getDisplayName().equals("High Fit Research Hood")
                        || prospect.getDisplayName().equals("Lower Fit Reachable Research Hood"))
                .map(VendorProspect::getDisplayName)
                .toList();

        assertThat(orderedNames).containsExactly(
                "High Fit Research Hood",
                "Lower Fit Reachable Research Hood"
        );
    }

    @Test
    void prospectsPageShowsEnrichFirstBacklogAndResearchCsvExport() throws Exception {
        VendorProspectForm research = new VendorProspectForm();
        research.setDisplayName("Enrich First Hood Route");
        research.setWebsiteUrl("https://enrichfirsthood.example");
        research.setPrimaryMetro("Greenville");
        research.setMetroScope("Greenville metro");
        research.setServiceAreaText("Greenville and nearby restaurant kitchens.");
        research.setServiceAreaOverlapStatus("NO_ACTIVE_AXIS2_OVERLAP");
        research.setSizeBand("MICRO_TEAM");
        research.setOwnershipStyle("OWNER_LED");
        research.setDocumentationMaturity("LOW");
        research.setSegmentationLabel("mixed");
        research.setPrimaryOfferAxis("AXIS_1");
        research.setAxis1AngleFit(92);
        research.setAxis2AngleFit(87);
        research.setOwnerContactStatus("GENERIC");
        research.setSourceUrl("https://enrichfirsthood.example/about");
        research.setPhone("864-555-0199");
        research.setContactConfidence(42);
        research.setContactSourceUrl("https://enrichfirsthood.example/contact");
        outboundOpsService.createProspect(research);

        mockMvc.perform(get("/ops/outbound/prospects"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Enrich-First Backlog")))
                .andExpect(content().string(containsString("Enrich First Hood Route")))
                .andExpect(content().string(containsString("Export Research CSV")));

        mockMvc.perform(get("/ops/outbound/prospects/research.csv"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/csv"))
                .andExpect(content().string(containsString("prospect_fit_score")))
                .andExpect(content().string(containsString("vendor_quality_tier")))
                .andExpect(content().string(containsString("export_readiness_score")))
                .andExpect(content().string(containsString("Enrich First Hood Route")));
    }

    @Test
    void sendNowCsvExportIncludesOnlyHighFitSendReadyVendors() throws Exception {
        VendorProspectForm sendNow = new VendorProspectForm();
        sendNow.setDisplayName("Send Now Hood Crew");
        sendNow.setWebsiteUrl("https://sendnowhood.example");
        sendNow.setPrimaryMetro("Phoenix");
        sendNow.setMetroScope("Phoenix metro");
        sendNow.setServiceAreaText("Phoenix restaurants and nearby commercial kitchens.");
        sendNow.setServiceAreaOverlapStatus("NO_ACTIVE_AXIS2_OVERLAP");
        sendNow.setSizeBand("MICRO_TEAM");
        sendNow.setOwnershipStyle("OWNER_LED");
        sendNow.setDocumentationMaturity("LOW");
        sendNow.setSegmentationLabel("mixed");
        sendNow.setPrimaryOfferAxis("AXIS_1");
        sendNow.setAxis1AngleFit(92);
        sendNow.setAxis2AngleFit(88);
        sendNow.setOwnerContactStatus("DIRECT");
        sendNow.setSourceUrl("https://sendnowhood.example/contact");
        sendNow.setEmail("owner@sendnowhood.example");
        sendNow.setPhone("602-555-0100");
        sendNow.setContactConfidence(84);
        sendNow.setContactSourceUrl("https://sendnowhood.example/contact");
        outboundOpsService.createProspect(sendNow);

        VendorProspectForm activeReserve = new VendorProspectForm();
        activeReserve.setDisplayName("Active Reserve Hood");
        activeReserve.setWebsiteUrl("https://activereservehood.example");
        activeReserve.setPrimaryMetro("Phoenix");
        activeReserve.setMetroScope("Phoenix metro");
        activeReserve.setServiceAreaText("Phoenix commercial kitchens and surrounding operators.");
        activeReserve.setServiceAreaOverlapStatus("NO_ACTIVE_AXIS2_OVERLAP");
        activeReserve.setSizeBand("REGIONAL");
        activeReserve.setOwnershipStyle("SMALL_OFFICE_LED");
        activeReserve.setDocumentationMaturity("MEDIUM");
        activeReserve.setSegmentationLabel("mixed");
        activeReserve.setPrimaryOfferAxis("AXIS_1");
        activeReserve.setAxis1AngleFit(74);
        activeReserve.setAxis2AngleFit(71);
        activeReserve.setOwnerContactStatus("GENERIC");
        activeReserve.setSourceUrl("https://activereservehood.example/contact");
        activeReserve.setEmail("info@activereservehood.example");
        activeReserve.setPhone("602-555-0110");
        activeReserve.setContactConfidence(76);
        activeReserve.setContactSourceUrl("https://activereservehood.example/contact");
        outboundOpsService.createProspect(activeReserve);

        mockMvc.perform(get("/ops/outbound/prospects"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Export Send-Now CSV")))
                .andExpect(content().string(containsString("Export Active CSV")));

        mockMvc.perform(get("/ops/outbound/prospects/send-now.csv"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/csv"))
                .andExpect(content().string(containsString("Send Now Hood Crew")))
                .andExpect(content().string(org.hamcrest.Matchers.not(containsString("Active Reserve Hood"))));

        mockMvc.perform(get("/ops/outbound/prospects/export.csv"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/csv"))
                .andExpect(content().string(containsString("Send Now Hood Crew")))
                .andExpect(content().string(containsString("Active Reserve Hood")));
    }
}
