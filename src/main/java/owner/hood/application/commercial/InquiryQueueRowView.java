package owner.hood.application.commercial;

public record InquiryQueueRowView(
        String leadId,
        String sourceTypeLabel,
        String companyName,
        String contactName,
        String email,
        String phone,
        String serviceAreaText,
        String productInterest,
        String notesPreview,
        String leadStatusLabel,
        String leadStatusTone,
        String createdAtText,
        boolean convertible
) {
}
