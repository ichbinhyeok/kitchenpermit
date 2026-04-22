package owner.hood.domain.vendor;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import owner.hood.domain.shared.AbstractAuditedEntity;

@Entity
@Table(name = "vendor_setup_profiles")
public class VendorSetupProfile extends AbstractAuditedEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vendor_id", nullable = false)
    private VendorOrganization vendor;

    @Column(name = "brand_name", nullable = false)
    private String brandName;

    @Column(name = "logo_asset_path")
    private String logoAssetPath;

    @Column(name = "primary_contact_name", nullable = false)
    private String primaryContactName;

    @Column(name = "primary_contact_title")
    private String primaryContactTitle;

    @Column(name = "reply_email", nullable = false)
    private String replyEmail;

    @Column(name = "phone")
    private String phone;

    @Column(name = "service_area_text")
    private String serviceAreaText;

    @Column(name = "service_offerings")
    private String serviceOfferings;

    @Column(name = "emergency_availability_text")
    private String emergencyAvailabilityText;

    @Column(name = "cta_text")
    private String ctaText;

    @Column(name = "signature_block")
    private String signatureBlock;

    @Column(name = "certifications_blurb")
    private String certificationsBlurb;

    @Column(name = "insurance_blurb")
    private String insuranceBlurb;

    @Column(name = "brand_color_hex")
    private String brandColorHex;

    public VendorOrganization getVendor() {
        return vendor;
    }

    public void setVendor(VendorOrganization vendor) {
        this.vendor = vendor;
    }

    public String getBrandName() {
        return brandName;
    }

    public void setBrandName(String brandName) {
        this.brandName = brandName;
    }

    public String getLogoAssetPath() {
        return logoAssetPath;
    }

    public void setLogoAssetPath(String logoAssetPath) {
        this.logoAssetPath = logoAssetPath;
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

    public String getSignatureBlock() {
        return signatureBlock;
    }

    public void setSignatureBlock(String signatureBlock) {
        this.signatureBlock = signatureBlock;
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

    public String getBrandColorHex() {
        return brandColorHex;
    }

    public void setBrandColorHex(String brandColorHex) {
        this.brandColorHex = brandColorHex;
    }
}
