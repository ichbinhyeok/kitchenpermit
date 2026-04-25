package owner.hood.application.commercial;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import owner.hood.domain.commercial.CommercialLead;
import owner.hood.domain.commercial.CommercialLeadSourceType;
import owner.hood.domain.commercial.CommercialLeadStatus;
import owner.hood.infrastructure.persistence.CommercialLeadRepository;

import java.util.UUID;

@Service
public class CommercialLeadIntakeService {

    private final CommercialLeadRepository commercialLeadRepository;
    private final InquiryMailDraftFactory inquiryMailDraftFactory;

    public CommercialLeadIntakeService(
            CommercialLeadRepository commercialLeadRepository,
            InquiryMailDraftFactory inquiryMailDraftFactory
    ) {
        this.commercialLeadRepository = commercialLeadRepository;
        this.inquiryMailDraftFactory = inquiryMailDraftFactory;
    }

    @Transactional
    public PublicInquiryView capturePublicInquiry(PublicInquiryCommand command) {
        CommercialLead lead = new CommercialLead();
        lead.setSourceType(CommercialLeadSourceType.PUBLIC_START_FORM);
        lead.setCompanyName(normalizeRequired(command.companyName()));
        lead.setContactName(normalizeRequired(command.contactName()));
        lead.setEmail(normalizeRequired(command.email()));
        lead.setPhone(normalizeOptional(command.phone()));
        lead.setServiceAreaText(normalizeRequired(command.serviceArea()));
        lead.setProductInterest(normalizeRequired(command.productInterest()));
        lead.setLeadNotes(normalizeOptional(command.notes()));
        lead.setLeadStatus(CommercialLeadStatus.NEW);

        CommercialLead savedLead = commercialLeadRepository.save(lead);
        return toView(savedLead);
    }

    @Transactional(readOnly = true)
    public PublicInquiryView loadInquiry(UUID leadId) {
        CommercialLead lead = commercialLeadRepository.findById(leadId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inquiry not found"));
        return toView(lead);
    }

    private PublicInquiryView toView(CommercialLead lead) {
        return new PublicInquiryView(
                lead.getId(),
                lead.getSourceType().name(),
                lead.getCompanyName(),
                lead.getContactName(),
                lead.getEmail(),
                lead.getPhone(),
                lead.getServiceAreaText(),
                lead.getProductInterest(),
                lead.getLeadNotes(),
                lead.getLeadStatus().name(),
                lead.getCreatedAt(),
                inquiryMailDraftFactory.buildDraftUrl(
                        lead.getCompanyName(),
                        lead.getContactName(),
                        lead.getEmail(),
                        lead.getProductInterest(),
                        lead.getServiceAreaText(),
                        lead.getPhone(),
                        lead.getLeadNotes()
                )
        );
    }

    private String normalizeRequired(String value) {
        return value == null ? "" : value.trim();
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
