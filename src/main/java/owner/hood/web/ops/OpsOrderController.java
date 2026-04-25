package owner.hood.web.ops;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import owner.hood.application.commercial.CommercialOrderService;
import owner.hood.web.common.PageMetaFactory;

@Controller
public class OpsOrderController {

    private final CommercialOrderService commercialOrderService;
    private final PageMetaFactory pageMetaFactory;

    public OpsOrderController(CommercialOrderService commercialOrderService, PageMetaFactory pageMetaFactory) {
        this.commercialOrderService = commercialOrderService;
        this.pageMetaFactory = pageMetaFactory;
    }

    @GetMapping("/ops/orders")
    public String index(Model model) {
        model.addAttribute("page", pageMetaFactory.packetPage("/ops/orders", "Ops Orders | hood", "Internal commercial order queue"));
        model.addAttribute("summary", commercialOrderService.loadSummary());
        model.addAttribute("orders", commercialOrderService.listOrderQueue());
        model.addAttribute("convertedOrderNumber", model.asMap().get("convertedOrderNumber"));
        return "page/ops/orders-index";
    }
}
