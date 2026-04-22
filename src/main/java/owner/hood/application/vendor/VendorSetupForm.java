package owner.hood.application.vendor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class VendorSetupForm {

    @NotBlank
    private String displayName;

    @NotBlank
    private String legalName;

    @NotBlank
    private String websiteUrl;

    @NotBlank
    private String primaryMetro;

    private String hqCity;

    private String hqState;

    @NotBlank
    private String primaryContactName;

    private String primaryContactTitle;

    @Email
    @NotBlank
    private String replyEmail;

    @NotBlank
    private String phone;

    @NotBlank
    @Size(max = 600)
    private String serviceAreaText;

    @NotBlank
    @Size(max = 1000)
    private String serviceOfferings;

    @Size(max = 500)
    private String emergencyAvailabilityText;

    @NotBlank
    private String ctaText;

    private String certificationsBlurb;

    private String insuranceBlurb;

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getLegalName() {
        return legalName;
    }

    public void setLegalName(String legalName) {
        this.legalName = legalName;
    }

    public String getWebsiteUrl() {
        return websiteUrl;
    }

    public void setWebsiteUrl(String websiteUrl) {
        this.websiteUrl = websiteUrl;
    }

    public String getPrimaryMetro() {
        return primaryMetro;
    }

    public void setPrimaryMetro(String primaryMetro) {
        this.primaryMetro = primaryMetro;
    }

    public String getHqCity() {
        return hqCity;
    }

    public void setHqCity(String hqCity) {
        this.hqCity = hqCity;
    }

    public String getHqState() {
        return hqState;
    }

    public void setHqState(String hqState) {
        this.hqState = hqState;
    }

    public String getPrimaryContactName() {
        return primaryContactName;
    }

    public void setPrimaryContactName(String primaryContactName) {
        this.primaryContactName = primaryContactName;
    }

    public String getPrimaryContactTitle() {
        return primaryContactTitle;
    }

    public void setPrimaryContactTitle(String primaryContactTitle) {
        this.primaryContactTitle = primaryContactTitle;
    }

    public String getReplyEmail() {
        return replyEmail;
    }

    public void setReplyEmail(String replyEmail) {
        this.replyEmail = replyEmail;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getServiceAreaText() {
        return serviceAreaText;
    }

    public void setServiceAreaText(String serviceAreaText) {
        this.serviceAreaText = serviceAreaText;
    }

    public String getServiceOfferings() {
        return serviceOfferings;
    }

    public void setServiceOfferings(String serviceOfferings) {
        this.serviceOfferings = serviceOfferings;
    }

    public String getEmergencyAvailabilityText() {
        return emergencyAvailabilityText;
    }

    public void setEmergencyAvailabilityText(String emergencyAvailabilityText) {
        this.emergencyAvailabilityText = emergencyAvailabilityText;
    }

    public String getCtaText() {
        return ctaText;
    }

    public void setCtaText(String ctaText) {
        this.ctaText = ctaText;
    }

    public String getCertificationsBlurb() {
        return certificationsBlurb;
    }

    public void setCertificationsBlurb(String certificationsBlurb) {
        this.certificationsBlurb = certificationsBlurb;
    }

    public String getInsuranceBlurb() {
        return insuranceBlurb;
    }

    public void setInsuranceBlurb(String insuranceBlurb) {
        this.insuranceBlurb = insuranceBlurb;
    }
}
