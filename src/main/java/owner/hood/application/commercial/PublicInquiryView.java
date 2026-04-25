package owner.hood.application.commercial;

import java.time.Instant;
import java.util.UUID;

public record PublicInquiryView(
        UUID id,
        String sourceType,
        String companyName,
        String contactName,
        String email,
        String phone,
        String serviceArea,
        String productInterest,
        String notes,
        String leadStatus,
        Instant createdAt,
        String emailDraftUrl
) {
}
