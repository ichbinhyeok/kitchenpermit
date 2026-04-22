package owner.hood.application.outbound;

public record OutboundPerformanceRowView(
        String label,
        int campaignCount,
        int totalSent,
        int positiveReplyCount,
        int paidBatchOrderCount
) {
}
