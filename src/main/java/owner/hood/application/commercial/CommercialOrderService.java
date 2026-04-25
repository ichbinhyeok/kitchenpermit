package owner.hood.application.commercial;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import owner.hood.domain.commercial.CommercialFulfillmentStatus;
import owner.hood.domain.commercial.CommercialOrder;
import owner.hood.domain.commercial.CommercialOrderLine;
import owner.hood.domain.commercial.CommercialOrderStatus;
import owner.hood.domain.commercial.CommercialPaymentStatus;
import owner.hood.infrastructure.persistence.CommercialOrderLineRepository;
import owner.hood.infrastructure.persistence.CommercialOrderRepository;

import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
public class CommercialOrderService {

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("MMM d", Locale.US);

    private final CommercialOrderRepository commercialOrderRepository;
    private final CommercialOrderLineRepository commercialOrderLineRepository;

    public CommercialOrderService(
            CommercialOrderRepository commercialOrderRepository,
            CommercialOrderLineRepository commercialOrderLineRepository
    ) {
        this.commercialOrderRepository = commercialOrderRepository;
        this.commercialOrderLineRepository = commercialOrderLineRepository;
    }

    @Transactional(readOnly = true)
    public List<OrderQueueRowView> listOrderQueue() {
        return commercialOrderRepository.findAllByOrderByUpdatedAtDesc()
                .stream()
                .map(this::toRowView)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderQueueSummaryView loadSummary() {
        return new OrderQueueSummaryView(
                commercialOrderRepository.count(),
                commercialOrderRepository.countByOrderStatus(CommercialOrderStatus.NEW),
                commercialOrderRepository.countByOrderStatus(CommercialOrderStatus.AWAITING_PAYMENT),
                commercialOrderRepository.countByOrderStatus(CommercialOrderStatus.IN_FULFILLMENT),
                commercialOrderRepository.countByOrderStatus(CommercialOrderStatus.READY_TO_SEND)
        );
    }

    private OrderQueueRowView toRowView(CommercialOrder order) {
        List<CommercialOrderLine> lines = commercialOrderLineRepository.findByOrderIdOrderByCreatedAtAsc(order.getId());
        CommercialOrderLine primaryLine = lines.isEmpty() ? null : lines.getFirst();
        String primaryProductLabel = primaryLine == null
                ? "No line items yet"
                : lines.size() == 1
                ? primaryLine.getLineLabel()
                : primaryLine.getLineLabel() + " +" + (lines.size() - 1) + " more";
        int totalAmount = lines.stream().mapToInt(CommercialOrderLine::getLineTotal).sum();
        return new OrderQueueRowView(
                order.getId().toString(),
                order.getOrderNumber(),
                order.getLead().getCompanyName(),
                order.getLead().getContactName(),
                primaryProductLabel,
                formatDollars(totalAmount),
                humanize(order.getOrderStatus().name()),
                orderTone(order.getOrderStatus()),
                humanize(order.getPaymentStatus().name()),
                paymentTone(order.getPaymentStatus()),
                humanize(order.getFulfillmentStatus().name()),
                fulfillmentTone(order.getFulfillmentStatus()),
                DATE_FORMATTER.format(order.getUpdatedAt().atZone(ZoneOffset.UTC))
        );
    }

    private String formatDollars(int amount) {
        return "$" + amount;
    }

    private String humanize(String value) {
        return value.toLowerCase(Locale.ROOT).replace('_', ' ');
    }

    private String orderTone(CommercialOrderStatus status) {
        return switch (status) {
            case DELIVERED, CLOSED_WON -> "success";
            case CLOSED_LOST -> "alert";
            default -> "default";
        };
    }

    private String paymentTone(CommercialPaymentStatus status) {
        return switch (status) {
            case CONFIRMED -> "success";
            case FAILED, REFUNDED -> "alert";
            default -> "default";
        };
    }

    private String fulfillmentTone(CommercialFulfillmentStatus status) {
        return switch (status) {
            case SEND_READY, SENT -> "success";
            case BLOCKED_INVENTORY_OR_QA, BLOCKED_VENDOR_SETUP -> "alert";
            default -> "default";
        };
    }
}
