package owner.hood.web.ops;

import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import owner.hood.application.axis1.Axis1JobForm;
import owner.hood.application.axis1.Axis1JobService;
import owner.hood.application.vendor.VendorSetupService;
import owner.hood.web.common.PageMetaFactory;

import java.time.LocalDate;
import java.util.UUID;

@Controller
public class OpsAxis1Controller {

    private final Axis1JobService axis1JobService;
    private final VendorSetupService vendorSetupService;
    private final PageMetaFactory pageMetaFactory;

    public OpsAxis1Controller(
            Axis1JobService axis1JobService,
            VendorSetupService vendorSetupService,
            PageMetaFactory pageMetaFactory
    ) {
        this.axis1JobService = axis1JobService;
        this.vendorSetupService = vendorSetupService;
        this.pageMetaFactory = pageMetaFactory;
    }

    @GetMapping("/ops/axis-1/jobs/new")
    public String form(@RequestParam UUID vendorId, Model model) {
        if (!model.containsAttribute("form")) {
            Axis1JobForm form = new Axis1JobForm();
            form.setVendorId(vendorId);
            form.setServiceDate(LocalDate.now());
            form.setFindingSeverity("MEDIUM");
            model.addAttribute("form", form);
        }
        model.addAttribute("page", pageMetaFactory.packetPage("/ops/axis-1/jobs/new", "New Axis 1 Job | hood", "Internal Axis 1 job entry"));
        model.addAttribute("vendor", vendorSetupService.getVendor(vendorId));
        return "page/ops/axis1-job-new";
    }

    @PostMapping("/ops/axis-1/jobs/new")
    public String create(@Valid @ModelAttribute("form") Axis1JobForm form, BindingResult bindingResult, Model model) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("page", pageMetaFactory.packetPage("/ops/axis-1/jobs/new", "New Axis 1 Job | hood", "Internal Axis 1 job entry"));
            model.addAttribute("vendor", vendorSetupService.getVendor(form.getVendorId()));
            return "page/ops/axis1-job-new";
        }
        String token = axis1JobService.createJobAndRender(form);
        return "redirect:/deliver/axis-1/" + token;
    }
}
