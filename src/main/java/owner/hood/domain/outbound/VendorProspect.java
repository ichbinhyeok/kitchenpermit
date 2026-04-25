package owner.hood.domain.outbound;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import owner.hood.domain.shared.AbstractAuditedEntity;
import owner.hood.domain.vendor.DocumentationMaturity;
import owner.hood.domain.vendor.OwnershipStyle;
import owner.hood.domain.vendor.SizeBand;

@Entity
@Table(name = "vendor_prospects")
public class VendorProspect extends AbstractAuditedEntity {

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(name = "website_url")
    private String websiteUrl;

    @Column(name = "primary_metro", nullable = false)
    private String primaryMetro;

    @Column(name = "metro_scope", nullable = false)
    private String metroScope;

    @Column(name = "service_area_text", nullable = false)
    private String serviceAreaText;

    @Column(name = "service_area_overlap_status", nullable = false)
    private String serviceAreaOverlapStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "size_band", nullable = false)
    private SizeBand sizeBand;

    @Enumerated(EnumType.STRING)
    @Column(name = "ownership_style", nullable = false)
    private OwnershipStyle ownershipStyle;

    @Enumerated(EnumType.STRING)
    @Column(name = "documentation_maturity", nullable = false)
    private DocumentationMaturity documentationMaturity;

    @Column(name = "segmentation_label", nullable = false)
    private String segmentationLabel;

    @Column(name = "primary_offer_axis", nullable = false)
    private String primaryOfferAxis;

    @Column(name = "axis1_angle_fit", nullable = false)
    private int axis1AngleFit;

    @Column(name = "axis2_angle_fit", nullable = false)
    private int axis2AngleFit;

    @Enumerated(EnumType.STRING)
    @Column(name = "owner_contact_status", nullable = false)
    private OwnerContactStatus ownerContactStatus;

    @Column(name = "source_url", nullable = false)
    private String sourceUrl;

    @Column(name = "notes")
    private String notes;

    @Column(name = "contact_name")
    private String contactName;

    @Column(name = "role_title")
    private String roleTitle;

    @Column(name = "email")
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "contact_confidence", nullable = false)
    private int contactConfidence;

    @Column(name = "contact_source_url")
    private String contactSourceUrl;

    @Column(name = "vendor_fit_score", nullable = false)
    private int vendorFitScore;

    @Column(name = "prospect_fit_score", nullable = false)
    private int prospectFitScore;

    @Column(name = "export_readiness_score", nullable = false)
    private int exportReadinessScore;

    @Column(name = "legitimacy_score", nullable = false)
    private int legitimacyScore;

    @Column(name = "vendor_quality_tier", nullable = false)
    private String vendorQualityTier;

    @Column(name = "source_channel", nullable = false)
    private String sourceChannel;

    @Column(name = "send_priority", nullable = false)
    private String sendPriority;

    @Enumerated(EnumType.STRING)
    @Column(name = "prospect_status", nullable = false)
    private ProspectStatus prospectStatus;

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
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

    public String getMetroScope() {
        return metroScope;
    }

    public void setMetroScope(String metroScope) {
        this.metroScope = metroScope;
    }

    public String getServiceAreaText() {
        return serviceAreaText;
    }

    public void setServiceAreaText(String serviceAreaText) {
        this.serviceAreaText = serviceAreaText;
    }

    public String getServiceAreaOverlapStatus() {
        return serviceAreaOverlapStatus;
    }

    public void setServiceAreaOverlapStatus(String serviceAreaOverlapStatus) {
        this.serviceAreaOverlapStatus = serviceAreaOverlapStatus;
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

    public String getSegmentationLabel() {
        return segmentationLabel;
    }

    public void setSegmentationLabel(String segmentationLabel) {
        this.segmentationLabel = segmentationLabel;
    }

    public String getPrimaryOfferAxis() {
        return primaryOfferAxis;
    }

    public void setPrimaryOfferAxis(String primaryOfferAxis) {
        this.primaryOfferAxis = primaryOfferAxis;
    }

    public int getAxis1AngleFit() {
        return axis1AngleFit;
    }

    public void setAxis1AngleFit(int axis1AngleFit) {
        this.axis1AngleFit = axis1AngleFit;
    }

    public int getAxis2AngleFit() {
        return axis2AngleFit;
    }

    public void setAxis2AngleFit(int axis2AngleFit) {
        this.axis2AngleFit = axis2AngleFit;
    }

    public OwnerContactStatus getOwnerContactStatus() {
        return ownerContactStatus;
    }

    public void setOwnerContactStatus(OwnerContactStatus ownerContactStatus) {
        this.ownerContactStatus = ownerContactStatus;
    }

    public String getSourceUrl() {
        return sourceUrl;
    }

    public void setSourceUrl(String sourceUrl) {
        this.sourceUrl = sourceUrl;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
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

    public int getContactConfidence() {
        return contactConfidence;
    }

    public void setContactConfidence(int contactConfidence) {
        this.contactConfidence = contactConfidence;
    }

    public String getContactSourceUrl() {
        return contactSourceUrl;
    }

    public void setContactSourceUrl(String contactSourceUrl) {
        this.contactSourceUrl = contactSourceUrl;
    }

    public int getVendorFitScore() {
        return vendorFitScore;
    }

    public void setVendorFitScore(int vendorFitScore) {
        this.vendorFitScore = vendorFitScore;
    }

    public int getProspectFitScore() {
        return prospectFitScore;
    }

    public void setProspectFitScore(int prospectFitScore) {
        this.prospectFitScore = prospectFitScore;
    }

    public int getExportReadinessScore() {
        return exportReadinessScore;
    }

    public void setExportReadinessScore(int exportReadinessScore) {
        this.exportReadinessScore = exportReadinessScore;
    }

    public int getLegitimacyScore() {
        return legitimacyScore;
    }

    public void setLegitimacyScore(int legitimacyScore) {
        this.legitimacyScore = legitimacyScore;
    }

    public String getVendorQualityTier() {
        return vendorQualityTier;
    }

    public void setVendorQualityTier(String vendorQualityTier) {
        this.vendorQualityTier = vendorQualityTier;
    }

    public String getSourceChannel() {
        return sourceChannel;
    }

    public void setSourceChannel(String sourceChannel) {
        this.sourceChannel = sourceChannel;
    }

    public String getSendPriority() {
        return sendPriority;
    }

    public void setSendPriority(String sendPriority) {
        this.sendPriority = sendPriority;
    }

    public ProspectStatus getProspectStatus() {
        return prospectStatus;
    }

    public void setProspectStatus(ProspectStatus prospectStatus) {
        this.prospectStatus = prospectStatus;
    }
}
