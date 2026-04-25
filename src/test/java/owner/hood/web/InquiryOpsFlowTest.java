package owner.hood.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import owner.hood.domain.commercial.CommercialLead;
import owner.hood.domain.commercial.CommercialLeadSourceType;
import owner.hood.domain.commercial.CommercialLeadStatus;
import owner.hood.domain.commercial.CommercialOrder;
import owner.hood.domain.commercial.CommercialOrderLine;
import owner.hood.domain.commercial.CommercialProductLineKey;
import owner.hood.infrastructure.persistence.CommercialLeadRepository;
import owner.hood.infrastructure.persistence.CommercialOrderLineRepository;
import owner.hood.infrastructure.persistence.CommercialOrderRepository;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class InquiryOpsFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CommercialLeadRepository commercialLeadRepository;

    @Autowired
    private CommercialOrderRepository commercialOrderRepository;

    @Autowired
    private CommercialOrderLineRepository commercialOrderLineRepository;

    @Test
    void inquiryQueuePageShowsOpenPublicInquiry() throws Exception {
        CommercialLead lead = saveLead("Austin Exhaust Co", "Sales lists");

        mockMvc.perform(get("/ops/inquiries"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Inquiry inbox")))
                .andExpect(content().string(containsString("Austin Exhaust Co")))
                .andExpect(content().string(containsString("Austin metro")))
                .andExpect(content().string(containsString("Convert to order")))
                .andExpect(content().string(containsString(lead.getId().toString())));
    }

    @Test
    void convertInquiryCreatesOrderAndLineItem() throws Exception {
        CommercialLead lead = saveLead("DFW Hood Vendor", "Service packets + sales lists");

        mockMvc.perform(post("/ops/inquiries/{leadId}/convert", lead.getId()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/ops/orders"));

        CommercialLead refreshedLead = commercialLeadRepository.findById(lead.getId()).orElseThrow();
        assertThat(refreshedLead.getLeadStatus()).isEqualTo(CommercialLeadStatus.CONVERTED_TO_ORDER);
        assertThat(refreshedLead.getConvertedToOrderAt()).isNotNull();

        CommercialOrder order = commercialOrderRepository.findFirstByLeadIdOrderByCreatedAtDesc(lead.getId())
                .orElseThrow();
        assertThat(order.getOrderNumber()).startsWith("ORD-");
        assertThat(order.getLead().getId()).isEqualTo(lead.getId());
        assertThat(order.getOwnerNotes()).contains("Converted from public inquiry");

        CommercialOrderLine line = commercialOrderLineRepository.findByOrderIdOrderByCreatedAtAsc(order.getId())
                .stream()
                .findFirst()
                .orElseThrow();
        assertThat(line.getProductLineKey()).isEqualTo(CommercialProductLineKey.AXIS1_AXIS2_BUNDLE);
        assertThat(line.getLineTotal()).isEqualTo(259);

        mockMvc.perform(get("/ops/orders"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString(order.getOrderNumber())))
                .andExpect(content().string(containsString("DFW Hood Vendor")))
                .andExpect(content().string(containsString("Service + sales launch bundle")));
    }

    private CommercialLead saveLead(String companyName, String productInterest) {
        CommercialLead lead = new CommercialLead();
        lead.setSourceType(CommercialLeadSourceType.PUBLIC_START_FORM);
        lead.setCompanyName(companyName);
        lead.setContactName("Jordan Lee");
        lead.setEmail(companyName.toLowerCase().replace(' ', '.') + "@example.com");
        lead.setPhone("512-555-0100");
        lead.setServiceAreaText("Austin metro");
        lead.setProductInterest(productInterest);
        lead.setLeadNotes("Website start flow request.");
        lead.setLeadStatus(CommercialLeadStatus.NEW);
        return commercialLeadRepository.save(lead);
    }
}
