package owner.hood.web.delivery;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.server.ResponseStatusException;
import owner.hood.application.axis2.Axis2PacketView;
import owner.hood.application.axis2.Axis2Service;
import owner.hood.application.axis1.Axis1BriefView;
import owner.hood.application.axis1.Axis1JobService;
import owner.hood.infrastructure.pdf.Axis2PdfService;
import owner.hood.infrastructure.pdf.Axis1PdfService;
import owner.hood.web.common.PageMetaFactory;

@Controller
public class DeliveryController {

    private final Axis1JobService axis1JobService;
    private final Axis2Service axis2Service;
    private final Axis1PdfService axis1PdfService;
    private final Axis2PdfService axis2PdfService;
    private final PageMetaFactory pageMetaFactory;

    public DeliveryController(
            Axis1JobService axis1JobService,
            Axis2Service axis2Service,
            Axis1PdfService axis1PdfService,
            Axis2PdfService axis2PdfService,
            PageMetaFactory pageMetaFactory
    ) {
        this.axis1JobService = axis1JobService;
        this.axis2Service = axis2Service;
        this.axis1PdfService = axis1PdfService;
        this.axis2PdfService = axis2PdfService;
        this.pageMetaFactory = pageMetaFactory;
    }

    @GetMapping("/deliver/axis-1/{token}")
    public String axis1Brief(@PathVariable String token, Model model) {
        Axis1BriefView brief = axis1JobService.loadBrief(token);
        model.addAttribute("page", pageMetaFactory.packetPage(
                "/deliver/axis-1/" + token,
                brief.vendorBrandName() + " | Service Completion Brief",
                "Tokenized Axis 1 delivery surface."
        ));
        model.addAttribute("brief", brief);
        model.addAttribute("siteName", pageMetaFactory.siteName());
        return "packet/axis1-brief";
    }

    @GetMapping("/deliver/axis-2/{token}")
    public String axis2Packet(@PathVariable String token, Model model) {
        Axis2PacketView packet = axis2Service.findPacket(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        model.addAttribute("page", pageMetaFactory.packetPage(
                "/deliver/axis-2/" + token,
                packet.vendorBrandName() + " | Axis 2 Opportunity Batch",
                "Tokenized Axis 2 delivery surface."
        ));
        model.addAttribute("packet", packet);
        model.addAttribute("siteName", pageMetaFactory.siteName());
        return "packet/axis2-first-touch";
    }

    @GetMapping("/deliver/axis-2/{token}/list.csv")
    public ResponseEntity<byte[]> axis2ListExport(@PathVariable String token) {
        return ResponseEntity.ok()
                .contentType(new MediaType("text", "csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename("hood-axis2-" + token + "-list.csv")
                        .build()
                        .toString())
                .body(axis2Service.exportBatchCsv(token));
    }

    @GetMapping("/deliver/packet/{token}/pdf")
    public ResponseEntity<byte[]> axis1BriefPdf(@PathVariable String token) {
        return axis1JobService.findBrief(token)
                .map(brief -> pdfResponse("hood-axis1-" + token + ".pdf", axis1PdfService.render(brief)))
                .or(() -> axis2Service.findPacket(token)
                        .map(packet -> pdfResponse("hood-axis2-" + token + ".pdf", axis2PdfService.render(packet))))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    private ResponseEntity<byte[]> pdfResponse(String filename, byte[] pdf) {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline()
                        .filename(filename)
                        .build()
                        .toString())
                .body(pdf);
    }
}
