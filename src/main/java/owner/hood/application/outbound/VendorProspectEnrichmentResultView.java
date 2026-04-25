package owner.hood.application.outbound;

import java.util.List;

public record VendorProspectEnrichmentResultView(
        int processedCount,
        int updatedCount,
        int rejectedCount,
        List<VendorProspectEnrichmentRowView> rows
) {
}
