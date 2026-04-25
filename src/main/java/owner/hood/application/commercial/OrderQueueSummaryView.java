package owner.hood.application.commercial;

public record OrderQueueSummaryView(
        long totalOrders,
        long newOrders,
        long awaitingPaymentOrders,
        long inFulfillmentOrders,
        long readyToSendOrders
) {
}
