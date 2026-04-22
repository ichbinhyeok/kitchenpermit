package owner.hood.domain.axis1;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import owner.hood.domain.shared.AbstractAuditedEntity;

import java.time.Instant;

@Entity
@Table(name = "axis1_brief_renders")
public class Axis1BriefRender extends AbstractAuditedEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "axis1_job_id", nullable = false)
    private Axis1Job job;

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
    private RenderStatus renderStatus;

    @Column(name = "delivered_at")
    private Instant deliveredAt;

    public Axis1Job getJob() {
        return job;
    }

    public void setJob(Axis1Job job) {
        this.job = job;
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

    public RenderStatus getRenderStatus() {
        return renderStatus;
    }

    public void setRenderStatus(RenderStatus renderStatus) {
        this.renderStatus = renderStatus;
    }

    public Instant getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(Instant deliveredAt) {
        this.deliveredAt = deliveredAt;
    }
}
