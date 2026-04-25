package owner.hood.web.intake;

import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import owner.hood.application.commercial.CommercialLeadIntakeService;
import owner.hood.application.commercial.InquiryMailDraftFactory;
import owner.hood.application.commercial.PublicInquiryCommand;
import owner.hood.application.commercial.PublicInquiryView;
import owner.hood.web.common.PageMetaFactory;

import java.util.UUID;

@Controller
public class PublicStartController {

    private final PageMetaFactory pageMetaFactory;
    private final InquiryMailDraftFactory inquiryMailDraftFactory;
    private final CommercialLeadIntakeService commercialLeadIntakeService;

    public PublicStartController(
            PageMetaFactory pageMetaFactory,
            InquiryMailDraftFactory inquiryMailDraftFactory,
            CommercialLeadIntakeService commercialLeadIntakeService
    ) {
        this.pageMetaFactory = pageMetaFactory;
        this.inquiryMailDraftFactory = inquiryMailDraftFactory;
        this.commercialLeadIntakeService = commercialLeadIntakeService;
    }

    @GetMapping("/start")
    public String start(Model model) {
        if (!model.containsAttribute("form")) {
            model.addAttribute("form", new StartRequestForm());
        }
        model.addAttribute("page", pageMetaFactory.publicPage(
                "/start",
                "Start | hood",
                "Start the hood workflow with a structured intake path for Axis 1, Axis 2, or bundle requests."
        ));
        model.addAttribute("siteName", pageMetaFactory.siteName());
        model.addAttribute("supportEmail", pageMetaFactory.supportEmail());
        model.addAttribute("genericEmailDraftUrl", buildEmailDraftUrl(null, null, null, null, null, null, null));
        return "page/start";
    }

    @PostMapping("/start")
    public String submit(
            @Valid @ModelAttribute("form") StartRequestForm form,
            BindingResult bindingResult,
            RedirectAttributes redirectAttributes,
            Model model
    ) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("page", pageMetaFactory.publicPage(
                    "/start",
                    "Start | hood",
                    "Start the hood workflow with a structured intake path for Axis 1, Axis 2, or bundle requests."
            ));
            model.addAttribute("siteName", pageMetaFactory.siteName());
            model.addAttribute("supportEmail", pageMetaFactory.supportEmail());
            model.addAttribute("genericEmailDraftUrl", buildEmailDraftUrl(null, null, null, null, null, null, null));
            return "page/start";
        }
        PublicInquiryView inquiry = commercialLeadIntakeService.capturePublicInquiry(new PublicInquiryCommand(
                form.getCompanyName(),
                form.getContactName(),
                form.getEmail(),
                null,
                form.getServiceArea(),
                form.getProductInterest(),
                null
        ));
        redirectAttributes.addAttribute("leadId", inquiry.id());
        return "redirect:/start/submitted";
    }

    @GetMapping("/start/submitted")
    public String submitted(
            @RequestParam(name = "leadId", required = false) UUID leadId,
            Model model
    ) {
        model.addAttribute("page", pageMetaFactory.publicPage(
                "/start/submitted",
                "Start Submitted | hood",
                "A confirmation surface for structured hood intake requests."
        ));
        model.addAttribute("siteName", pageMetaFactory.siteName());
        model.addAttribute("supportEmail", pageMetaFactory.supportEmail());
        if (leadId != null) {
            PublicInquiryView inquiry = commercialLeadIntakeService.loadInquiry(leadId);
            hydrateSubmittedModel(model, inquiry);
            return "page/start-submitted";
        }

        model.addAttribute("emailDraftUrl", buildEmailDraftUrl(
                (String) model.getAttribute("submittedCompanyName"),
                (String) model.getAttribute("submittedContactName"),
                (String) model.getAttribute("submittedEmail"),
                (String) model.getAttribute("submittedProductInterest"),
                (String) model.getAttribute("submittedServiceArea"),
                null,
                null
        ));
        return "page/start-submitted";
    }

    private String buildEmailDraftUrl(
            String companyName,
            String contactName,
            String email,
            String productInterest,
            String serviceArea,
            String phone,
            String notes
    ) {
        return inquiryMailDraftFactory.buildDraftUrl(
                companyName,
                contactName,
                email,
                productInterest,
                serviceArea,
                phone,
                notes
        );
    }

    private void hydrateSubmittedModel(Model model, PublicInquiryView inquiry) {
        model.addAttribute("submittedCompanyName", inquiry.companyName());
        model.addAttribute("submittedContactName", inquiry.contactName());
        model.addAttribute("submittedEmail", inquiry.email());
        model.addAttribute("submittedProductInterest", inquiry.productInterest());
        model.addAttribute("submittedServiceArea", inquiry.serviceArea());
        model.addAttribute("emailDraftUrl", inquiry.emailDraftUrl());
    }
}
