package owner.hood.web.ops;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import owner.hood.application.commercial.CommercialInquiryOpsService;
import owner.hood.application.commercial.OrderConversionResult;
import owner.hood.web.common.PageMetaFactory;

import java.util.UUID;

@Controller
public class OpsInquiryController {

    private final CommercialInquiryOpsService commercialInquiryOpsService;
    private final PageMetaFactory pageMetaFactory;

    public OpsInquiryController(
            CommercialInquiryOpsService commercialInquiryOpsService,
            PageMetaFactory pageMetaFactory
    ) {
        this.commercialInquiryOpsService = commercialInquiryOpsService;
        this.pageMetaFactory = pageMetaFactory;
    }

    @GetMapping("/ops/inquiries")
    public String index(Model model) {
        model.addAttribute("page", pageMetaFactory.packetPage("/ops/inquiries", "Ops Inquiries | hood", "Internal inquiry inbox"));
        model.addAttribute("summary", commercialInquiryOpsService.loadSummary());
        model.addAttribute("inquiries", commercialInquiryOpsService.listOpenInquiries());
        return "page/ops/inquiries-index";
    }

    @PostMapping("/ops/inquiries/{leadId}/convert")
    public String convertToOrder(
            @PathVariable UUID leadId,
            RedirectAttributes redirectAttributes
    ) {
        OrderConversionResult conversion = commercialInquiryOpsService.convertToOrder(leadId);
        redirectAttributes.addFlashAttribute("convertedOrderNumber", conversion.orderNumber());
        return "redirect:/ops/orders";
    }
}
