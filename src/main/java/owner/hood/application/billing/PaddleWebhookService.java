package owner.hood.application.billing;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import owner.hood.application.auth.AccountUserDetailsService;
import owner.hood.domain.billing.BillingSubscription;
import owner.hood.domain.billing.BillingWebhookEvent;
import owner.hood.infrastructure.persistence.BillingSubscriptionRepository;
import owner.hood.infrastructure.persistence.BillingWebhookEventRepository;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Locale;
import java.util.Optional;

@Service
public class PaddleWebhookService {

    private final BillingSubscriptionRepository subscriptions;
    private final BillingWebhookEventRepository webhookEvents;
    private final String companyPriceId;
    private final ObjectMapper objectMapper;

    public PaddleWebhookService(
            BillingSubscriptionRepository subscriptions,
            BillingWebhookEventRepository webhookEvents,
            @Value("${hood.billing.paddle.company-price-id:}") String companyPriceId
    ) {
        this.subscriptions = subscriptions;
        this.webhookEvents = webhookEvents;
        this.companyPriceId = companyPriceId == null ? "" : companyPriceId.trim();
        this.objectMapper = new ObjectMapper();
    }

    @Transactional
    public PaddleWebhookResult handle(byte[] rawBody) {
        String body = new String(rawBody, StandardCharsets.UTF_8);
        JsonNode root = read(body);
        String eventId = root.path("event_id").asText("");
        String eventType = root.path("event_type").asText("");

        if (eventId.isBlank() || eventType.isBlank()) {
            throw new IllegalArgumentException("Paddle webhook payload is missing event_id or event_type.");
        }

        if (webhookEvents.existsByEventId(eventId)) {
            return new PaddleWebhookResult(eventId, eventType, "duplicate", "", "", "");
        }

        PaddleWebhookResult result = switch (eventType) {
            case "transaction.completed", "transaction.paid" -> handleCompletedTransaction(root, body);
            case "subscription.created", "subscription.activated", "subscription.updated",
                 "subscription.resumed", "subscription.trialing", "subscription.past_due",
                 "subscription.paused", "subscription.canceled" -> handleSubscriptionEvent(root, body);
            default -> new PaddleWebhookResult(eventId, eventType, "ignored", "", "", "");
        };

        BillingWebhookEvent processed = new BillingWebhookEvent();
        processed.setProvider("paddle");
        processed.setEventId(eventId);
        processed.setEventType(eventType);
        processed.setProcessedAt(Instant.now());
        webhookEvents.save(processed);

        return result;
    }

    private PaddleWebhookResult handleCompletedTransaction(JsonNode root, String body) {
        JsonNode data = root.path("data");
        String accountEmail = normalizedAccountEmail(data.path("custom_data").path("hood_account_email").asText(""));
        String subscriptionId = data.path("subscription_id").asText("");
        String transactionId = data.path("id").asText("");
        String priceId = firstPriceId(data);

        if (accountEmail.isBlank() || subscriptionId.isBlank() || !companyPriceMatches(priceId)) {
            return new PaddleWebhookResult(
                    root.path("event_id").asText(""),
                    root.path("event_type").asText(""),
                    "ignored",
                    accountEmail,
                    subscriptionId,
                    data.path("status").asText("")
            );
        }

        BillingSubscription subscription = subscriptions.findByProviderSubscriptionId(subscriptionId)
                .orElseGet(BillingSubscription::new);
        subscription.setAccountEmail(accountEmail);
        subscription.setProvider("paddle");
        subscription.setProviderCustomerId(optionalText(data.path("customer_id")));
        subscription.setProviderSubscriptionId(subscriptionId);
        subscription.setProviderTransactionId(transactionId);
        subscription.setPriceId(priceId);
        subscription.setStatus("active");
        subscription.setCurrentPeriodStartsAt(parseInstant(data.path("billing_period").path("starts_at")));
        subscription.setCurrentPeriodEndsAt(parseInstant(data.path("billing_period").path("ends_at")));
        subscription.setLastEventId(root.path("event_id").asText(""));
        subscription.setLastEventType(root.path("event_type").asText(""));
        subscription.setRawEventJson(body);
        subscriptions.save(subscription);

        return new PaddleWebhookResult(
                root.path("event_id").asText(""),
                root.path("event_type").asText(""),
                "activated",
                accountEmail,
                subscriptionId,
                "active"
        );
    }

    private PaddleWebhookResult handleSubscriptionEvent(JsonNode root, String body) {
        JsonNode data = root.path("data");
        String subscriptionId = data.path("id").asText("");
        Optional<BillingSubscription> existing = subscriptions.findByProviderSubscriptionId(subscriptionId);

        if (subscriptionId.isBlank() || existing.isEmpty()) {
            return new PaddleWebhookResult(
                    root.path("event_id").asText(""),
                    root.path("event_type").asText(""),
                    "deferred",
                    "",
                    subscriptionId,
                    data.path("status").asText("")
            );
        }

        BillingSubscription subscription = existing.get();
        String status = normalizeStatus(data.path("status").asText(""));
        String priceId = firstSubscriptionPriceId(data);

        if (!priceId.isBlank()) {
            subscription.setPriceId(priceId);
        }

        subscription.setProviderCustomerId(optionalText(data.path("customer_id")));
        subscription.setStatus(status);
        subscription.setCurrentPeriodStartsAt(parseInstant(data.path("current_billing_period").path("starts_at")));
        subscription.setCurrentPeriodEndsAt(parseInstant(data.path("current_billing_period").path("ends_at")));
        subscription.setLastEventId(root.path("event_id").asText(""));
        subscription.setLastEventType(root.path("event_type").asText(""));
        subscription.setRawEventJson(body);
        subscriptions.save(subscription);

        return new PaddleWebhookResult(
                root.path("event_id").asText(""),
                root.path("event_type").asText(""),
                "updated",
                subscription.getAccountEmail(),
                subscriptionId,
                status
        );
    }

    private JsonNode read(String body) {
        try {
            return objectMapper.readTree(body);
        } catch (Exception exception) {
            throw new IllegalArgumentException("Paddle webhook payload is not valid JSON.", exception);
        }
    }

    private boolean companyPriceMatches(String priceId) {
        return companyPriceId.isBlank() || companyPriceId.equals(priceId);
    }

    private String firstPriceId(JsonNode data) {
        JsonNode items = data.path("items");

        if (items.isArray() && !items.isEmpty()) {
            return items.get(0).path("price").path("id").asText("");
        }

        JsonNode lineItems = data.path("details").path("line_items");

        if (lineItems.isArray() && !lineItems.isEmpty()) {
            return lineItems.get(0).path("price_id").asText("");
        }

        return "";
    }

    private String firstSubscriptionPriceId(JsonNode data) {
        JsonNode items = data.path("items");

        if (items.isArray() && !items.isEmpty()) {
            return items.get(0).path("price").path("id").asText("");
        }

        return "";
    }

    private String normalizeStatus(String value) {
        String status = value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
        return status.isBlank() ? "unknown" : status;
    }

    private String normalizedAccountEmail(String value) {
        return AccountUserDetailsService.normalizeEmail(value);
    }

    private String optionalText(JsonNode node) {
        if (node == null || node.isNull() || node.isMissingNode()) {
            return null;
        }

        String value = node.asText("");
        return value.isBlank() ? null : value;
    }

    private Instant parseInstant(JsonNode node) {
        String value = optionalText(node);

        if (value == null) {
            return null;
        }

        try {
            return Instant.parse(value);
        } catch (Exception exception) {
            return null;
        }
    }
}
