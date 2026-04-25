package owner.hood.application.outbound;

import jakarta.validation.constraints.NotBlank;

public class VendorProspectImportForm {

    @NotBlank
    private String candidateRows;

    public String getCandidateRows() {
        return candidateRows;
    }

    public void setCandidateRows(String candidateRows) {
        this.candidateRows = candidateRows;
    }
}
