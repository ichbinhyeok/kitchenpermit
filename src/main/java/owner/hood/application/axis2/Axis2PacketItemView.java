package owner.hood.application.axis2;

public record Axis2PacketItemView(
        int rankOrder,
        String businessName,
        String streetAddress,
        String cityName,
        String metroLabel,
        String triggerType,
        String triggerDateText,
        int finalScore,
        String whySurfaced,
        String triggerSummary,
        String hoodRelevanceNote,
        String suggestedEmailOpener,
        String suggestedCallOpener,
        String vendorAngleNote,
        String prepChecklist,
        String vendorCta,
        String contactLadder,
        String riskNote,
        String sourceName,
        String sourceUrl,
        String sourceExcerpt
) {
}
