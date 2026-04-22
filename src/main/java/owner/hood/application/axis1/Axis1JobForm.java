package owner.hood.application.axis1;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public class Axis1JobForm {

    @NotNull
    private UUID vendorId;

    @NotBlank
    private String customerName;

    @NotBlank
    private String siteName;

    @NotBlank
    private String siteAddress;

    @NotNull
    private LocalDate serviceDate;

    private String crewLabel;

    @NotBlank
    private String serviceSummary;

    private LocalDate nextRecommendedServiceDate;

    private String findingSummary;

    private String recommendedAction;

    private String findingSeverity = "MEDIUM";

    public UUID getVendorId() {
        return vendorId;
    }

    public void setVendorId(UUID vendorId) {
        this.vendorId = vendorId;
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

    public String getSiteAddress() {
        return siteAddress;
    }

    public void setSiteAddress(String siteAddress) {
        this.siteAddress = siteAddress;
    }

    public LocalDate getServiceDate() {
        return serviceDate;
    }

    public void setServiceDate(LocalDate serviceDate) {
        this.serviceDate = serviceDate;
    }

    public String getCrewLabel() {
        return crewLabel;
    }

    public void setCrewLabel(String crewLabel) {
        this.crewLabel = crewLabel;
    }

    public String getServiceSummary() {
        return serviceSummary;
    }

    public void setServiceSummary(String serviceSummary) {
        this.serviceSummary = serviceSummary;
    }

    public LocalDate getNextRecommendedServiceDate() {
        return nextRecommendedServiceDate;
    }

    public void setNextRecommendedServiceDate(LocalDate nextRecommendedServiceDate) {
        this.nextRecommendedServiceDate = nextRecommendedServiceDate;
    }

    public String getFindingSummary() {
        return findingSummary;
    }

    public void setFindingSummary(String findingSummary) {
        this.findingSummary = findingSummary;
    }

    public String getRecommendedAction() {
        return recommendedAction;
    }

    public void setRecommendedAction(String recommendedAction) {
        this.recommendedAction = recommendedAction;
    }

    public String getFindingSeverity() {
        return findingSeverity;
    }

    public void setFindingSeverity(String findingSeverity) {
        this.findingSeverity = findingSeverity;
    }
}
