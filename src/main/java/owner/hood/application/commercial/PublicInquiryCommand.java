package owner.hood.application.commercial;

public record PublicInquiryCommand(
        String companyName,
        String contactName,
        String email,
        String phone,
        String serviceArea,
        String productInterest,
        String notes
) {
}
