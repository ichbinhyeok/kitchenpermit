package owner.hood.domain.vendor;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import owner.hood.domain.shared.AbstractAuditedEntity;

@Entity
@Table(name = "vendor_organizations")
public class VendorOrganization extends AbstractAuditedEntity {

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(name = "legal_name", nullable = false)
    private String legalName;

    @Column(name = "website_url")
    private String websiteUrl;

    @Column(name = "primary_metro", nullable = false)
    private String primaryMetro;

    @Column(name = "hq_city")
    private String hqCity;

    @Column(name = "hq_state")
    private String hqState;

    @Enumerated(EnumType.STRING)
    @Column(name = "size_band", nullable = false)
    private SizeBand sizeBand;

    @Enumerated(EnumType.STRING)
    @Column(name = "ownership_style", nullable = false)
    private OwnershipStyle ownershipStyle;

    @Enumerated(EnumType.STRING)
    @Column(name = "documentation_maturity", nullable = false)
    private DocumentationMaturity documentationMaturity;

    @Column(name = "axis1_fit_score", nullable = false)
    private int axis1FitScore;

    @Column(name = "axis2_fit_score", nullable = false)
    private int axis2FitScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private VendorStatus status;

    @Column(name = "brand_notes")
    private String brandNotes;

    @Column(name = "service_summary")
    private String serviceSummary;

    @Column(name = "specialties")
    private String specialties;

    @Column(name = "notes")
    private String notes;

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getLegalName() {
        return legalName;
    }

    public void setLegalName(String legalName) {
        this.legalName = legalName;
    }

    public String getWebsiteUrl() {
        return websiteUrl;
    }

    public void setWebsiteUrl(String websiteUrl) {
        this.websiteUrl = websiteUrl;
    }

    public String getPrimaryMetro() {
        return primaryMetro;
    }

    public void setPrimaryMetro(String primaryMetro) {
        this.primaryMetro = primaryMetro;
    }

    public String getHqCity() {
        return hqCity;
    }

    public void setHqCity(String hqCity) {
        this.hqCity = hqCity;
    }

    public String getHqState() {
        return hqState;
    }

    public void setHqState(String hqState) {
        this.hqState = hqState;
    }

    public SizeBand getSizeBand() {
        return sizeBand;
    }

    public void setSizeBand(SizeBand sizeBand) {
        this.sizeBand = sizeBand;
    }

    public OwnershipStyle getOwnershipStyle() {
        return ownershipStyle;
    }

    public void setOwnershipStyle(OwnershipStyle ownershipStyle) {
        this.ownershipStyle = ownershipStyle;
    }

    public DocumentationMaturity getDocumentationMaturity() {
        return documentationMaturity;
    }

    public void setDocumentationMaturity(DocumentationMaturity documentationMaturity) {
        this.documentationMaturity = documentationMaturity;
    }

    public int getAxis1FitScore() {
        return axis1FitScore;
    }

    public void setAxis1FitScore(int axis1FitScore) {
        this.axis1FitScore = axis1FitScore;
    }

    public int getAxis2FitScore() {
        return axis2FitScore;
    }

    public void setAxis2FitScore(int axis2FitScore) {
        this.axis2FitScore = axis2FitScore;
    }

    public VendorStatus getStatus() {
        return status;
    }

    public void setStatus(VendorStatus status) {
        this.status = status;
    }

    public String getBrandNotes() {
        return brandNotes;
    }

    public void setBrandNotes(String brandNotes) {
        this.brandNotes = brandNotes;
    }

    public String getServiceSummary() {
        return serviceSummary;
    }

    public void setServiceSummary(String serviceSummary) {
        this.serviceSummary = serviceSummary;
    }

    public String getSpecialties() {
        return specialties;
    }

    public void setSpecialties(String specialties) {
        this.specialties = specialties;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
