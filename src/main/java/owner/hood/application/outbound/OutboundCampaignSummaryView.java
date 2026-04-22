package owner.hood.application.outbound;

public record OutboundCampaignSummaryView(
        String campaignId,
        String prospectName,
        String primaryOfferAxis,
        String campaignStage,
        String providerCampaignId,
        String windowLabel,
        int totalSent,
        int deliveredCount,
        int bouncedCount,
        int positiveReplyCount,
        int sampleRequestCount,
        int paidBatchOrderCount
) {
}
