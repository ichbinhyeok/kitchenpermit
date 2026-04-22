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
@Table(name = "axis2_packet_renders")
public class Axis2PacketRender extends AbstractAuditedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vendor_id", nullable = false)
    private VendorOrganization vendor;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "batch_id", nullable = false)
    private Axis2Batch batch;

    @Column(name = "render_version", nullable = false)
    private String renderVersion;

    @Column(name = "delivery_token", nullable = false, unique = true)
    private String deliveryToken;

    @Column(name = "html_path")
    private String htmlPath;

    @Column(name = "pdf_path")
    private String pdfPath;

    @Enumerated(EnumType.STRING)
    @Column(name = "render_status", nullable = false)
    private Axis2RenderStatus renderStatus;

    public VendorOrganization getVendor() {
        return vendor;
    }

    public void setVendor(VendorOrganization vendor) {
        this.vendor = vendor;
    }

    public Axis2Batch getBatch() {
        return batch;
    }

    public void setBatch(Axis2Batch batch) {
        this.batch = batch;
    }

    public String getRenderVersion() {
        return renderVersion;
    }

    public void setRenderVersion(String renderVersion) {
        this.renderVersion = renderVersion;
    }

    public String getDeliveryToken() {
        return deliveryToken;
    }

    public void setDeliveryToken(String deliveryToken) {
        this.deliveryToken = deliveryToken;
    }

    public String getHtmlPath() {
        return htmlPath;
    }

    public void setHtmlPath(String htmlPath) {
        this.htmlPath = htmlPath;
    }

    public String getPdfPath() {
        return pdfPath;
    }

    public void setPdfPath(String pdfPath) {
        this.pdfPath = pdfPath;
    }

    public Axis2RenderStatus getRenderStatus() {
        return renderStatus;
    }

    public void setRenderStatus(Axis2RenderStatus renderStatus) {
        this.renderStatus = renderStatus;
    }
}
