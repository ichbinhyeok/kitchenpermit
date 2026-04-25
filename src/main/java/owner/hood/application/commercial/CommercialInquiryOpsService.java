package owner.hood.application.commercial;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import owner.hood.domain.commercial.CommercialFulfillmentStatus;
import owner.hood.domain.commercial.CommercialLead;
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
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.EnumSet;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class CommercialInquiryOpsService {

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("MMM d", Locale.US);
    private static final EnumSet<CommercialLeadStatus> OPEN_STATUSES =
            EnumSet.of(CommercialLeadStatus.NEW, CommercialLeadStatus.REVIEWED);

    private final CommercialLeadRepository commercialLeadRepository;
    private final CommercialOrderRepository commercialOrderRepository;
    private final CommercialOrderLineRepository commercialOrderLineRepository;

    public CommercialInquiryOpsService(
            CommercialLeadRepository commercialLeadRepository,
            CommercialOrderRepository commercialOrderRepository,
            CommercialOrderLineRepository commercialOrderLineRepository
    ) {
        this.commercialLeadRepository = commercialLeadRepository;
        this.commercialOrderRepository = commercialOrderRepository;
        this.commercialOrderLineRepository = commercialOrderLineRepository;
    }

    @Transactional(readOnly = true)
    public InquiryQueueSummaryView loadSummary() {
        long newInquiries = commercialLeadRepository.countByLeadStatus(CommercialLeadStatus.NEW);
        long reviewedInquiries = commercialLeadRepository.countByLeadStatus(CommercialLeadStatus.REVIEWED);
        return new InquiryQueueSummaryView(
                newInquiries + reviewedInquiries,
                newInquiries,
                reviewedInquiries,
                commercialLeadRepository.countByLeadStatus(CommercialLeadStatus.CONVERTED_TO_ORDER)
        );
    }

    @Transactional(readOnly = true)
    public List<InquiryQueueRowView> listOpenInquiries() {
        return commercialLeadRepository.findAllByLeadStatusInOrderByCreatedAtDesc(OPEN_STATUSES)
                .stream()
                .map(this::toRowView)
                .toList();
    }

    @Transactional
    public OrderConversionResult convertToOrder(UUID leadId) {
        CommercialLead lead = commercialLeadRepository.findById(leadId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inquiry not found"));

        if (!OPEN_STATUSES.contains(lead.getLeadStatus())) {
            CommercialOrder existingOrder = commercialOrderRepository.findFirstByLeadIdOrderByCreatedAtDesc(leadId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Inquiry is not convertible"));
            return new OrderConversionResult(lead.getId(), existingOrder.getId(), existingOrder.getOrderNumber());
        }

        PricePreset preset = mapPreset(lead.getProductInterest());
        Instant now = Instant.now();

        CommercialOrder order = new CommercialOrder();
        order.setLead(lead);
        order.setOrderNumber(nextOrderNumber());
        order.setOrderStatus(CommercialOrderStatus.NEW);
        order.setPaymentStatus(CommercialPaymentStatus.NOT_REQUESTED);
        order.setFulfillmentStatus(preset.fulfillmentStatus());
        order.setOrderedAt(now);
        order.setOwnerNotes(buildOwnerNotes(lead, preset));
        CommercialOrder savedOrder = commercialOrderRepository.save(order);

        CommercialOrderLine line = new CommercialOrderLine();
        line.setOrder(savedOrder);
        line.setProductLineKey(preset.productLineKey());
        line.setLineLabel(preset.lineLabel());
        line.setQuantity(1);
        line.setUnitPrice(preset.startingPrice());
        line.setLineTotal(preset.startingPrice());
        line.setTargetMetroScope(lead.getServiceAreaText());
        line.setLineFulfillmentStatus(preset.fulfillmentStatus());
        line.setNotes("Converted from public inquiry. Starting-at price should be reviewed manually.");
        commercialOrderLineRepository.save(line);

        lead.setLeadStatus(CommercialLeadStatus.CONVERTED_TO_ORDER);
        lead.setConvertedToOrderAt(now);

        return new OrderConversionResult(lead.getId(), savedOrder.getId(), savedOrder.getOrderNumber());
    }

    private InquiryQueueRowView toRowView(CommercialLead lead) {
        return new InquiryQueueRowView(
                lead.getId().toString(),
                humanize(lead.getSourceType().name()),
                lead.getCompanyName(),
                lead.getContactName(),
                lead.getEmail(),
                lead.getPhone(),
                lead.getServiceAreaText(),
                lead.getProductInterest(),
                summarizeNotes(lead.getLeadNotes()),
                humanize(lead.getLeadStatus().name()),
                toneForLeadStatus(lead.getLeadStatus()),
                DATE_FORMATTER.format(lead.getCreatedAt().atZone(ZoneOffset.UTC)),
                OPEN_STATUSES.contains(lead.getLeadStatus())
        );
    }

    private String toneForLeadStatus(CommercialLeadStatus leadStatus) {
        return switch (leadStatus) {
            case CONVERTED_TO_ORDER -> "success";
            case CLOSED_NO_FIT -> "alert";
            default -> "default";
        };
    }

    private String summarizeNotes(String notes) {
        if (notes == null || notes.isBlank()) {
            return "No notes yet";
        }
        String normalized = notes.trim();
        return normalized.length() <= 120 ? normalized : normalized.substring(0, 117) + "...";
    }

    private String humanize(String value) {
        return value.toLowerCase(Locale.ROOT).replace('_', ' ');
    }

    private String nextOrderNumber() {
        int nextSequence = commercialOrderRepository.findAll()
                .stream()
                .map(CommercialOrder::getOrderNumber)
                .mapToInt(this::extractOrderSequence)
                .max()
                .orElse(0) + 1;
        return "ORD-%04d".formatted(nextSequence);
    }

    private int extractOrderSequence(String orderNumber) {
        if (orderNumber == null || !orderNumber.startsWith("ORD-")) {
            return 0;
        }
        try {
            return Integer.parseInt(orderNumber.substring(4));
        } catch (NumberFormatException exception) {
            return 0;
        }
    }

    private String buildOwnerNotes(CommercialLead lead, PricePreset preset) {
        StringBuilder builder = new StringBuilder();
        builder.append("Converted from public inquiry as ")
                .append(preset.lineLabel())
                .append(". Starting-at price preset: $")
                .append(preset.startingPrice())
                .append('.');
        if (lead.getLeadNotes() != null && !lead.getLeadNotes().isBlank()) {
            builder.append(" Inquiry notes: ").append(lead.getLeadNotes().trim());
        }
        return builder.toString();
    }

    private PricePreset mapPreset(String productInterest) {
        String normalized = productInterest == null ? "" : productInterest.toLowerCase(Locale.ROOT);
        boolean wantsServicePackets = normalized.contains("axis 1")
                || normalized.contains("service packet")
                || normalized.contains("service packets")
                || normalized.contains("existing customer");
        boolean wantsSalesLists = normalized.contains("axis 2")
                || normalized.contains("sales list")
                || normalized.contains("sales lists")
                || normalized.contains("new sales")
                || normalized.contains("live sales");

        if (normalized.contains("bundle")
                || normalized.contains("both")
                || normalized.contains("service + sales")
                || normalized.contains("service packets + sales lists")
                || (wantsServicePackets && wantsSalesLists)) {
            return new PricePreset(
                    CommercialProductLineKey.AXIS1_AXIS2_BUNDLE,
                    "Service + sales launch bundle",
                    259,
                    CommercialFulfillmentStatus.BLOCKED_VENDOR_SETUP
            );
        }
        if (normalized.contains("repeat")) {
            return new PricePreset(
                    CommercialProductLineKey.AXIS2_REPEAT_BATCH,
                    "Repeat live sales batch",
                    149,
                    CommercialFulfillmentStatus.BLOCKED_INVENTORY_OR_QA
            );
        }
        if (wantsServicePackets) {
            return new PricePreset(
                    CommercialProductLineKey.AXIS1_SETUP,
                    "Service packet setup",
                    149,
                    CommercialFulfillmentStatus.BLOCKED_VENDOR_SETUP
            );
        }
        return new PricePreset(
                CommercialProductLineKey.AXIS2_PAID_BATCH_10,
                "Live sales batch of 10",
                149,
                CommercialFulfillmentStatus.BLOCKED_INVENTORY_OR_QA
        );
    }

    private record PricePreset(
            CommercialProductLineKey productLineKey,
            String lineLabel,
            int startingPrice,
            CommercialFulfillmentStatus fulfillmentStatus
    ) {
    }
}
