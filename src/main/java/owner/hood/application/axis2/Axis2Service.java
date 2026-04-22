package owner.hood.application.axis2;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import owner.hood.application.delivery.DeliveryRecordService;
import owner.hood.domain.axis2.Axis2Batch;
import owner.hood.domain.axis2.Axis2BatchDeliveryStatus;
import owner.hood.domain.axis2.Axis2BatchItem;
import owner.hood.domain.axis2.Axis2BatchType;
import owner.hood.domain.axis2.Axis2PacketRender;
import owner.hood.domain.axis2.Axis2RenderStatus;
import owner.hood.domain.axis2.OpportunityContact;
import owner.hood.domain.axis2.OpportunityEligibilityStatus;
import owner.hood.domain.axis2.OpportunityProject;
import owner.hood.domain.axis2.OpportunitySignal;
import owner.hood.domain.axis2.TriggerType;
import owner.hood.domain.vendor.VendorOrganization;
import owner.hood.domain.vendor.VendorSetupProfile;
import owner.hood.infrastructure.persistence.Axis2BatchItemRepository;
import owner.hood.infrastructure.persistence.Axis2BatchRepository;
import owner.hood.infrastructure.persistence.Axis2PacketRenderRepository;
import owner.hood.infrastructure.persistence.OpportunityContactRepository;
import owner.hood.infrastructure.persistence.OpportunityProjectRepository;
import owner.hood.infrastructure.persistence.OpportunitySignalRepository;
import owner.hood.infrastructure.persistence.VendorOrganizationRepository;
import owner.hood.infrastructure.persistence.VendorSetupProfileRepository;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
public class Axis2Service {

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("MMM d, uuuu", Locale.US);

    private final VendorOrganizationRepository vendorOrganizationRepository;
    private final VendorSetupProfileRepository vendorSetupProfileRepository;
    private final OpportunityProjectRepository opportunityProjectRepository;
    private final OpportunitySignalRepository opportunitySignalRepository;
    private final OpportunityContactRepository opportunityContactRepository;
    private final Axis2BatchRepository axis2BatchRepository;
    private final Axis2BatchItemRepository axis2BatchItemRepository;
    private final Axis2PacketRenderRepository axis2PacketRenderRepository;
    private final DeliveryRecordService deliveryRecordService;

    public Axis2Service(
            VendorOrganizationRepository vendorOrganizationRepository,
            VendorSetupProfileRepository vendorSetupProfileRepository,
            OpportunityProjectRepository opportunityProjectRepository,
            OpportunitySignalRepository opportunitySignalRepository,
            OpportunityContactRepository opportunityContactRepository,
            Axis2BatchRepository axis2BatchRepository,
            Axis2BatchItemRepository axis2BatchItemRepository,
            Axis2PacketRenderRepository axis2PacketRenderRepository,
            DeliveryRecordService deliveryRecordService
    ) {
        this.vendorOrganizationRepository = vendorOrganizationRepository;
        this.vendorSetupProfileRepository = vendorSetupProfileRepository;
        this.opportunityProjectRepository = opportunityProjectRepository;
        this.opportunitySignalRepository = opportunitySignalRepository;
        this.opportunityContactRepository = opportunityContactRepository;
        this.axis2BatchRepository = axis2BatchRepository;
        this.axis2BatchItemRepository = axis2BatchItemRepository;
        this.axis2PacketRenderRepository = axis2PacketRenderRepository;
        this.deliveryRecordService = deliveryRecordService;
    }

    @Transactional
    public UUID importSignal(Axis2SignalImportForm form) {
        String metroKey = normalizeMetroKey(form.getMetroKey());
        int finalScore = computeFinalScore(
                form.getFreshnessScore(),
                form.getHoodRelevanceScore(),
                form.getFoodServiceCertaintyScore(),
                form.getBuyerAuthorityScore(),
                form.getContactabilityScore()
        );
        OpportunityEligibilityStatus eligibilityStatus = computeEligibilityStatus(
                metroKey,
                finalScore,
                form.getFreshnessScore(),
                form.getHoodRelevanceScore(),
                form.getFoodServiceCertaintyScore()
        );

        String dedupeKey = buildDedupeKey(
                form.getCanonicalBusinessName(),
                form.getCanonicalStreetAddress(),
                metroKey
        );

        OpportunityProject project = opportunityProjectRepository.findByDedupeKey(dedupeKey)
                .orElseGet(OpportunityProject::new);

        LocalDate firstSeen = project.getFirstSeenTriggerDate() == null
                ? form.getTriggerDate()
                : minDate(project.getFirstSeenTriggerDate(), form.getTriggerDate());
        LocalDate lastSeen = project.getLastSeenTriggerDate() == null
                ? form.getTriggerDate()
                : maxDate(project.getLastSeenTriggerDate(), form.getTriggerDate());

        project.setMetroKey(metroKey);
        project.setCityName(form.getCityName());
        project.setCanonicalBusinessName(form.getCanonicalBusinessName());
        project.setCanonicalStreetAddress(form.getCanonicalStreetAddress());
        project.setDedupeKey(dedupeKey);
        project.setStrongestTriggerType(finalScore >= project.getFinalScore() || project.getStrongestTriggerType() == null
                ? form.getTriggerType()
                : project.getStrongestTriggerType());
        project.setFirstSeenTriggerDate(firstSeen);
        project.setLastSeenTriggerDate(lastSeen);
        project.setActiveSignalCount(project.getActiveSignalCount() + 1);
        project.setFoodServiceCertaintyScore(Math.max(project.getFoodServiceCertaintyScore(), form.getFoodServiceCertaintyScore()));
        project.setHoodRelevanceScore(Math.max(project.getHoodRelevanceScore(), form.getHoodRelevanceScore()));
        project.setFreshnessScore(Math.max(project.getFreshnessScore(), form.getFreshnessScore()));
        project.setBuyerAuthorityScore(Math.max(project.getBuyerAuthorityScore(), form.getBuyerAuthorityScore()));
        project.setContactabilityScore(Math.max(project.getContactabilityScore(), form.getContactabilityScore()));
        project.setFinalScore(Math.max(project.getFinalScore(), finalScore));
        project.setEligibilityStatus(eligibilityStatus);
        opportunityProjectRepository.save(project);

        OpportunitySignal signal = new OpportunitySignal();
        signal.setProject(project);
        signal.setMetroKey(metroKey);
        signal.setCityName(form.getCityName());
        signal.setSourceKey(form.getSourceKey());
        signal.setTriggerType(form.getTriggerType());
        signal.setTriggerDate(form.getTriggerDate());
        signal.setBusinessName(form.getCanonicalBusinessName());
        signal.setStreetAddress(form.getCanonicalStreetAddress());
        signal.setSourceUrl(form.getSourceUrl());
        signal.setSourceExcerpt(form.getSourceExcerpt());
        signal.setFoodServiceCertaintyScore(form.getFoodServiceCertaintyScore());
        signal.setHoodRelevanceScore(form.getHoodRelevanceScore());
        signal.setFreshnessScore(form.getFreshnessScore());
        signal.setBuyerAuthorityScore(form.getBuyerAuthorityScore());
        signal.setContactabilityScore(form.getContactabilityScore());
        signal.setFinalScore(finalScore);
        signal.setEligibilityStatus(eligibilityStatus);
        opportunitySignalRepository.save(signal);

        if (hasText(form.getContactFullName()) || hasText(form.getContactEmail()) || hasText(form.getContactPhone())) {
            OpportunityContact contact = new OpportunityContact();
            contact.setSignal(signal);
            contact.setContactLevel(form.getContactLevel() == null || form.getContactLevel().isBlank() ? "owner" : form.getContactLevel());
            contact.setFullName(form.getContactFullName());
            contact.setRoleTitle(form.getContactRoleTitle());
            contact.setEmail(form.getContactEmail());
            contact.setPhone(form.getContactPhone());
            contact.setSourceUrl(form.getSourceUrl());
            contact.setConfidenceScore(form.getContactConfidenceScore());
            opportunityContactRepository.save(contact);
        }

        return project.getId();
    }

    @Transactional(readOnly = true)
    public List<Axis2ProjectListItemView> listProjects() {
        return opportunityProjectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(project -> {
                    Optional<OpportunitySignal> topSignal = opportunitySignalRepository
                            .findFirstByProjectIdOrderByFinalScoreDescTriggerDateDesc(project.getId());
                    Optional<OpportunityContact> topContact = topSignal
                            .map(signal -> opportunityContactRepository.findBySignalIdOrderByConfidenceScoreDescCreatedAtAsc(signal.getId()))
                            .filter(list -> !list.isEmpty())
                            .map(list -> list.getFirst());

                    String contactLine = topContact
                            .map(contact -> joinNonBlank(
                                    contact.getFullName(),
                                    contact.getRoleTitle(),
                                    firstNonBlank(contact.getEmail(), contact.getPhone())
                            ))
                            .orElse("Contact enrichment still needed");

                    String sourceLabel = topSignal
                            .map(signal -> joinNonBlank(signal.getSourceKey(), formatDate(signal.getTriggerDate())))
                            .orElse("No signal");

                    return new Axis2ProjectListItemView(
                            project.getCanonicalBusinessName(),
                            firstNonBlank(project.getCanonicalStreetAddress(), "Address pending"),
                            project.getCityName(),
                            project.getStrongestTriggerType().name(),
                            project.getFinalScore(),
                            project.getEligibilityStatus().name(),
                            contactLine,
                            sourceLabel,
                            formatDate(project.getLastSeenTriggerDate())
                    );
                })
                .toList();
    }

    @Transactional
    public String prepareBatch(Axis2BatchForm form) {
        VendorOrganization vendor = vendorOrganizationRepository.findById(form.getVendorId())
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found: " + form.getVendorId()));

        String metroKey = normalizeMetroKey(form.getTargetMetroScope());
        List<OpportunityProject> eligibleProjects =
                opportunityProjectRepository.findByMetroKeyAndEligibilityStatusOrderByFinalScoreDescLastSeenTriggerDateDesc(
                        metroKey,
                        OpportunityEligibilityStatus.ACTIVE
                );

        if (eligibleProjects.isEmpty()) {
            throw new IllegalStateException("No commercially usable " + form.getTargetMetroScope() + " inventory is ready yet.");
        }

        Axis2BatchType batchType = Axis2BatchType.valueOf(form.getBatchType().toUpperCase(Locale.ROOT));
        int cappedIntendedSize = batchType == Axis2BatchType.SAMPLE
                ? Math.min(form.getIntendedSize(), 3)
                : form.getIntendedSize();
        int actualSize = Math.min(cappedIntendedSize, eligibleProjects.size());

        Axis2Batch batch = new Axis2Batch();
        batch.setVendor(vendor);
        batch.setBatchType(batchType);
        batch.setTargetMetroScope(form.getTargetMetroScope());
        batch.setIntendedSize(form.getIntendedSize());
        batch.setActualSize(actualSize);
        batch.setPricingSnapshot("Starting at $149 / 10 live opportunities");
        batch.setDeliveryStatus(Axis2BatchDeliveryStatus.READY);
        axis2BatchRepository.save(batch);

        for (int index = 0; index < actualSize; index++) {
            OpportunityProject project = eligibleProjects.get(index);
            OpportunitySignal signal = opportunitySignalRepository.findFirstByProjectIdOrderByFinalScoreDescTriggerDateDesc(project.getId())
                    .orElseThrow(() -> new IllegalStateException("Signal missing for project " + project.getId()));
            List<OpportunityContact> contacts = opportunityContactRepository.findBySignalIdOrderByConfidenceScoreDescCreatedAtAsc(signal.getId());

            Axis2BatchItem item = new Axis2BatchItem();
            item.setBatch(batch);
            item.setProject(project);
            item.setPrimarySignal(signal);
            item.setRankOrder(index + 1);
            item.setVendorAngleNote(buildVendorAngleNote(signal.getTriggerType(), project.getCanonicalBusinessName()));
            item.setIncludedContactLevel(contacts.isEmpty() ? "generic-path" : contacts.getFirst().getContactLevel());
            item.setDemoSafe(batchType == Axis2BatchType.SAMPLE);
            axis2BatchItemRepository.save(item);
        }

        Axis2PacketRender render = new Axis2PacketRender();
        render.setVendor(vendor);
        render.setBatch(batch);
        render.setRenderVersion("v1");
        render.setDeliveryToken(UUID.randomUUID().toString().replace("-", ""));
        render.setHtmlPath("/deliver/axis-2/" + render.getDeliveryToken());
        render.setPdfPath("/deliver/packet/" + render.getDeliveryToken() + "/pdf");
        render.setRenderStatus(Axis2RenderStatus.READY);
        axis2PacketRenderRepository.save(render);
        deliveryRecordService.recordReadyDelivery(
                vendor.getId(),
                "AXIS_2",
                "BATCH_PACKET",
                "TOKEN_LINK",
                vendorSetupProfileRepository.findByVendorId(vendor.getId())
                        .map(VendorSetupProfile::getReplyEmail)
                        .orElse(null)
        );
        return render.getDeliveryToken();
    }

    @Transactional(readOnly = true)
    public Axis2PacketView loadPacket(String token) {
        Axis2PacketRender render = axis2PacketRenderRepository.findByDeliveryToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Axis 2 render not found: " + token));

        Axis2Batch batch = render.getBatch();
        VendorSetupProfile setupProfile = vendorSetupProfileRepository.findByVendorId(render.getVendor().getId())
                .orElseThrow(() -> new IllegalArgumentException("Vendor setup profile not found: " + render.getVendor().getId()));
        boolean sampleBatch = batch.getBatchType() == Axis2BatchType.SAMPLE;

        List<Axis2PacketItemView> items = axis2BatchItemRepository.findByBatchIdOrderByRankOrderAsc(batch.getId())
                .stream()
                .map(item -> {
                    List<OpportunityContact> contacts = opportunityContactRepository.findBySignalIdOrderByConfidenceScoreDescCreatedAtAsc(
                            item.getPrimarySignal().getId()
                    );
                    String contactLadder = sampleBatch
                            ? "Protected in free sample. Contact path unlocks in the paid batch."
                            : buildContactLadder(contacts, item.getProject());
                    String riskNote = sampleBatch
                            ? "Masked sample row. Full source, contact, and copy details remain locked."
                            : buildRiskNote(item.getPrimarySignal().getFinalScore(), contacts.isEmpty());
                    return new Axis2PacketItemView(
                            item.getRankOrder(),
                            item.getProject().getCanonicalBusinessName(),
                            sampleBatch ? "Masked for sample" : item.getProject().getCanonicalStreetAddress(),
                            item.getProject().getCityName(),
                            sampleBatch ? "Masked metro scope" : item.getProject().getMetroKey(),
                            item.getPrimarySignal().getTriggerType().name(),
                            formatDate(item.getPrimarySignal().getTriggerDate()),
                            item.getPrimarySignal().getFinalScore(),
                            sampleBatch
                                    ? "This row was surfaced from a live Austin trigger that still clears the commercial freshness bar."
                                    : buildWhySurfaced(item.getPrimarySignal(), item.getProject()),
                            sampleBatch
                                    ? "Trigger: " + item.getPrimarySignal().getTriggerType().name()
                                    + " / Date " + formatDate(item.getPrimarySignal().getTriggerDate()) + "."
                                    : buildTriggerSummary(item.getPrimarySignal()),
                            sampleBatch
                                    ? "Hood relevance is confirmed, but the exact reasoning stays inside the paid packet."
                                    : buildHoodRelevanceNote(item.getPrimarySignal(), item.getProject()),
                            sampleBatch
                                    ? "Protected in free sample."
                                    : buildSuggestedEmailOpener(item.getProject().getCanonicalBusinessName(), item.getPrimarySignal().getTriggerType()),
                            sampleBatch
                                    ? "Protected in free sample."
                                    : buildSuggestedCallOpener(item.getProject().getCanonicalBusinessName(), item.getPrimarySignal().getTriggerType()),
                            sampleBatch
                                    ? "Protected in free sample."
                                    : item.getVendorAngleNote(),
                            sampleBatch
                                    ? "Protected in free sample."
                                    : buildPrepChecklist(item.getPrimarySignal().getTriggerType()),
                            sampleBatch
                                    ? "Reply to request the paid batch if you want vendor-ready contact and first-touch detail."
                                    : buildVendorCta(setupProfile.getPrimaryContactName(), setupProfile.getReplyEmail()),
                            contactLadder,
                            riskNote,
                            sampleBatch ? "Protected source" : item.getPrimarySignal().getSourceKey(),
                            sampleBatch ? null : item.getPrimarySignal().getSourceUrl(),
                            sampleBatch
                                    ? "Short signal note only. Source link, full excerpt, and contact path unlock in the paid batch."
                                    : firstNonBlank(item.getPrimarySignal().getSourceExcerpt(), "Trigger excerpt withheld on this surface.")
                    );
                })
                .toList();

        return new Axis2PacketView(
                token,
                setupProfile.getBrandName(),
                setupProfile.getPrimaryContactName(),
                setupProfile.getReplyEmail(),
                setupProfile.getPhone(),
                batch.getTargetMetroScope(),
                buildBatchLabel(batch.getBatchType(), batch.getActualSize()),
                batch.getActualSize(),
                sampleBatch ? null : "/deliver/axis-2/" + token + "/list.csv",
                sampleBatch
                        ? "This is a masked sample. It shows the quality bar and signal logic without giving away the full usable lead package."
                        : "This batch is a live list-first sales packet. Each row is a canonical "
                        + batch.getTargetMetroScope()
                        + " opportunity that passed the current freshness, hood relevance, and food-service certainty bar.",
                sampleBatch
                        ? "Reply to request a paid batch if you want the full contact ladder, source evidence, and first-touch framing."
                        : buildVendorCta(setupProfile.getPrimaryContactName(), setupProfile.getReplyEmail()),
                items
        );
    }

    @Transactional(readOnly = true)
    public Optional<Axis2PacketView> findPacket(String token) {
        try {
            return Optional.of(loadPacket(token));
        } catch (IllegalArgumentException exception) {
            return Optional.empty();
        }
    }

    @Transactional(readOnly = true)
    public byte[] exportBatchCsv(String token) {
        Axis2PacketView packet = loadPacket(token);
        StringBuilder csv = new StringBuilder();
        csv.append("rank_order,business_name,street_address,city_name,metro,trigger_type,trigger_date,final_score,why_surfaced,hood_relevance_note,fit_note,contact_ladder,risk_note,source_name,source_url\n");
        for (Axis2PacketItemView item : packet.items()) {
            csv.append(item.rankOrder()).append(',')
                    .append(csvCell(item.businessName())).append(',')
                    .append(csvCell(item.streetAddress())).append(',')
                    .append(csvCell(item.cityName())).append(',')
                    .append(csvCell(item.metroLabel())).append(',')
                    .append(csvCell(item.triggerType())).append(',')
                    .append(csvCell(item.triggerDateText())).append(',')
                    .append(item.finalScore()).append(',')
                    .append(csvCell(item.whySurfaced())).append(',')
                    .append(csvCell(item.hoodRelevanceNote())).append(',')
                    .append(csvCell(item.vendorAngleNote())).append(',')
                    .append(csvCell(item.contactLadder())).append(',')
                    .append(csvCell(item.riskNote())).append(',')
                    .append(csvCell(item.sourceName())).append(',')
                    .append(csvCell(item.sourceUrl()))
                    .append('\n');
        }
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private int computeFinalScore(
            int freshnessScore,
            int hoodRelevanceScore,
            int foodServiceCertaintyScore,
            int buyerAuthorityScore,
            int contactabilityScore
    ) {
        double score = (freshnessScore * 0.30)
                + (hoodRelevanceScore * 0.25)
                + (foodServiceCertaintyScore * 0.20)
                + (buyerAuthorityScore * 0.15)
                + (contactabilityScore * 0.10);
        return (int) Math.round(score);
    }

    private OpportunityEligibilityStatus computeEligibilityStatus(
            String metroKey,
            int finalScore,
            int freshnessScore,
            int hoodRelevanceScore,
            int foodServiceCertaintyScore
    ) {
        if (!"austin".equals(metroKey)) {
            return OpportunityEligibilityStatus.REVIEW;
        }
        if (finalScore >= 70 && freshnessScore >= 85 && hoodRelevanceScore >= 60 && foodServiceCertaintyScore >= 60) {
            return OpportunityEligibilityStatus.ACTIVE;
        }
        if (finalScore >= 55) {
            return OpportunityEligibilityStatus.REVIEW;
        }
        return OpportunityEligibilityStatus.REJECTED;
    }

    private String buildDedupeKey(String businessName, String streetAddress, String metroKey) {
        return (normalizeToken(businessName) + "|" + normalizeToken(streetAddress) + "|" + normalizeToken(metroKey));
    }

    private String normalizeMetroKey(String value) {
        return normalizeToken(value).replace(" ", "-");
    }

    private String normalizeToken(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
    }

    private LocalDate minDate(LocalDate left, LocalDate right) {
        return left.isBefore(right) ? left : right;
    }

    private LocalDate maxDate(LocalDate left, LocalDate right) {
        return left.isAfter(right) ? left : right;
    }

    private String buildVendorAngleNote(TriggerType triggerType, String businessName) {
        return switch (triggerType) {
            case REMODEL -> businessName + " is showing remodel activity that can justify an immediate kitchen exhaust inspection intro.";
            case FINISH_OUT -> businessName + " looks like a finish-out timing window where a fast first-touch packet can frame hood compliance early.";
            case CHANGE_OF_USE -> businessName + " appears to be a change-of-use opportunity where exhaust scope may need fresh vendor attention.";
            case NEW_OPENING -> businessName + " signals a new-opening path where vendor response speed matters more than generic directory outreach.";
            case EQUIPMENT_SWAP -> businessName + " shows equipment churn that can reopen the hood conversation.";
            case OTHER -> businessName + " has a live trigger that should be explained before outreach starts.";
        };
    }

    private String buildBatchLabel(Axis2BatchType batchType, int actualSize) {
        return switch (batchType) {
            case SAMPLE -> "Masked sample batch of " + actualSize;
            case REPEAT -> "Repeat paid batch of " + actualSize;
            case PAID_BATCH -> "Paid batch of " + actualSize + " live opportunities";
        };
    }

    private String buildWhySurfaced(OpportunitySignal signal, OpportunityProject project) {
        return project.getCanonicalBusinessName()
                + " was surfaced because a "
                + signal.getTriggerType().name().replace('_', ' ').toLowerCase(Locale.ROOT)
                + " signal was seen on "
                + formatDate(signal.getTriggerDate())
                + " and still clears the current commercial score threshold.";
    }

    private String buildTriggerSummary(OpportunitySignal signal) {
        return "Trigger: " + signal.getTriggerType().name()
                + " / Source " + signal.getSourceKey()
                + " / Freshness score " + signal.getFreshnessScore()
                + " / Contactability " + signal.getContactabilityScore()
                + " / Final score " + signal.getFinalScore() + ".";
    }

    private String buildHoodRelevanceNote(OpportunitySignal signal, OpportunityProject project) {
        return switch (signal.getTriggerType()) {
            case REMODEL -> project.getCanonicalBusinessName() + " appears to be in a remodel window where hood scope, compliance prep, and first cleaning timing can be discussed early.";
            case FINISH_OUT -> project.getCanonicalBusinessName() + " appears to be moving through finish-out, which is often the point where kitchen exhaust vendors can frame readiness and inspection support.";
            case CHANGE_OF_USE -> "A food-service change of use can reopen hood scope and planning needs, giving the vendor a reason to start the conversation now.";
            case NEW_OPENING -> "New-opening timing increases the value of a practical first-touch message built around launch readiness, not generic cleaning copy.";
            case EQUIPMENT_SWAP -> "Equipment or hood-system change suggests operational movement that can justify a timely hood-service intro.";
            case OTHER -> "The signal is hood-relevant because it suggests a live commercial kitchen change, not a stale directory record.";
        };
    }

    private String buildSuggestedEmailOpener(String businessName, TriggerType triggerType) {
        return switch (triggerType) {
            case REMODEL, FINISH_OUT -> "Saw the " + triggerType.name().replace('_', ' ').toLowerCase(Locale.ROOT)
                    + " activity tied to " + businessName
                    + ". If your kitchen exhaust scope is still being lined up, I can send a quick prep checklist and timing note.";
            case CHANGE_OF_USE -> "Looks like " + businessName + " may be moving through a food-service use change. If hood scope is part of that transition, I can send the short pre-service prep points we usually use.";
            case NEW_OPENING -> "If " + businessName + " is in an opening window, I can send a short checklist for hood readiness and first-service timing.";
            case EQUIPMENT_SWAP, OTHER -> "Came across a live kitchen change tied to " + businessName + ". If helpful, I can send a short hood-readiness note rather than a generic service pitch.";
        };
    }

    private String buildSuggestedCallOpener(String businessName, TriggerType triggerType) {
        return "Calling because " + businessName
                + " is showing a live "
                + triggerType.name().replace('_', ' ').toLowerCase(Locale.ROOT)
                + " signal, and I wanted to see whether hood scope or inspection prep is already being handled.";
    }

    private String buildPrepChecklist(TriggerType triggerType) {
        return switch (triggerType) {
            case REMODEL, FINISH_OUT -> "Confirm hood footprint, duct path, service timing, access constraints, and any inspection-driven documentation expectations.";
            case CHANGE_OF_USE -> "Confirm whether the kitchen configuration is changing, who owns hood compliance, and whether pre-opening service timing has been set.";
            case NEW_OPENING -> "Confirm opening date pressure, hood-install status, first-clean timing, and who is owning final readiness.";
            case EQUIPMENT_SWAP, OTHER -> "Confirm scope change, access path, inspection timing, and whether a vendor has already been selected.";
        };
    }

    private String buildVendorCta(String contactName, String replyEmail) {
        return "Reply to " + firstNonBlank(replyEmail, "the listed vendor contact")
                + " and reference the row number if you want "
                + firstNonBlank(contactName, "the vendor")
                + " to turn this into a first-touch sequence or a follow-up prep note.";
    }

    private String buildContactLadder(List<OpportunityContact> contacts, OpportunityProject project) {
        if (contacts.isEmpty()) {
            return "1) Website or front desk path / 2) Generic contact route / 3) Re-enrich before sending a higher-value row.";
        }
        OpportunityContact top = contacts.getFirst();
        return "1) " + joinNonBlank(
                firstNonBlank(top.getFullName(), project.getCanonicalBusinessName()),
                top.getRoleTitle(),
                firstNonBlank(top.getEmail(), top.getPhone())
        ) + " / 2) Source-verified public route / 3) Vendor website fallback if direct path fails.";
    }

    private String buildRiskNote(int finalScore, boolean missingDirectContact) {
        if (missingDirectContact) {
            return "Direct named contact is still weak. Use a light first-touch and be ready to re-enrich before repeat outreach.";
        }
        if (finalScore < 75) {
            return "Commercially usable, but still explain the trigger clearly before assuming urgency.";
        }
        return "No major exclusion note at current QA level.";
    }

    private String formatDate(LocalDate date) {
        return date == null ? "Date pending" : date.format(DATE_FORMATTER);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String firstNonBlank(String primary, String fallback) {
        return hasText(primary) ? primary : fallback;
    }

    private String joinNonBlank(String... parts) {
        return java.util.Arrays.stream(parts)
                .filter(this::hasText)
                .reduce((left, right) -> left + " / " + right)
                .orElse("");
    }

    private String csvCell(String value) {
        if (value == null) {
            return "";
        }
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }
}
