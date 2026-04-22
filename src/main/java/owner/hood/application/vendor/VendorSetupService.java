package owner.hood.application.vendor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import owner.hood.domain.vendor.DocumentationMaturity;
import owner.hood.domain.vendor.OwnershipStyle;
import owner.hood.domain.vendor.SizeBand;
import owner.hood.domain.vendor.VendorOrganization;
import owner.hood.domain.vendor.VendorSetupProfile;
import owner.hood.domain.vendor.VendorStatus;
import owner.hood.infrastructure.persistence.VendorOrganizationRepository;
import owner.hood.infrastructure.persistence.VendorSetupProfileRepository;

import java.util.List;
import java.util.UUID;

@Service
public class VendorSetupService {

    private final VendorOrganizationRepository vendorOrganizationRepository;
    private final VendorSetupProfileRepository vendorSetupProfileRepository;

    public VendorSetupService(
            VendorOrganizationRepository vendorOrganizationRepository,
            VendorSetupProfileRepository vendorSetupProfileRepository
    ) {
        this.vendorOrganizationRepository = vendorOrganizationRepository;
        this.vendorSetupProfileRepository = vendorSetupProfileRepository;
    }

    public List<VendorOrganization> listVendors() {
        return vendorOrganizationRepository.findAllByOrderByCreatedAtDesc();
    }

    public VendorOrganization getVendor(UUID vendorId) {
        return vendorOrganizationRepository.findById(vendorId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found: " + vendorId));
    }

    public VendorSetupProfile getSetupProfile(UUID vendorId) {
        return vendorSetupProfileRepository.findByVendorId(vendorId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor setup profile not found: " + vendorId));
    }

    @Transactional
    public UUID createVendor(VendorSetupForm form) {
        VendorOrganization vendor = new VendorOrganization();
        vendor.setDisplayName(form.getDisplayName());
        vendor.setLegalName(form.getLegalName());
        vendor.setWebsiteUrl(form.getWebsiteUrl());
        vendor.setPrimaryMetro(form.getPrimaryMetro());
        vendor.setHqCity(form.getHqCity());
        vendor.setHqState(form.getHqState());
        vendor.setSizeBand(SizeBand.SMALL_OFFICE);
        vendor.setOwnershipStyle(OwnershipStyle.OWNER_LED);
        vendor.setDocumentationMaturity(DocumentationMaturity.LOW);
        vendor.setAxis1FitScore(85);
        vendor.setAxis2FitScore(72);
        vendor.setStatus(VendorStatus.PROSPECT);
        vendor.setServiceSummary(form.getServiceOfferings());
        vendor.setNotes("Created from hood internal vendor setup flow.");
        vendorOrganizationRepository.save(vendor);

        VendorSetupProfile setupProfile = new VendorSetupProfile();
        setupProfile.setVendor(vendor);
        setupProfile.setBrandName(form.getDisplayName());
        setupProfile.setPrimaryContactName(form.getPrimaryContactName());
        setupProfile.setPrimaryContactTitle(form.getPrimaryContactTitle());
        setupProfile.setReplyEmail(form.getReplyEmail());
        setupProfile.setPhone(form.getPhone());
        setupProfile.setServiceAreaText(form.getServiceAreaText());
        setupProfile.setServiceOfferings(form.getServiceOfferings());
        setupProfile.setEmergencyAvailabilityText(form.getEmergencyAvailabilityText());
        setupProfile.setCtaText(form.getCtaText());
        setupProfile.setSignatureBlock(form.getPrimaryContactName());
        setupProfile.setCertificationsBlurb(form.getCertificationsBlurb());
        setupProfile.setInsuranceBlurb(form.getInsuranceBlurb());
        setupProfile.setBrandColorHex("#f97316");
        vendorSetupProfileRepository.save(setupProfile);
        return vendor.getId();
    }
}
