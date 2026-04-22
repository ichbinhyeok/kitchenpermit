package owner.hood.application.axis1;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

public record Axis1BriefView(
        String token,
        String vendorBrandName,
        String vendorPrimaryContactName,
        String vendorReplyEmail,
        String vendorPhone,
        String vendorServiceAreaText,
        String vendorServiceOfferings,
        String vendorCtaText,
        String certificationsBlurb,
        String insuranceBlurb,
        String customerName,
        String siteName,
        String siteAddress,
        LocalDate serviceDate,
        String crewLabel,
        String serviceSummary,
        LocalDate nextRecommendedServiceDate,
        List<Axis1BriefFindingView> findings
) {
    private static final DateTimeFormatter DISPLAY_DATE =
            DateTimeFormatter.ofPattern("MMM d, uuuu", Locale.US);

    public String serviceDateText() {
        return serviceDate == null ? "Not supplied" : serviceDate.format(DISPLAY_DATE);
    }

    public String nextRecommendedServiceDateText() {
        return nextRecommendedServiceDate == null ? "To be scheduled" : nextRecommendedServiceDate.format(DISPLAY_DATE);
    }
}
