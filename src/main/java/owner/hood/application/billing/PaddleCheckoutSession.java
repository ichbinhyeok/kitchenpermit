package owner.hood.application.billing;

public record PaddleCheckoutSession(
        String provider,
        String environment,
        String clientToken,
        String companyPriceId,
        String checkoutMode,
        String transactionId,
        String accountEmail,
        String successUrl,
        String fallbackReason
) {
}
