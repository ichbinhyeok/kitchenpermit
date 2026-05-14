package owner.hood.application.billing;

public record PaddleWebhookResult(
        String eventId,
        String eventType,
        String action,
        String accountEmail,
        String subscriptionId,
        String status
) {
}
