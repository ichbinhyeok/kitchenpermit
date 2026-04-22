package owner.hood.application.axis2;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import owner.hood.domain.axis2.TriggerType;

import java.time.LocalDate;

public class Axis2SignalImportForm {

    @NotBlank
    private String metroKey = "austin";

    @NotBlank
    private String cityName = "Austin";

    @NotBlank
    private String canonicalBusinessName;

    @NotBlank
    private String canonicalStreetAddress;

    @NotNull
    private TriggerType triggerType = TriggerType.REMODEL;

    @NotNull
    private LocalDate triggerDate = LocalDate.now();

    @NotBlank
    private String sourceKey;

    @NotBlank
    private String sourceUrl;

    @Size(max = 2000)
    private String sourceExcerpt;

    @Min(0)
    @Max(100)
    private int foodServiceCertaintyScore = 80;

    @Min(0)
    @Max(100)
    private int hoodRelevanceScore = 80;

    @Min(0)
    @Max(100)
    private int freshnessScore = 80;

    @Min(0)
    @Max(100)
    private int buyerAuthorityScore = 60;

    @Min(0)
    @Max(100)
    private int contactabilityScore = 55;

    private String contactLevel = "owner";

    private String contactFullName;

    private String contactRoleTitle;

    @Email
    private String contactEmail;

    private String contactPhone;

    @Min(0)
    @Max(100)
    private int contactConfidenceScore = 60;

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

    public String getSourceKey() {
        return sourceKey;
    }

    public void setSourceKey(String sourceKey) {
        this.sourceKey = sourceKey;
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

    public String getContactLevel() {
        return contactLevel;
    }

    public void setContactLevel(String contactLevel) {
        this.contactLevel = contactLevel;
    }

    public String getContactFullName() {
        return contactFullName;
    }

    public void setContactFullName(String contactFullName) {
        this.contactFullName = contactFullName;
    }

    public String getContactRoleTitle() {
        return contactRoleTitle;
    }

    public void setContactRoleTitle(String contactRoleTitle) {
        this.contactRoleTitle = contactRoleTitle;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public int getContactConfidenceScore() {
        return contactConfidenceScore;
    }

    public void setContactConfidenceScore(int contactConfidenceScore) {
        this.contactConfidenceScore = contactConfidenceScore;
    }
}
