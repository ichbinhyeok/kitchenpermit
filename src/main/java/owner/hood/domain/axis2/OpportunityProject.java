package owner.hood.domain.axis2;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import owner.hood.domain.shared.AbstractAuditedEntity;

import java.time.LocalDate;

@Entity
@Table(name = "opportunity_projects")
public class OpportunityProject extends AbstractAuditedEntity {

    @Column(name = "metro_key", nullable = false)
    private String metroKey;

    @Column(name = "city_name", nullable = false)
    private String cityName;

    @Column(name = "canonical_business_name", nullable = false)
    private String canonicalBusinessName;

    @Column(name = "canonical_street_address")
    private String canonicalStreetAddress;

    @Column(name = "dedupe_key", nullable = false, unique = true)
    private String dedupeKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "strongest_trigger_type", nullable = false)
    private TriggerType strongestTriggerType;

    @Column(name = "first_seen_trigger_date", nullable = false)
    private LocalDate firstSeenTriggerDate;

    @Column(name = "last_seen_trigger_date", nullable = false)
    private LocalDate lastSeenTriggerDate;

    @Column(name = "active_signal_count", nullable = false)
    private int activeSignalCount;

    @Column(name = "food_service_certainty_score", nullable = false)
    private int foodServiceCertaintyScore;

    @Column(name = "hood_relevance_score", nullable = false)
    private int hoodRelevanceScore;

    @Column(name = "freshness_score", nullable = false)
    private int freshnessScore;

    @Column(name = "buyer_authority_score", nullable = false)
    private int buyerAuthorityScore;

    @Column(name = "contactability_score", nullable = false)
    private int contactabilityScore;

    @Column(name = "final_score", nullable = false)
    private int finalScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "eligibility_status", nullable = false)
    private OpportunityEligibilityStatus eligibilityStatus;

    public String getMetroKey() {
        return metroKey;
    }

    public void setMetroKey(String metroKey) {
        this.metroKey = metroKey;
    }

    public String getCityName() {
        return cityName;
    }

    public void setCityName(String cityName) {
        this.cityName = cityName;
    }

    public String getCanonicalBusinessName() {
        return canonicalBusinessName;
    }

    public void setCanonicalBusinessName(String canonicalBusinessName) {
        this.canonicalBusinessName = canonicalBusinessName;
    }

    public String getCanonicalStreetAddress() {
        return canonicalStreetAddress;
    }

    public void setCanonicalStreetAddress(String canonicalStreetAddress) {
        this.canonicalStreetAddress = canonicalStreetAddress;
    }

    public String getDedupeKey() {
        return dedupeKey;
    }

    public void setDedupeKey(String dedupeKey) {
        this.dedupeKey = dedupeKey;
    }

    public TriggerType getStrongestTriggerType() {
        return strongestTriggerType;
    }

    public void setStrongestTriggerType(TriggerType strongestTriggerType) {
        this.strongestTriggerType = strongestTriggerType;
    }

    public LocalDate getFirstSeenTriggerDate() {
        return firstSeenTriggerDate;
    }

    public void setFirstSeenTriggerDate(LocalDate firstSeenTriggerDate) {
        this.firstSeenTriggerDate = firstSeenTriggerDate;
    }

    public LocalDate getLastSeenTriggerDate() {
        return lastSeenTriggerDate;
    }

    public void setLastSeenTriggerDate(LocalDate lastSeenTriggerDate) {
        this.lastSeenTriggerDate = lastSeenTriggerDate;
    }

    public int getActiveSignalCount() {
        return activeSignalCount;
    }

    public void setActiveSignalCount(int activeSignalCount) {
        this.activeSignalCount = activeSignalCount;
    }

    public int getFoodServiceCertaintyScore() {
        return foodServiceCertaintyScore;
    }

    public void setFoodServiceCertaintyScore(int foodServiceCertaintyScore) {
        this.foodServiceCertaintyScore = foodServiceCertaintyScore;
    }

    public int getHoodRelevanceScore() {
        return hoodRelevanceScore;
    }

    public void setHoodRelevanceScore(int hoodRelevanceScore) {
        this.hoodRelevanceScore = hoodRelevanceScore;
    }

    public int getFreshnessScore() {
        return freshnessScore;
    }

    public void setFreshnessScore(int freshnessScore) {
        this.freshnessScore = freshnessScore;
    }

    public int getBuyerAuthorityScore() {
        return buyerAuthorityScore;
    }

    public void setBuyerAuthorityScore(int buyerAuthorityScore) {
        this.buyerAuthorityScore = buyerAuthorityScore;
    }

    public int getContactabilityScore() {
        return contactabilityScore;
    }

    public void setContactabilityScore(int contactabilityScore) {
        this.contactabilityScore = contactabilityScore;
    }

    public int getFinalScore() {
        return finalScore;
    }

    public void setFinalScore(int finalScore) {
        this.finalScore = finalScore;
    }

    public OpportunityEligibilityStatus getEligibilityStatus() {
        return eligibilityStatus;
    }

    public void setEligibilityStatus(OpportunityEligibilityStatus eligibilityStatus) {
        this.eligibilityStatus = eligibilityStatus;
    }
}
