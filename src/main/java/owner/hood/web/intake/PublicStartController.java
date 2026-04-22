package owner.hood.web.intake;

import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import owner.hood.web.common.PageMetaFactory;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Controller
public class PublicStartController {

    private final PageMetaFactory pageMetaFactory;

    public PublicStartController(PageMetaFactory pageMetaFactory) {
        this.pageMetaFactory = pageMetaFactory;
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
        model.addAttribute("genericEmailDraftUrl", buildEmailDraftUrl(null, null, null, null, null));
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
            model.addAttribute("genericEmailDraftUrl", buildEmailDraftUrl(null, null, null, null, null));
            return "page/start";
        }
        redirectAttributes.addFlashAttribute("submittedCompanyName", form.getCompanyName());
        redirectAttributes.addFlashAttribute("submittedContactName", form.getContactName());
        redirectAttributes.addFlashAttribute("submittedEmail", form.getEmail());
        redirectAttributes.addFlashAttribute("submittedProductInterest", form.getProductInterest());
        redirectAttributes.addFlashAttribute("submittedServiceArea", form.getServiceArea());
        return "redirect:/start/submitted";
    }

    @GetMapping("/start/submitted")
    public String submitted(Model model) {
        model.addAttribute("page", pageMetaFactory.publicPage(
                "/start/submitted",
                "Start Submitted | hood",
                "A confirmation surface for structured hood intake requests."
        ));
        model.addAttribute("siteName", pageMetaFactory.siteName());
        model.addAttribute("supportEmail", pageMetaFactory.supportEmail());
        model.addAttribute("emailDraftUrl", buildEmailDraftUrl(
                (String) model.getAttribute("submittedCompanyName"),
                (String) model.getAttribute("submittedContactName"),
                (String) model.getAttribute("submittedEmail"),
                (String) model.getAttribute("submittedProductInterest"),
                (String) model.getAttribute("submittedServiceArea")
        ));
        return "page/start-submitted";
    }

    private String buildEmailDraftUrl(
            String companyName,
            String contactName,
            String email,
            String productInterest,
            String serviceArea
    ) {
        String subject = firstNonBlank(productInterest, "Project request")
                + " request"
                + (hasText(companyName) ? " - " + companyName : "");

        String body = "Kitchen Permit team,\r\n\r\n"
                + "I want to discuss " + firstNonBlank(productInterest, "a project") + ".\r\n\r\n"
                + "Company: " + firstNonBlank(companyName, "Not provided") + "\r\n"
                + "Primary contact: " + firstNonBlank(contactName, "Not provided") + "\r\n"
                + "Email: " + firstNonBlank(email, "Not provided") + "\r\n"
                + "Service area: " + firstNonBlank(serviceArea, "Not provided") + "\r\n\r\n"
                + "Notes:\r\n";

        return "mailto:" + pageMetaFactory.supportEmail()
                + "?subject=" + encode(subject)
                + "&body=" + encode(body);
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String firstNonBlank(String primary, String fallback) {
        return hasText(primary) ? primary : fallback;
    }
}
