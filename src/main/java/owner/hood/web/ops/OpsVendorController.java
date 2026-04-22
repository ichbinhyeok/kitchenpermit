package owner.hood.web.ops;

import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import owner.hood.application.vendor.VendorSetupForm;
import owner.hood.application.vendor.VendorSetupService;
import owner.hood.web.common.PageMetaFactory;

import java.util.UUID;

@Controller
public class OpsVendorController {

    private final VendorSetupService vendorSetupService;
    private final PageMetaFactory pageMetaFactory;

    public OpsVendorController(VendorSetupService vendorSetupService, PageMetaFactory pageMetaFactory) {
        this.vendorSetupService = vendorSetupService;
        this.pageMetaFactory = pageMetaFactory;
    }

    @GetMapping("/ops/vendors")
    public String index(Model model) {
        model.addAttribute("page", pageMetaFactory.packetPage("/ops/vendors", "Ops Vendors | hood", "Internal vendor setup list"));
        model.addAttribute("vendors", vendorSetupService.listVendors());
        return "page/ops/vendors-index";
    }

    @GetMapping("/ops/vendors/new")
    public String form(Model model) {
        if (!model.containsAttribute("form")) {
            model.addAttribute("form", new VendorSetupForm());
        }
        model.addAttribute("page", pageMetaFactory.packetPage("/ops/vendors/new", "New Vendor | hood", "Internal vendor setup form"));
        return "page/ops/vendor-new";
    }

    @PostMapping("/ops/vendors/new")
    public String create(@Valid @ModelAttribute("form") VendorSetupForm form, BindingResult bindingResult, Model model) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("page", pageMetaFactory.packetPage("/ops/vendors/new", "New Vendor | hood", "Internal vendor setup form"));
            return "page/ops/vendor-new";
        }
        UUID vendorId = vendorSetupService.createVendor(form);
        return "redirect:/ops/vendors/" + vendorId;
    }

    @GetMapping("/ops/vendors/{vendorId}")
    public String show(@PathVariable UUID vendorId, Model model) {
        model.addAttribute("page", pageMetaFactory.packetPage("/ops/vendors/" + vendorId, "Vendor Detail | hood", "Internal vendor detail"));
        model.addAttribute("vendor", vendorSetupService.getVendor(vendorId));
        model.addAttribute("setup", vendorSetupService.getSetupProfile(vendorId));
        return "page/ops/vendor-show";
    }
}
