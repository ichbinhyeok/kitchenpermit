package owner.hood.application.outbound;

import java.util.List;

public record VendorProspectImportResultView(
        int processedCount,
        int importedCount,
        int rejectedCount,
        List<VendorProspectImportRowView> rows
) {
}
