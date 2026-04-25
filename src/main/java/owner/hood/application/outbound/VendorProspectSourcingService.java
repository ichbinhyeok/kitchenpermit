package owner.hood.application.outbound;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import owner.hood.domain.outbound.OwnerContactStatus;
import owner.hood.domain.outbound.ProspectStatus;
import owner.hood.domain.outbound.VendorProspect;
import owner.hood.domain.vendor.DocumentationMaturity;
import owner.hood.domain.vendor.OwnershipStyle;
import owner.hood.domain.vendor.SizeBand;
import owner.hood.infrastructure.persistence.VendorProspectRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class VendorProspectSourcingService {

    private static final String ACTIVE_AXIS2_OVERLAP = "ACTIVE_AXIS2_OVERLAP";
    private static final String NO_ACTIVE_AXIS2_OVERLAP = "NO_ACTIVE_AXIS2_OVERLAP";
    private static final String SOURCE_OFFICIAL_SITE = "OFFICIAL_SITE";
    private static final String SOURCE_APPROVED_VENDOR_LIST = "APPROVED_VENDOR_LIST";
    private static final String SOURCE_TRADE_ASSOCIATION = "TRADE_ASSOCIATION";
    private static final String SOURCE_GOOGLE_MAPS = "GOOGLE_MAPS";
    private static final String SOURCE_SOCIAL_PROFILE = "SOCIAL_PROFILE";
    private static final String SOURCE_REVIEW_PLATFORM = "REVIEW_PLATFORM";
    private static final String SOURCE_BUSINESS_DIRECTORY = "BUSINESS_DIRECTORY";
    private static final String SOURCE_GOVERNMENT_LISTING = "GOVERNMENT_LISTING";
    private static final String SOURCE_OTHER_PUBLIC = "OTHER_PUBLIC";

    private final VendorProspectRepository vendorProspectRepository;

    public VendorProspectSourcingService(VendorProspectRepository vendorProspectRepository) {
        this.vendorProspectRepository = vendorProspectRepository;
    }

    @Transactional
    public VendorProspectImportResultView importCandidates(VendorProspectImportForm form) {
        List<VendorProspectImportRowView> rows = new ArrayList<>();
        String[] candidateLines = form.getCandidateRows() == null
                ? new String[0]
                : form.getCandidateRows().split("\\R");

        int processed = 0;
        int imported = 0;
        for (String rawLine : candidateLines) {
            if (rawLine == null || rawLine.isBlank()) {
                continue;
            }
            if (looksLikeHeader(rawLine)) {
                continue;
            }
            processed++;
            Candidate candidate = parseCandidate(rawLine);
            Qualification qualification = qualify(candidate);
            if (!qualification.importable()) {
                rows.add(new VendorProspectImportRowView(
                        firstNonBlank(candidate.displayName(), "Unlabeled candidate"),
                        "rejected",
                        qualification.reason(),
                        qualification.primaryMetro(),
                        qualification.segmentationLabel(),
                        qualification.primaryOfferAxis(),
                        "",
                        "",
                        candidate.sourceUrl()
                ));
                continue;
            }

            VendorProspect prospect = new VendorProspect();
            prospect.setDisplayName(candidate.displayName());
            prospect.setWebsiteUrl(blankToNull(candidate.websiteUrl()));
            prospect.setPrimaryMetro(qualification.primaryMetro());
            prospect.setMetroScope(firstNonBlank(candidate.primaryMetro(), qualification.primaryMetro()));
            prospect.setServiceAreaText(firstNonBlank(candidate.serviceAreaText(), qualification.primaryMetro()));
            prospect.setServiceAreaOverlapStatus(qualification.serviceAreaOverlapStatus());
            prospect.setSizeBand(qualification.sizeBand());
            prospect.setOwnershipStyle(qualification.ownershipStyle());
            prospect.setDocumentationMaturity(qualification.documentationMaturity());
            prospect.setSegmentationLabel(qualification.segmentationLabel());
            prospect.setPrimaryOfferAxis(qualification.primaryOfferAxis());
            prospect.setAxis1AngleFit(qualification.axis1AngleFit());
            prospect.setAxis2AngleFit(qualification.axis2AngleFit());
            prospect.setOwnerContactStatus(qualification.ownerContactStatus());
            prospect.setSourceUrl(candidate.sourceUrl().trim());
            prospect.setNotes(buildNotes(candidate, qualification));
            prospect.setContactName(blankToNull(candidate.contactName()));
            prospect.setRoleTitle(blankToNull(candidate.roleTitle()));
            prospect.setEmail(blankToNull(candidate.email()));
            prospect.setPhone(blankToNull(candidate.phone()));
            prospect.setContactConfidence(qualification.contactConfidence());
            prospect.setContactSourceUrl(firstNonBlank(candidate.contactSourceUrl(), candidate.sourceUrl()));
            prospect.setVendorFitScore(qualification.prospectFitScore());
            prospect.setProspectFitScore(qualification.prospectFitScore());
            prospect.setExportReadinessScore(qualification.exportReadinessScore());
            prospect.setLegitimacyScore(qualification.legitimacyScore());
            prospect.setVendorQualityTier(qualification.vendorQualityTier());
            prospect.setSourceChannel(qualification.sourceChannel());
            prospect.setSendPriority(qualification.sendPriority());
            prospect.setProspectStatus(qualification.prospectStatus());
            vendorProspectRepository.save(prospect);
            imported++;

            rows.add(new VendorProspectImportRowView(
                    prospect.getDisplayName(),
                    "imported",
                    qualification.reason(),
                    prospect.getPrimaryMetro(),
                    prospect.getSegmentationLabel(),
                    prospect.getPrimaryOfferAxis(),
                    prospect.getProspectStatus().name(),
                    prospect.getSendPriority(),
                    prospect.getSourceUrl()
            ));
        }

        return new VendorProspectImportResultView(
                processed,
                imported,
                processed - imported,
                rows
        );
    }

    private boolean looksLikeHeader(String rawLine) {
        String normalized = rawLine.toLowerCase(Locale.ROOT);
        return normalized.contains("display_name") || normalized.contains("website_url") || normalized.startsWith("name|");
    }

    private Candidate parseCandidate(String rawLine) {
        String[] parts = rawLine.contains("|")
                ? rawLine.split("\\|", -1)
                : rawLine.split(",", -1);

        String displayName = part(parts, 0);
        String websiteUrl = part(parts, 1);
        String sourceUrl = part(parts, 2);

        if (parts.length >= 9) {
            return new Candidate(
                    displayName,
                    websiteUrl,
                    sourceUrl,
                    part(parts, 3),
                    part(parts, 4),
                    part(parts, 5),
                    part(parts, 6),
                    part(parts, 7),
                    "",
                    sourceUrl,
                    part(parts, 8)
            );
        }

        return new Candidate(
                displayName,
                websiteUrl,
                sourceUrl,
                "",
                part(parts, 3),
                part(parts, 4),
                part(parts, 5),
                part(parts, 6),
                "",
                sourceUrl,
                part(parts, 7)
        );
    }

    private String part(String[] parts, int index) {
        return index >= parts.length || parts[index] == null ? "" : parts[index].trim();
    }

    private Qualification qualify(Candidate candidate) {
        if (!hasText(candidate.displayName())) {
            return Qualification.rejected("Missing vendor display name.");
        }
        if (!hasText(candidate.sourceUrl())) {
            return Qualification.rejected("Missing traceable source URL.");
        }
        if (isDuplicate(candidate)) {
            return Qualification.rejected("Duplicate prospect source or website already exists.");
        }

        String evidence = evidence(candidate);
        String marketEvidence = marketEvidence(candidate);
        String sourceChannel = detectSourceChannel(candidate);
        int hoodFitScore = hoodFitScore(evidence);
        if (hoodFitScore < 55) {
            return Qualification.rejected("Weak hood-service evidence. Do not send generic cleaner rows.");
        }

        String primaryMetro = detectPrimaryMetro(candidate, marketEvidence);
        if (!hasText(primaryMetro)) {
            return Qualification.rejected("No usable service-area market found. Provide an explicit primary metro.");
        }

        SizeBand sizeBand = detectSizeBand(evidence);
        if (sizeBand == SizeBand.ENTERPRISE) {
            return Qualification.rejected("Enterprise or national maturity makes this a low-probability MVP target.");
        }

        int contactConfidence = contactConfidence(candidate, evidence);
        String serviceAreaOverlapStatus = "Austin".equals(primaryMetro) || containsAustin(marketEvidence)
                ? ACTIVE_AXIS2_OVERLAP
                : NO_ACTIVE_AXIS2_OVERLAP;
        OwnerContactStatus ownerContactStatus = detectOwnerContactStatus(candidate, evidence);
        DocumentationMaturity documentationMaturity = detectDocumentationMaturity(evidence);
        OwnershipStyle ownershipStyle = detectOwnershipStyle(ownerContactStatus, evidence);
        int legitimacyScore = legitimacyScore(candidate, sourceChannel, marketEvidence, evidence);
        if (legitimacyScore < 45) {
            return Qualification.rejected("Source proof is too weak for a real local vendor. Bring stronger public evidence.");
        }
        int prospectFitScore = vendorFitScore(
                hoodFitScore,
                sizeBand,
                ownershipStyle,
                documentationMaturity,
                sourceChannel,
                candidate.websiteUrl(),
                candidate.email(),
                evidence
        );
        if (prospectFitScore < 55) {
            return Qualification.rejected("Hood fit is real, but this vendor is not a strong match for hood's SMB outbound motion.");
        }
        int axis1Fit = axis1FitScore(hoodFitScore, documentationMaturity, ownerContactStatus, evidence);
        int axis2Fit = axis2FitScore(hoodFitScore, serviceAreaOverlapStatus, ownerContactStatus, evidence);
        String segment = segment(axis1Fit, axis2Fit, serviceAreaOverlapStatus, documentationMaturity, evidence);
        String primaryOfferAxis = chooseOfferAxis(axis1Fit, axis2Fit, serviceAreaOverlapStatus, segment);
        ProspectStatus prospectStatus = determineProspectStatus(candidate, prospectFitScore, legitimacyScore, contactConfidence);
        if (prospectStatus == null) {
            return Qualification.rejected("Fit exists, but there is no usable email or enough proof to justify a research-queue import.");
        }
        int exportReadinessScore = exportReadinessScore(
                prospectStatus,
                contactConfidence,
                legitimacyScore,
                sourceChannel,
                candidate.email(),
                candidate.phone(),
                candidate.contactSourceUrl(),
                ownerContactStatus
        );
        String vendorQualityTier = vendorQualityTier(
                hoodFitScore,
                prospectFitScore,
                exportReadinessScore,
                legitimacyScore,
                sizeBand,
                ownershipStyle,
                documentationMaturity,
                evidence
        );
        String sendPriority = determineSendPriority(
                prospectStatus,
                prospectFitScore,
                exportReadinessScore,
                vendorQualityTier,
                ownershipStyle,
                documentationMaturity,
                sizeBand
        );

        return new Qualification(
                true,
                reason(primaryOfferAxis, primaryMetro, segment, serviceAreaOverlapStatus, prospectStatus),
                primaryMetro,
                serviceAreaOverlapStatus,
                sizeBand,
                ownershipStyle,
                documentationMaturity,
                segment,
                primaryOfferAxis,
                axis1Fit,
                axis2Fit,
                ownerContactStatus,
                contactConfidence,
                prospectFitScore,
                exportReadinessScore,
                legitimacyScore,
                vendorQualityTier,
                sourceChannel,
                sendPriority,
                prospectStatus
        );
    }

    private boolean isDuplicate(Candidate candidate) {
        if (hasText(candidate.websiteUrl())
                && vendorProspectRepository.findFirstByWebsiteUrlIgnoreCase(candidate.websiteUrl()).isPresent()) {
            return true;
        }
        return hasText(candidate.sourceUrl())
                && vendorProspectRepository.findFirstBySourceUrlIgnoreCase(candidate.sourceUrl()).isPresent();
    }

    private String evidence(Candidate candidate) {
        return String.join(" ",
                candidate.displayName(),
                candidate.websiteUrl(),
                candidate.sourceUrl(),
                candidate.primaryMetro(),
                candidate.serviceAreaText(),
                candidate.contactName(),
                candidate.email(),
                candidate.phone(),
                candidate.evidenceText()
        ).toLowerCase(Locale.ROOT);
    }

    private String marketEvidence(Candidate candidate) {
        return String.join(" ",
                candidate.primaryMetro(),
                candidate.serviceAreaText(),
                candidate.evidenceText()
        ).toLowerCase(Locale.ROOT);
    }

    private int hoodFitScore(String evidence) {
        int score = 0;
        if (containsAny(evidence,
                "hood cleaning",
                "hood-cleaning",
                "hood exhaust",
                "hood and exhaust cleaning",
                "kitchen hood",
                "vent hood",
                "exhaust hood")) {
            score += 45;
        }
        if (containsAny(evidence,
                "kitchen exhaust",
                "commercial exhaust",
                "grease duct",
                "grease exhaust",
                "exhaust systems")) {
            score += 35;
        }
        if (containsAny(evidence, "nfpa 96", "nfpa code 96", "nfpa-certified", "fire code", "code compliance")) {
            score += 20;
        }
        if (containsAny(evidence, "restaurant", "commercial kitchen", "food service", "foodservice")) {
            score += 15;
        }
        if (containsAny(evidence,
                "exhaust fan",
                "filters",
                "ducts",
                "fire suppression",
                "fan maintenance",
                "hood repair",
                "hood installation",
                "exhaust vent installation")) {
            score += 10;
        }
        if (containsAny(evidence, "pressure washing", "janitorial") && score < 55) {
            score -= 15;
        }
        return clamp(score);
    }

    private String detectSourceChannel(Candidate candidate) {
        String websiteHost = host(candidate.websiteUrl());
        String sourceHost = host(candidate.sourceUrl());
        String normalizedSourceUrl = candidate.sourceUrl().toLowerCase(Locale.ROOT);
        if (hasText(websiteHost) && hasText(sourceHost) && websiteHost.equals(sourceHost)) {
            return SOURCE_OFFICIAL_SITE;
        }
        if (isApprovedVendorListSource(sourceHost, normalizedSourceUrl)) {
            return SOURCE_APPROVED_VENDOR_LIST;
        }
        if (containsAny(sourceHost, "ikeca.org", "nafed.org")) {
            return SOURCE_TRADE_ASSOCIATION;
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
                "allbiz.com",
                "buildzoom.com",
                "macraesbluebook.com",
                "houzz.com",
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

    private boolean isApprovedVendorListSource(String sourceHost, String normalizedSourceUrl) {
        boolean governmentHost = containsAny(sourceHost, ".gov", "nyc.gov");
        if (!governmentHost) {
            return false;
        }
        return containsAny(
                normalizedSourceUrl,
                "approved-companies-commercial-cooking",
                "registered-hood-cleaners",
                "registered-commercial-hood",
                "commercial-kitchen-hood-cleaning",
                "registered_cleaners",
                "hood-cleaners.pdf"
        );
    }

    private String detectPrimaryMetro(Candidate candidate, String marketEvidence) {
        if (hasText(candidate.primaryMetro())) {
            String normalized = candidate.primaryMetro().toLowerCase(Locale.ROOT);
            if (containsAustin(normalized)) {
                return "Austin";
            }
            if (containsDfw(normalized)) {
                return "DFW";
            }
            if (containsSanAntonio(normalized)) {
                return "San Antonio";
            }
            return normalizeExplicitMetro(candidate.primaryMetro());
        }
        if (containsAustin(marketEvidence)) {
            return "Austin";
        }
        if (containsDfw(marketEvidence)) {
            return "DFW";
        }
        if (containsSanAntonio(marketEvidence)) {
            return "San Antonio";
        }
        return "";
    }

    private String normalizeExplicitMetro(String primaryMetro) {
        String normalized = primaryMetro.trim().replaceAll("\\s+", " ");
        if (normalized.length() <= 64) {
            return normalized;
        }
        return normalized.substring(0, 64).trim();
    }

    private boolean containsAustin(String value) {
        return containsAny(value, "austin", "round rock", "cedar park", "pflugerville", "georgetown", "san marcos");
    }

    private boolean containsDfw(String value) {
        return containsAny(value, "dfw", "dallas", "fort worth", "arlington", "plano", "irving", "frisco", "prosper", "flower mound", "metroplex");
    }

    private boolean containsSanAntonio(String value) {
        return containsAny(value, "san antonio", "new braunfels", "boerne", "schertz");
    }

    private SizeBand detectSizeBand(String evidence) {
        if (containsAny(
                evidence,
                "nationwide",
                "franchise",
                "locations across the country",
                "national accounts",
                "national account",
                "national contract",
                "national contracts",
                "national coverage",
                "national service",
                "national services",
                "enterprise clients",
                "enterprise client",
                "enterprise accounts",
                "enterprise account",
                "enterprise solutions",
                "all states",
                "coast to coast"
        )) {
            return SizeBand.ENTERPRISE;
        }
        if (containsAny(evidence, "statewide", "multiple offices", "regional", "all texas")) {
            return SizeBand.REGIONAL;
        }
        if (containsAny(evidence,
                "solo operator",
                "one crew",
                "one truck",
                "father & son",
                "father and son",
                "husband and wife")) {
            return SizeBand.SOLO;
        }
        if (containsAny(evidence,
                "family owned",
                "family-owned",
                "family run",
                "family-operated",
                "owner operated",
                "owner-operated",
                "locally owned",
                "small business",
                "firefighter-owned",
                "veteran-owned")) {
            return SizeBand.MICRO_TEAM;
        }
        return SizeBand.SMALL_OFFICE;
    }

    private OwnerContactStatus detectOwnerContactStatus(Candidate candidate, String evidence) {
        String contactText = (candidate.contactName() + " " + candidate.roleTitle()).toLowerCase(Locale.ROOT);
        if ((hasText(candidate.contactName()) && !looksGenericContactName(candidate.contactName()))
                || containsAny(contactText, "owner", "founder", "president", "principal", "ceo", "coo")) {
            return OwnerContactStatus.DIRECT;
        }
        if (hasText(candidate.email()) || hasText(candidate.phone()) || hasText(candidate.websiteUrl())) {
            return OwnerContactStatus.GENERIC;
        }
        return OwnerContactStatus.UNKNOWN;
    }

    private DocumentationMaturity detectDocumentationMaturity(String evidence) {
        if (containsAny(
                evidence,
                "customer portal",
                "client portal",
                "mobile app",
                "software",
                "dashboard",
                "online booking",
                "field service database",
                "customer database",
                "service database",
                "servicetitan",
                "service titan",
                "housecall pro")) {
            return DocumentationMaturity.HIGH;
        }
        if (proofHeavySignals(evidence)
                || containsAny(evidence, "documentation", "certification sticker", "service report", "service sticker")) {
            return DocumentationMaturity.MEDIUM;
        }
        return DocumentationMaturity.LOW;
    }

    private OwnershipStyle detectOwnershipStyle(OwnerContactStatus ownerContactStatus, String evidence) {
        if (ownerContactStatus == OwnerContactStatus.DIRECT) {
            return OwnershipStyle.OWNER_LED;
        }
        if (containsAny(
                evidence,
                "family owned",
                "family-owned",
                "family run",
                "family-operated",
                "locally owned",
                "small business",
                "father & son",
                "father and son",
                "husband and wife",
                "veteran-owned",
                "firefighter-owned")) {
            return OwnershipStyle.SMALL_OFFICE_LED;
        }
        if (containsAny(evidence, "manager", "management team")) {
            return OwnershipStyle.MANAGER_LED;
        }
        return OwnershipStyle.UNKNOWN;
    }

    private int contactConfidence(Candidate candidate, String evidence) {
        int score = 0;
        if (hasText(candidate.email())) {
            String normalizedEmail = candidate.email().toLowerCase(Locale.ROOT);
            if (usesFreeMailbox(normalizedEmail)) {
                score += 60;
            } else if (containsAny(normalizedEmail, "info@", "contact@", "office@", "sales@")) {
                score += 55;
            } else {
                score += 78;
            }
        }
        if (hasText(candidate.phone())) {
            score += 20;
        }
        if (hasText(candidate.contactName())) {
            score += 12;
        }
        if (hasText(candidate.websiteUrl()) || hasText(candidate.sourceUrl())) {
            score += 8;
        }
        if (containsAny(evidence, "contact", "quote", "estimate", "call", "24/7", "text")) {
            score += 10;
        }
        return clamp(score);
    }

    private int vendorFitScore(
            int hoodFitScore,
            SizeBand sizeBand,
            OwnershipStyle ownershipStyle,
            DocumentationMaturity documentationMaturity,
            String sourceChannel,
            String websiteUrl,
            String email,
            String evidence
    ) {
        int score = 26 + (hoodFitScore / 2);
        if (sizeBand == SizeBand.SOLO) {
            score += 20;
        } else if (sizeBand == SizeBand.MICRO_TEAM) {
            score += 18;
        } else if (sizeBand == SizeBand.SMALL_OFFICE) {
            score += 12;
        } else if (sizeBand == SizeBand.REGIONAL) {
            score += 3;
        }
        if (ownershipStyle == OwnershipStyle.OWNER_LED) {
            score += 10;
        } else if (ownershipStyle == OwnershipStyle.SMALL_OFFICE_LED) {
            score += 7;
        }
        if (documentationMaturity == DocumentationMaturity.LOW) {
            score += 14;
        } else if (documentationMaturity == DocumentationMaturity.MEDIUM) {
            score += 8;
        } else {
            score -= 10;
        }
        if (containsAny(evidence, "family owned", "locally owned", "owner operated", "small business")) {
            score += 8;
        }
        score += restaurantFocusAdjustment(evidence);
        score += hoodFirstAdjacentBonus(hoodFitScore, evidence);
        score += ownerLedBuySignalBonus(ownershipStyle, sourceChannel, evidence);
        score += operatorNeedBonus(sourceChannel, websiteUrl, email, evidence, documentationMaturity);
        score -= mixedServicePenalty(hoodFitScore, evidence);
        score -= commercialMaturityPenalty(evidence, documentationMaturity);
        if (containsAny(evidence, "national accounts", "multi-state", "statewide")) {
            score -= 10;
        }
        if (SOURCE_OTHER_PUBLIC.equals(sourceChannel) && !hasText(websiteUrl)) {
            score -= 6;
        }
        return clamp(score);
    }

    private int legitimacyScore(Candidate candidate, String sourceChannel, String marketEvidence, String evidence) {
        int score = switch (sourceChannel) {
            case SOURCE_OFFICIAL_SITE -> 72;
            case SOURCE_APPROVED_VENDOR_LIST -> 80;
            case SOURCE_TRADE_ASSOCIATION -> 66;
            case SOURCE_GOOGLE_MAPS -> 70;
            case SOURCE_GOVERNMENT_LISTING -> 68;
            case SOURCE_REVIEW_PLATFORM -> 60;
            case SOURCE_SOCIAL_PROFILE -> 56;
            case SOURCE_BUSINESS_DIRECTORY -> 52;
            default -> 44;
        };
        if (hasText(candidate.primaryMetro()) || hasText(candidate.serviceAreaText())) {
            score += 10;
        }
        if (hasText(candidate.phone())) {
            score += 8;
        }
        if (hasText(candidate.email())) {
            score += 6;
        }
        if (containsAny(marketEvidence, "commercial kitchens", "restaurant", "service area", "coverage")) {
            score += 8;
        }
        if (containsAny(evidence, "licensed", "insured", "certified", "years", "since")) {
            score += 6;
        }
        if (containsAny(evidence, "google reviews", "reviews", "photos", "before and after", "job photos")) {
            score += 4;
        }
        if (SOURCE_APPROVED_VENDOR_LIST.equals(sourceChannel)
                && containsAny(evidence,
                "approved",
                "registered",
                "fdny",
                "boston fire",
                "fire marshal",
                "certificate of fitness")) {
            score += 8;
        }
        if (SOURCE_TRADE_ASSOCIATION.equals(sourceChannel)
                && containsAny(evidence,
                "ikeca",
                "cecs",
                "cesi",
                "certified exhaust cleaning specialist",
                "active member",
                "member directory")) {
            score += 8;
        }
        if ((SOURCE_BUSINESS_DIRECTORY.equals(sourceChannel) || SOURCE_REVIEW_PLATFORM.equals(sourceChannel))
                && containsAny(evidence, "owner", "member", "founder", "principal", "ceo")) {
            score += 6;
        }
        if (SOURCE_GOOGLE_MAPS.equals(sourceChannel)
                && containsAny(evidence, "google reviews", "service area business", "call now", "directions")) {
            score += 6;
        }
        if ((SOURCE_GOOGLE_MAPS.equals(sourceChannel) || SOURCE_SOCIAL_PROFILE.equals(sourceChannel))
                && containsAny(evidence, "owner replies", "owner + operator", "founder", "locally owned")) {
            score += 6;
        }
        if (SOURCE_SOCIAL_PROFILE.equals(sourceChannel)
                && containsAny(evidence, "facebook page", "messenger", "instagram", "dm us")) {
            score += 4;
        }
        if (containsAny(candidate.sourceUrl().toLowerCase(Locale.ROOT),
                "craigslist",
                "b12sites.com",
                "ueniweb.com",
                "site123",
                "wixsite.com",
                "digitaljournal.com")) {
            score -= 12;
        }
        if (SOURCE_OTHER_PUBLIC.equals(sourceChannel) && !hasText(candidate.phone()) && !hasText(candidate.websiteUrl())) {
            score -= 8;
        }
        return clamp(score);
    }

    private int axis1FitScore(
            int hoodFitScore,
            DocumentationMaturity documentationMaturity,
            OwnerContactStatus ownerContactStatus,
            String evidence
    ) {
        int score = 48 + (hoodFitScore / 4);
        if (documentationMaturity == DocumentationMaturity.LOW) {
            score += 22;
        } else if (documentationMaturity == DocumentationMaturity.MEDIUM) {
            score += 10;
        }
        if (ownerContactStatus == OwnerContactStatus.DIRECT) {
            score += 8;
        }
        if (proofHeavySignals(evidence)) {
            score += 12;
        }
        if (containsAny(evidence, "scheduled service", "quarterly", "semi-annual", "inspection", "compliance")) {
            score += 8;
        }
        if (containsAny(evidence, "blocked access", "inaccessible", "partial service", "service sticker", "authorized by")) {
            score += 6;
        }
        return clamp(score);
    }

    private int axis2FitScore(
            int hoodFitScore,
            String serviceAreaOverlapStatus,
            OwnerContactStatus ownerContactStatus,
            String evidence
    ) {
        int score = 45 + (hoodFitScore / 5);
        if (ACTIVE_AXIS2_OVERLAP.equals(serviceAreaOverlapStatus)) {
            score += 24;
        } else {
            score += 8;
        }
        if (ownerContactStatus == OwnerContactStatus.DIRECT) {
            score += 8;
        }
        if (containsAny(evidence, "grow", "new customers", "all metro", "metroplex", "24/7 quotes", "surrounding areas", "service areas")) {
            score += 10;
        }
        return clamp(score);
    }

    private String segment(
            int axis1Fit,
            int axis2Fit,
            String serviceAreaOverlapStatus,
            DocumentationMaturity documentationMaturity,
            String evidence
    ) {
        boolean growthSignal = containsAny(evidence, "all metro", "metroplex", "surrounding areas", "new customers", "quote", "24/7");
        if (ACTIVE_AXIS2_OVERLAP.equals(serviceAreaOverlapStatus) && growthSignal && axis2Fit + 8 >= axis1Fit) {
            return "growth_oriented";
        }
        if ((documentationMaturity == DocumentationMaturity.LOW || proofHeavySignals(evidence)) && axis1Fit >= axis2Fit) {
            return "stability_oriented";
        }
        return "mixed";
    }

    private String chooseOfferAxis(int axis1Fit, int axis2Fit, String serviceAreaOverlapStatus, String segment) {
        if (!ACTIVE_AXIS2_OVERLAP.equals(serviceAreaOverlapStatus)) {
            return "AXIS_1";
        }
        if ("growth_oriented".equals(segment)) {
            return "AXIS_2";
        }
        if ("stability_oriented".equals(segment)) {
            return "AXIS_1";
        }
        return axis2Fit >= axis1Fit ? "AXIS_2" : "AXIS_1";
    }

    private ProspectStatus determineProspectStatus(
            Candidate candidate,
            int prospectFitScore,
            int legitimacyScore,
            int contactConfidence
    ) {
        if (hasUsableEmail(candidate.email()) && contactConfidence >= 50) {
            return ProspectStatus.ACTIVE;
        }
        if (prospectFitScore >= 65
                && legitimacyScore >= 55
                && (hasText(candidate.phone()) || hasText(candidate.websiteUrl()) || hasText(candidate.contactSourceUrl()))) {
            return ProspectStatus.RESEARCH;
        }
        return null;
    }

    private int exportReadinessScore(
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
        if (hasText(contactSourceUrl)) {
            score += 8;
        }
        if (hasText(phone)) {
            score += 4;
        }
        if (ownerContactStatus == OwnerContactStatus.DIRECT) {
            score += 6;
        }
        score += switch (sourceChannel) {
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

    private String determineSendPriority(
            ProspectStatus prospectStatus,
            int prospectFitScore,
            int exportReadinessScore,
            String vendorQualityTier,
            OwnershipStyle ownershipStyle,
            DocumentationMaturity documentationMaturity,
            SizeBand sizeBand
    ) {
        if (prospectStatus == ProspectStatus.RESEARCH) {
            return "RESEARCH";
        }
        int icpBonus = 0;
        if (ownershipStyle == OwnershipStyle.OWNER_LED) {
            icpBonus += 4;
        } else if (ownershipStyle == OwnershipStyle.SMALL_OFFICE_LED) {
            icpBonus += 2;
        }
        if (documentationMaturity == DocumentationMaturity.LOW) {
            icpBonus += 4;
        } else if (documentationMaturity == DocumentationMaturity.MEDIUM) {
            icpBonus += 1;
        }
        if (sizeBand == SizeBand.SOLO || sizeBand == SizeBand.MICRO_TEAM) {
            icpBonus += 4;
        } else if (sizeBand == SizeBand.REGIONAL) {
            icpBonus -= 2;
        }
        if ("A".equals(vendorQualityTier)) {
            icpBonus += 4;
        }
        int fitForPriority = prospectFitScore + icpBonus;
        if (fitForPriority >= 86 && exportReadinessScore >= 78) {
            return "P1";
        }
        if (fitForPriority >= 74 && exportReadinessScore >= 60) {
            return "P2";
        }
        return "P3";
    }

    private int restaurantFocusAdjustment(String evidence) {
        int score = 0;
        if (containsAny(evidence, "restaurant", "commercial kitchen", "food service", "foodservice")) {
            score += 12;
        }
        if (containsAny(evidence, "bar", "cafe", "bakery", "food truck", "deli")) {
            score += 4;
        }
        int institutionCount = countContains(
                evidence,
                "school",
                "university",
                "hospital",
                "nursing home",
                "assisted living",
                "government",
                "embassy",
                "church",
                "property management",
                "convention center"
        );
        score -= Math.min(16, institutionCount * 4);
        return score;
    }

    private int ownerLedBuySignalBonus(OwnershipStyle ownershipStyle, String sourceChannel, String evidence) {
        int score = 0;
        if (containsAny(
                evidence,
                "founder",
                "owner + operator",
                "owner/operator",
                "owner-led",
                "veteran-owned",
                "firefighter-owned",
                "family-run")) {
            score += 6;
        }
        if (containsAny(
                evidence,
                "call or text",
                "call us",
                "text us",
                "same-day estimate",
                "same day estimate",
                "request service",
                "request quote",
                "free quote",
                "free estimate",
                "message us")) {
            score += 4;
        }
        if (containsAny(
                evidence,
                "owner replies",
                "recent job photos",
                "before and after",
                "before-after",
                "job photos",
                "google reviews")) {
            score += 4;
        }
        if ((SOURCE_GOOGLE_MAPS.equals(sourceChannel) || SOURCE_SOCIAL_PROFILE.equals(sourceChannel))
                && (ownershipStyle == OwnershipStyle.OWNER_LED || ownershipStyle == OwnershipStyle.SMALL_OFFICE_LED)) {
            score += 4;
        }
        return score;
    }

    private int operatorNeedBonus(
            String sourceChannel,
            String websiteUrl,
            String email,
            String evidence,
            DocumentationMaturity documentationMaturity
    ) {
        int score = 0;
        if (!hasText(websiteUrl)
                && (SOURCE_GOOGLE_MAPS.equals(sourceChannel)
                || SOURCE_SOCIAL_PROFILE.equals(sourceChannel)
                || SOURCE_REVIEW_PLATFORM.equals(sourceChannel)
                || SOURCE_BUSINESS_DIRECTORY.equals(sourceChannel))) {
            score += 8;
        }
        if (usesFreeMailbox(email)) {
            score += 4;
        }
        if (containsAny(evidence, "call us", "text us", "message us", "messenger", "same day quote", "free estimate", "free quote")) {
            score += 6;
        }
        if (documentationMaturity != DocumentationMaturity.HIGH && proofHeavySignals(evidence)) {
            score += 6;
        }
        return score;
    }

    private String vendorQualityTier(
            int hoodFitScore,
            int prospectFitScore,
            int exportReadinessScore,
            int legitimacyScore,
            SizeBand sizeBand,
            OwnershipStyle ownershipStyle,
            DocumentationMaturity documentationMaturity,
            String evidence
    ) {
        boolean adjacentMixed = containsAny(
                evidence,
                "fire suppression",
                "fire extinguisher",
                "hood installation",
                "hood repair",
                "restaurant equipment"
        );
        boolean broadMixed = containsAny(
                evidence,
                "pressure washing",
                "power washing",
                "janitorial",
                "carpet cleaning",
                "window cleaning",
                "floor cleaning",
                "floor care",
                "air duct",
                "hvac",
                "plumbing",
                "pest control",
                "grease trap",
                "property management"
        );
        boolean smallLocalOperator = sizeBand == SizeBand.SOLO
                || sizeBand == SizeBand.MICRO_TEAM
                || sizeBand == SizeBand.SMALL_OFFICE;
        boolean ownerLed = ownershipStyle == OwnershipStyle.OWNER_LED
                || ownershipStyle == OwnershipStyle.SMALL_OFFICE_LED;
        boolean hoodFirst = hoodFitScore >= 72
                && containsAny(evidence, "restaurant", "commercial kitchen", "food service", "kitchen exhaust");

        if (hoodFirst
                && prospectFitScore >= 78
                && exportReadinessScore >= 55
                && legitimacyScore >= 60
                && smallLocalOperator
                && ownerLed
                && documentationMaturity != DocumentationMaturity.HIGH
                && !broadMixed
                && !adjacentMixed) {
            return "A";
        }
        return "B";
    }

    private int hoodFirstAdjacentBonus(int hoodFitScore, String evidence) {
        if (hoodFitScore < 70) {
            return 0;
        }
        if (!containsAny(
                evidence,
                "fire suppression",
                "fire extinguisher",
                "hood installation",
                "hood repair",
                "restaurant equipment")) {
            return 0;
        }
        if (!containsAny(evidence, "restaurant", "commercial kitchen", "food service", "kitchen exhaust")) {
            return 0;
        }
        int score = 4;
        if (!containsAny(
                evidence,
                "pressure washing",
                "power washing",
                "janitorial",
                "carpet cleaning",
                "window cleaning",
                "floor cleaning",
                "floor care",
                "air duct",
                "hvac",
                "property management")) {
            score += 2;
        }
        return score;
    }

    private int mixedServicePenalty(int hoodFitScore, String evidence) {
        int broadServiceCount = countContains(
                evidence,
                "pressure washing",
                "power washing",
                "janitorial",
                "carpet cleaning",
                "window cleaning",
                "floor cleaning",
                "floor care",
                "trash chute",
                "air duct",
                "hvac",
                "plumbing",
                "pest control",
                "grease trap"
        );
        int adjacentServiceCount = countContains(
                evidence,
                "fire suppression",
                "fire extinguisher",
                "hood installation",
                "hood repair",
                "restaurant equipment"
        );
        int broadPenalty = Math.min(15, broadServiceCount * 3);
        int adjacentPenalty = Math.min(8, adjacentServiceCount * 2);
        boolean hoodFirstAdjacent = hoodFitScore >= 70
                && containsAny(evidence, "restaurant", "commercial kitchen", "food service", "kitchen exhaust");
        if (hoodFirstAdjacent) {
            if (broadServiceCount == 0) {
                adjacentPenalty = Math.min(3, adjacentServiceCount);
            } else if (broadServiceCount == 1) {
                adjacentPenalty = Math.min(4, adjacentServiceCount + 1);
            }
        }
        int penalty = broadPenalty + adjacentPenalty;
        if (containsAny(evidence, "air duct", "hvac")
                && containsAny(evidence, "carpet cleaning", "janitorial", "window cleaning", "floor care")) {
            penalty += 4;
        }
        if (broadServiceCount >= 3 && adjacentServiceCount > 0) {
            penalty += 2;
        }
        return penalty;
    }

    private int commercialMaturityPenalty(String evidence, DocumentationMaturity documentationMaturity) {
        int penalty = documentationMaturity == DocumentationMaturity.HIGH ? 10 : 0;
        if (containsAny(
                evidence,
                "customer portal",
                "client portal",
                "mobile app",
                "dashboard",
                "software",
                "online booking",
                "field service database",
                "customer database",
                "servicetitan",
                "service titan",
                "housecall pro")) {
            penalty += 10;
        }
        if (containsAny(evidence, "national accounts", "account managers", "enterprise clients", "thomas verified")) {
            penalty += 4;
        }
        return penalty;
    }

    private String reason(
            String primaryOfferAxis,
            String primaryMetro,
            String segment,
            String serviceAreaOverlapStatus,
            ProspectStatus prospectStatus
    ) {
        if (prospectStatus == ProspectStatus.RESEARCH) {
            return primaryMetro + " looks like a strong local fit, but it is not email-ready yet; keep it in research queue.";
        }
        if ("AXIS_2".equals(primaryOfferAxis)) {
            return "Austin active overlap plus " + segment + " profile supports Axis 2-first cold email.";
        }
        if (NO_ACTIVE_AXIS2_OVERLAP.equals(serviceAreaOverlapStatus)) {
            return primaryMetro + " is prospectable, but not active Axis 2 coverage; use Axis 1-first.";
        }
        return "Documentation and trust angle is stronger than live-list angle; use Axis 1-first.";
    }

    private String buildNotes(Candidate candidate, Qualification qualification) {
        return "Sourced by vendor prospect engine. "
                + qualification.reason()
                + " Quality tier: " + qualification.vendorQualityTier() + "."
                + " Source channel: " + qualification.sourceChannel() + "."
                + " Fit " + qualification.prospectFitScore()
                + " / ready " + qualification.exportReadinessScore()
                + " / legitimacy " + qualification.legitimacyScore()
                + " / reachability " + qualification.contactConfidence() + "."
                + " Evidence: "
                + firstNonBlank(candidate.evidenceText(), "Trace source URL and service-area page before send.");
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

    private int countContains(String value, String... needles) {
        if (value == null) {
            return 0;
        }
        int count = 0;
        for (String needle : needles) {
            if (value.contains(needle)) {
                count++;
            }
        }
        return count;
    }

    private boolean proofHeavySignals(String evidence) {
        return containsAny(
                evidence,
                "before and after",
                "before-and-after",
                "photo report",
                "service report",
                "job photos",
                "service sticker",
                "certification sticker",
                "photo inspection"
        );
    }

    private int clamp(int score) {
        return Math.max(0, Math.min(100, score));
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String blankToNull(String value) {
        return hasText(value) ? value.trim() : null;
    }

    private boolean hasUsableEmail(String value) {
        return hasText(value) && value.contains("@");
    }

    private boolean looksGenericContactName(String value) {
        if (!hasText(value)) {
            return true;
        }
        String normalized = value.toLowerCase(Locale.ROOT);
        return containsAny(normalized, "team", "office", "front desk", "sales", "support", "contact");
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

    private String firstNonBlank(String primary, String fallback) {
        return hasText(primary) ? primary.trim() : fallback;
    }

    private record Candidate(
            String displayName,
            String websiteUrl,
            String sourceUrl,
            String primaryMetro,
            String serviceAreaText,
            String contactName,
            String email,
            String phone,
            String roleTitle,
            String contactSourceUrl,
            String evidenceText
    ) {
    }

    private record Qualification(
            boolean importable,
            String reason,
            String primaryMetro,
            String serviceAreaOverlapStatus,
            SizeBand sizeBand,
            OwnershipStyle ownershipStyle,
            DocumentationMaturity documentationMaturity,
            String segmentationLabel,
            String primaryOfferAxis,
            int axis1AngleFit,
            int axis2AngleFit,
            OwnerContactStatus ownerContactStatus,
            int contactConfidence,
            int prospectFitScore,
            int exportReadinessScore,
            int legitimacyScore,
            String vendorQualityTier,
            String sourceChannel,
            String sendPriority,
            ProspectStatus prospectStatus
    ) {

        private static Qualification rejected(String reason) {
            return new Qualification(
                    false,
                    reason,
                    "",
                    "",
                    SizeBand.SMALL_OFFICE,
                    OwnershipStyle.UNKNOWN,
                    DocumentationMaturity.LOW,
                    "",
                    "",
                    0,
                    0,
                    OwnerContactStatus.UNKNOWN,
                    0,
                    0,
                    0,
                    0,
                    "B",
                    "",
                    "",
                    ProspectStatus.RESEARCH
            );
        }
    }
}
