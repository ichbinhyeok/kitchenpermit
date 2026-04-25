package owner.hood.application.outbound;

import jakarta.validation.constraints.NotBlank;

public class VendorProspectEnrichmentForm {

    @NotBlank
    private String enrichmentRows;

    public String getEnrichmentRows() {
        return enrichmentRows;
    }

    public void setEnrichmentRows(String enrichmentRows) {
        this.enrichmentRows = enrichmentRows;
    }
}
