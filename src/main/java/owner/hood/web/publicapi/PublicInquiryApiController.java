package owner.hood.web.publicapi;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import owner.hood.application.commercial.CommercialLeadIntakeService;
import owner.hood.application.commercial.PublicInquiryCommand;
import owner.hood.application.commercial.PublicInquiryView;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/public/inquiries")
public class PublicInquiryApiController {

    private final CommercialLeadIntakeService commercialLeadIntakeService;

    public PublicInquiryApiController(CommercialLeadIntakeService commercialLeadIntakeService) {
        this.commercialLeadIntakeService = commercialLeadIntakeService;
    }

    @PostMapping
    public ResponseEntity<PublicInquiryView> createInquiry(
            @Valid @RequestBody CreatePublicInquiryRequest request
    ) {
        PublicInquiryView inquiry = commercialLeadIntakeService.capturePublicInquiry(new PublicInquiryCommand(
                request.companyName(),
                request.contactName(),
                request.email(),
                request.phone(),
                request.serviceArea(),
                request.productInterest(),
                request.notes()
        ));
        return ResponseEntity
                .created(URI.create("/api/public/inquiries/" + inquiry.id()))
                .body(inquiry);
    }

    @GetMapping("/{leadId}")
    public PublicInquiryView getInquiry(@PathVariable UUID leadId) {
        return commercialLeadIntakeService.loadInquiry(leadId);
    }

    public record CreatePublicInquiryRequest(
            @NotBlank @Size(max = 255) String companyName,
            @NotBlank @Size(max = 255) String contactName,
            @NotBlank @Email @Size(max = 255) String email,
            @Size(max = 64) String phone,
            @NotBlank @Size(max = 1000) String serviceArea,
            @NotBlank @Size(max = 64) String productInterest,
            @Size(max = 2000) String notes
    ) {
    }
}
