package owner.hood.application.axis1;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import owner.hood.application.delivery.DeliveryRecordService;
import owner.hood.domain.axis1.Axis1BriefRender;
import owner.hood.domain.axis1.Axis1Finding;
import owner.hood.domain.axis1.Axis1Job;
import owner.hood.domain.axis1.CustomerVisibleStatus;
import owner.hood.domain.axis1.FindingType;
import owner.hood.domain.axis1.RenderStatus;
import owner.hood.domain.axis1.Severity;
import owner.hood.domain.vendor.VendorOrganization;
import owner.hood.domain.vendor.VendorSetupProfile;
import owner.hood.infrastructure.persistence.Axis1BriefRenderRepository;
import owner.hood.infrastructure.persistence.Axis1FindingRepository;
import owner.hood.infrastructure.persistence.Axis1JobRepository;
import owner.hood.infrastructure.persistence.VendorOrganizationRepository;
import owner.hood.infrastructure.persistence.VendorSetupProfileRepository;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
public class Axis1JobService {

    private final VendorOrganizationRepository vendorOrganizationRepository;
    private final VendorSetupProfileRepository vendorSetupProfileRepository;
    private final Axis1JobRepository axis1JobRepository;
    private final Axis1FindingRepository axis1FindingRepository;
    private final Axis1BriefRenderRepository axis1BriefRenderRepository;
    private final DeliveryRecordService deliveryRecordService;

    public Axis1JobService(
            VendorOrganizationRepository vendorOrganizationRepository,
            VendorSetupProfileRepository vendorSetupProfileRepository,
            Axis1JobRepository axis1JobRepository,
            Axis1FindingRepository axis1FindingRepository,
            Axis1BriefRenderRepository axis1BriefRenderRepository,
            DeliveryRecordService deliveryRecordService
    ) {
        this.vendorOrganizationRepository = vendorOrganizationRepository;
        this.vendorSetupProfileRepository = vendorSetupProfileRepository;
        this.axis1JobRepository = axis1JobRepository;
        this.axis1FindingRepository = axis1FindingRepository;
        this.axis1BriefRenderRepository = axis1BriefRenderRepository;
        this.deliveryRecordService = deliveryRecordService;
    }

    @Transactional
    public String createJobAndRender(Axis1JobForm form) {
        VendorOrganization vendor = vendorOrganizationRepository.findById(form.getVendorId())
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found: " + form.getVendorId()));
        Axis1Job job = new Axis1Job();
        job.setVendor(vendor);
        job.setCustomerName(form.getCustomerName());
        job.setSiteName(form.getSiteName());
        job.setSiteAddress(form.getSiteAddress());
        job.setServiceDate(form.getServiceDate());
        job.setCrewLabel(form.getCrewLabel());
        job.setServiceSummary(form.getServiceSummary());
        job.setNextRecommendedServiceDate(form.getNextRecommendedServiceDate());
        job.setCustomerVisibleStatus(CustomerVisibleStatus.READY_TO_RENDER);
        axis1JobRepository.save(job);

        if (form.getFindingSummary() != null && !form.getFindingSummary().isBlank()) {
            Axis1Finding finding = new Axis1Finding();
            finding.setJob(job);
            finding.setFindingType(FindingType.DEFICIENCY);
            finding.setSeverity(Severity.valueOf(form.getFindingSeverity().toUpperCase(Locale.ROOT)));
            finding.setCustomerVisible(true);
            finding.setSummary(form.getFindingSummary());
            finding.setRecommendedAction(form.getRecommendedAction());
            finding.setRequiresFollowup(true);
            axis1FindingRepository.save(finding);
        }

        Axis1BriefRender render = new Axis1BriefRender();
        render.setJob(job);
        render.setRenderVersion("v1");
        render.setDeliveryToken(UUID.randomUUID().toString().replace("-", ""));
        render.setRenderStatus(RenderStatus.READY);
        render.setHtmlPath("/deliver/axis-1/" + render.getDeliveryToken());
        render.setPdfPath("/deliver/packet/" + render.getDeliveryToken() + "/pdf");
        axis1BriefRenderRepository.save(render);
        deliveryRecordService.recordReadyDelivery(
                vendor.getId(),
                "AXIS_1",
                "SERVICE_COMPLETION_BRIEF",
                "TOKEN_LINK",
                vendorSetupProfileRepository.findByVendorId(vendor.getId())
                        .map(VendorSetupProfile::getReplyEmail)
                        .orElse(null)
        );
        return render.getDeliveryToken();
    }

    @Transactional(readOnly = true)
    public Axis1BriefView loadBrief(String token) {
        return findBrief(token)
                .orElseThrow(() -> new IllegalArgumentException("Axis 1 render not found: " + token));
    }

    @Transactional(readOnly = true)
    public Optional<Axis1BriefView> findBrief(String token) {
        Axis1BriefRender render = axis1BriefRenderRepository.findByDeliveryToken(token)
                .orElse(null);
        if (render == null) {
            return Optional.empty();
        }

        Axis1Job job = render.getJob();
        VendorOrganization vendor = job.getVendor();
        VendorSetupProfile setupProfile = vendorSetupProfileRepository.findByVendorId(vendor.getId())
                .orElseThrow(() -> new IllegalArgumentException("Vendor setup profile not found: " + vendor.getId()));

        List<Axis1BriefFindingView> findings = axis1FindingRepository.findByJobIdOrderByCreatedAtAsc(job.getId())
                .stream()
                .map(finding -> new Axis1BriefFindingView(
                        finding.getSeverity().name(),
                        finding.getSummary(),
                        finding.getRecommendedAction()
                ))
                .toList();

        return Optional.of(new Axis1BriefView(
                token,
                setupProfile.getBrandName(),
                setupProfile.getPrimaryContactName(),
                setupProfile.getReplyEmail(),
                setupProfile.getPhone(),
                setupProfile.getServiceAreaText(),
                setupProfile.getServiceOfferings(),
                setupProfile.getCtaText(),
                setupProfile.getCertificationsBlurb(),
                setupProfile.getInsuranceBlurb(),
                job.getCustomerName(),
                job.getSiteName(),
                job.getSiteAddress(),
                job.getServiceDate(),
                job.getCrewLabel(),
                job.getServiceSummary(),
                job.getNextRecommendedServiceDate(),
                findings
        ));
    }
}
