package owner.hood.domain.commercial;

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
@Table(name = "commercial_order_lines")
public class CommercialOrderLine extends AbstractAuditedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private CommercialOrder order;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_line_key", nullable = false)
    private CommercialProductLineKey productLineKey;

    @Column(name = "line_label", nullable = false)
    private String lineLabel;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Column(name = "unit_price", nullable = false)
    private int unitPrice;

    @Column(name = "line_total", nullable = false)
    private int lineTotal;

    @Column(name = "target_metro_scope")
    private String targetMetroScope;

    @Enumerated(EnumType.STRING)
    @Column(name = "line_fulfillment_status", nullable = false)
    private CommercialFulfillmentStatus lineFulfillmentStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linked_vendor_id")
    private VendorOrganization linkedVendor;

    @Column(name = "notes")
    private String notes;

    public CommercialOrder getOrder() {
        return order;
    }

    public void setOrder(CommercialOrder order) {
        this.order = order;
    }

    public CommercialProductLineKey getProductLineKey() {
        return productLineKey;
    }

    public void setProductLineKey(CommercialProductLineKey productLineKey) {
        this.productLineKey = productLineKey;
    }

    public String getLineLabel() {
        return lineLabel;
    }

    public void setLineLabel(String lineLabel) {
        this.lineLabel = lineLabel;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public int getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(int unitPrice) {
        this.unitPrice = unitPrice;
    }

    public int getLineTotal() {
        return lineTotal;
    }

    public void setLineTotal(int lineTotal) {
        this.lineTotal = lineTotal;
    }

    public String getTargetMetroScope() {
        return targetMetroScope;
    }

    public void setTargetMetroScope(String targetMetroScope) {
        this.targetMetroScope = targetMetroScope;
    }

    public CommercialFulfillmentStatus getLineFulfillmentStatus() {
        return lineFulfillmentStatus;
    }

    public void setLineFulfillmentStatus(CommercialFulfillmentStatus lineFulfillmentStatus) {
        this.lineFulfillmentStatus = lineFulfillmentStatus;
    }

    public VendorOrganization getLinkedVendor() {
        return linkedVendor;
    }

    public void setLinkedVendor(VendorOrganization linkedVendor) {
        this.linkedVendor = linkedVendor;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
