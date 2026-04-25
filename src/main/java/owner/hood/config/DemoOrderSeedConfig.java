package owner.hood.config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
import java.util.List;

@Configuration(proxyBeanMethods = false)
public class DemoOrderSeedConfig {

    @Bean
    @ConditionalOnProperty(name = "hood.demo.seed-orders", havingValue = "true")
    ApplicationRunner demoOrderSeedRunner(
            CommercialLeadRepository commercialLeadRepository,
            CommercialOrderRepository commercialOrderRepository,
            CommercialOrderLineRepository commercialOrderLineRepository
    ) {
        return args -> {
            if (commercialOrderRepository.count() > 0) {
                return;
            }

            CommercialLead awaitingPaymentLead = commercialLeadRepository.save(lead(
                    "Austin Exhaust Co",
                    "Ben Flores",
                    "ben@austinexhaust.co",
                    "(512) 555-0183",
                    "Austin / Round Rock",
                    "Axis 2 paid batch of 10",
                    "Outbound reply asking for a paid starter batch."
            ));
            CommercialOrder awaitingPaymentOrder = commercialOrderRepository.save(order(
                    awaitingPaymentLead,
                    "ORD-0001",
                    CommercialOrderStatus.AWAITING_PAYMENT,
                    CommercialPaymentStatus.REQUESTED,
                    CommercialFulfillmentStatus.NOT_STARTED,
                    Instant.now().minusSeconds(86_400L),
                    "Manual payment check pending."
            ));
            commercialOrderLineRepository.save(line(
                    awaitingPaymentOrder,
                    CommercialProductLineKey.AXIS2_PAID_BATCH_10,
                    "Axis 2 paid batch of 10",
                    1,
                    149,
                    "Austin",
                    CommercialFulfillmentStatus.NOT_STARTED,
                    "Starter paid batch."
            ));

            CommercialLead fulfillmentLead = commercialLeadRepository.save(lead(
                    "Capital Hood Pros",
                    "Maya Singh",
                    "maya@capitalhoodpros.com",
                    "(737) 555-0110",
                    "Austin / Cedar Park",
                    "Axis 1 setup",
                    "Vendor wants a completion brief template before next service run."
            ));
            CommercialOrder fulfillmentOrder = commercialOrderRepository.save(order(
                    fulfillmentLead,
                    "ORD-0002",
                    CommercialOrderStatus.IN_FULFILLMENT,
                    CommercialPaymentStatus.CONFIRMED,
                    CommercialFulfillmentStatus.BUILDING,
                    Instant.now().minusSeconds(172_800L),
                    "Packet build is underway."
            ));
            commercialOrderLineRepository.save(line(
                    fulfillmentOrder,
                    CommercialProductLineKey.AXIS1_SETUP,
                    "Axis 1 completion packet setup",
                    1,
                    299,
                    "Austin",
                    CommercialFulfillmentStatus.BUILDING,
                    "Includes branded technician-facing output."
            ));

            CommercialLead readyLead = commercialLeadRepository.save(lead(
                    "Metro Vent Compliance",
                    "Tara Nguyen",
                    "tara@metroventcompliance.com",
                    "(214) 555-0144",
                    "Dallas / Fort Worth",
                    "Axis 2 repeat batch",
                    "Repeat buyer asked for another live prospect batch."
            ));
            CommercialOrder readyOrder = commercialOrderRepository.save(order(
                    readyLead,
                    "ORD-0003",
                    CommercialOrderStatus.READY_TO_SEND,
                    CommercialPaymentStatus.CONFIRMED,
                    CommercialFulfillmentStatus.SEND_READY,
                    Instant.now().minusSeconds(259_200L),
                    "QA complete, ready to deliver over email."
            ));
            commercialOrderLineRepository.save(line(
                    readyOrder,
                    CommercialProductLineKey.AXIS2_REPEAT_BATCH,
                    "Axis 2 repeat batch of 20",
                    1,
                    398,
                    "Dallas / Fort Worth",
                    CommercialFulfillmentStatus.SEND_READY,
                    "Repeat list with refreshed remodel signals."
            ));

            CommercialLead newLead = commercialLeadRepository.save(lead(
                    "Lone Star Grease Group",
                    "Owen Parker",
                    "owen@lonestargrease.com",
                    "(210) 555-0198",
                    "San Antonio",
                    "Axis 1 + Axis 2 bundle",
                    "Direct inbound asking for setup plus first outbound batch."
            ));
            CommercialOrder newOrder = commercialOrderRepository.save(order(
                    newLead,
                    "ORD-0004",
                    CommercialOrderStatus.NEW,
                    CommercialPaymentStatus.NOT_REQUESTED,
                    CommercialFulfillmentStatus.BLOCKED_VENDOR_SETUP,
                    Instant.now().minusSeconds(43_200L),
                    "Needs manual scoping before payment request."
            ));
            commercialOrderLineRepository.save(line(
                    newOrder,
                    CommercialProductLineKey.AXIS1_AXIS2_BUNDLE,
                    "Axis 1 + Axis 2 launch bundle",
                    1,
                    429,
                    "San Antonio",
                    CommercialFulfillmentStatus.BLOCKED_VENDOR_SETUP,
                    "Bundle order pending vendor intake details."
            ));
        };
    }

    private CommercialLead lead(
            String companyName,
            String contactName,
            String email,
            String phone,
            String serviceAreaText,
            String productInterest,
            String leadNotes
    ) {
        CommercialLead lead = new CommercialLead();
        lead.setSourceType(CommercialLeadSourceType.MANUAL_ENTRY);
        lead.setCompanyName(companyName);
        lead.setContactName(contactName);
        lead.setEmail(email);
        lead.setPhone(phone);
        lead.setServiceAreaText(serviceAreaText);
        lead.setProductInterest(productInterest);
        lead.setLeadNotes(leadNotes);
        lead.setLeadStatus(CommercialLeadStatus.CONVERTED_TO_ORDER);
        lead.setConvertedToOrderAt(Instant.now());
        return lead;
    }

    private CommercialOrder order(
            CommercialLead lead,
            String orderNumber,
            CommercialOrderStatus orderStatus,
            CommercialPaymentStatus paymentStatus,
            CommercialFulfillmentStatus fulfillmentStatus,
            Instant orderedAt,
            String ownerNotes
    ) {
        CommercialOrder order = new CommercialOrder();
        order.setLead(lead);
        order.setOrderNumber(orderNumber);
        order.setOrderStatus(orderStatus);
        order.setPaymentStatus(paymentStatus);
        order.setFulfillmentStatus(fulfillmentStatus);
        order.setOrderedAt(orderedAt);
        order.setOwnerNotes(ownerNotes);
        if (paymentStatus == CommercialPaymentStatus.CONFIRMED) {
            order.setPaidAt(orderedAt.plusSeconds(3_600L));
        }
        if (fulfillmentStatus == CommercialFulfillmentStatus.SEND_READY) {
            order.setDeliveredAt(orderedAt.plusSeconds(14_400L));
        }
        return order;
    }

    private CommercialOrderLine line(
            CommercialOrder order,
            CommercialProductLineKey productLineKey,
            String lineLabel,
            int quantity,
            int unitPrice,
            String targetMetroScope,
            CommercialFulfillmentStatus lineFulfillmentStatus,
            String notes
    ) {
        CommercialOrderLine line = new CommercialOrderLine();
        line.setOrder(order);
        line.setProductLineKey(productLineKey);
        line.setLineLabel(lineLabel);
        line.setQuantity(quantity);
        line.setUnitPrice(unitPrice);
        line.setLineTotal(quantity * unitPrice);
        line.setTargetMetroScope(targetMetroScope);
        line.setLineFulfillmentStatus(lineFulfillmentStatus);
        line.setNotes(notes);
        return line;
    }
}
