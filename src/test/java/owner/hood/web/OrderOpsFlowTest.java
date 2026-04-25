package owner.hood.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import owner.hood.domain.commercial.CommercialFulfillmentStatus;
import owner.hood.domain.commercial.CommercialLead;
import owner.hood.domain.commercial.CommercialLeadSourceType;
import owner.hood.domain.commercial.CommercialLeadStatus;
import owner.hood.domain.commercial.CommercialOrder;
import owner.hood.domain.commercial.CommercialOrderLine;
import owner.hood.domain.commercial.CommercialOrderStatus;
import owner.hood.domain.commercial.CommercialPaymentStatus;
import owner.hood.domain.commercial.CommercialProductLineKey;
import owner.hood.infrastructure.persistence.CommercialLeadRepository;
import owner.hood.infrastructure.persistence.CommercialOrderLineRepository;
import owner.hood.infrastructure.persistence.CommercialOrderRepository;

import java.time.Instant;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class OrderOpsFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CommercialLeadRepository commercialLeadRepository;

    @Autowired
    private CommercialOrderRepository commercialOrderRepository;

    @Autowired
    private CommercialOrderLineRepository commercialOrderLineRepository;

    @Test
    void orderQueuePageShowsCommercialStatuses() throws Exception {
        CommercialLead lead = new CommercialLead();
        lead.setSourceType(CommercialLeadSourceType.DIRECT_EMAIL);
        lead.setCompanyName("Austin Exhaust Co");
        lead.setContactName("Jamie Rivera");
        lead.setEmail("jamie@austinexhaust.example");
        lead.setPhone("512-555-0100");
        lead.setServiceAreaText("Austin metro");
        lead.setProductInterest("Axis 2");
        lead.setLeadNotes("Direct inquiry from compliance inbox.");
        lead.setLeadStatus(CommercialLeadStatus.CONVERTED_TO_ORDER);
        commercialLeadRepository.save(lead);

        CommercialOrder order = new CommercialOrder();
        order.setLead(lead);
        order.setOrderNumber("ORD-9101");
        order.setOrderStatus(CommercialOrderStatus.AWAITING_PAYMENT);
        order.setPaymentStatus(CommercialPaymentStatus.REQUESTED);
        order.setFulfillmentStatus(CommercialFulfillmentStatus.NOT_STARTED);
        order.setOrderedAt(Instant.parse("2026-04-22T05:00:00Z"));
        order.setOwnerNotes("Waiting on manual payment confirmation.");
        commercialOrderRepository.save(order);

        CommercialOrderLine line = new CommercialOrderLine();
        line.setOrder(order);
        line.setProductLineKey(CommercialProductLineKey.AXIS2_PAID_BATCH_10);
        line.setLineLabel("Axis 2 paid batch of 10");
        line.setQuantity(1);
        line.setUnitPrice(149);
        line.setLineTotal(149);
        line.setTargetMetroScope("Austin");
        line.setLineFulfillmentStatus(CommercialFulfillmentStatus.NOT_STARTED);
        line.setNotes("Austin inventory only.");
        commercialOrderLineRepository.save(line);

        mockMvc.perform(get("/ops/orders"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Manual commerce queue")))
                .andExpect(content().string(containsString("ORD-9101")))
                .andExpect(content().string(containsString("Austin Exhaust Co")))
                .andExpect(content().string(containsString("Axis 2 paid batch of 10")))
                .andExpect(content().string(containsString("awaiting payment")))
                .andExpect(content().string(containsString("requested")));
    }
}
