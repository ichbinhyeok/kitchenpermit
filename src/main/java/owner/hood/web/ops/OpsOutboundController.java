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
import owner.hood.application.outbound.VendorProspectEnrichmentForm;
import owner.hood.application.outbound.VendorProspectEnrichmentResultView;
import owner.hood.application.outbound.VendorProspectEnrichmentService;
import owner.hood.application.outbound.VendorProspectImportForm;
import owner.hood.application.outbound.VendorProspectImportResultView;
import owner.hood.application.outbound.VendorProspectSourcingService;
import owner.hood.application.outbound.VendorProspectForm;
import owner.hood.web.common.PageMetaFactory;

import java.util.UUID;

@Controller
public class OpsOutboundController {

    private final OutboundOpsService outboundOpsService;
    private final VendorProspectSourcingService vendorProspectSourcingService;
    private final VendorProspectEnrichmentService vendorProspectEnrichmentService;
    private final PageMetaFactory pageMetaFactory;

    public OpsOutboundController(
            OutboundOpsService outboundOpsService,
            VendorProspectSourcingService vendorProspectSourcingService,
            VendorProspectEnrichmentService vendorProspectEnrichmentService,
            PageMetaFactory pageMetaFactory
    ) {
        this.outboundOpsService = outboundOpsService;
        this.vendorProspectSourcingService = vendorProspectSourcingService;
        this.vendorProspectEnrichmentService = vendorProspectEnrichmentService;
        this.pageMetaFactory = pageMetaFactory;
    }

    @GetMapping("/ops/outbound/prospects")
    public String prospects(Model model) {
        if (!model.containsAttribute("form")) {
            model.addAttribute("form", new VendorProspectForm());
        }
        if (!model.containsAttribute("importForm")) {
            model.addAttribute("importForm", new VendorProspectImportForm());
        }
        if (!model.containsAttribute("enrichmentForm")) {
            model.addAttribute("enrichmentForm", new VendorProspectEnrichmentForm());
        }
        if (!model.containsAttribute("lastImportResult")) {
            model.addAttribute("lastImportResult", null);
        }
        if (!model.containsAttribute("lastEnrichmentResult")) {
            model.addAttribute("lastEnrichmentResult", null);
        }
        model.addAttribute("page", pageMetaFactory.packetPage("/ops/outbound/prospects", "Outbound Prospects | hood", "Internal vendor prospect sourcing"));
        model.addAttribute("prospects", outboundOpsService.listProspects());
        model.addAttribute("researchBacklog", outboundOpsService.listResearchBacklog());
        model.addAttribute("queueSummary", outboundOpsService.queueSummary());
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

    @GetMapping("/ops/outbound/prospects/send-now.csv")
    public ResponseEntity<byte[]> exportSendNowCsv() {
        byte[] payload = outboundOpsService.exportSendNowCsv();
        return ResponseEntity.ok()
                .contentType(new MediaType("text", "csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename("hood-vendor-send-now.csv")
                        .build()
                        .toString())
                .body(payload);
    }

    @GetMapping("/ops/outbound/prospects/research.csv")
    public ResponseEntity<byte[]> exportResearchBacklogCsv() {
        byte[] payload = outboundOpsService.exportResearchBacklogCsv();
        return ResponseEntity.ok()
                .contentType(new MediaType("text", "csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename("hood-vendor-research-backlog.csv")
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
            if (!model.containsAttribute("importForm")) {
                model.addAttribute("importForm", new VendorProspectImportForm());
            }
            if (!model.containsAttribute("enrichmentForm")) {
                model.addAttribute("enrichmentForm", new VendorProspectEnrichmentForm());
            }
            model.addAttribute("lastImportResult", null);
            model.addAttribute("lastEnrichmentResult", null);
            model.addAttribute("prospects", outboundOpsService.listProspects());
            model.addAttribute("researchBacklog", outboundOpsService.listResearchBacklog());
            model.addAttribute("queueSummary", outboundOpsService.queueSummary());
            return "page/ops/outbound-prospects";
        }
        outboundOpsService.createProspect(form);
        return "redirect:/ops/outbound/prospects";
    }

    @PostMapping("/ops/outbound/prospects/import")
    public String importProspects(
            @Valid @ModelAttribute("importForm") VendorProspectImportForm importForm,
            BindingResult bindingResult,
            Model model
    ) {
        model.addAttribute("page", pageMetaFactory.packetPage("/ops/outbound/prospects", "Outbound Prospects | hood", "Internal vendor prospect sourcing"));
        if (!model.containsAttribute("form")) {
            model.addAttribute("form", new VendorProspectForm());
        }
        if (!model.containsAttribute("enrichmentForm")) {
            model.addAttribute("enrichmentForm", new VendorProspectEnrichmentForm());
        }
        if (bindingResult.hasErrors()) {
            model.addAttribute("lastImportResult", null);
            model.addAttribute("lastEnrichmentResult", null);
            model.addAttribute("prospects", outboundOpsService.listProspects());
            model.addAttribute("researchBacklog", outboundOpsService.listResearchBacklog());
            model.addAttribute("queueSummary", outboundOpsService.queueSummary());
            return "page/ops/outbound-prospects";
        }

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(importForm);
        model.addAttribute("lastImportResult", result);
        model.addAttribute("lastEnrichmentResult", null);
        model.addAttribute("prospects", outboundOpsService.listProspects());
        model.addAttribute("researchBacklog", outboundOpsService.listResearchBacklog());
        model.addAttribute("queueSummary", outboundOpsService.queueSummary());
        return "page/ops/outbound-prospects";
    }

    @PostMapping("/ops/outbound/prospects/enrichment")
    public String enrichProspects(
            @Valid @ModelAttribute("enrichmentForm") VendorProspectEnrichmentForm enrichmentForm,
            BindingResult bindingResult,
            Model model
    ) {
        model.addAttribute("page", pageMetaFactory.packetPage("/ops/outbound/prospects", "Outbound Prospects | hood", "Internal vendor prospect sourcing"));
        if (!model.containsAttribute("form")) {
            model.addAttribute("form", new VendorProspectForm());
        }
        if (!model.containsAttribute("importForm")) {
            model.addAttribute("importForm", new VendorProspectImportForm());
        }
        if (bindingResult.hasErrors()) {
            model.addAttribute("lastImportResult", null);
            model.addAttribute("lastEnrichmentResult", null);
            model.addAttribute("prospects", outboundOpsService.listProspects());
            model.addAttribute("researchBacklog", outboundOpsService.listResearchBacklog());
            model.addAttribute("queueSummary", outboundOpsService.queueSummary());
            return "page/ops/outbound-prospects";
        }

        VendorProspectEnrichmentResultView result = vendorProspectEnrichmentService.enrichCandidates(enrichmentForm);
        model.addAttribute("lastImportResult", null);
        model.addAttribute("lastEnrichmentResult", result);
        model.addAttribute("prospects", outboundOpsService.listProspects());
        model.addAttribute("researchBacklog", outboundOpsService.listResearchBacklog());
        model.addAttribute("queueSummary", outboundOpsService.queueSummary());
        return "page/ops/outbound-prospects";
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
