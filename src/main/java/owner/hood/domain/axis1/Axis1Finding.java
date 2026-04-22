package owner.hood.domain.axis1;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import owner.hood.domain.shared.AbstractAuditedEntity;

@Entity
@Table(name = "axis1_findings")
public class Axis1Finding extends AbstractAuditedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "axis1_job_id", nullable = false)
    private Axis1Job job;

    @Enumerated(EnumType.STRING)
    @Column(name = "finding_type", nullable = false)
    private FindingType findingType;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false)
    private Severity severity;

    @Column(name = "customer_visible", nullable = false)
    private boolean customerVisible;

    @Column(name = "summary", nullable = false)
    private String summary;

    @Column(name = "recommended_action")
    private String recommendedAction;

    @Column(name = "requires_followup", nullable = false)
    private boolean requiresFollowup;

    public Axis1Job getJob() {
        return job;
    }

    public void setJob(Axis1Job job) {
        this.job = job;
    }

    public FindingType getFindingType() {
        return findingType;
    }

    public void setFindingType(FindingType findingType) {
        this.findingType = findingType;
    }

    public Severity getSeverity() {
        return severity;
    }

    public void setSeverity(Severity severity) {
        this.severity = severity;
    }

    public boolean isCustomerVisible() {
        return customerVisible;
    }

    public void setCustomerVisible(boolean customerVisible) {
        this.customerVisible = customerVisible;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getRecommendedAction() {
        return recommendedAction;
    }

    public void setRecommendedAction(String recommendedAction) {
        this.recommendedAction = recommendedAction;
    }

    public boolean isRequiresFollowup() {
        return requiresFollowup;
    }

    public void setRequiresFollowup(boolean requiresFollowup) {
        this.requiresFollowup = requiresFollowup;
    }
}
