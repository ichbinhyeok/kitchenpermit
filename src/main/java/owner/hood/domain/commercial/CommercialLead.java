package owner.hood.domain.commercial;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import owner.hood.domain.shared.AbstractAuditedEntity;

import java.time.Instant;

@Entity
@Table(name = "commercial_leads")
public class CommercialLead extends AbstractAuditedEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false)
    private CommercialLeadSourceType sourceType;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "contact_name", nullable = false)
    private String contactName;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "service_area_text", nullable = false)
    private String serviceAreaText;

    @Column(name = "product_interest", nullable = false)
    private String productInterest;

    @Column(name = "lead_notes")
    private String leadNotes;

    @Enumerated(EnumType.STRING)
    @Column(name = "lead_status", nullable = false)
    private CommercialLeadStatus leadStatus;

    @Column(name = "converted_to_order_at")
    private Instant convertedToOrderAt;

    public CommercialLeadSourceType getSourceType() {
        return sourceType;
    }

    public void setSourceType(CommercialLeadSourceType sourceType) {
        this.sourceType = sourceType;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public String getProductInterest() {
        return productInterest;
    }

    public void setProductInterest(String productInterest) {
        this.productInterest = productInterest;
    }

    public String getLeadNotes() {
        return leadNotes;
    }

    public void setLeadNotes(String leadNotes) {
        this.leadNotes = leadNotes;
    }

    public CommercialLeadStatus getLeadStatus() {
        return leadStatus;
    }

    public void setLeadStatus(CommercialLeadStatus leadStatus) {
        this.leadStatus = leadStatus;
    }

    public Instant getConvertedToOrderAt() {
        return convertedToOrderAt;
    }

    public void setConvertedToOrderAt(Instant convertedToOrderAt) {
        this.convertedToOrderAt = convertedToOrderAt;
    }
}
