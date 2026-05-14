package owner.hood.domain.axis1;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import owner.hood.domain.shared.AbstractAuditedEntity;

@Entity
@Table(name = "axis1_company_profiles")
public class Axis1CompanyProfile extends AbstractAuditedEntity {

    @Column(name = "account_email", nullable = false, unique = true)
    private String accountEmail;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "service_area", nullable = false)
    private String serviceArea;

    @Column(name = "direct_line", nullable = false)
    private String directLine;

    @Column(name = "dispatch_email", nullable = false)
    private String dispatchEmail;

    @Column(name = "after_hours_phone", nullable = false)
    private String afterHoursPhone;

    @Column(name = "certification", nullable = false)
    private String certification;

    @Column(name = "technician_label", nullable = false)
    private String technicianLabel;

    @Column(name = "brand_initials", nullable = false)
    private String brandInitials;

    @Column(name = "logo_url", nullable = false, columnDefinition = "text")
    private String logoUrl = "";

    @Column(name = "brand_color", nullable = false, length = 16)
    private String brandColor = "#0F172A";

    public String getAccountEmail() {
        return accountEmail;
    }

    public void setAccountEmail(String accountEmail) {
        this.accountEmail = accountEmail;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getServiceArea() {
        return serviceArea;
    }

    public void setServiceArea(String serviceArea) {
        this.serviceArea = serviceArea;
    }

    public String getDirectLine() {
        return directLine;
    }

    public void setDirectLine(String directLine) {
        this.directLine = directLine;
    }

    public String getDispatchEmail() {
        return dispatchEmail;
    }

    public void setDispatchEmail(String dispatchEmail) {
        this.dispatchEmail = dispatchEmail;
    }

    public String getAfterHoursPhone() {
        return afterHoursPhone;
    }

    public void setAfterHoursPhone(String afterHoursPhone) {
        this.afterHoursPhone = afterHoursPhone;
    }

    public String getCertification() {
        return certification;
    }

    public void setCertification(String certification) {
        this.certification = certification;
    }

    public String getTechnicianLabel() {
        return technicianLabel;
    }

    public void setTechnicianLabel(String technicianLabel) {
        this.technicianLabel = technicianLabel;
    }

    public String getBrandInitials() {
        return brandInitials;
    }

    public void setBrandInitials(String brandInitials) {
        this.brandInitials = brandInitials;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getBrandColor() {
        return brandColor;
    }

    public void setBrandColor(String brandColor) {
        this.brandColor = brandColor;
    }
}
