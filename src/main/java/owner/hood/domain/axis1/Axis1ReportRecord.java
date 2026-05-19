package owner.hood.domain.axis1;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import owner.hood.domain.shared.AbstractAuditedEntity;

import java.time.Instant;

@Entity
@Table(name = "axis1_report_records")
public class Axis1ReportRecord extends AbstractAuditedEntity {

    @Column(name = "public_id", nullable = false, unique = true)
    private String publicId;

    @Column(name = "account_email")
    private String accountEmail;

    @Column(name = "product_plan", nullable = false)
    private String productPlan;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "site_name", nullable = false)
    private String siteName;

    @Column(name = "service_date")
    private String serviceDate;

    @Column(name = "next_service_date")
    private String nextServiceDate;

    @Column(name = "payload_json", nullable = false, columnDefinition = "text")
    private String payloadJson;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "public_view_count", nullable = false)
    private int publicViewCount;

    @Column(name = "first_viewed_at")
    private Instant firstViewedAt;

    @Column(name = "last_viewed_at")
    private Instant lastViewedAt;

    @Column(name = "pdf_save_click_count", nullable = false)
    private int pdfSaveClickCount;

    @Column(name = "last_pdf_save_clicked_at")
    private Instant lastPdfSaveClickedAt;

    @Column(name = "customer_confirmed_at")
    private Instant customerConfirmedAt;

    @Column(name = "customer_confirmed_by")
    private String customerConfirmedBy;

    public String getPublicId() {
        return publicId;
    }

    public void setPublicId(String publicId) {
        this.publicId = publicId;
    }

    public String getAccountEmail() {
        return accountEmail;
    }

    public void setAccountEmail(String accountEmail) {
        this.accountEmail = accountEmail;
    }

    public String getProductPlan() {
        return productPlan;
    }

    public void setProductPlan(String productPlan) {
        this.productPlan = productPlan;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getSiteName() {
        return siteName;
    }

    public void setSiteName(String siteName) {
        this.siteName = siteName;
    }

    public String getServiceDate() {
        return serviceDate;
    }

    public void setServiceDate(String serviceDate) {
        this.serviceDate = serviceDate;
    }

    public String getNextServiceDate() {
        return nextServiceDate;
    }

    public void setNextServiceDate(String nextServiceDate) {
        this.nextServiceDate = nextServiceDate;
    }

    public String getPayloadJson() {
        return payloadJson;
    }

    public void setPayloadJson(String payloadJson) {
        this.payloadJson = payloadJson;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public int getPublicViewCount() {
        return publicViewCount;
    }

    public void setPublicViewCount(int publicViewCount) {
        this.publicViewCount = publicViewCount;
    }

    public Instant getFirstViewedAt() {
        return firstViewedAt;
    }

    public void setFirstViewedAt(Instant firstViewedAt) {
        this.firstViewedAt = firstViewedAt;
    }

    public Instant getLastViewedAt() {
        return lastViewedAt;
    }

    public void setLastViewedAt(Instant lastViewedAt) {
        this.lastViewedAt = lastViewedAt;
    }

    public int getPdfSaveClickCount() {
        return pdfSaveClickCount;
    }

    public void setPdfSaveClickCount(int pdfSaveClickCount) {
        this.pdfSaveClickCount = pdfSaveClickCount;
    }

    public Instant getLastPdfSaveClickedAt() {
        return lastPdfSaveClickedAt;
    }

    public void setLastPdfSaveClickedAt(Instant lastPdfSaveClickedAt) {
        this.lastPdfSaveClickedAt = lastPdfSaveClickedAt;
    }

    public Instant getCustomerConfirmedAt() {
        return customerConfirmedAt;
    }

    public void setCustomerConfirmedAt(Instant customerConfirmedAt) {
        this.customerConfirmedAt = customerConfirmedAt;
    }

    public String getCustomerConfirmedBy() {
        return customerConfirmedBy;
    }

    public void setCustomerConfirmedBy(String customerConfirmedBy) {
        this.customerConfirmedBy = customerConfirmedBy;
    }
}
