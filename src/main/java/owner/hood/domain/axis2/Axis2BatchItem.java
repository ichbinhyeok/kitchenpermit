package owner.hood.domain.axis2;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import owner.hood.domain.shared.AbstractAuditedEntity;

@Entity
@Table(name = "axis2_batch_items")
public class Axis2BatchItem extends AbstractAuditedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "batch_id", nullable = false)
    private Axis2Batch batch;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private OpportunityProject project;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "primary_signal_id", nullable = false)
    private OpportunitySignal primarySignal;

    @Column(name = "rank_order", nullable = false)
    private int rankOrder;

    @Column(name = "vendor_angle_note")
    private String vendorAngleNote;

    @Column(name = "included_contact_level")
    private String includedContactLevel;

    @Column(name = "is_demo_safe", nullable = false)
    private boolean demoSafe;

    public Axis2Batch getBatch() {
        return batch;
    }

    public void setBatch(Axis2Batch batch) {
        this.batch = batch;
    }

    public OpportunityProject getProject() {
        return project;
    }

    public void setProject(OpportunityProject project) {
        this.project = project;
    }

    public OpportunitySignal getPrimarySignal() {
        return primarySignal;
    }

    public void setPrimarySignal(OpportunitySignal primarySignal) {
        this.primarySignal = primarySignal;
    }

    public int getRankOrder() {
        return rankOrder;
    }

    public void setRankOrder(int rankOrder) {
        this.rankOrder = rankOrder;
    }

    public String getVendorAngleNote() {
        return vendorAngleNote;
    }

    public void setVendorAngleNote(String vendorAngleNote) {
        this.vendorAngleNote = vendorAngleNote;
    }

    public String getIncludedContactLevel() {
        return includedContactLevel;
    }

    public void setIncludedContactLevel(String includedContactLevel) {
        this.includedContactLevel = includedContactLevel;
    }

    public boolean isDemoSafe() {
        return demoSafe;
    }

    public void setDemoSafe(boolean demoSafe) {
        this.demoSafe = demoSafe;
    }
}
