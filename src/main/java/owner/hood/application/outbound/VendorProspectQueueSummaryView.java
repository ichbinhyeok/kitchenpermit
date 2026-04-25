package owner.hood.application.outbound;

public record VendorProspectQueueSummaryView(
        int sendNowCount,
        int enrichFirstCount,
        int reserveCount
) {
}
