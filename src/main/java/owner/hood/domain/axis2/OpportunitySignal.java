package owner.hood.domain.axis2;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import owner.hood.domain.shared.AbstractAuditedEntity;

import java.time.LocalDate;

@Entity
@Table(name = "opportunity_signals")
public class OpportunitySignal extends AbstractAuditedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "opportunity_project_id", nullable = false)
    private OpportunityProject project;

    @Column(name = "metro_key", nullable = false)
    private String metroKey;

    @Column(name = "city_name", nullable = false)
    private String cityName;

    @Column(name = "source_key", nullable = false)
    private String sourceKey;

    @Column(name = "external_record_id")
    private String externalRecordId;

    @Enumerated(EnumType.STRING)
    @Column(name = "trigger_type", nullable = false)
    private TriggerType triggerType;

    @Column(name = "trigger_date", nullable = false)
    private LocalDate triggerDate;

    @Column(name = "business_name", nullable = false)
    private String businessName;

    @Column(name = "street_address")
    private String streetAddress;

    @Column(name = "source_url", nullable = false)
    private String sourceUrl;

    @Column(name = "source_excerpt")
    private String sourceExcerpt;

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

    public OpportunityProject getProject() {
        return project;
    }

    public void setProject(OpportunityProject project) {
        this.project = project;
    }

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

    public String getSourceKey() {
        return sourceKey;
    }

    public void setSourceKey(String sourceKey) {
        this.sourceKey = sourceKey;
    }

    public String getExternalRecordId() {
        return externalRecordId;
    }

    public void setExternalRecordId(String externalRecordId) {
        this.externalRecordId = externalRecordId;
    }

    public TriggerType getTriggerType() {
        return triggerType;
    }

    public void setTriggerType(TriggerType triggerType) {
        this.triggerType = triggerType;
    }

    public LocalDate getTriggerDate() {
        return triggerDate;
    }

    public void setTriggerDate(LocalDate triggerDate) {
        this.triggerDate = triggerDate;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getStreetAddress() {
        return streetAddress;
    }

    public void setStreetAddress(String streetAddress) {
        this.streetAddress = streetAddress;
    }

    public String getSourceUrl() {
        return sourceUrl;
    }

    public void setSourceUrl(String sourceUrl) {
        this.sourceUrl = sourceUrl;
    }

    public String getSourceExcerpt() {
        return sourceExcerpt;
    }

    public void setSourceExcerpt(String sourceExcerpt) {
        this.sourceExcerpt = sourceExcerpt;
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
