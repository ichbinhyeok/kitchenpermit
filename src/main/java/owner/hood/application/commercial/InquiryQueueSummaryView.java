package owner.hood.application.commercial;

public record InquiryQueueSummaryView(
        long openInquiries,
        long newInquiries,
        long reviewedInquiries,
        long convertedInquiries
) {
}
