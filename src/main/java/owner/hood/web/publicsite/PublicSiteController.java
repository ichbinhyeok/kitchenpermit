package owner.hood.web.publicsite;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import owner.hood.web.common.PageMetaFactory;

@Controller
public class PublicSiteController {

    private final PageMetaFactory pageMetaFactory;

    public PublicSiteController(PageMetaFactory pageMetaFactory) {
        this.pageMetaFactory = pageMetaFactory;
    }

    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("page", pageMetaFactory.publicPage(
                "/",
                "hood | Industrial packets for kitchen exhaust vendors",
                "Product-grade service packets, sales opportunity lists, and first-touch packet workflows for hood vendors."
        ));
        model.addAttribute("siteName", pageMetaFactory.siteName());
        return "page/home";
    }

    @GetMapping("/axis-1")
    public String axis1(Model model) {
        model.addAttribute("page", pageMetaFactory.publicPage(
                "/axis-1",
                "Axis 1 | Service Completion Brief",
                "Customer-facing service completion packets that help hood vendors explain work, prove value, and drive rebook."
        ));
        model.addAttribute("siteName", pageMetaFactory.siteName());
        return "page/axis1";
    }

    @GetMapping("/axis-2")
    public String axis2(Model model) {
        model.addAttribute("page", pageMetaFactory.publicPage(
                "/axis-2",
                "Axis 2 | Sales List + First-Touch Packet",
                "Trigger-led sales opportunity lists and first-touch outbound packet workflows for hood vendors."
        ));
        model.addAttribute("siteName", pageMetaFactory.siteName());
        return "page/axis2";
    }

    @GetMapping("/samples")
    public String samples(Model model) {
        model.addAttribute("page", pageMetaFactory.publicPage(
                "/samples",
                "Samples | hood",
                "Preview the packet surfaces that hood uses to sell and deliver vendor-grade packets."
        ));
        model.addAttribute("siteName", pageMetaFactory.siteName());
        return "page/samples";
    }

    @GetMapping("/samples/axis-1")
    public String sampleAxis1(Model model) {
        model.addAttribute("page", pageMetaFactory.publicPage(
                "/samples/axis-1",
                "Axis 1 Sample | hood",
                "A masked sample of the Axis 1 service completion brief used for existing customer communication."
        ));
        model.addAttribute("siteName", pageMetaFactory.siteName());
        return "page/sample-axis1";
    }

    @GetMapping("/samples/axis-2")
    public String sampleAxis2(Model model) {
        model.addAttribute("page", pageMetaFactory.publicPage(
                "/samples/axis-2",
                "Axis 2 Sample | hood",
                "A masked sample of the Axis 2 sales list and first-touch packet surface."
        ));
        model.addAttribute("siteName", pageMetaFactory.siteName());
        return "page/sample-axis2";
    }

    @GetMapping("/pricing")
    public String pricing(Model model) {
        model.addAttribute("page", pageMetaFactory.publicPage(
                "/pricing",
                "Pricing | hood",
                "Starting-at pricing for Axis 1 setup, Axis 2 setup, bundle packaging, and paid batches."
        ));
        model.addAttribute("siteName", pageMetaFactory.siteName());
        return "page/pricing";
    }
}
