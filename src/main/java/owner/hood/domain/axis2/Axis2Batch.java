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
import owner.hood.domain.vendor.VendorOrganization;

@Entity
@Table(name = "axis2_batches")
public class Axis2Batch extends AbstractAuditedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vendor_id", nullable = false)
    private VendorOrganization vendor;

    @Enumerated(EnumType.STRING)
    @Column(name = "batch_type", nullable = false)
    private Axis2BatchType batchType;

    @Column(name = "target_metro_scope")
    private String targetMetroScope;

    @Column(name = "intended_size", nullable = false)
    private int intendedSize;

    @Column(name = "actual_size", nullable = false)
    private int actualSize;

    @Column(name = "pricing_snapshot")
    private String pricingSnapshot;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_status", nullable = false)
    private Axis2BatchDeliveryStatus deliveryStatus;

    public VendorOrganization getVendor() {
        return vendor;
    }

    public void setVendor(VendorOrganization vendor) {
        this.vendor = vendor;
    }

    public Axis2BatchType getBatchType() {
        return batchType;
    }

    public void setBatchType(Axis2BatchType batchType) {
        this.batchType = batchType;
    }

    public String getTargetMetroScope() {
        return targetMetroScope;
    }

    public void setTargetMetroScope(String targetMetroScope) {
        this.targetMetroScope = targetMetroScope;
    }

    public int getIntendedSize() {
        return intendedSize;
    }

    public void setIntendedSize(int intendedSize) {
        this.intendedSize = intendedSize;
    }

    public int getActualSize() {
        return actualSize;
    }

    public void setActualSize(int actualSize) {
        this.actualSize = actualSize;
    }

    public String getPricingSnapshot() {
        return pricingSnapshot;
    }

    public void setPricingSnapshot(String pricingSnapshot) {
        this.pricingSnapshot = pricingSnapshot;
    }

    public Axis2BatchDeliveryStatus getDeliveryStatus() {
        return deliveryStatus;
    }

    public void setDeliveryStatus(Axis2BatchDeliveryStatus deliveryStatus) {
        this.deliveryStatus = deliveryStatus;
    }
}
