package owner.hood.application.outbound;

public record VendorProspectEnrichmentRowView(
        String displayName,
        String decision,
        String reason,
        String prospectStatus,
        String sendPriority,
        String sourceChannel,
        String contactPath
) {

    public boolean successful() {
        return !"rejected".equals(decision);
    }
}
