package owner.hood.web.ops;

import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import owner.hood.application.axis2.Axis2BatchForm;
import owner.hood.application.axis2.Axis2Service;
import owner.hood.application.axis2.Axis2SignalImportForm;
import owner.hood.application.vendor.VendorSetupService;
import owner.hood.web.common.PageMetaFactory;

import java.util.UUID;

@Controller
public class OpsAxis2Controller {

    private final Axis2Service axis2Service;
    private final VendorSetupService vendorSetupService;
    private final PageMetaFactory pageMetaFactory;

    public OpsAxis2Controller(
            Axis2Service axis2Service,
            VendorSetupService vendorSetupService,
            PageMetaFactory pageMetaFactory
    ) {
        this.axis2Service = axis2Service;
        this.vendorSetupService = vendorSetupService;
        this.pageMetaFactory = pageMetaFactory;
    }

    @GetMapping("/ops/axis-2/signals/import")
    public String importForm(Model model) {
        if (!model.containsAttribute("form")) {
            model.addAttribute("form", new Axis2SignalImportForm());
        }
        model.addAttribute("page", pageMetaFactory.packetPage("/ops/axis-2/signals/import", "Axis 2 Import | hood", "Internal Austin signal import"));
        return "page/ops/axis2-signal-import";
    }

    @PostMapping("/ops/axis-2/signals/import")
    public String importSignal(
            @Valid @ModelAttribute("form") Axis2SignalImportForm form,
            BindingResult bindingResult,
            Model model
    ) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("page", pageMetaFactory.packetPage("/ops/axis-2/signals/import", "Axis 2 Import | hood", "Internal Austin signal import"));
            return "page/ops/axis2-signal-import";
        }
        axis2Service.importSignal(form);
        return "redirect:/ops/axis-2/projects";
    }

    @GetMapping("/ops/axis-2/projects")
    public String projects(Model model) {
        model.addAttribute("page", pageMetaFactory.packetPage("/ops/axis-2/projects", "Axis 2 Projects | hood", "Internal canonical project list"));
        model.addAttribute("projects", axis2Service.listProjects());
        model.addAttribute("vendors", vendorSetupService.listVendors());
        return "page/ops/axis2-projects";
    }

    @GetMapping("/ops/axis-2/batches/new")
    public String batchForm(@RequestParam(required = false) UUID vendorId, Model model) {
        if (!model.containsAttribute("form")) {
            Axis2BatchForm form = new Axis2BatchForm();
            form.setVendorId(vendorId);
            model.addAttribute("form", form);
        }
        populateBatchPage(model);
        return "page/ops/axis2-batch-new";
    }

    @PostMapping("/ops/axis-2/batches/new")
    public String createBatch(
            @Valid @ModelAttribute("form") Axis2BatchForm form,
            BindingResult bindingResult,
            Model model
    ) {
        if (bindingResult.hasErrors()) {
            populateBatchPage(model);
            return "page/ops/axis2-batch-new";
        }
        try {
            String token = axis2Service.prepareBatch(form);
            return "redirect:/deliver/axis-2/" + token;
        } catch (IllegalStateException exception) {
            model.addAttribute("batchError", exception.getMessage());
            populateBatchPage(model);
            return "page/ops/axis2-batch-new";
        }
    }

    private void populateBatchPage(Model model) {
        model.addAttribute("page", pageMetaFactory.packetPage("/ops/axis-2/batches/new", "New Axis 2 Batch | hood", "Internal Austin batch builder"));
        model.addAttribute("projects", axis2Service.listProjects());
        model.addAttribute("vendors", vendorSetupService.listVendors());
    }
}
