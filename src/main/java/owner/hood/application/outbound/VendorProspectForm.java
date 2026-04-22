package owner.hood.application.outbound;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class VendorProspectForm {

    @NotBlank
    private String displayName;

    private String websiteUrl;

    @NotBlank
    private String primaryMetro;

    @NotBlank
    private String metroScope;

    @NotBlank
    @Size(max = 1000)
    private String serviceAreaText;

    @NotBlank
    private String serviceAreaOverlapStatus = "ACTIVE_OVERLAP";

    @NotBlank
    private String sizeBand = "SMALL_OFFICE";

    @NotBlank
    private String ownershipStyle = "OWNER_LED";

    @NotBlank
    private String documentationMaturity = "LOW";

    @NotBlank
    private String segmentationLabel = "owner-led";

    @NotBlank
    private String primaryOfferAxis = "AXIS_2";

    @Min(0)
    @Max(100)
    private int axis1AngleFit = 70;

    @Min(0)
    @Max(100)
    private int axis2AngleFit = 85;

    @NotBlank
    private String ownerContactStatus = "GENERIC";

    @NotBlank
    private String sourceUrl;

    private String notes;

    private String contactName;

    private String roleTitle;

    private String email;

    private String phone;

    @Min(0)
    @Max(100)
    private int contactConfidence = 60;

    private String contactSourceUrl;

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

    public String getSizeBand() {
        return sizeBand;
    }

    public void setSizeBand(String sizeBand) {
        this.sizeBand = sizeBand;
    }

    public String getOwnershipStyle() {
        return ownershipStyle;
    }

    public void setOwnershipStyle(String ownershipStyle) {
        this.ownershipStyle = ownershipStyle;
    }

    public String getDocumentationMaturity() {
        return documentationMaturity;
    }

    public void setDocumentationMaturity(String documentationMaturity) {
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

    public String getOwnerContactStatus() {
        return ownerContactStatus;
    }

    public void setOwnerContactStatus(String ownerContactStatus) {
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
}
