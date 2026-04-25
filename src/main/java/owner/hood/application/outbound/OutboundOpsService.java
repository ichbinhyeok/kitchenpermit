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
    private static final String SOURCE_OFFICIAL_SITE = "OFFICIAL_SITE";
    private static final String SOURCE_GOOGLE_MAPS = "GOOGLE_MAPS";
    private static final String SOURCE_SOCIAL_PROFILE = "SOCIAL_PROFILE";
    private static final String SOURCE_REVIEW_PLATFORM = "REVIEW_PLATFORM";
    private static final String SOURCE_BUSINESS_DIRECTORY = "BUSINESS_DIRECTORY";
    private static final String SOURCE_GOVERNMENT_LISTING = "GOVERNMENT_LISTING";
    private static final String SOURCE_OTHER_PUBLIC = "OTHER_PUBLIC";

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
        int prospectFitScore = Math.max(form.getAxis1AngleFit(), form.getAxis2AngleFit());
        prospect.setVendorFitScore(prospectFitScore);
        prospect.setProspectFitScore(prospectFitScore);
        String sourceChannel = detectSourceChannel(form.getWebsiteUrl(), form.getSourceUrl());
        prospect.setSourceChannel(sourceChannel);
        int legitimacyScore = baseLegitimacyScore(
                sourceChannel,
                form.getPrimaryMetro(),
                form.getPhone(),
                form.getEmail()
        );
        prospect.setLegitimacyScore(legitimacyScore);
        ProspectStatus prospectStatus = hasUsableEmail(form.getEmail()) && form.getContactConfidence() >= 50
                ? ProspectStatus.ACTIVE
                : ProspectStatus.RESEARCH;
        prospect.setProspectStatus(prospectStatus);
        int exportReadinessScore = computeExportReadinessScore(
                prospectStatus,
                prospect.getContactConfidence(),
                legitimacyScore,
                sourceChannel,
                prospect.getEmail(),
                prospect.getPhone(),
                prospect.getContactSourceUrl(),
                prospect.getOwnerContactStatus()
        );
        prospect.setExportReadinessScore(exportReadinessScore);
        prospect.setVendorQualityTier(determineVendorQualityTier(
                prospectFitScore,
                exportReadinessScore,
                legitimacyScore,
                prospect.getOwnershipStyle(),
                prospect.getDocumentationMaturity(),
                prospect.getSizeBand(),
                prospect.getNotes()
        ));
        prospect.setSendPriority(determineSendPriority(
                prospectStatus,
                prospectFitScore,
                exportReadinessScore
        ));
        vendorProspectRepository.save(prospect);
        return prospect.getId();
    }

    @Transactional(readOnly = true)
    public List<VendorProspect> listProspects() {
        return vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .sorted(Comparator
                        .comparingInt((VendorProspect prospect) -> prospectStatusRank(prospect.getProspectStatus()))
                        .thenComparingInt((VendorProspect prospect) -> vendorQualityTierRank(prospect.getVendorQualityTier()))
                        .thenComparingInt((VendorProspect prospect) -> sendPriorityRank(prospect.getSendPriority()))
                        .thenComparing(Comparator.comparingInt(this::effectiveProspectFitScore).reversed())
                        .thenComparing(Comparator.comparingInt(this::effectiveExportReadinessScore).reversed())
                        .thenComparing(Comparator.comparingInt(VendorProspect::getLegitimacyScore).reversed())
                        .thenComparing(Comparator.comparingInt(VendorProspect::getContactConfidence).reversed())
                        .thenComparing(VendorProspect::getCreatedAt, Comparator.reverseOrder()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VendorProspect> listResearchBacklog() {
        return vendorProspectRepository.findAllByProspectStatusOrderByCreatedAtDesc(ProspectStatus.RESEARCH)
                .stream()
                .sorted(Comparator
                        .comparingInt((VendorProspect prospect) -> researchBacklogRank(prospect))
                        .thenComparingInt((VendorProspect prospect) -> vendorQualityTierRank(prospect.getVendorQualityTier()))
                        .thenComparing(Comparator.comparingInt(this::effectiveProspectFitScore).reversed())
                        .thenComparing(Comparator.comparingInt(this::effectiveExportReadinessScore).reversed())
                        .thenComparing(Comparator.comparingInt(VendorProspect::getLegitimacyScore).reversed())
                        .thenComparing(VendorProspect::getCreatedAt, Comparator.reverseOrder()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VendorProspect> listSendNowProspects() {
        return vendorProspectRepository.findAllByProspectStatusOrderByCreatedAtDesc(ProspectStatus.ACTIVE)
                .stream()
                .filter(this::isSendNowCandidate)
                .sorted(Comparator
                        .comparingInt((VendorProspect prospect) -> vendorQualityTierRank(prospect.getVendorQualityTier()))
                        .thenComparingInt((VendorProspect prospect) -> sendPriorityRank(prospect.getSendPriority()))
                        .thenComparing(Comparator.comparingInt(this::effectiveProspectFitScore).reversed())
                        .thenComparing(Comparator.comparingInt(this::effectiveExportReadinessScore).reversed())
                        .thenComparing(Comparator.comparingInt(VendorProspect::getLegitimacyScore).reversed())
                        .thenComparing(VendorProspect::getCreatedAt, Comparator.reverseOrder()))
                .toList();
    }

    @Transactional(readOnly = true)
    public VendorProspectQueueSummaryView queueSummary() {
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc();
        int sendNowCount = 0;
        int enrichFirstCount = 0;
        int reserveCount = 0;
        for (VendorProspect prospect : prospects) {
            if (isSendNowCandidate(prospect)) {
                sendNowCount++;
            } else if (isEnrichFirstCandidate(prospect)) {
                enrichFirstCount++;
            } else {
                reserveCount++;
            }
        }
        return new VendorProspectQueueSummaryView(sendNowCount, enrichFirstCount, reserveCount);
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
        return buildProspectsCsv(vendorProspectRepository.findAllByProspectStatusOrderByCreatedAtDesc(ProspectStatus.ACTIVE));
    }

    @Transactional(readOnly = true)
    public byte[] exportSendNowCsv() {
        return buildProspectsCsv(listSendNowProspects());
    }

    @Transactional(readOnly = true)
    public byte[] exportResearchBacklogCsv() {
        return buildProspectsCsv(listResearchBacklog());
    }

    private byte[] buildProspectsCsv(List<VendorProspect> prospects) {
        StringBuilder csv = new StringBuilder();
        csv.append("display_name,website_url,primary_metro,metro_scope,service_area_text,service_area_overlap_status,size_band,ownership_style,documentation_maturity,segmentation_label,primary_offer_axis,axis1_angle_fit,axis2_angle_fit,vendor_fit_score,prospect_fit_score,export_readiness_score,legitimacy_score,vendor_quality_tier,send_priority,source_channel,owner_contact_status,source_url,contact_name,role_title,email,phone,contact_confidence,contact_source_url,notes\n");
        for (VendorProspect prospect : prospects) {
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
                    .append(prospect.getVendorFitScore()).append(',')
                    .append(effectiveProspectFitScore(prospect)).append(',')
                    .append(effectiveExportReadinessScore(prospect)).append(',')
                    .append(prospect.getLegitimacyScore()).append(',')
                    .append(csvCell(defaultVendorQualityTier(prospect.getVendorQualityTier()))).append(',')
                    .append(csvCell(prospect.getSendPriority())).append(',')
                    .append(csvCell(prospect.getSourceChannel())).append(',')
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

    private int prospectStatusRank(ProspectStatus prospectStatus) {
        return prospectStatus == ProspectStatus.ACTIVE ? 0 : 1;
    }

    private int researchBacklogRank(VendorProspect prospect) {
        if (isEnrichFirstCandidate(prospect)) {
            return 0;
        }
        return 1;
    }

    private int sendPriorityRank(String sendPriority) {
        return switch (sendPriority == null ? "" : sendPriority) {
            case "P1" -> 0;
            case "P2" -> 1;
            case "P3" -> 2;
            default -> 3;
        };
    }

    private int vendorQualityTierRank(String vendorQualityTier) {
        return "A".equals(defaultVendorQualityTier(vendorQualityTier)) ? 0 : 1;
    }

    private boolean hasUsableEmail(String email) {
        return email != null && email.contains("@");
    }

    private String detectSourceChannel(String websiteUrl, String sourceUrl) {
        String websiteHost = host(websiteUrl);
        String sourceHost = host(sourceUrl);
        String normalizedSourceUrl = sourceUrl == null ? "" : sourceUrl.toLowerCase(Locale.ROOT);
        if (!websiteHost.isBlank() && websiteHost.equals(sourceHost)) {
            return SOURCE_OFFICIAL_SITE;
        }
        if (isGoogleMapsSource(sourceHost, normalizedSourceUrl)) {
            return SOURCE_GOOGLE_MAPS;
        }
        if (sourceHost.contains("facebook.com")
                || sourceHost.contains("instagram.com")
                || sourceHost.contains("about.me")
                || sourceHost.contains("linkedin.com")
                || sourceHost.contains("tiktok.com")) {
            return SOURCE_SOCIAL_PROFILE;
        }
        if (sourceHost.contains(".gov") || sourceHost.contains("nyc.gov")) {
            return SOURCE_GOVERNMENT_LISTING;
        }
        if (sourceHost.contains("yelp.com")
                || sourceHost.contains("bbb.org")
                || sourceHost.contains("angi.com")
                || sourceHost.contains("angieslist.com")
                || sourceHost.contains("thumbtack.com")
                || sourceHost.contains("homeadvisor.com")
                || sourceHost.contains("birdeye.com")
                || sourceHost.contains("nextdoor.com")) {
            return SOURCE_REVIEW_PLATFORM;
        }
        if (sourceHost.contains("localac.net")
                || sourceHost.contains("citysquares.com")
                || sourceHost.contains("provenexpert.com")
                || sourceHost.contains("brownbook.net")
                || sourceHost.contains("ezlocal.com")
                || sourceHost.contains("startus.cc")
                || sourceHost.contains("trustedpros.com")
                || sourceHost.contains("callupcontact.com")
                || sourceHost.contains("sosou.de")
                || sourceHost.contains("yellowpages.com")
                || sourceHost.contains("mapquest.com")
                || sourceHost.contains("manta.com")
                || sourceHost.contains("merchantcircle.com")
                || sourceHost.contains("chamberofcommerce.com")
                || sourceHost.contains("showmelocal.com")
                || sourceHost.contains("hotfrog.com")) {
            return SOURCE_BUSINESS_DIRECTORY;
        }
        return SOURCE_OTHER_PUBLIC;
    }

    private boolean isGoogleMapsSource(String sourceHost, String normalizedSourceUrl) {
        if (sourceHost.contains("maps.app.goo.gl") || sourceHost.equals("g.co")) {
            return true;
        }
        return sourceHost.contains("google.com")
                && (normalizedSourceUrl.contains("/maps/")
                || normalizedSourceUrl.contains("google.com/maps")
                || normalizedSourceUrl.contains("google.com/localservices"));
    }

    private int baseLegitimacyScore(
            String sourceChannel,
            String primaryMetro,
            String phone,
            String email
    ) {
        int score = switch (sourceChannel) {
            case SOURCE_OFFICIAL_SITE -> 72;
            case SOURCE_GOOGLE_MAPS -> 70;
            case SOURCE_GOVERNMENT_LISTING -> 68;
            case SOURCE_REVIEW_PLATFORM -> 60;
            case SOURCE_SOCIAL_PROFILE -> 56;
            case SOURCE_BUSINESS_DIRECTORY -> 52;
            default -> 44;
        };
        if (primaryMetro != null && !primaryMetro.isBlank()) {
            score += 10;
        }
        if (phone != null && !phone.isBlank()) {
            score += 8;
        }
        if (email != null && !email.isBlank()) {
            score += 6;
        }
        return Math.max(0, Math.min(100, score));
    }

    private String determineSendPriority(
            ProspectStatus prospectStatus,
            int prospectFitScore,
            int exportReadinessScore
    ) {
        if (prospectStatus == ProspectStatus.RESEARCH) {
            return "RESEARCH";
        }
        if (prospectFitScore >= 82 && exportReadinessScore >= 78) {
            return "P1";
        }
        if (prospectFitScore >= 70 && exportReadinessScore >= 60) {
            return "P2";
        }
        return "P3";
    }

    private int effectiveProspectFitScore(VendorProspect prospect) {
        return prospect.getProspectFitScore() > 0 ? prospect.getProspectFitScore() : prospect.getVendorFitScore();
    }

    private int effectiveExportReadinessScore(VendorProspect prospect) {
        if (prospect.getExportReadinessScore() > 0) {
            return prospect.getExportReadinessScore();
        }
        return computeExportReadinessScore(
                prospect.getProspectStatus(),
                prospect.getContactConfidence(),
                prospect.getLegitimacyScore(),
                prospect.getSourceChannel(),
                prospect.getEmail(),
                prospect.getPhone(),
                prospect.getContactSourceUrl(),
                prospect.getOwnerContactStatus()
        );
    }

    private boolean isSendNowCandidate(VendorProspect prospect) {
        return prospect.getProspectStatus() == ProspectStatus.ACTIVE
                && effectiveProspectFitScore(prospect) >= 75
                && effectiveExportReadinessScore(prospect) >= 65;
    }

    private boolean isEnrichFirstCandidate(VendorProspect prospect) {
        return prospect.getProspectStatus() == ProspectStatus.RESEARCH
                && effectiveProspectFitScore(prospect) >= 75;
    }

    private int computeExportReadinessScore(
            ProspectStatus prospectStatus,
            int contactConfidence,
            int legitimacyScore,
            String sourceChannel,
            String email,
            String phone,
            String contactSourceUrl,
            OwnerContactStatus ownerContactStatus
    ) {
        int score = contactConfidence;
        if (prospectStatus == ProspectStatus.ACTIVE) {
            score += 14;
        } else if (prospectStatus == ProspectStatus.RESEARCH) {
            score -= 10;
        }
        if (hasUsableEmail(email)) {
            score += usesFreeMailbox(email) ? 8 : 16;
        }
        if (phone != null && !phone.isBlank()) {
            score += 4;
        }
        if (contactSourceUrl != null && !contactSourceUrl.isBlank()) {
            score += 8;
        }
        if (ownerContactStatus == OwnerContactStatus.DIRECT) {
            score += 6;
        }
        score += switch (sourceChannel == null ? "" : sourceChannel) {
            case SOURCE_OFFICIAL_SITE -> 12;
            case SOURCE_GOOGLE_MAPS -> 9;
            case SOURCE_GOVERNMENT_LISTING -> 8;
            case SOURCE_REVIEW_PLATFORM -> 4;
            case SOURCE_SOCIAL_PROFILE -> 3;
            case SOURCE_BUSINESS_DIRECTORY -> 1;
            default -> 0;
        };
        if (legitimacyScore >= 75) {
            score += 10;
        } else if (legitimacyScore >= 65) {
            score += 6;
        } else if (legitimacyScore >= 55) {
            score += 2;
        }
        return Math.max(0, Math.min(100, score));
    }

    private String determineVendorQualityTier(
            int prospectFitScore,
            int exportReadinessScore,
            int legitimacyScore,
            OwnershipStyle ownershipStyle,
            DocumentationMaturity documentationMaturity,
            SizeBand sizeBand,
            String notes
    ) {
        String normalizedNotes = notes == null ? "" : notes.toLowerCase(Locale.ROOT);
        boolean adjacentMixed = normalizedNotes.contains("fire suppression")
                || normalizedNotes.contains("fire extinguisher")
                || normalizedNotes.contains("hood repair")
                || normalizedNotes.contains("hood installation")
                || normalizedNotes.contains("restaurant equipment");
        boolean broadMixed = normalizedNotes.contains("pressure washing")
                || normalizedNotes.contains("power washing")
                || normalizedNotes.contains("janitorial")
                || normalizedNotes.contains("carpet cleaning")
                || normalizedNotes.contains("window cleaning")
                || normalizedNotes.contains("floor care")
                || normalizedNotes.contains("air duct")
                || normalizedNotes.contains("hvac")
                || normalizedNotes.contains("property management");
        boolean ownerLed = ownershipStyle == OwnershipStyle.OWNER_LED
                || ownershipStyle == OwnershipStyle.SMALL_OFFICE_LED;
        boolean smallLocalOperator = sizeBand == SizeBand.SOLO
                || sizeBand == SizeBand.MICRO_TEAM
                || sizeBand == SizeBand.SMALL_OFFICE;
        if (prospectFitScore >= 78
                && exportReadinessScore >= 55
                && legitimacyScore >= 60
                && ownerLed
                && smallLocalOperator
                && documentationMaturity != DocumentationMaturity.HIGH
                && !adjacentMixed
                && !broadMixed) {
            return "A";
        }
        return "B";
    }

    private String defaultVendorQualityTier(String vendorQualityTier) {
        return vendorQualityTier == null || vendorQualityTier.isBlank() ? "B" : vendorQualityTier;
    }

    private String host(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        String normalized = value.trim().toLowerCase(Locale.ROOT)
                .replaceFirst("^https?://", "")
                .replaceFirst("^www\\.", "");
        int slashIndex = normalized.indexOf('/');
        return slashIndex >= 0 ? normalized.substring(0, slashIndex) : normalized;
    }

    private boolean usesFreeMailbox(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }
        String normalized = value.toLowerCase(Locale.ROOT);
        return normalized.contains("@gmail.com")
                || normalized.contains("@yahoo.com")
                || normalized.contains("@outlook.com")
                || normalized.contains("@hotmail.com")
                || normalized.contains("@aol.com")
                || normalized.contains("@icloud.com")
                || normalized.contains("@proton.me")
                || normalized.contains("@protonmail.com");
    }

    private static final class MutableAggregate {
        private int campaignCount;
        private int totalSent;
        private int positiveReplyCount;
        private int paidBatchOrderCount;
    }
}
