package owner.hood.application.outbound;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import owner.hood.domain.outbound.CampaignStage;
import owner.hood.domain.outbound.OutboundCampaign;
import owner.hood.domain.outbound.OutboundResultSnapshot;
import owner.hood.domain.outbound.OwnerContactStatus;
import owner.hood.domain.outbound.ProspectStatus;
import owner.hood.domain.outbound.VendorProspect;
import owner.hood.domain.vendor.DocumentationMaturity;
import owner.hood.domain.vendor.OwnershipStyle;
import owner.hood.domain.vendor.SizeBand;
import owner.hood.infrastructure.persistence.OutboundCampaignRepository;
import owner.hood.infrastructure.persistence.OutboundResultSnapshotRepository;
import owner.hood.infrastructure.persistence.VendorProspectRepository;

import java.nio.charset.StandardCharsets;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class OutboundOpsService {

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("MMM d", Locale.US);

    private final VendorProspectRepository vendorProspectRepository;
    private final OutboundCampaignRepository outboundCampaignRepository;
    private final OutboundResultSnapshotRepository outboundResultSnapshotRepository;

    public OutboundOpsService(
            VendorProspectRepository vendorProspectRepository,
            OutboundCampaignRepository outboundCampaignRepository,
            OutboundResultSnapshotRepository outboundResultSnapshotRepository
    ) {
        this.vendorProspectRepository = vendorProspectRepository;
        this.outboundCampaignRepository = outboundCampaignRepository;
        this.outboundResultSnapshotRepository = outboundResultSnapshotRepository;
    }

    @Transactional
    public UUID createProspect(VendorProspectForm form) {
        VendorProspect prospect = new VendorProspect();
        prospect.setDisplayName(form.getDisplayName());
        prospect.setWebsiteUrl(form.getWebsiteUrl());
        prospect.setPrimaryMetro(form.getPrimaryMetro());
        prospect.setMetroScope(form.getMetroScope());
        prospect.setServiceAreaText(form.getServiceAreaText());
        prospect.setServiceAreaOverlapStatus(form.getServiceAreaOverlapStatus());
        prospect.setSizeBand(SizeBand.valueOf(form.getSizeBand().toUpperCase(Locale.ROOT)));
        prospect.setOwnershipStyle(OwnershipStyle.valueOf(form.getOwnershipStyle().toUpperCase(Locale.ROOT)));
        prospect.setDocumentationMaturity(DocumentationMaturity.valueOf(form.getDocumentationMaturity().toUpperCase(Locale.ROOT)));
        prospect.setSegmentationLabel(form.getSegmentationLabel());
        prospect.setPrimaryOfferAxis(form.getPrimaryOfferAxis());
        prospect.setAxis1AngleFit(form.getAxis1AngleFit());
        prospect.setAxis2AngleFit(form.getAxis2AngleFit());
        prospect.setOwnerContactStatus(OwnerContactStatus.valueOf(form.getOwnerContactStatus().toUpperCase(Locale.ROOT)));
        prospect.setSourceUrl(form.getSourceUrl());
        prospect.setNotes(form.getNotes());
        prospect.setContactName(form.getContactName());
        prospect.setRoleTitle(form.getRoleTitle());
        prospect.setEmail(form.getEmail());
        prospect.setPhone(form.getPhone());
        prospect.setContactConfidence(form.getContactConfidence());
        prospect.setContactSourceUrl(form.getContactSourceUrl());
        prospect.setProspectStatus(ProspectStatus.ACTIVE);
        vendorProspectRepository.save(prospect);
        return prospect.getId();
    }

    @Transactional(readOnly = true)
    public List<VendorProspect> listProspects() {
        return vendorProspectRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public UUID createCampaign(OutboundCampaignForm form) {
        VendorProspect prospect = vendorProspectRepository.findById(form.getVendorProspectId())
                .orElseThrow(() -> new IllegalArgumentException("Vendor prospect not found: " + form.getVendorProspectId()));

        OutboundCampaign campaign = new OutboundCampaign();
        campaign.setVendorProspect(prospect);
        campaign.setPrimaryOfferAxis(resolveOfferAxis(
                form.getPrimaryOfferAxis() == null || form.getPrimaryOfferAxis().isBlank()
                        ? prospect.getPrimaryOfferAxis()
                        : form.getPrimaryOfferAxis(),
                prospect.getServiceAreaOverlapStatus()
        ));
        campaign.setExecutionProvider("Smartlead");
        campaign.setProviderCampaignId(form.getProviderCampaignId());
        campaign.setCampaignStage(CampaignStage.valueOf(form.getCampaignStage().toUpperCase(Locale.ROOT)));
        outboundCampaignRepository.save(campaign);
        return campaign.getId();
    }

    @Transactional
    public void recordSnapshot(UUID campaignId, OutboundResultSnapshotForm form) {
        OutboundCampaign campaign = outboundCampaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found: " + campaignId));

        OutboundResultSnapshot snapshot = new OutboundResultSnapshot();
        snapshot.setCampaign(campaign);
        snapshot.setAnalysisWindowStart(form.getAnalysisWindowStart().atStartOfDay().toInstant(ZoneOffset.UTC));
        snapshot.setAnalysisWindowEnd(form.getAnalysisWindowEnd().plusDays(1).atStartOfDay().minusSeconds(1).toInstant(ZoneOffset.UTC));
        snapshot.setTotalSent(form.getTotalSent());
        snapshot.setDeliveredCount(form.getDeliveredCount());
        snapshot.setBouncedCount(form.getBouncedCount());
        snapshot.setPositiveReplyCount(form.getPositiveReplyCount());
        snapshot.setNeutralReplyCount(form.getNeutralReplyCount());
        snapshot.setNegativeReplyCount(form.getNegativeReplyCount());
        snapshot.setSampleRequestCount(form.getSampleRequestCount());
        snapshot.setPaidBatchOrderCount(form.getPaidBatchOrderCount());
        outboundResultSnapshotRepository.save(snapshot);
    }

    @Transactional(readOnly = true)
    public List<OutboundCampaignSummaryView> listCampaignSummaries() {
        return outboundCampaignRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(campaign -> {
                    OutboundResultSnapshot snapshot = outboundResultSnapshotRepository
                            .findFirstByCampaignIdOrderByAnalysisWindowEndDesc(campaign.getId())
                            .orElse(null);
                    return new OutboundCampaignSummaryView(
                            campaign.getId().toString(),
                            campaign.getVendorProspect().getDisplayName(),
                            campaign.getPrimaryOfferAxis(),
                            campaign.getCampaignStage().name(),
                            campaign.getProviderCampaignId(),
                            snapshot == null ? "No result snapshot yet" : buildWindowLabel(snapshot),
                            snapshot == null ? 0 : snapshot.getTotalSent(),
                            snapshot == null ? 0 : snapshot.getDeliveredCount(),
                            snapshot == null ? 0 : snapshot.getBouncedCount(),
                            snapshot == null ? 0 : snapshot.getPositiveReplyCount(),
                            snapshot == null ? 0 : snapshot.getSampleRequestCount(),
                            snapshot == null ? 0 : snapshot.getPaidBatchOrderCount()
                    );
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OutboundPerformanceRowView> anglePerformance() {
        return aggregateByDimension(campaign -> campaign.getPrimaryOfferAxis());
    }

    @Transactional(readOnly = true)
    public List<OutboundPerformanceRowView> metroPerformance() {
        return aggregateByDimension(campaign -> campaign.getVendorProspect().getPrimaryMetro());
    }

    @Transactional(readOnly = true)
    public List<OutboundPerformanceRowView> segmentPerformance() {
        return aggregateByDimension(campaign -> campaign.getVendorProspect().getSegmentationLabel());
    }

    @Transactional(readOnly = true)
    public byte[] exportProspectsCsv() {
        StringBuilder csv = new StringBuilder();
        csv.append("display_name,website_url,primary_metro,metro_scope,service_area_text,service_area_overlap_status,size_band,ownership_style,documentation_maturity,segmentation_label,primary_offer_axis,axis1_angle_fit,axis2_angle_fit,owner_contact_status,source_url,contact_name,role_title,email,phone,contact_confidence,contact_source_url,notes\n");
        for (VendorProspect prospect : vendorProspectRepository.findAllByOrderByCreatedAtDesc()) {
            csv.append(csvCell(prospect.getDisplayName())).append(',')
                    .append(csvCell(prospect.getWebsiteUrl())).append(',')
                    .append(csvCell(prospect.getPrimaryMetro())).append(',')
                    .append(csvCell(prospect.getMetroScope())).append(',')
                    .append(csvCell(prospect.getServiceAreaText())).append(',')
                    .append(csvCell(prospect.getServiceAreaOverlapStatus())).append(',')
                    .append(csvCell(prospect.getSizeBand().name())).append(',')
                    .append(csvCell(prospect.getOwnershipStyle().name())).append(',')
                    .append(csvCell(prospect.getDocumentationMaturity().name())).append(',')
                    .append(csvCell(prospect.getSegmentationLabel())).append(',')
                    .append(csvCell(prospect.getPrimaryOfferAxis())).append(',')
                    .append(prospect.getAxis1AngleFit()).append(',')
                    .append(prospect.getAxis2AngleFit()).append(',')
                    .append(csvCell(prospect.getOwnerContactStatus().name())).append(',')
                    .append(csvCell(prospect.getSourceUrl())).append(',')
                    .append(csvCell(prospect.getContactName())).append(',')
                    .append(csvCell(prospect.getRoleTitle())).append(',')
                    .append(csvCell(prospect.getEmail())).append(',')
                    .append(csvCell(prospect.getPhone())).append(',')
                    .append(prospect.getContactConfidence()).append(',')
                    .append(csvCell(prospect.getContactSourceUrl())).append(',')
                    .append(csvCell(prospect.getNotes()))
                    .append('\n');
        }
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private List<OutboundPerformanceRowView> aggregateByDimension(java.util.function.Function<OutboundCampaign, String> labelExtractor) {
        Map<String, MutableAggregate> aggregates = new LinkedHashMap<>();
        for (OutboundCampaign campaign : outboundCampaignRepository.findAllByOrderByCreatedAtDesc()) {
            String label = labelExtractor.apply(campaign);
            OutboundResultSnapshot snapshot = outboundResultSnapshotRepository
                    .findFirstByCampaignIdOrderByAnalysisWindowEndDesc(campaign.getId())
                    .orElse(null);
            MutableAggregate aggregate = aggregates.computeIfAbsent(label == null || label.isBlank() ? "UNSET" : label, ignored -> new MutableAggregate());
            aggregate.campaignCount++;
            if (snapshot != null) {
                aggregate.totalSent += snapshot.getTotalSent();
                aggregate.positiveReplyCount += snapshot.getPositiveReplyCount();
                aggregate.paidBatchOrderCount += snapshot.getPaidBatchOrderCount();
            }
        }
        return aggregates.entrySet().stream()
                .map(entry -> new OutboundPerformanceRowView(
                        entry.getKey(),
                        entry.getValue().campaignCount,
                        entry.getValue().totalSent,
                        entry.getValue().positiveReplyCount,
                        entry.getValue().paidBatchOrderCount
                ))
                .sorted(Comparator.comparingInt(OutboundPerformanceRowView::totalSent).reversed()
                        .thenComparing(OutboundPerformanceRowView::label))
                .toList();
    }

    private String buildWindowLabel(OutboundResultSnapshot snapshot) {
        return DATE_FORMATTER.format(snapshot.getAnalysisWindowStart().atZone(ZoneOffset.UTC))
                + " - "
                + DATE_FORMATTER.format(snapshot.getAnalysisWindowEnd().atZone(ZoneOffset.UTC));
    }

    private String resolveOfferAxis(String requestedAxis, String serviceAreaOverlapStatus) {
        String normalizedAxis = requestedAxis == null || requestedAxis.isBlank()
                ? "AXIS_1"
                : requestedAxis.trim().toUpperCase(Locale.ROOT);

        if ("AXIS_2".equals(normalizedAxis) && !hasActiveCoverageOverlap(serviceAreaOverlapStatus)) {
            return "AXIS_1";
        }
        return normalizedAxis;
    }

    private boolean hasActiveCoverageOverlap(String serviceAreaOverlapStatus) {
        if (serviceAreaOverlapStatus == null || serviceAreaOverlapStatus.isBlank()) {
            return false;
        }
        String normalized = serviceAreaOverlapStatus.toUpperCase(Locale.ROOT);
        if (normalized.contains("NO_ACTIVE") || normalized.contains("INACTIVE")) {
            return false;
        }
        return normalized.contains("ACTIVE");
    }

    private String csvCell(String value) {
        if (value == null) {
            return "";
        }
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }

    private static final class MutableAggregate {
        private int campaignCount;
        private int totalSent;
        private int positiveReplyCount;
        private int paidBatchOrderCount;
    }
}
