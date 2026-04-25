package owner.hood.application.commercial;

public record OrderQueueRowView(
        String orderId,
        String orderNumber,
        String companyName,
        String contactName,
        String primaryProductLabel,
        String totalAmountText,
        String orderStatusLabel,
        String orderStatusTone,
        String paymentStatusLabel,
        String paymentStatusTone,
        String fulfillmentStatusLabel,
        String fulfillmentStatusTone,
        String updatedAtText
) {
}
