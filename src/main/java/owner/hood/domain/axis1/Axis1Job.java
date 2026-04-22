package owner.hood.domain.axis1;

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

import java.time.LocalDate;

@Entity
@Table(name = "axis1_jobs")
public class Axis1Job extends AbstractAuditedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vendor_id", nullable = false)
    private VendorOrganization vendor;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "site_name", nullable = false)
    private String siteName;

    @Column(name = "site_address", nullable = false)
    private String siteAddress;

    @Column(name = "service_date", nullable = false)
    private LocalDate serviceDate;

    @Column(name = "crew_label")
    private String crewLabel;

    @Column(name = "service_summary", nullable = false)
    private String serviceSummary;

    @Column(name = "next_recommended_service_date")
    private LocalDate nextRecommendedServiceDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "customer_visible_status", nullable = false)
    private CustomerVisibleStatus customerVisibleStatus;

    public VendorOrganization getVendor() {
        return vendor;
    }

    public void setVendor(VendorOrganization vendor) {
        this.vendor = vendor;
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

    public CustomerVisibleStatus getCustomerVisibleStatus() {
        return customerVisibleStatus;
    }

    public void setCustomerVisibleStatus(CustomerVisibleStatus customerVisibleStatus) {
        this.customerVisibleStatus = customerVisibleStatus;
    }
}
