package owner.hood.web.ops;

import jakarta.validation.Valid;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import owner.hood.application.outbound.OutboundCampaignForm;
import owner.hood.application.outbound.OutboundOpsService;
import owner.hood.application.outbound.OutboundResultSnapshotForm;
import owner.hood.application.outbound.VendorProspectForm;
import owner.hood.web.common.PageMetaFactory;

import java.util.UUID;

@Controller
public class OpsOutboundController {

    private final OutboundOpsService outboundOpsService;
    private final PageMetaFactory pageMetaFactory;

    public OpsOutboundController(OutboundOpsService outboundOpsService, PageMetaFactory pageMetaFactory) {
        this.outboundOpsService = outboundOpsService;
        this.pageMetaFactory = pageMetaFactory;
    }

    @GetMapping("/ops/outbound/prospects")
    public String prospects(Model model) {
        if (!model.containsAttribute("form")) {
            model.addAttribute("form", new VendorProspectForm());
        }
        model.addAttribute("page", pageMetaFactory.packetPage("/ops/outbound/prospects", "Outbound Prospects | hood", "Internal vendor prospect sourcing"));
        model.addAttribute("prospects", outboundOpsService.listProspects());
        return "page/ops/outbound-prospects";
    }

    @GetMapping("/ops/outbound/prospects/export.csv")
    public ResponseEntity<byte[]> exportProspectsCsv() {
        byte[] payload = outboundOpsService.exportProspectsCsv();
        return ResponseEntity.ok()
                .contentType(new MediaType("text", "csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename("hood-vendor-prospects.csv")
                        .build()
                        .toString())
                .body(payload);
    }

    @PostMapping("/ops/outbound/prospects")
    public String createProspect(
            @Valid @ModelAttribute("form") VendorProspectForm form,
            BindingResult bindingResult,
            Model model
    ) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("page", pageMetaFactory.packetPage("/ops/outbound/prospects", "Outbound Prospects | hood", "Internal vendor prospect sourcing"));
            model.addAttribute("prospects", outboundOpsService.listProspects());
            return "page/ops/outbound-prospects";
        }
        outboundOpsService.createProspect(form);
        return "redirect:/ops/outbound/prospects";
    }

    @GetMapping("/ops/outbound/campaigns")
    public String campaigns(Model model) {
        if (!model.containsAttribute("campaignForm")) {
            model.addAttribute("campaignForm", new OutboundCampaignForm());
        }
        if (!model.containsAttribute("snapshotForm")) {
            model.addAttribute("snapshotForm", new OutboundResultSnapshotForm());
        }
        populateCampaignPage(model);
        return "page/ops/outbound-campaigns";
    }

    @PostMapping("/ops/outbound/campaigns")
    public String createCampaign(
            @Valid @ModelAttribute("campaignForm") OutboundCampaignForm campaignForm,
            BindingResult bindingResult,
            Model model
    ) {
        if (bindingResult.hasErrors()) {
            if (!model.containsAttribute("snapshotForm")) {
                model.addAttribute("snapshotForm", new OutboundResultSnapshotForm());
            }
            populateCampaignPage(model);
            return "page/ops/outbound-campaigns";
        }
        outboundOpsService.createCampaign(campaignForm);
        return "redirect:/ops/outbound/campaigns";
    }

    @PostMapping("/ops/outbound/campaigns/{campaignId}/snapshots")
    public String createSnapshot(
            @PathVariable UUID campaignId,
            @Valid @ModelAttribute("snapshotForm") OutboundResultSnapshotForm snapshotForm,
            BindingResult bindingResult,
            Model model
    ) {
        if (bindingResult.hasErrors()) {
            if (!model.containsAttribute("campaignForm")) {
                model.addAttribute("campaignForm", new OutboundCampaignForm());
            }
            model.addAttribute("snapshotCampaignId", campaignId.toString());
            populateCampaignPage(model);
            return "page/ops/outbound-campaigns";
        }
        outboundOpsService.recordSnapshot(campaignId, snapshotForm);
        return "redirect:/ops/outbound/campaigns";
    }

    private void populateCampaignPage(Model model) {
        model.addAttribute("page", pageMetaFactory.packetPage("/ops/outbound/campaigns", "Outbound Campaigns | hood", "Smartlead handoff and result analysis"));
        model.addAttribute("prospects", outboundOpsService.listProspects());
        model.addAttribute("campaigns", outboundOpsService.listCampaignSummaries());
        model.addAttribute("angleRows", outboundOpsService.anglePerformance());
        model.addAttribute("metroRows", outboundOpsService.metroPerformance());
        model.addAttribute("segmentRows", outboundOpsService.segmentPerformance());
    }
}
