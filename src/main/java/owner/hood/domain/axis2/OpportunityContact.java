package owner.hood.domain.axis2;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import owner.hood.domain.shared.AbstractAuditedEntity;

@Entity
@Table(name = "opportunity_contacts")
public class OpportunityContact extends AbstractAuditedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "signal_id", nullable = false)
    private OpportunitySignal signal;

    @Column(name = "contact_level", nullable = false)
    private String contactLevel;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "role_title")
    private String roleTitle;

    @Column(name = "email")
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "source_url")
    private String sourceUrl;

    @Column(name = "confidence_score", nullable = false)
    private int confidenceScore;

    public OpportunitySignal getSignal() {
        return signal;
    }

    public void setSignal(OpportunitySignal signal) {
        this.signal = signal;
    }

    public String getContactLevel() {
        return contactLevel;
    }

    public void setContactLevel(String contactLevel) {
        this.contactLevel = contactLevel;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getRoleTitle() {
        return roleTitle;
    }

    public void setRoleTitle(String roleTitle) {
        this.roleTitle = roleTitle;
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

    public String getSourceUrl() {
        return sourceUrl;
    }

    public void setSourceUrl(String sourceUrl) {
        this.sourceUrl = sourceUrl;
    }

    public int getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(int confidenceScore) {
        this.confidenceScore = confidenceScore;
    }
}
