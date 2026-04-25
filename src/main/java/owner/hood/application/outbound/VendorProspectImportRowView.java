package owner.hood.application.outbound;

public record VendorProspectImportRowView(
        String displayName,
        String decision,
        String reason,
        String primaryMetro,
        String segmentationLabel,
        String primaryOfferAxis,
        String prospectStatus,
        String sendPriority,
        String sourceUrl
) {

    public boolean imported() {
        return "imported".equals(decision);
    }
}
