package owner.hood.application.outbound;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import owner.hood.domain.outbound.ProspectStatus;
import owner.hood.domain.outbound.VendorProspect;
import owner.hood.infrastructure.persistence.VendorProspectRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class VendorProspectEnrichmentService {

    private static final String SOURCE_OFFICIAL_SITE = "OFFICIAL_SITE";
    private static final String SOURCE_GOOGLE_MAPS = "GOOGLE_MAPS";
    private static final String SOURCE_SOCIAL_PROFILE = "SOCIAL_PROFILE";
    private static final String SOURCE_REVIEW_PLATFORM = "REVIEW_PLATFORM";
    private static final String SOURCE_BUSINESS_DIRECTORY = "BUSINESS_DIRECTORY";
    private static final String SOURCE_GOVERNMENT_LISTING = "GOVERNMENT_LISTING";
    private static final String SOURCE_OTHER_PUBLIC = "OTHER_PUBLIC";

    private final VendorProspectRepository vendorProspectRepository;

    public VendorProspectEnrichmentService(VendorProspectRepository vendorProspectRepository) {
        this.vendorProspectRepository = vendorProspectRepository;
    }

    @Transactional
    public VendorProspectEnrichmentResultView enrichCandidates(VendorProspectEnrichmentForm form) {
        List<VendorProspectEnrichmentRowView> rows = new ArrayList<>();
        String[] enrichmentLines = form.getEnrichmentRows() == null
                ? new String[0]
                : form.getEnrichmentRows().split("\\R");

        int processed = 0;
        int updated = 0;
        for (String rawLine : enrichmentLines) {
            if (rawLine == null || rawLine.isBlank() || looksLikeHeader(rawLine)) {
                continue;
            }
            processed++;

            EnrichmentCandidate candidate = parseCandidate(rawLine);
            Optional<VendorProspect> existingProspect = lookupProspect(candidate);
            if (existingProspect.isEmpty()) {
                rows.add(new VendorProspectEnrichmentRowView(
                        firstNonBlank(candidate.displayName(), "Unmatched prospect"),
                        "rejected",
                        "No existing prospect matched this row. Use display name or source URL that already exists.",
                        "",
                        "",
                        "",
                        blankToNull(candidate.contactSourceUrl())
                ));
                continue;
            }

            VendorProspect prospect = existingProspect.get();
            ProspectStatus previousStatus = prospect.getProspectStatus();
            String currentSourceChannel = firstNonBlank(prospect.getSourceChannel(), SOURCE_OTHER_PUBLIC);

            String email = firstNonBlank(candidate.email(), prospect.getEmail());
            String phone = firstNonBlank(candidate.phone(), prospect.getPhone());
            String contactName = firstNonBlank(candidate.contactName(), prospect.getContactName());
            String roleTitle = firstNonBlank(candidate.roleTitle(), prospect.getRoleTitle());
            String contactSourceUrl = firstNonBlank(candidate.contactSourceUrl(), prospect.getContactSourceUrl(), prospect.getSourceUrl());

            int contactConfidence = contactConfidence(
                    contactName,
                    roleTitle,
                    email,
                    phone,
                    prospect.getWebsiteUrl(),
                    contactSourceUrl,
                    candidate.evidenceText()
            );
            String enrichmentChannel = detectSourceChannel(prospect.getWebsiteUrl(), contactSourceUrl);
            String sourceChannel = strongerSourceChannel(currentSourceChannel, enrichmentChannel);
            int legitimacyScore = Math.max(
                    prospect.getLegitimacyScore(),
                    legitimacyScore(sourceChannel, prospect.getPrimaryMetro(), email, phone, candidate.evidenceText())
            );
            int prospectFitScore = effectiveProspectFitScore(prospect);
            ProspectStatus prospectStatus = determineProspectStatus(
                    previousStatus,
                    prospectFitScore,
                    legitimacyScore,
                    email,
                    phone,
                    prospect.getWebsiteUrl(),
                    contactSourceUrl,
                    contactConfidence
            );
            int exportReadinessScore = computeExportReadinessScore(
                    prospectStatus,
                    contactConfidence,
                    legitimacyScore,
                    sourceChannel,
                    email,
                    phone,
                    contactSourceUrl,
                    prospect.getOwnerContactStatus()
            );
            String sendPriority = determineSendPriority(
                    prospectStatus,
                    prospectFitScore,
                    exportReadinessScore
            );

            boolean changed = applyUpdates(
                    prospect,
                    contactName,
                    roleTitle,
                    email,
                    phone,
                    contactSourceUrl,
                    contactConfidence,
                    legitimacyScore,
                    sourceChannel,
                    sendPriority,
                    exportReadinessScore,
                    prospectStatus,
                    candidate.evidenceText()
            );
            if (!changed) {
                rows.add(new VendorProspectEnrichmentRowView(
                        prospect.getDisplayName(),
                        "rejected",
                        "No new contact path was added. Provide email, phone, contact source, or stronger evidence.",
                        prospect.getProspectStatus().name(),
                        prospect.getSendPriority(),
                        prospect.getSourceChannel(),
                        blankToNull(prospect.getContactSourceUrl())
                ));
                continue;
            }

            vendorProspectRepository.save(prospect);
            updated++;

            String decision = previousStatus != ProspectStatus.ACTIVE && prospectStatus == ProspectStatus.ACTIVE
                    ? "promoted"
                    : "updated";
            rows.add(new VendorProspectEnrichmentRowView(
                    prospect.getDisplayName(),
                    decision,
                    decisionReason(decision, sourceChannel, prospectStatus),
                    prospect.getProspectStatus().name(),
                    prospect.getSendPriority(),
                    prospect.getSourceChannel(),
                    firstNonBlank(prospect.getEmail(), prospect.getPhone(), prospect.getContactSourceUrl())
            ));
        }

        return new VendorProspectEnrichmentResultView(
                processed,
                updated,
                processed - updated,
                rows
        );
    }

    private boolean looksLikeHeader(String rawLine) {
        String normalized = rawLine.toLowerCase(Locale.ROOT);
        return normalized.contains("display_name")
                || normalized.contains("contact_source_url")
                || normalized.startsWith("name|");
    }

    private EnrichmentCandidate parseCandidate(String rawLine) {
        String[] parts = rawLine.contains("|")
                ? rawLine.split("\\|", -1)
                : rawLine.split(",", -1);
        return new EnrichmentCandidate(
                part(parts, 0),
                part(parts, 1),
                part(parts, 2),
                part(parts, 3),
                part(parts, 4),
                part(parts, 5),
                part(parts, 6),
                part(parts, 7)
        );
    }

    private String part(String[] parts, int index) {
        return index >= parts.length || parts[index] == null ? "" : parts[index].trim();
    }

    private Optional<VendorProspect> lookupProspect(EnrichmentCandidate candidate) {
        if (hasText(candidate.sourceUrl())) {
            Optional<VendorProspect> bySource = vendorProspectRepository.findFirstBySourceUrlIgnoreCase(candidate.sourceUrl());
            if (bySource.isPresent()) {
                return bySource;
            }
        }
        if (hasText(candidate.displayName())) {
            return vendorProspectRepository.findFirstByDisplayNameIgnoreCase(candidate.displayName());
        }
        return Optional.empty();
    }

    private boolean applyUpdates(
            VendorProspect prospect,
            String contactName,
            String roleTitle,
            String email,
            String phone,
            String contactSourceUrl,
            int contactConfidence,
            int legitimacyScore,
            String sourceChannel,
            String sendPriority,
            int exportReadinessScore,
            ProspectStatus prospectStatus,
            String evidenceText
    ) {
        boolean changed = false;
        changed |= replaceIfDifferent(prospect.getContactName(), contactName, prospect::setContactName);
        changed |= replaceIfDifferent(prospect.getRoleTitle(), roleTitle, prospect::setRoleTitle);
        changed |= replaceIfDifferent(prospect.getEmail(), email, prospect::setEmail);
        changed |= replaceIfDifferent(prospect.getPhone(), phone, prospect::setPhone);
        changed |= replaceIfDifferent(prospect.getContactSourceUrl(), contactSourceUrl, prospect::setContactSourceUrl);
        changed |= replaceIfDifferent(prospect.getSourceChannel(), sourceChannel, prospect::setSourceChannel);
        changed |= replaceIfDifferent(prospect.getSendPriority(), sendPriority, prospect::setSendPriority);
        changed |= replaceIfDifferent(prospect.getProspectStatus(), prospectStatus, prospect::setProspectStatus);
        if (prospect.getContactConfidence() != contactConfidence) {
            prospect.setContactConfidence(contactConfidence);
            changed = true;
        }
        if (prospect.getLegitimacyScore() != legitimacyScore) {
            prospect.setLegitimacyScore(legitimacyScore);
            changed = true;
        }
        if (prospect.getProspectFitScore() == 0 && prospect.getVendorFitScore() > 0) {
            prospect.setProspectFitScore(prospect.getVendorFitScore());
            changed = true;
        }
        if (prospect.getExportReadinessScore() != exportReadinessScore) {
            prospect.setExportReadinessScore(exportReadinessScore);
            changed = true;
        }

        String enrichmentNote = enrichmentNote(sourceChannel, email, phone, contactSourceUrl, evidenceText);
        String existingNotes = prospect.getNotes();
        if (hasText(enrichmentNote) && (existingNotes == null || !existingNotes.contains(enrichmentNote))) {
            prospect.setNotes(appendNote(existingNotes, enrichmentNote));
            changed = true;
        }
        return changed;
    }

    private String decisionReason(String decision, String sourceChannel, ProspectStatus prospectStatus) {
        if ("promoted".equals(decision)) {
            return "Research queue prospect now has a usable contact path and is active for send. Latest proof channel: " + sourceChannel + ".";
        }
        if (prospectStatus == ProspectStatus.RESEARCH) {
            return "Research queue prospect was enriched with a better contact path, but it still needs more work before send.";
        }
        return "Prospect contact path was refreshed. Latest proof channel: " + sourceChannel + ".";
    }

    private int contactConfidence(
            String contactName,
            String roleTitle,
            String email,
            String phone,
            String websiteUrl,
            String contactSourceUrl,
            String evidenceText
    ) {
        int score = 0;
        if (hasUsableEmail(email)) {
            String normalizedEmail = email.toLowerCase(Locale.ROOT);
            score += containsAny(normalizedEmail, "info@", "contact@", "office@", "sales@") ? 55 : 75;
        }
        if (hasText(phone)) {
            score += 20;
        }
        if (hasText(contactName)) {
            score += 12;
        }
        if (hasText(roleTitle) && containsAny(roleTitle.toLowerCase(Locale.ROOT), "owner", "founder", "president", "principal")) {
            score += 10;
        }
        if (hasText(websiteUrl) || hasText(contactSourceUrl)) {
            score += 8;
        }
        String evidence = firstNonBlank(evidenceText, "").toLowerCase(Locale.ROOT);
        if (containsAny(evidence, "contact", "quote", "estimate", "call", "24/7", "text", "messenger", "dm us")) {
            score += 10;
        }
        return clamp(score);
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
        if (containsAny(sourceHost, "facebook.com", "instagram.com", "about.me", "linkedin.com", "tiktok.com")) {
            return SOURCE_SOCIAL_PROFILE;
        }
        if (containsAny(sourceHost, ".gov", "nyc.gov")) {
            return SOURCE_GOVERNMENT_LISTING;
        }
        if (containsAny(sourceHost,
                "yelp.com",
                "bbb.org",
                "angi.com",
                "angieslist.com",
                "thumbtack.com",
                "homeadvisor.com",
                "birdeye.com",
                "nextdoor.com")) {
            return SOURCE_REVIEW_PLATFORM;
        }
        if (containsAny(sourceHost,
                "localac.net",
                "citysquares.com",
                "provenexpert.com",
                "brownbook.net",
                "ezlocal.com",
                "startus.cc",
                "trustedpros.com",
                "callupcontact.com",
                "sosou.de",
                "yellowpages.com",
                "mapquest.com",
                "manta.com",
                "merchantcircle.com",
                "chamberofcommerce.com",
                "showmelocal.com",
                "hotfrog.com")) {
            return SOURCE_BUSINESS_DIRECTORY;
        }
        return SOURCE_OTHER_PUBLIC;
    }

    private boolean isGoogleMapsSource(String sourceHost, String normalizedSourceUrl) {
        if (containsAny(sourceHost, "maps.app.goo.gl", "g.co")) {
            return true;
        }
        return sourceHost.contains("google.com")
                && containsAny(normalizedSourceUrl, "/maps/", "google.com/maps", "google.com/localservices");
    }

    private String strongerSourceChannel(String currentSourceChannel, String candidateSourceChannel) {
        return sourceChannelStrength(candidateSourceChannel) > sourceChannelStrength(currentSourceChannel)
                ? candidateSourceChannel
                : currentSourceChannel;
    }

    private int sourceChannelStrength(String sourceChannel) {
        return switch (firstNonBlank(sourceChannel, SOURCE_OTHER_PUBLIC)) {
            case SOURCE_OFFICIAL_SITE -> 6;
            case SOURCE_GOOGLE_MAPS -> 5;
            case SOURCE_GOVERNMENT_LISTING -> 4;
            case SOURCE_REVIEW_PLATFORM -> 3;
            case SOURCE_SOCIAL_PROFILE -> 2;
            case SOURCE_BUSINESS_DIRECTORY -> 1;
            default -> 0;
        };
    }

    private int legitimacyScore(
            String sourceChannel,
            String primaryMetro,
            String email,
            String phone,
            String evidenceText
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
        if (hasText(primaryMetro)) {
            score += 10;
        }
        if (hasText(phone)) {
            score += 8;
        }
        if (hasUsableEmail(email)) {
            score += 6;
        }
        String evidence = firstNonBlank(evidenceText, "").toLowerCase(Locale.ROOT);
        if (containsAny(evidence, "review", "reviews", "photo", "photos", "owner replied", "owner response")) {
            score += 4;
        }
        if (containsAny(evidence, "licensed", "insured", "certified", "years", "since")) {
            score += 4;
        }
        return clamp(score);
    }

    private ProspectStatus determineProspectStatus(
            ProspectStatus previousStatus,
            int vendorFitScore,
            int legitimacyScore,
            String email,
            String phone,
            String websiteUrl,
            String contactSourceUrl,
            int contactConfidence
    ) {
        if (previousStatus == ProspectStatus.CONTACTED
                || previousStatus == ProspectStatus.QUALIFIED
                || previousStatus == ProspectStatus.CLOSED) {
            return previousStatus;
        }
        if (hasUsableEmail(email) && contactConfidence >= 50) {
            return ProspectStatus.ACTIVE;
        }
        if (vendorFitScore >= 65
                && legitimacyScore >= 55
                && (hasText(phone) || hasText(websiteUrl) || hasText(contactSourceUrl))) {
            return ProspectStatus.RESEARCH;
        }
        return previousStatus;
    }

    private String determineSendPriority(
            ProspectStatus prospectStatus,
            int prospectFitScore,
            int exportReadinessScore
    ) {
        if (prospectStatus == ProspectStatus.RESEARCH) {
            return "RESEARCH";
        }
        if (prospectStatus != ProspectStatus.ACTIVE) {
            return firstNonBlank(prospectStatus.name(), "RESEARCH");
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

    private int computeExportReadinessScore(
            ProspectStatus prospectStatus,
            int contactConfidence,
            int legitimacyScore,
            String sourceChannel,
            String email,
            String phone,
            String contactSourceUrl,
            owner.hood.domain.outbound.OwnerContactStatus ownerContactStatus
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
        if (hasText(phone)) {
            score += 4;
        }
        if (hasText(contactSourceUrl)) {
            score += 8;
        }
        if (ownerContactStatus == owner.hood.domain.outbound.OwnerContactStatus.DIRECT) {
            score += 6;
        }
        score += switch (firstNonBlank(sourceChannel, SOURCE_OTHER_PUBLIC)) {
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
        return clamp(score);
    }

    private String enrichmentNote(
            String sourceChannel,
            String email,
            String phone,
            String contactSourceUrl,
            String evidenceText
    ) {
        StringBuilder note = new StringBuilder("Research enrichment pass. ");
        if (hasUsableEmail(email)) {
            note.append("Usable email added. ");
        } else if (hasText(phone)) {
            note.append("Phone/contact route refreshed. ");
        }
        note.append("Proof channel: ").append(sourceChannel).append(". ");
        if (hasText(contactSourceUrl)) {
            note.append("Contact source: ").append(contactSourceUrl).append(". ");
        }
        if (hasText(evidenceText)) {
            note.append("Evidence: ").append(evidenceText.trim());
        }
        return note.toString().trim();
    }

    private String appendNote(String existingNotes, String enrichmentNote) {
        if (!hasText(existingNotes)) {
            return enrichmentNote;
        }
        return existingNotes.trim() + " " + enrichmentNote;
    }

    private boolean replaceIfDifferent(String currentValue, String nextValue, java.util.function.Consumer<String> setter) {
        if (!hasText(nextValue)) {
            return false;
        }
        if (firstNonBlank(currentValue, "").equals(nextValue.trim())) {
            return false;
        }
        setter.accept(nextValue.trim());
        return true;
    }

    private boolean replaceIfDifferent(ProspectStatus currentValue, ProspectStatus nextValue, java.util.function.Consumer<ProspectStatus> setter) {
        if (nextValue == null || currentValue == nextValue) {
            return false;
        }
        setter.accept(nextValue);
        return true;
    }

    private int clamp(int score) {
        return Math.max(0, Math.min(100, score));
    }

    private boolean hasUsableEmail(String value) {
        return hasText(value) && value.contains("@");
    }

    private boolean usesFreeMailbox(String value) {
        if (!hasText(value)) {
            return false;
        }
        String normalized = value.toLowerCase(Locale.ROOT);
        return containsAny(
                normalized,
                "@gmail.com",
                "@yahoo.com",
                "@outlook.com",
                "@hotmail.com",
                "@aol.com",
                "@icloud.com",
                "@proton.me",
                "@protonmail.com"
        );
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private boolean containsAny(String value, String... needles) {
        if (value == null) {
            return false;
        }
        for (String needle : needles) {
            if (value.contains(needle)) {
                return true;
            }
        }
        return false;
    }

    private String host(String value) {
        if (!hasText(value)) {
            return "";
        }
        String normalized = value.trim().toLowerCase(Locale.ROOT)
                .replaceFirst("^https?://", "")
                .replaceFirst("^www\\.", "");
        int slashIndex = normalized.indexOf('/');
        return slashIndex >= 0 ? normalized.substring(0, slashIndex) : normalized;
    }

    private String blankToNull(String value) {
        return hasText(value) ? value.trim() : null;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (hasText(value)) {
                return value.trim();
            }
        }
        return "";
    }

    private record EnrichmentCandidate(
            String displayName,
            String sourceUrl,
            String contactSourceUrl,
            String contactName,
            String roleTitle,
            String email,
            String phone,
            String evidenceText
    ) {
    }
}
