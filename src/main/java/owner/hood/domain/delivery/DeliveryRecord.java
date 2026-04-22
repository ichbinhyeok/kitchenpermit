package owner.hood.domain.delivery;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import owner.hood.domain.shared.AbstractAuditedEntity;
import owner.hood.domain.vendor.VendorOrganization;

import java.time.Instant;

@Entity
@Table(name = "delivery_records")
public class DeliveryRecord extends AbstractAuditedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vendor_id", nullable = false)
    private VendorOrganization vendor;

    @Column(name = "product_axis", nullable = false)
    private String productAxis;

    @Column(name = "artifact_type", nullable = false)
    private String artifactType;

    @Column(name = "delivery_channel", nullable = false)
    private String deliveryChannel;

    @Column(name = "delivered_to")
    private String deliveredTo;

    @Column(name = "delivered_at")
    private Instant deliveredAt;

    @Column(name = "delivery_status", nullable = false)
    private String deliveryStatus;

    public VendorOrganization getVendor() {
        return vendor;
    }

    public void setVendor(VendorOrganization vendor) {
        this.vendor = vendor;
    }

    public String getProductAxis() {
        return productAxis;
    }

    public void setProductAxis(String productAxis) {
        this.productAxis = productAxis;
    }

    public String getArtifactType() {
        return artifactType;
    }

    public void setArtifactType(String artifactType) {
        this.artifactType = artifactType;
    }

    public String getDeliveryChannel() {
        return deliveryChannel;
    }

    public void setDeliveryChannel(String deliveryChannel) {
        this.deliveryChannel = deliveryChannel;
    }

    public String getDeliveredTo() {
        return deliveredTo;
    }

    public void setDeliveredTo(String deliveredTo) {
        this.deliveredTo = deliveredTo;
    }

    public Instant getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(Instant deliveredAt) {
        this.deliveredAt = deliveredAt;
    }

    public String getDeliveryStatus() {
        return deliveryStatus;
    }

    public void setDeliveryStatus(String deliveryStatus) {
        this.deliveryStatus = deliveryStatus;
    }
}
