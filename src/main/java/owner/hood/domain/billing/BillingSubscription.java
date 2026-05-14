package owner.hood.domain.billing;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import owner.hood.domain.shared.AbstractAuditedEntity;

import java.time.Instant;

@Entity
@Table(name = "billing_subscriptions")
public class BillingSubscription extends AbstractAuditedEntity {

    @Column(name = "account_email", nullable = false)
    private String accountEmail;

    @Column(name = "provider", nullable = false)
    private String provider;

    @Column(name = "provider_customer_id")
    private String providerCustomerId;

    @Column(name = "provider_subscription_id", nullable = false, unique = true)
    private String providerSubscriptionId;

    @Column(name = "provider_transaction_id")
    private String providerTransactionId;

    @Column(name = "price_id")
    private String priceId;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "current_period_starts_at")
    private Instant currentPeriodStartsAt;

    @Column(name = "current_period_ends_at")
    private Instant currentPeriodEndsAt;

    @Column(name = "last_event_id")
    private String lastEventId;

    @Column(name = "last_event_type")
    private String lastEventType;

    @Column(name = "raw_event_json", columnDefinition = "text")
    private String rawEventJson;

    public String getAccountEmail() {
        return accountEmail;
    }

    public void setAccountEmail(String accountEmail) {
        this.accountEmail = accountEmail;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getProviderCustomerId() {
        return providerCustomerId;
    }

    public void setProviderCustomerId(String providerCustomerId) {
        this.providerCustomerId = providerCustomerId;
    }

    public String getProviderSubscriptionId() {
        return providerSubscriptionId;
    }

    public void setProviderSubscriptionId(String providerSubscriptionId) {
        this.providerSubscriptionId = providerSubscriptionId;
    }

    public String getProviderTransactionId() {
        return providerTransactionId;
    }

    public void setProviderTransactionId(String providerTransactionId) {
        this.providerTransactionId = providerTransactionId;
    }

    public String getPriceId() {
        return priceId;
    }

    public void setPriceId(String priceId) {
        this.priceId = priceId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCurrentPeriodStartsAt() {
        return currentPeriodStartsAt;
    }

    public void setCurrentPeriodStartsAt(Instant currentPeriodStartsAt) {
        this.currentPeriodStartsAt = currentPeriodStartsAt;
    }

    public Instant getCurrentPeriodEndsAt() {
        return currentPeriodEndsAt;
    }

    public void setCurrentPeriodEndsAt(Instant currentPeriodEndsAt) {
        this.currentPeriodEndsAt = currentPeriodEndsAt;
    }

    public String getLastEventId() {
        return lastEventId;
    }

    public void setLastEventId(String lastEventId) {
        this.lastEventId = lastEventId;
    }

    public String getLastEventType() {
        return lastEventType;
    }

    public void setLastEventType(String lastEventType) {
        this.lastEventType = lastEventType;
    }

    public String getRawEventJson() {
        return rawEventJson;
    }

    public void setRawEventJson(String rawEventJson) {
        this.rawEventJson = rawEventJson;
    }
}
